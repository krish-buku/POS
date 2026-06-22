import React from 'react';
import { Text, View } from 'react-native';
import { Clock, Users } from 'lucide-react-native';
import { useTheme } from '../theme';
import { formatElapsed, formatRupiah } from '../lib/format';
import type { TableStatus } from '../constants/colors';
import { TableTile } from './TableTile';
import { useT } from '../i18n/store';

interface TableCardProps {
  id: string;
  number: number;
  name: string;
  capacity: number;
  status: TableStatus;
  runningTotal: number;
  assignedStaffId: string | null;
  orderStartedAt?: string | null;
  isSelected?: boolean;
  showBillCta?: boolean;
  onPress: (id: string) => void;
  onLongPress?: (id: string) => void;
}

export function TableCard({
  id,
  number,
  name,
  capacity,
  status,
  runningTotal,
  assignedStaffId,
  orderStartedAt,
  isSelected = false,
  showBillCta = false,
  onPress,
  onLongPress,
}: TableCardProps) {
  const theme = useTheme();
  const t = useT();
  const sessions = status === 'occupied' ? Math.max(1, Math.min(4, Math.ceil((runningTotal || 1) / 65000))) : undefined;
  const shape = capacity >= 6 ? 'long' : capacity <= 2 ? 'round' : 'square';

  return (
    <View
      style={{
        backgroundColor: theme.palette.neutral[0],
        borderRadius: 14,
        borderWidth: 1,
        borderColor: isSelected ? theme.palette.brand.navy : theme.palette.neutral[200],
        padding: 10,
        minWidth: 170,
        ...theme.elevation.sm,
      }}
    >
      <TableTile
        id={id}
        label={name || `Table ${number}`}
        seats={capacity}
        shape={shape}
        status={status}
        runningTotal={runningTotal}
        sessions={sessions}
        selected={isSelected}
        pending={false}
        size={148}
        onPress={() => onPress(id)}
        onLongPress={onLongPress ? () => onLongPress(id) : undefined}
      />

      {status === 'occupied' ? (
        <View style={{ marginTop: 8, gap: 5 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <Clock size={12} color={theme.palette.neutral[500]} />
              <Text style={{ color: theme.palette.neutral[600], fontSize: 11, fontWeight: '700' }}>
                {formatElapsed(orderStartedAt)}
              </Text>
            </View>
            <Text style={{ color: theme.palette.brand.navy, fontSize: 11, fontWeight: '900' }}>
              {formatRupiah(runningTotal)}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <Users size={12} color={theme.palette.neutral[500]} />
              <Text style={{ color: theme.palette.neutral[600], fontSize: 11, fontWeight: '700' }}>
                Opened by: {assignedStaffId ?? 'Staff'}
              </Text>
            </View>
            {showBillCta ? (
              <Text style={{ color: theme.palette.semantic.success, fontSize: 11, fontWeight: '900' }}>
                {t('tabs.payment').toUpperCase()}
              </Text>
            ) : null}
          </View>
        </View>
      ) : null}
    </View>
  );
}
