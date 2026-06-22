import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useTheme } from '../theme';
import { arr } from '../lib/safe';
import { formatRupiah } from '../lib/format';
import type { OrderLineItem, OrderFeeItem } from '../../features/order/types';
import { useT } from '../i18n/store';

interface OrderSummaryProps {
  items: OrderLineItem[];
  subtotal: number;
  discount: number;
  tax: number;
  fees: OrderFeeItem[];
  total: number;
  onUpdateQuantity?: (itemId: string, quantity: number) => void;
  onRemoveItem?: (itemId: string) => void;
  editable?: boolean;
}

export function OrderSummary({
  items,
  subtotal,
  discount,
  tax,
  fees,
  total,
  onUpdateQuantity,
  editable = true,
}: OrderSummaryProps) {
  const theme = useTheme();
  const t = useT();
  const safeItems = arr(items);
  const safeFees = arr(fees);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.palette.neutral[0],
        borderRadius: theme.radii[12],
        borderWidth: 1,
        borderColor: theme.palette.neutral[200],
        ...theme.elevation.sm,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: theme.spacing[12],
          borderBottomWidth: 1,
          borderBottomColor: theme.palette.neutral[200],
        }}
      >
        <Text
          style={{
            fontSize: theme.type.body.size,
            fontWeight: '700',
            color: theme.palette.neutral[900],
          }}
        >
          {t('order.title')}
        </Text>
        <Text
          style={{
            fontSize: theme.type.caption.size,
            color: theme.palette.neutral[600],
            fontWeight: '500',
          }}
        >
          {safeItems.length} {t('order.itemSuffix')}
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1, paddingHorizontal: theme.spacing[12] }}
        showsVerticalScrollIndicator={false}
      >
        {safeItems.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: theme.spacing[40] }}>
            <Text
              style={{
                fontSize: theme.type.body.size,
                fontWeight: '600',
                color: theme.palette.neutral[500],
                marginBottom: 4,
              }}
            >
              {t('order.summary.emptyTitle')}
            </Text>
            <Text
              style={{
                fontSize: theme.type.caption.size,
                color: theme.palette.neutral[500],
              }}
            >
              {t('order.summary.emptySubtitle')}
            </Text>
          </View>
        ) : (
          safeItems.map((item) => {
            const modifiers = arr(item.modifiers);
            return (
              <View
                key={item.id}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingVertical: 10,
                  borderBottomWidth: 1,
                  borderBottomColor: theme.palette.neutral[100],
                }}
              >
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text
                    numberOfLines={1}
                    style={{
                      fontSize: theme.type.caption.size,
                      fontWeight: '600',
                      color: theme.palette.neutral[900],
                    }}
                  >
                    {item.menuItemName}
                  </Text>
                  {modifiers.length > 0 ? (
                    <Text
                      style={{
                        fontSize: theme.type.micro.size,
                        color: theme.palette.neutral[600],
                        marginTop: 1,
                      }}
                    >
                      + {modifiers.join(', ')}
                    </Text>
                  ) : null}
                  {item.notes ? (
                    <Text
                      numberOfLines={1}
                      style={{
                        fontSize: theme.type.micro.size,
                        color: theme.palette.semantic.warning,
                        fontStyle: 'italic',
                        marginTop: 1,
                      }}
                    >
                      {t('order.notePrefix')}: {item.notes}
                    </Text>
                  ) : null}
                  <Text
                    style={{
                      fontSize: theme.type.micro.size,
                      color: theme.palette.neutral[500],
                      marginTop: 2,
                      fontVariant: ['tabular-nums'],
                    }}
                  >
                    @ {formatRupiah(item.unitPrice)}
                  </Text>
                </View>

                <View style={{ alignItems: 'flex-end' }}>
                  {editable && onUpdateQuantity ? (
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 8,
                        marginBottom: 4,
                      }}
                    >
                      <Pressable
                        onPress={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        accessibilityRole="button"
                        accessibilityLabel={`Decrease ${item.menuItemName}`}
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: theme.radii[8],
                          backgroundColor: theme.palette.neutral[100],
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: '700',
                            color: theme.palette.brand.navy,
                          }}
                        >
                          -
                        </Text>
                      </Pressable>
                      <Text
                        style={{
                          fontSize: theme.type.body.size,
                          fontWeight: '600',
                          color: theme.palette.neutral[900],
                          minWidth: 20,
                          textAlign: 'center',
                          fontVariant: ['tabular-nums'],
                        }}
                      >
                        {item.quantity}
                      </Text>
                      <Pressable
                        onPress={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        accessibilityRole="button"
                        accessibilityLabel={`Increase ${item.menuItemName}`}
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: theme.radii[8],
                          backgroundColor: theme.palette.neutral[100],
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: '700',
                            color: theme.palette.brand.navy,
                          }}
                        >
                          +
                        </Text>
                      </Pressable>
                    </View>
                  ) : (
                    <Text
                      style={{
                        fontSize: theme.type.body.size,
                        fontWeight: '600',
                        color: theme.palette.neutral[900],
                      }}
                    >
                      x{item.quantity}
                    </Text>
                  )}
                  <Text
                    style={{
                      fontSize: theme.type.caption.size,
                      fontWeight: '600',
                      color: theme.palette.neutral[900],
                      fontVariant: ['tabular-nums'],
                    }}
                  >
                    {formatRupiah(item.subtotal)}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {safeItems.length > 0 ? (
        <View style={{ padding: theme.spacing[12] }}>
          <View style={{ height: 1, backgroundColor: theme.palette.neutral[200], marginVertical: 6 }} />

          <Row label={t('payment.subtotal')} value={formatRupiah(subtotal)} />

          {discount > 0 ? (
            <Row
              label={t('order.discount')}
              value={`-${formatRupiah(discount)}`}
              labelColor={theme.palette.semantic.success}
              valueColor={theme.palette.semantic.success}
              valueWeight="600"
            />
          ) : null}

          {safeFees.map((fee) => (
            <Row key={fee.id} label={fee.name} value={formatRupiah(fee.amount)} />
          ))}

          {tax > 0 ? <Row label={t('payment.tax')} value={formatRupiah(tax)} /> : null}

          <View style={{ height: 1, backgroundColor: theme.palette.neutral[200], marginVertical: 6 }} />

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingVertical: 3,
            }}
          >
            <Text
              style={{
                fontSize: theme.type.body.size,
                fontWeight: '800',
                color: theme.palette.neutral[900],
              }}
            >
              TOTAL
            </Text>
            <Text
              style={{
                fontSize: theme.type.price.size,
                lineHeight: theme.type.price.lineHeight,
                fontWeight: '800',
                color: theme.palette.brand.navy,
                fontVariant: ['tabular-nums'],
              }}
            >
              {formatRupiah(total)}
            </Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

function Row({
  label,
  value,
  labelColor,
  valueColor,
  valueWeight = '500',
}: {
  label: string;
  value: string;
  labelColor?: string;
  valueColor?: string;
  valueWeight?: '400' | '500' | '600' | '700';
}) {
  const theme = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 3,
      }}
    >
      <Text
        style={{
          fontSize: theme.type.caption.size,
          color: labelColor || theme.palette.neutral[600],
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontSize: theme.type.caption.size,
          fontWeight: valueWeight,
          color: valueColor || theme.palette.neutral[900],
          fontVariant: ['tabular-nums'],
        }}
      >
        {value}
      </Text>
    </View>
  );
}
