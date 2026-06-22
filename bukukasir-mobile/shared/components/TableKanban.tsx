import React, { useMemo } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useTheme } from '../theme';
import { TableCard } from './TableCard';
import { useT } from '../i18n/store';
import type { TableStatus } from '../constants/colors';
import type { TranslationKey } from '../i18n/translations';

interface Props {
  tables: any[];
  selectedTableId?: string | null;
  showBillCta?: boolean;
  onTablePress: (id: string) => void;
  onTableLongPress?: (id: string) => void;
}

const COLUMNS: { status: TableStatus; labelKey: TranslationKey; tone: 'available' | 'occupied' | 'reserved' | 'cleaning' }[] = [
  { status: 'available', labelKey: 'tables.status.available', tone: 'available' },
  { status: 'occupied',  labelKey: 'tables.status.occupied',  tone: 'occupied'  },
  { status: 'reserved',  labelKey: 'tables.status.reserved',  tone: 'reserved'  },
  { status: 'cleaning',  labelKey: 'tables.status.cleaning',  tone: 'cleaning'  },
];

export function TableKanban({ tables, selectedTableId, showBillCta, onTablePress, onTableLongPress }: Props) {
  const theme = useTheme();
  const t = useT();

  const byStatus = useMemo(() => {
    const m: Record<TableStatus, any[]> = {
      available: [],
      occupied: [],
      reserved: [],
      cleaning: [],
    };
    for (const t of tables) {
      if (t.status && m[t.status as TableStatus]) m[t.status as TableStatus].push(t);
    }
    return m;
  }, [tables]);

  return (
    <View style={{ flex: 1, flexDirection: 'row', padding: theme.spacing[12], gap: theme.spacing[12] }}>
      {COLUMNS.map((col) => {
        const tone = theme.palette.status.table[col.tone];
        const bg = theme.palette.status.table[`${col.tone}Bg` as keyof typeof theme.palette.status.table];
        const items = byStatus[col.status];
        return (
          <View
            key={col.status}
            style={{
              flex: 1,
              backgroundColor: theme.palette.neutral[100],
              borderRadius: theme.radii[16],
              overflow: 'hidden',
            }}
          >
            {/* Column header */}
            <View
              style={{
                paddingHorizontal: theme.spacing[12],
                paddingVertical: theme.spacing[10],
                backgroundColor: bg,
                borderBottomWidth: 1,
                borderBottomColor: theme.palette.neutral[200],
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <View
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: tone,
                }}
              />
              <Text
                style={{
                  flex: 1,
                  fontSize: 14,
                  fontWeight: '800',
                  color: theme.palette.neutral[900],
                  textTransform: 'uppercase',
                  letterSpacing: 0.6,
                }}
              >
                {t(col.labelKey)}
              </Text>
              <View
                style={{
                  minWidth: 26,
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 12,
                  backgroundColor: tone,
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '800',
                    color: '#FFFFFF',
                    fontVariant: ['tabular-nums'],
                  }}
                >
                  {items.length}
                </Text>
              </View>
            </View>

            {/* Column body */}
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{
                padding: theme.spacing[10],
                gap: theme.spacing[10],
              }}
            >
              {items.length === 0 ? (
                <View
                  style={{
                    paddingVertical: theme.spacing[20],
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      color: theme.palette.neutral[500],
                      fontWeight: '600',
                    }}
                  >
                    {t('tables.kanbanEmpty')}
                  </Text>
                </View>
              ) : (
                items.map((item) => (
                  <TableCard
                    key={item.id}
                    id={item.id}
                    number={item.number}
                    name={item.name}
                    capacity={item.capacity}
                    status={item.status}
                    runningTotal={item.runningTotal || 0}
                    assignedStaffId={item.assignedStaffId || null}
                    orderStartedAt={item.orderStartedAt || item.currentOrderStartedAt || null}
                    isSelected={item.id === selectedTableId}
                    showBillCta={showBillCta}
                    onPress={onTablePress}
                    onLongPress={onTableLongPress}
                  />
                ))
              )}
            </ScrollView>
          </View>
        );
      })}
    </View>
  );
}
