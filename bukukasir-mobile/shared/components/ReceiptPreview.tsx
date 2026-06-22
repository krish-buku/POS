import React from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '../theme';
import { formatRupiah, formatTime } from '../lib/format';
import { useT } from '../i18n/store';

interface ReceiptPreviewProps {
  businessName?: string;
  order: any;
  amountPaid?: number;
  paymentLabel?: string;
  remaining?: number;
  compact?: boolean;
}

const toNumber = (value: unknown) =>
  typeof value === 'number' && Number.isFinite(value) ? value : Number(value ?? 0) || 0;

export function ReceiptPreview({
  businessName = 'BukuKasir',
  order,
  amountPaid,
  paymentLabel = 'Manual',
  remaining = 0,
  compact = false,
}: ReceiptPreviewProps) {
  const theme = useTheme();
  const t = useT();
  const items = Array.isArray(order?.items) ? order.items : [];
  const total = toNumber(order?.total);

  return (
    <View
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.palette.neutral[200],
        padding: compact ? 12 : 16,
      }}
    >
      <Text style={{ color: theme.palette.neutral[900], fontSize: compact ? 14 : 16, fontWeight: '900', textAlign: 'center' }}>
        {businessName}
      </Text>
      <Text style={{ color: theme.palette.neutral[500], fontSize: 11, textAlign: 'center', marginTop: 2 }}>
        {t('receipt.preview')} · {formatTime(order?.createdAt ?? new Date())}
      </Text>
      <View style={{ height: 1, backgroundColor: theme.palette.neutral[200], marginVertical: 10 }} />

      <Text style={{ color: theme.palette.neutral[700], fontSize: 12, fontWeight: '800' }}>
        {order?.orderNumber ?? t('receipt.draft')} {order?.tableName ? `· ${order.tableName}` : ''}
      </Text>

      <View style={{ marginTop: 8, gap: 6 }}>
        {items.map((item: any, index: number) => (
          <View key={item?.id ?? index}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
              <Text style={{ flex: 1, color: theme.palette.neutral[900], fontSize: 12 }} numberOfLines={1}>
                {toNumber(item?.quantity) || 1}x {item?.menuItemName ?? item?.name ?? t('receipt.item')}
              </Text>
              <Text style={{ color: theme.palette.neutral[900], fontSize: 12, fontVariant: ['tabular-nums'] }}>
                {formatRupiah(toNumber(item?.subtotal))}
              </Text>
            </View>
            {Array.isArray(item?.modifiers) && item.modifiers.length > 0 ? (
              <Text style={{ color: theme.palette.neutral[500], fontSize: 10, marginLeft: 10 }}>
                + {item.modifiers.join(', ')}
              </Text>
            ) : null}
            {item?.notes ? (
              <Text style={{ color: theme.palette.neutral[500], fontSize: 10, marginLeft: 10 }}>
                {t('order.notePrefix')}: {item.notes}
              </Text>
            ) : null}
          </View>
        ))}
      </View>

      <View style={{ height: 1, backgroundColor: theme.palette.neutral[200], marginVertical: 10 }} />
      <ReceiptRow label={t('payment.subtotal')} value={formatRupiah(toNumber(order?.subtotal))} />
      {toNumber(order?.discount) > 0 ? <ReceiptRow label={t('receipt.discount')} value={`-${formatRupiah(toNumber(order?.discount)).replace('Rp ', 'Rp ')}`} /> : null}
      {toNumber(order?.tax) > 0 ? <ReceiptRow label={t('receipt.taxService')} value={formatRupiah(toNumber(order?.tax))} /> : null}
      <ReceiptRow label="TOTAL" value={formatRupiah(total)} strong />
      {amountPaid != null ? <ReceiptRow label={`${t('receipt.pay')} (${paymentLabel})`} value={formatRupiah(amountPaid)} /> : null}
      {remaining > 0 ? <ReceiptRow label={t('receipt.remainingOpenTab')} value={formatRupiah(remaining)} warning /> : null}
      <Text style={{ color: theme.palette.neutral[500], fontSize: 10, textAlign: 'center', marginTop: 12 }}>
        {t('receipt.manualNotice')}
      </Text>
    </View>
  );
}

function ReceiptRow({
  label,
  value,
  strong,
  warning,
}: {
  label: string;
  value: string;
  strong?: boolean;
  warning?: boolean;
}) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 }}>
      <Text style={{ color: warning ? theme.palette.semantic.warning : theme.palette.neutral[700], fontSize: strong ? 14 : 12, fontWeight: strong ? '900' : '600' }}>
        {label}
      </Text>
      <Text style={{ color: warning ? theme.palette.semantic.warning : theme.palette.neutral[900], fontSize: strong ? 16 : 12, fontWeight: strong ? '900' : '700', fontVariant: ['tabular-nums'] }}>
        {value}
      </Text>
    </View>
  );
}
