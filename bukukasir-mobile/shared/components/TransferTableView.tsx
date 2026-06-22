import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../features/auth/store';
import { useTheme } from '../theme';
import {
  useTables,
  useTransferTable,
  useAssignTableStaff,
} from '../hooks/queries';
import { arr } from '../lib/safe';
import { Header } from '../ui/Header';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { EmptyState } from '../ui/EmptyState';
import { Skeleton } from '../ui/Skeleton';
import { SegmentedControl } from '../ui/SegmentedControl';
import { PressScale } from '../motion/PressScale';
import { api } from '../lib/api';
import { useT } from '../i18n/store';

type Mode = 'staff' | 'table';
type Scope = 'mine' | 'all';
type RoleColor = 'cashier' | 'waiter' | 'kitchen';

interface Props {
  scope: Scope;
  roleColor: RoleColor;
}

export function TransferTableView({ scope, roleColor }: Props) {
  const theme = useTheme();
  const t = useT();
  const router = useRouter();
  const { user } = useAuthStore();

  const businessId = user?.businessId ?? '';
  const { data: tablesData, isLoading: tablesLoading, refetch: refetchTables } = useTables(businessId);
  const tables = arr<any>(tablesData);

  const transferTable = useTransferTable();
  const assignStaff = useAssignTableStaff();

  const [mode, setMode] = useState<Mode>('staff');
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [selectedToTableId, setSelectedToTableId] = useState<string | null>(null);

  const [staffList, setStaffList] = useState<any[] | null>(null);
  const [staffLoading, setStaffLoading] = useState(true);
  const tableRoute = roleColor === 'waiter' ? '/(waiter)/my-tables' : '/(cashier)/tables';

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await api.getStaff(businessId);
        if (!mounted) return;
        setStaffList(arr<any>(data));
      } catch {
        if (mounted) setStaffList([]);
      } finally {
        if (mounted) setStaffLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [businessId]);

  const sourceTables = useMemo(
    () =>
      tables.filter((t) => {
        if (t.status !== 'occupied') return false;
        if (scope === 'mine') return t.assignedStaffId === user?.id;
        return true;
      }),
    [tables, user?.id, scope]
  );

  const availableTables = useMemo(
    () => tables.filter((t) => t.status === 'available' && t.id !== selectedTableId),
    [tables, selectedTableId]
  );

  const assignableStaff = useMemo(
    () =>
      arr<any>(staffList).filter(
        (s) =>
          (s.isActive ?? s.active ?? true) &&
          (scope === 'mine' ? s.id !== user?.id : true) &&
          ((s.role || '').toLowerCase() === 'waiter' ||
            (s.role || '').toLowerCase() === 'cashier')
      ),
    [staffList, user?.id, scope]
  );

  const resetSelections = () => {
    setSelectedTableId(null);
    setSelectedStaffId(null);
    setSelectedToTableId(null);
  };

  const handleConfirm = () => {
    if (!selectedTableId) {
      Alert.alert(t('common.error'), t('transfer.err.pickTable'));
      return;
    }
    const table = sourceTables.find((t) => t.id === selectedTableId);

    if (mode === 'staff') {
      if (!selectedStaffId) {
        Alert.alert(t('common.error'), t('transfer.err.pickWaiter'));
        return;
      }
      const staff = assignableStaff.find((s) => s.id === selectedStaffId);
      Alert.alert(
        t('common.confirm'),
        t('transfer.confirm.staff')
          .replace('{table}', table?.name ?? '-')
          .replace('{staff}', staff?.name ?? '-'),
        [
          {
            text: t('transfer.mode.staff'),
            onPress: async () => {
              try {
                await assignStaff.mutateAsync({
                  tableId: selectedTableId,
                  staffId: selectedStaffId,
                  businessId,
                });
                Alert.alert(t('common.success'), t('transfer.success.staff'));
                resetSelections();
              } catch (e: any) {
                Alert.alert(t('common.error'), e?.message || t('transfer.err.staff'));
              }
            },
          },
          { text: t('common.cancel'), style: 'cancel' },
        ]
      );
    } else {
      if (!selectedToTableId) {
        Alert.alert(t('common.error'), t('transfer.err.pickTarget'));
        return;
      }
      const to = availableTables.find((t) => t.id === selectedToTableId);
      Alert.alert(
        t('common.confirm'),
        t('transfer.confirm.table')
          .replace('{from}', table?.name ?? '-')
          .replace('{to}', to?.name ?? '-'),
        [
          {
            text: t('transfer.mode.table'),
            onPress: async () => {
              try {
                await transferTable.mutateAsync({
                  fromTableId: selectedTableId,
                  toTableId: selectedToTableId,
                  businessId,
                });
                Alert.alert(t('common.success'), t('transfer.success.table'));
                resetSelections();
              } catch (e: any) {
                Alert.alert(t('common.error'), e?.message || t('transfer.err.table'));
              }
            },
          },
          { text: t('common.cancel'), style: 'cancel' },
        ]
      );
    }
  };

  const pending = mode === 'staff' ? assignStaff.isPending : transferTable.isPending;
  const canConfirm =
    mode === 'staff'
      ? !!selectedTableId && !!selectedStaffId
      : !!selectedTableId && !!selectedToTableId;

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.palette.neutral[50] }}
      edges={['top', 'left', 'right']}
    >
      <Header
        title={t('transfer.title')}
        subtitle={t('transfer.subtitle')}
        roleColor={roleColor}
      />

      <View style={{ paddingHorizontal: theme.spacing[16], paddingTop: theme.spacing[12] }}>
        <SegmentedControl
          options={[
            { value: 'staff', label: t('transfer.mode.staff') },
            { value: 'table', label: t('transfer.mode.table') },
          ]}
          value={mode}
          onChange={(v: Mode) => {
            setMode(v);
            resetSelections();
          }}
        />
      </View>

      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          padding: theme.spacing[16],
          gap: theme.spacing[12],
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: '700',
              color: theme.palette.neutral[900],
              marginBottom: 8,
            }}
          >
            {t('transfer.pickTable')}
          </Text>
          {tablesLoading ? (
            <View style={{ gap: 8 }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton.Card key={i} />
              ))}
            </View>
          ) : sourceTables.length === 0 ? (
            <EmptyState
              title={t('transfer.empty.occupied')}
              cta={t('common.refresh')}
              onCtaPress={refetchTables}
              secondaryCta={t('common.back')}
              onSecondaryCtaPress={() => router.replace(tableRoute)}
            />
          ) : (
            <FlatList
              data={sourceTables}
              keyExtractor={(t) => t.id}
              ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
              renderItem={({ item }) => (
                <PressScale
                  onPress={() => setSelectedTableId(item.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`${t('transfer.pickTable')}: ${item.name}`}
                  accessibilityState={{ selected: selectedTableId === item.id }}
                >
                  <Card
                    elevation="sm"
                    padding={theme.spacing[12]}
                    style={{
                      borderWidth: 2,
                      borderColor:
                        selectedTableId === item.id
                          ? theme.palette.roles[roleColor]
                          : 'transparent',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: '700',
                        color: theme.palette.neutral[900],
                      }}
                    >
                      {item.name}
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        color: theme.palette.neutral[600],
                        marginTop: 2,
                      }}
                    >
                      {`${item.capacity} ${t('tables.seats')} \u2022 ${item.status}`}
                    </Text>
                  </Card>
                </PressScale>
              )}
            />
          )}
        </View>

        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: '700',
              color: theme.palette.neutral[900],
              marginBottom: 8,
            }}
          >
            {mode === 'staff' ? t('transfer.pickStaff') : t('transfer.pickTargetTable')}
          </Text>
          {mode === 'staff' ? (
            staffLoading ? (
              <View style={{ gap: 8 }}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton.Card key={i} />
                ))}
              </View>
            ) : assignableStaff.length === 0 ? (
              <EmptyState
                title={t('transfer.empty.waiter')}
                cta={t('common.back')}
                onCtaPress={() => router.replace(tableRoute)}
              />
            ) : (
              <FlatList
                data={assignableStaff}
                keyExtractor={(s) => s.id}
                ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
                renderItem={({ item }) => (
                  <PressScale
                    onPress={() => setSelectedStaffId(item.id)}
                    accessibilityRole="button"
                    accessibilityLabel={`${t('transfer.pickStaff')}: ${item.name}`}
                    accessibilityState={{ selected: selectedStaffId === item.id }}
                  >
                    <Card
                      elevation="sm"
                      padding={theme.spacing[12]}
                      style={{
                        borderWidth: 2,
                        borderColor:
                          selectedStaffId === item.id
                            ? theme.palette.roles[roleColor]
                            : 'transparent',
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 10,
                      }}
                    >
                      <Text style={{ fontSize: 24 }}>{'\uD83D\uDC64'}</Text>
                      <View>
                        <Text
                          style={{
                            fontSize: 15,
                            fontWeight: '700',
                            color: theme.palette.neutral[900],
                          }}
                        >
                          {item.name}
                        </Text>
                        <Text
                          style={{
                            fontSize: 12,
                            color: theme.palette.neutral[600],
                            marginTop: 2,
                          }}
                        >
                          {item.role}
                        </Text>
                      </View>
                    </Card>
                  </PressScale>
                )}
              />
            )
          ) : availableTables.length === 0 ? (
            <EmptyState
              title={t('transfer.empty.available')}
              cta={t('common.refresh')}
              onCtaPress={refetchTables}
              secondaryCta={t('common.back')}
              onSecondaryCtaPress={() => router.replace(tableRoute)}
            />
          ) : (
            <FlatList
              data={availableTables}
              keyExtractor={(t) => t.id}
              ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
              renderItem={({ item }) => (
                <PressScale
                  onPress={() => setSelectedToTableId(item.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`${t('transfer.pickTargetTable')}: ${item.name}`}
                  accessibilityState={{ selected: selectedToTableId === item.id }}
                >
                  <Card
                    elevation="sm"
                    padding={theme.spacing[12]}
                    style={{
                      borderWidth: 2,
                      borderColor:
                        selectedToTableId === item.id
                          ? theme.palette.roles[roleColor]
                          : 'transparent',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: '700',
                        color: theme.palette.neutral[900],
                      }}
                    >
                      {item.name}
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        color: theme.palette.neutral[600],
                        marginTop: 2,
                      }}
                    >
                      {`${item.capacity} ${t('tables.seats')} \u2022 ${t('tables.status.available')}`}
                    </Text>
                  </Card>
                </PressScale>
              )}
            />
          )}
        </View>

        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          {canConfirm ? (
            <Card
              elevation="sm"
              padding={theme.spacing[12]}
              style={{ marginBottom: theme.spacing[12] }}
            >
              <Text style={{ fontWeight: '700', marginBottom: 4 }}>{t('transfer.summary')}</Text>
              <Text style={{ fontSize: 12, color: theme.palette.neutral[700] }}>
                {t('transfer.summary.table')}: {sourceTables.find((t) => t.id === selectedTableId)?.name}
              </Text>
              {mode === 'staff' ? (
                <Text style={{ fontSize: 12, color: theme.palette.neutral[700] }}>
                  {t('transfer.summary.to')}: {assignableStaff.find((s) => s.id === selectedStaffId)?.name}
                </Text>
              ) : (
                <Text style={{ fontSize: 12, color: theme.palette.neutral[700] }}>
                  {t('transfer.summary.target')}: {availableTables.find((t) => t.id === selectedToTableId)?.name}
                </Text>
              )}
            </Card>
          ) : null}

          <Button
            variant="primary"
            size="lg"
            onPress={handleConfirm}
            disabled={!canConfirm || pending}
            loading={pending}
          >
            {mode === 'staff' ? t('transfer.mode.staff') : t('transfer.mode.table')}
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}
