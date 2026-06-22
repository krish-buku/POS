import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { Mail, Printer, RefreshCcw, Search } from 'lucide-react-native';
import { useAuthStore } from '../../features/auth/store';
import { useOrderStore } from '../../features/order/store';
import { useTheme } from '../../shared/theme';
import { useT } from '../../shared/i18n/store';
import { formatRupiah } from '../../shared/lib/format';
import {
  OverlaySheet,
  POSScreen,
  Panel,
  PrimaryButton,
  ReceiptBlock,
  ResilienceBanner,
  SearchField,
  SectionHeader,
  SegmentTabs,
  StatCard,
  TextField,
  usePOSLayout,
} from '../../shared/pos/components';
import { historyOrders } from '../../shared/pos/demoData';

type Filter = 'all' | 'paid' | 'open' | 'review';

export default function CashierHistoryScreen() {
  const router = useRouter();
  const theme = useTheme();
  const t = useT();
  const { user, needsBusinessSelection } = useAuthStore();
  const order = useOrderStore();
  const { isCompact } = usePOSLayout();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [selectedId, setSelectedId] = useState(historyOrders[0]?.id ?? '');
  const [receiptSheet, setReceiptSheet] = useState(false);
  const [receiptPhone, setReceiptPhone] = useState(order.customer?.phone || '');
  const [notice, setNotice] = useState<{ title: string; message: string } | null>(null);
  const [receiptNotice, setReceiptNotice] = useState<{ title: string; message: string } | null>(null);

  if (needsBusinessSelection) {
    return <Redirect href="/(auth)/select-business" />;
  }

  if (!user?.businessId) {
    return <Redirect href="/(auth)/login" />;
  }

  const navigate = (target: 'order' | 'tables' | 'history' | 'settings') => {
    if (target === 'order') router.replace('/(cashier)/order');
    if (target === 'tables') router.replace('/(cashier)/tables');
    if (target === 'history') router.replace('/(cashier)/history');
    if (target === 'settings') router.replace('/(cashier)/settings');
  };

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return historyOrders.filter((row) => {
      const matchesQuery = `${row.orderNumber} ${row.customer} ${row.table} ${row.method}`.toLowerCase().includes(q);
      const matchesFilter =
        filter === 'all' ||
        (filter === 'paid' && row.status === 'Paid') ||
        (filter === 'open' && row.status === 'Open tab') ||
        (filter === 'review' && row.status.includes('review'));
      return matchesQuery && matchesFilter;
    });
  }, [filter, query]);

  const selected = historyOrders.find((row) => row.id === selectedId) ?? historyOrders[0];

  const closeReceiptSheet = () => {
    setReceiptSheet(false);
    setReceiptNotice(null);
  };

  const queueReprint = () => {
    order.addPrintJob({ type: 'reprint', status: 'queued', printerName: 'Front printer' });
    setNotice({ title: 'Reprint queued', message: `${selected.orderNumber} was added to the printer fallback queue.` });
  };

  const sendDigitalReceipt = () => {
    order.enqueueSync(`Digital receipt sent for ${selected.orderNumber}`);
    setNotice({ title: 'Digital receipt queued', message: `${selected.orderNumber} will be sent when sync completes.` });
  };

  const openRefundReview = () => {
    order.enqueueSync(`Refund review opened for ${selected.orderNumber}`);
    setNotice({ title: 'Refund review queued', message: `${selected.orderNumber} was marked for refund review.` });
  };

  return (
    <POSScreen
      role="cashier"
      title={t('pos.screen.history')}
      subtitle={user.businessName}
      active="history"
      staffName={user.name}
      onNavigate={navigate as any}
    >
      <View style={{ flex: 1, padding: isCompact ? 10 : 14, gap: 12 }}>
        <ResilienceBanner syncQueue={order.syncQueue} printJobs={order.printJobs} />

        <View style={{ flexDirection: isCompact ? 'column' : 'row', gap: 12, flex: 1 }}>
          <Panel style={{ flex: 1.25, minWidth: 0 }}>
            <SectionHeader eyebrow="Orders" title="History and receipts" />
            <View style={{ marginTop: 12, gap: 10 }}>
              <SearchField value={query} onChangeText={setQuery} placeholder="Search order, table, customer" />
              <SegmentTabs
                value={filter}
                onChange={setFilter}
                items={[
                  { key: 'all', label: 'All' },
                  { key: 'paid', label: 'Paid' },
                  { key: 'open', label: 'Open tab' },
                  { key: 'review', label: 'Review' },
                ]}
              />
            </View>
            <ScrollView contentContainerStyle={{ gap: 10, paddingTop: 12, paddingBottom: 20 }}>
              {rows.map((row) => {
                const selectedRow = row.id === selected.id;
                return (
                  <Pressable
                    key={row.id}
                    onPress={() => setSelectedId(row.id)}
                    accessibilityRole="button"
                    accessibilityLabel={`View order ${row.orderNumber}, ${row.customer}, ${formatRupiah(row.total)}, ${row.status}`}
                    accessibilityState={{ selected: selectedRow }}
                    style={({ pressed }) => ({
                      padding: 14,
                      borderRadius: 8,
                      borderWidth: 1.5,
                      borderColor: selectedRow ? theme.palette.brand.navy : theme.palette.neutral[200],
                      backgroundColor: selectedRow ? theme.palette.semantic.infoBg : pressed ? theme.palette.neutral[100] : '#FFFFFF',
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 12,
                    })}
                  >
                    <View style={{ width: 42, height: 42, borderRadius: 10, backgroundColor: theme.palette.neutral[100], alignItems: 'center', justifyContent: 'center' }}>
                      <Search size={18} color={theme.palette.neutral[700]} />
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={{ color: theme.palette.neutral[900], fontSize: 14, fontWeight: '900' }}>{row.orderNumber}</Text>
                      <Text style={{ marginTop: 3, color: theme.palette.neutral[500], fontSize: 12, fontWeight: '700' }}>{row.time} · {row.customer} · {row.table}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ color: theme.palette.neutral[900], fontSize: 14, fontWeight: '900' }}>{formatRupiah(row.total)}</Text>
                      <Text style={{ marginTop: 3, color: row.status === 'Paid' ? theme.palette.semantic.success : theme.palette.semantic.warning, fontSize: 11, fontWeight: '900' }}>{row.status}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          </Panel>

          <Panel style={{ flex: 1 }}>
            <SectionHeader eyebrow="Detail" title={selected.orderNumber} />
            <View style={{ marginTop: 12, gap: 10 }}>
              <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
                <StatCard label="Total" value={formatRupiah(selected.total)} />
                <StatCard label="Method" value={selected.method} />
              </View>
              <Panel padding={12} style={{ gap: 8, backgroundColor: theme.palette.neutral[50] }}>
                <Text style={{ color: theme.palette.neutral[900], fontSize: 15, fontWeight: '900' }}>{selected.customer}</Text>
                <Text style={{ color: theme.palette.neutral[600], fontSize: 12, fontWeight: '700' }}>Table/destination: {selected.table}</Text>
                <Text style={{ color: theme.palette.neutral[600], fontSize: 12, fontWeight: '700' }}>Audit: cashier {user.name} · manual POS payment · print fallback available</Text>
              </Panel>
              <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                <PrimaryButton onPress={() => { setReceiptNotice(null); setReceiptSheet(true); }}>View receipt</PrimaryButton>
                <PrimaryButton tone="light" onPress={queueReprint}>
                  Reprint
                </PrimaryButton>
                <PrimaryButton tone="light" onPress={sendDigitalReceipt}>
                  Digital receipt
                </PrimaryButton>
                <PrimaryButton tone="light" onPress={openRefundReview}>
                  Refund review
                </PrimaryButton>
              </View>
            </View>
          </Panel>
        </View>
      </View>

      <OverlaySheet visible={receiptSheet} title="Receipt detail" onClose={closeReceiptSheet}>
        {receiptNotice ? (
          <InlineNotice title={receiptNotice.title} message={receiptNotice.message} onClose={closeReceiptSheet} />
        ) : (
          <>
            <ReceiptBlock
              orderNumber={selected.orderNumber}
              businessName={user.businessName}
              items={order.items.length > 0 ? order.items : [
                { id: 'r-1', menuItemId: 'menu-001', menuItemName: 'Nasi Goreng Spesial', quantity: 2, unitPrice: 35000, modifiers: [], notes: '', subtotal: 70000 },
                { id: 'r-2', menuItemId: 'menu-005', menuItemName: 'Es Teh Manis', quantity: 2, unitPrice: 8000, modifiers: [], notes: '', subtotal: 16000 },
              ]}
              total={selected.total}
              paid={selected.total}
              method={selected.method}
            />
            <TextField label="Digital receipt phone/email" value={receiptPhone} onChangeText={setReceiptPhone} placeholder="+62 or email" />
            <PrimaryButton onPress={() => {
              order.enqueueSync(`Digital receipt sent to ${receiptPhone || 'customer'}`);
              setReceiptNotice({ title: 'Receipt send queued', message: `Receipt delivery is queued for ${receiptPhone || 'customer'}.` });
            }}>
              Send receipt
            </PrimaryButton>
          </>
        )}
      </OverlaySheet>

      <OverlaySheet visible={!!notice} title={notice?.title || ''} onClose={() => setNotice(null)}>
        <Text style={{ color: theme.palette.neutral[700], fontSize: 13, fontWeight: '800' }}>{notice?.message}</Text>
        <PrimaryButton onPress={() => setNotice(null)}>{t('common.close')}</PrimaryButton>
      </OverlaySheet>
    </POSScreen>
  );
}

function InlineNotice({ title, message, onClose }: { title: string; message: string; onClose: () => void }) {
  const theme = useTheme();
  return (
    <Panel padding={12} style={{ gap: 10 }}>
      <Text style={{ color: theme.palette.neutral[900], fontSize: 16, fontWeight: '900' }}>{title}</Text>
      <Text style={{ color: theme.palette.neutral[700], fontSize: 13, fontWeight: '800' }}>{message}</Text>
      <PrimaryButton onPress={onClose}>Close</PrimaryButton>
    </Panel>
  );
}
