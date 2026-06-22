import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useAuthStore } from '../../features/auth/store';
import { useOrderStore } from '../../features/order/store';
import { useTheme } from '../../shared/theme';
import { TableTile } from '../../shared/components/TableTile';
import { useTransferTable } from '../../shared/hooks/queries';
import {
  OverlaySheet,
  POSScreen,
  Panel,
  PrimaryButton,
  ResilienceBanner,
  SectionHeader,
  TextField,
  usePOSLayout,
} from '../../shared/pos/components';
import { posTables } from '../../shared/pos/demoData';

type SelectionSide = 'from' | 'to';

export default function CashierTransferScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ fromTableId?: string }>();
  const theme = useTheme();
  const { user, needsBusinessSelection } = useAuthStore();
  const order = useOrderStore();
  const transferTable = useTransferTable();
  const { isCompact } = usePOSLayout();
  const initialFromTable = useMemo(() => {
    const requested = String(params.fromTableId ?? '');
    return posTables.some((table) => table.id === requested) ? requested : 'table-002';
  }, [params.fromTableId]);
  const [selectionSide, setSelectionSide] = useState<SelectionSide>('to');
  const [fromTable, setFromTable] = useState(initialFromTable);
  const [toTable, setToTable] = useState(() => (initialFromTable === 'table-006' ? 'table-007' : 'table-006'));
  const [note, setNote] = useState('Guest moved to larger table.');
  const [notice, setNotice] = useState<{ title: string; message: string; success?: boolean } | null>(null);

  if (needsBusinessSelection) {
    return <Redirect href="/(auth)/select-business" />;
  }

  if (!user?.businessId) {
    return <Redirect href="/(auth)/login" />;
  }

  const source = posTables.find((table) => table.id === fromTable);
  const target = posTables.find((table) => table.id === toTable);

  const showNotice = (title: string, message: string, success = false) => {
    setNotice({ title, message, success });
  };

  const selectTable = (tableId: string) => {
    const table = posTables.find((item) => item.id === tableId);
    if (!table) return;

    if (selectionSide === 'from') {
      setFromTable(tableId);
      if (toTable === tableId) setToTable('');
      setSelectionSide('to');
      return;
    }

    if (tableId === fromTable) {
      showNotice('Choose a different table', 'The target table cannot be the same as the source. Select another table or change the source first.');
      return;
    }

    setToTable(tableId);
  };

  const validateTransfer = () => {
    if (!fromTable) {
      setSelectionSide('from');
      showNotice('Select source table', 'Choose the occupied table that is moving.');
      return false;
    }
    if (!toTable) {
      setSelectionSide('to');
      showNotice('Select target table', 'Choose the destination table before submitting the transfer.');
      return false;
    }
    if (fromTable === toTable) {
      setSelectionSide('to');
      showNotice('Choose a different table', 'Source and target cannot be the same table.');
      return false;
    }
    return true;
  };

  const submit = () => {
    if (!validateTransfer()) return;

    const fromName = source?.name || 'source';
    const toName = target?.name || 'target';
    const auditNote = note.trim() || 'No note';
    const label = `Transfer ${fromName} to ${toName}: ${auditNote}`;

    order.enqueueSync(label);
    transferTable.mutateAsync({ fromTableId: fromTable, toTableId: toTable, staffId: user.id }).catch(() => undefined);
    showNotice('Transfer queued', `${fromName} is moving to ${toName}. This request is visible in the sync queue and will retry if the backend is offline.`, true);
  };

  return (
    <POSScreen
      role="cashier"
      title="Transfer table"
      subtitle={user.businessName}
      active="tables"
      staffName={user.name}
      onBack={() => router.replace('/(cashier)/tables')}
      onNavigate={(target) => {
        if (target === 'order') router.replace('/(cashier)/order');
        if (target === 'tables') router.replace('/(cashier)/tables');
        if (target === 'history') router.replace('/(cashier)/history');
        if (target === 'settings') router.replace('/(cashier)/settings');
      }}
    >
      <View style={{ flex: 1, padding: isCompact ? 10 : 14, gap: 12 }}>
        <ResilienceBanner syncQueue={order.syncQueue} printJobs={order.printJobs} />
        <View style={{ flexDirection: isCompact ? 'column' : 'row', gap: 12, flex: 1 }}>
          <Panel style={{ flex: 1.5 }}>
            <SectionHeader
              eyebrow="Handoff"
              title="Select source and target"
              action={
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <SelectionButton active={selectionSide === 'from'} label="Set source" onPress={() => setSelectionSide('from')} />
                  <SelectionButton active={selectionSide === 'to'} label="Set target" onPress={() => setSelectionSide('to')} />
                </View>
              }
            />
            <View style={{ marginTop: 12, flexDirection: isCompact ? 'column' : 'row', gap: 10 }}>
              <SelectionSummary
                active={selectionSide === 'from'}
                label="Source"
                value={source?.name || 'Pick table'}
                meta={source ? `${source.guests || source.seats} guests · ${Math.round(source.runningTotal / 1000)}k open` : 'Occupied table'}
                onPress={() => setSelectionSide('from')}
              />
              <SelectionSummary
                active={selectionSide === 'to'}
                label="Target"
                value={target?.name || 'Pick table'}
                meta={target ? `${target.seats} seats · ${target.status}` : 'Available destination'}
                onPress={() => setSelectionSide('to')}
              />
            </View>
            <Text style={{ marginTop: 10, color: theme.palette.neutral[500], fontSize: 12, fontWeight: '800' }}>
              Tap a table to set the active side. Current mode: {selectionSide === 'from' ? 'source' : 'target'}.
            </Text>
            <ScrollView contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingTop: 14 }}>
              {posTables.map((table) => {
                const isSource = fromTable === table.id;
                const isTarget = toTable === table.id;
                return (
                <View key={table.id}>
                  <TableTile
                    id={table.id}
                    label={table.name}
                    seats={table.seats}
                    shape={table.shape}
                    status={table.status}
                    runningTotal={table.runningTotal}
                    guests={table.guests}
                    selected={isSource || isTarget}
                    onPress={() => selectTable(table.id)}
                  />
                  {isSource || isTarget ? (
                    <View
                      pointerEvents="none"
                      style={{
                        position: 'absolute',
                        top: 6,
                        left: 6,
                        paddingHorizontal: 8,
                        height: 24,
                        borderRadius: 999,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: isSource ? theme.palette.brand.navy : theme.palette.semantic.success,
                      }}
                    >
                      <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '900' }}>{isSource ? 'Source' : 'Target'}</Text>
                    </View>
                  ) : null}
                </View>
              );
              })}
            </ScrollView>
          </Panel>
          <Panel style={{ flex: 1 }}>
            <SectionHeader eyebrow="Transfer request" title="Confirm move" />
            <View style={{ marginTop: 12, gap: 10 }}>
              <Text style={{ color: theme.palette.neutral[700], fontSize: 13, fontWeight: '800' }}>
                From {source?.name || 'not selected'} to {target?.name || 'not selected'}
              </Text>
              <TextField label="Reason / audit note" value={note} onChangeText={setNote} multiline />
              <PrimaryButton disabled={transferTable.isPending} onPress={submit}>
                {transferTable.isPending ? 'Submitting transfer...' : 'Submit transfer'}
              </PrimaryButton>
              <PrimaryButton tone="light" onPress={() => router.replace('/(cashier)/tables')}>
                Back to tables
              </PrimaryButton>
            </View>
          </Panel>
        </View>
      </View>
      <OverlaySheet visible={!!notice} title={notice?.title || ''} onClose={() => setNotice(null)}>
        <Text style={{ color: theme.palette.neutral[700], fontSize: 13, fontWeight: '800' }}>{notice?.message}</Text>
        {notice?.success ? (
          <PrimaryButton onPress={() => router.replace('/(cashier)/tables')}>Back to tables</PrimaryButton>
        ) : null}
        <PrimaryButton tone="light" onPress={() => setNotice(null)}>
          Stay here
        </PrimaryButton>
      </OverlaySheet>
    </POSScreen>
  );
}

function SelectionButton({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
      style={({ pressed }) => ({
        minHeight: 38,
        paddingHorizontal: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: active ? theme.palette.neutral[900] : pressed ? theme.palette.neutral[100] : theme.palette.neutral[0],
        borderWidth: 1,
        borderColor: active ? theme.palette.neutral[900] : theme.palette.neutral[200],
      })}
    >
      <Text style={{ color: active ? '#FFFFFF' : theme.palette.neutral[900], fontSize: 12, fontWeight: '900' }}>{label}</Text>
    </Pressable>
  );
}

function SelectionSummary({
  active,
  label,
  value,
  meta,
  onPress,
}: {
  active: boolean;
  label: string;
  value: string;
  meta: string;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${value}. ${meta}`}
      accessibilityState={{ selected: active }}
      style={({ pressed }) => ({
        flex: 1,
        minHeight: 74,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: active ? theme.palette.brand.navy : theme.palette.neutral[200],
        backgroundColor: active ? theme.palette.semantic.infoBg : pressed ? theme.palette.neutral[100] : theme.palette.neutral[0],
        padding: 12,
      })}
    >
      <Text style={{ color: theme.palette.neutral[500], fontSize: 10, fontWeight: '900', textTransform: 'uppercase' }}>{label}</Text>
      <Text style={{ marginTop: 4, color: theme.palette.neutral[900], fontSize: 20, fontWeight: '900' }}>{value}</Text>
      <Text style={{ marginTop: 4, color: theme.palette.neutral[600], fontSize: 11, fontWeight: '800' }}>{meta}</Text>
    </Pressable>
  );
}
