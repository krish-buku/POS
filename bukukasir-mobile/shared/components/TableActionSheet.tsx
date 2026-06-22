import React, { useState } from 'react';
import { View, Text, Pressable, Alert, TextInput, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Sheet } from '../ui/Sheet';
import { useTheme } from '../theme';
import {
  useTables,
  useUpdateTableStatus,
  useMergeTables,
  useVoidOrder,
} from '../hooks/queries';
import { useAuthStore } from '../../features/auth/store';
import { arr } from '../lib/safe';
import type { TableStatus } from '../constants/colors';
import { useT } from '../i18n/store';
import { palette } from '../theme/colors';

interface TableActionSheetProps {
  tableId: string | null;
  onClose: () => void;
  /** Limits which actions are shown and where Transfer routes to. Default 'cashier'. */
  role?: 'cashier' | 'waiter';
}

const STATUS_OPTION_DEFS: {
  value: TableStatus;
  labelKey: Parameters<ReturnType<typeof useT>>[0];
  color: string;
}[] = [
  { value: 'available', labelKey: 'tables.status.available', color: palette.status.table.available },
  { value: 'occupied',  labelKey: 'tables.status.occupied',  color: palette.status.table.occupied  },
  { value: 'reserved',  labelKey: 'tables.status.reserved',  color: palette.status.table.reserved  },
  { value: 'cleaning',  labelKey: 'tables.status.cleaning',  color: palette.status.table.cleaning  },
];

type Mode = 'menu' | 'status' | 'merge' | 'void';

export function TableActionSheet({ tableId, onClose, role = 'cashier' }: TableActionSheetProps) {
  const theme = useTheme();
  const t = useT();
  const router = useRouter();
  const { user } = useAuthStore();
  const businessId = user?.businessId;
  const { data } = useTables(businessId);
  const tables = arr(data);
  const table = tables.find((tt) => tt.id === tableId);

  const updateStatus = useUpdateTableStatus();
  const mergeTables = useMergeTables();
  const voidOrder = useVoidOrder();

  const [mode, setMode] = useState<Mode>('menu');
  const [voidReason, setVoidReason] = useState('');
  const [managerPin, setManagerPin] = useState('');

  const handleClose = () => {
    setMode('menu');
    setVoidReason('');
    setManagerPin('');
    onClose();
  };

  const handleStatusChange = (next: TableStatus) => {
    if (!tableId) return;
    updateStatus.mutate(
      { tableId, status: next, businessId },
      {
        onSuccess: () => handleClose(),
        onError: () => Alert.alert(t('common.error'), t('action.err.status')),
      },
    );
  };

  const handleMerge = (targetTableId: string) => {
    if (!tableId) return;
    mergeTables.mutate(
      { tableIds: [tableId, targetTableId], targetTableId },
      {
        onSuccess: () => handleClose(),
        onError: (e: any) =>
          Alert.alert(t('common.error'), e?.message || t('action.err.merge')),
      },
    );
  };

  const handleVoid = () => {
    if (!managerPin || managerPin.length !== 6) {
      Alert.alert(t('common.error'), t('action.void.err.pin'));
      return;
    }
    if (!voidReason.trim()) {
      Alert.alert(t('common.error'), t('action.void.err.reason'));
      return;
    }
    if (!table?.currentOrderId) {
      Alert.alert(t('common.error'), t('action.void.err.noOrder'));
      return;
    }
    voidOrder.mutate(
      { orderId: table.currentOrderId, reason: voidReason.trim() },
      {
        onSuccess: () => {
          handleClose();
          Alert.alert(t('common.done'), t('action.void.success'));
        },
        onError: (e: any) =>
          Alert.alert(t('common.error'), e?.message || t('action.err.void')),
      },
    );
  };

  const handleTransfer = () => {
    if (!tableId) return;
    handleClose();
    const base = role === 'waiter' ? '/(waiter)/transfer' : '/(cashier)/transfer';
    router.push(`${base}?fromTableId=${tableId}`);
  };

  const handleAssignStaff = () => {
    if (!tableId) return;
    handleClose();
    Alert.alert(t('action.assignStaff.pendingTitle'), t('action.assignStaff.pendingMessage'));
  };

  const otherOccupiedTables = tables.filter(
    (tt) => tt.id !== tableId && tt.status === 'occupied',
  );

  const visible = tableId !== null;
  if (!table) {
    return (
      <Sheet visible={visible} onDismiss={handleClose}>
        <View />
      </Sheet>
    );
  }

  return (
    <Sheet
      visible={visible}
      onDismiss={handleClose}
      title={`${table.name} — ${table.capacity} ${t('tables.seats')}`}
      snapPoints={[520]}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: theme.spacing[12], gap: theme.spacing[8] }}
      >
        {mode === 'menu' ? (
          <>
            <ActionRow
              icon="🔄"
              label={t('action.changeStatus')}
              description={t('action.changeStatus.desc')}
              onPress={() => setMode('status')}
            />
            <ActionRow
              icon="👤"
              label={t('action.assignStaff')}
              description={t('action.assignStaff.desc')}
              onPress={handleAssignStaff}
            />
            <ActionRow
              icon="➡️"
              label={t('action.transfer')}
              description={t('action.transfer.desc')}
              onPress={handleTransfer}
              disabled={table.status !== 'occupied'}
            />
            <ActionRow
              icon="🔗"
              label={t('action.merge')}
              description={t('action.merge.desc')}
              onPress={() => setMode('merge')}
              disabled={table.status !== 'occupied' || otherOccupiedTables.length === 0}
            />
            {role === 'cashier' ? (
              <ActionRow
                icon="❌"
                label={t('action.void')}
                description={t('action.void.desc')}
                onPress={() => setMode('void')}
                disabled={table.status !== 'occupied' || !table.currentOrderId}
              />
            ) : null}
          </>
        ) : mode === 'status' ? (
          <>
            <SectionTitle text={t('action.pickStatus')} theme={theme} />
            {STATUS_OPTION_DEFS.map((opt) => (
              <Pressable
                key={opt.value}
                onPress={() => handleStatusChange(opt.value)}
                disabled={opt.value === table.status}
                accessibilityRole="button"
                accessibilityLabel={t(opt.labelKey)}
                accessibilityState={{ disabled: opt.value === table.status, selected: opt.value === table.status }}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  padding: 14,
                  borderRadius: 10,
                  borderWidth: 1.5,
                  borderColor:
                    opt.value === table.status ? opt.color : theme.palette.neutral[200],
                  backgroundColor:
                    opt.value === table.status
                      ? `${opt.color}15`
                      : pressed
                      ? theme.palette.neutral[100]
                      : theme.palette.neutral[0],
                  opacity: opt.value === table.status ? 0.6 : 1,
                })}
              >
                <View
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 7,
                    backgroundColor: opt.color,
                  }}
                />
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: '700',
                    color: theme.palette.neutral[900],
                    flex: 1,
                  }}
                >
                  {t(opt.labelKey)}
                </Text>
                {opt.value === table.status ? (
                  <Text
                    style={{
                      fontSize: 12,
                      color: theme.palette.neutral[600],
                      fontWeight: '600',
                    }}
                  >
                    {t('action.current')}
                  </Text>
                ) : null}
              </Pressable>
            ))}
            <BackButton onPress={() => setMode('menu')} theme={theme} label={t('common.back')} />
          </>
        ) : mode === 'merge' ? (
          <>
            <SectionTitle text={t('action.merge.pick')} theme={theme} />
            {otherOccupiedTables.length === 0 ? (
              <Text
                style={{
                  fontSize: 13,
                  color: theme.palette.neutral[600],
                  fontStyle: 'italic',
                  padding: 12,
                }}
              >
                {t('action.merge.none')}
              </Text>
            ) : (
              otherOccupiedTables.map((tt: any) => (
                <Pressable
                  key={tt.id}
                  onPress={() => handleMerge(tt.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`${t('action.merge')}: ${tt.name}`}
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    padding: 14,
                    borderRadius: 10,
                    borderWidth: 1.5,
                    borderColor: theme.palette.neutral[200],
                    backgroundColor: pressed
                      ? theme.palette.neutral[100]
                      : theme.palette.neutral[0],
                  })}
                >
                  <Text style={{ fontSize: 20 }}>🍽️</Text>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: '700',
                        color: theme.palette.neutral[900],
                      }}
                    >
                      {tt.name}
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        color: theme.palette.neutral[600],
                        marginTop: 2,
                      }}
                    >
                      {tt.capacity} {t('tables.seats')}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 18, color: theme.palette.neutral[400] }}>›</Text>
                </Pressable>
              ))
            )}
            <BackButton onPress={() => setMode('menu')} theme={theme} label={t('common.back')} />
          </>
        ) : mode === 'void' ? (
          <>
            <SectionTitle text={t('action.void.confirm')} theme={theme} />
            <Text
              style={{
                fontSize: 13,
                color: theme.palette.neutral[600],
                marginBottom: 10,
                lineHeight: 18,
              }}
            >
              {t('action.void.warning')}
            </Text>

            <Text
              style={{
                fontSize: 12,
                fontWeight: '700',
                color: theme.palette.neutral[700],
                marginTop: 4,
                marginBottom: 6,
              }}
            >
              {t('action.void.reasonLabel')}
            </Text>
            <TextInput
              value={voidReason}
              onChangeText={setVoidReason}
              placeholder={t('action.void.reasonPlaceholder')}
              multiline
              style={{
                borderWidth: 1,
                borderColor: theme.palette.neutral[300],
                borderRadius: 10,
                padding: 12,
                minHeight: 72,
                fontSize: 14,
                color: theme.palette.neutral[900],
                backgroundColor: theme.palette.neutral[0],
                textAlignVertical: 'top',
              }}
            />

            <Text
              style={{
                fontSize: 12,
                fontWeight: '700',
                color: theme.palette.neutral[700],
                marginTop: 10,
                marginBottom: 6,
              }}
            >
              {t('action.void.pinLabel')}
            </Text>
            <TextInput
              value={managerPin}
              onChangeText={setManagerPin}
              placeholder="● ● ● ● ● ●"
              secureTextEntry
              keyboardType="number-pad"
              maxLength={6}
              style={{
                borderWidth: 1,
                borderColor: theme.palette.neutral[300],
                borderRadius: 10,
                padding: 12,
                fontSize: 18,
                letterSpacing: 8,
                textAlign: 'center',
                color: theme.palette.neutral[900],
                backgroundColor: theme.palette.neutral[0],
              }}
            />
            <Text
              style={{
                fontSize: 11,
                color: theme.palette.neutral[500],
                marginTop: 4,
                fontStyle: 'italic',
              }}
            >
              {t('action.void.pinHint')}
            </Text>

            <Pressable
              onPress={handleVoid}
              disabled={voidOrder.isPending}
              accessibilityRole="button"
              accessibilityLabel={t('action.void.submit')}
              accessibilityState={{ disabled: voidOrder.isPending }}
              style={({ pressed }) => ({
                marginTop: 12,
                padding: 14,
                borderRadius: 10,
                alignItems: 'center',
                backgroundColor: pressed
                  ? theme.palette.semantic.error + 'CC'
                  : theme.palette.semantic.error,
                opacity: voidOrder.isPending ? 0.6 : 1,
              })}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '800',
                  color: '#FFFFFF',
                  letterSpacing: 0.4,
                  textTransform: 'uppercase',
                }}
              >
                {t('action.void.submit')}
              </Text>
            </Pressable>

            <BackButton onPress={() => setMode('menu')} theme={theme} label={t('common.back')} />
          </>
        ) : null}
      </ScrollView>
    </Sheet>
  );
}

function SectionTitle({ text, theme }: { text: string; theme: ReturnType<typeof useTheme> }) {
  return (
    <Text
      style={{
        fontSize: 13,
        fontWeight: '700',
        color: theme.palette.neutral[700],
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
      }}
    >
      {text}
    </Text>
  );
}

function BackButton({
  onPress,
  label,
  theme,
}: {
  onPress: () => void;
  label: string;
  theme: ReturnType<typeof useTheme>;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => ({
        marginTop: 8,
        padding: 12,
        borderRadius: 10,
        alignItems: 'center',
        backgroundColor: pressed ? theme.palette.neutral[200] : theme.palette.neutral[100],
      })}
    >
      <Text style={{ fontSize: 14, fontWeight: '700', color: theme.palette.neutral[700] }}>
        {label}
      </Text>
    </Pressable>
  );
}

function ActionRow({
  icon,
  label,
  description,
  onPress,
  disabled,
}: {
  icon: string;
  label: string;
  description: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={`${label}. ${description}`}
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        padding: 14,
        borderRadius: 10,
        backgroundColor: pressed
          ? theme.palette.neutral[100]
          : theme.palette.neutral[0],
        borderWidth: 1,
        borderColor: theme.palette.neutral[200],
        opacity: disabled ? 0.5 : 1,
      })}
    >
      <Text style={{ fontSize: 22 }}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 15,
            fontWeight: '700',
            color: theme.palette.neutral[900],
          }}
        >
          {label}
        </Text>
        <Text
          style={{
            fontSize: 12,
            color: theme.palette.neutral[600],
            marginTop: 2,
          }}
        >
          {description}
        </Text>
      </View>
      <Text style={{ fontSize: 18, color: theme.palette.neutral[400] }}>›</Text>
    </Pressable>
  );
}
