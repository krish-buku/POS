import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { useAuthStore } from '../../features/auth/store';
import { useOrderStore } from '../../features/order/store';
import { useTheme } from '../../shared/theme';
import { useT } from '../../shared/i18n/store';
import { formatRupiah } from '../../shared/lib/format';
import { useCreateOrder, useCreatePayment } from '../../shared/hooks/queries';
import {
  CustomerChip,
  Numpad,
  OrderSummary,
  OverlaySheet,
  POSScreen,
  Panel,
  PaymentMethodCard,
  PrimaryButton,
  ReceiptBlock,
  ResilienceBanner,
  SectionHeader,
  StatCard,
  TextField,
  usePOSLayout,
} from '../../shared/pos/components';
import { paymentMethods } from '../../shared/pos/demoData';

export default function CashierPaymentScreen() {
  const router = useRouter();
  const theme = useTheme();
  const t = useT();
  const { user, needsBusinessSelection } = useAuthStore();
  const order = useOrderStore();
  const { isCompact } = usePOSLayout();
  const createOrder = useCreateOrder();
  const createPayment = useCreatePayment();
  const businessId = user?.businessId ?? '';
  const [method, setMethod] = useState<'cash' | 'qris' | 'edc' | 'ewallet'>('cash');
  const [amount, setAmount] = useState(String(order.total || 0));
  const [success, setSuccess] = useState(false);
  const [printerSheet, setPrinterSheet] = useState(false);
  const [completedReference, setCompletedReference] = useState('');
  const [notice, setNotice] = useState<{ title: string; message: string } | null>(null);
  const [printerResult, setPrinterResult] = useState<{ title: string; message: string } | null>(null);
  const feesTotal = order.fees.reduce((sum, fee) => sum + fee.amount, 0);
  const amountPaid = method === 'cash' ? parseInt(amount, 10) || 0 : order.total;
  const change = Math.max(0, amountPaid - order.total);
  const hasActiveItems = order.items.some((item) => !item.voided);
  const referenceMissing = method !== 'cash' && order.paymentReference.trim().length === 0;

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

  const loadDemoOrder = () => {
    order.clearOrder();
    order.setDestination({ type: 'dine_in', label: 'T1', tableId: 'table-001', tableName: 'T1', guestCount: 2 });
    order.addItem({
      menuItemId: 'menu-001',
      menuItemName: 'Nasi Goreng Spesial',
      quantity: 1,
      unitPrice: 25000,
      modifiers: [],
      notes: '',
      syncState: 'draft',
      course: 'fire',
    });
    setMethod('cash');
    setAmount('25000');
    setCompletedReference('');
  };

  const finish = async () => {
    if (!hasActiveItems) {
      setNotice({
        title: t('pos.payment.noActiveOrder'),
        message: t('pos.payment.noActiveOrderDesc'),
      });
      return;
    }
    if (method === 'cash' && amountPaid < order.total) {
      setNotice({
        title: t('pos.payment.cashShortTitle'),
        message: t('pos.payment.cashShortDesc'),
      });
      return;
    }
    const reference = method === 'cash'
      ? ''
      : order.paymentReference.trim() || `${method.toUpperCase()}-MOCK-${Date.now().toString().slice(-6)}`;
    if (reference) {
      order.setPaymentReference(reference);
      if (!order.paymentReference.trim()) {
        order.enqueueSync(`Mock ${method.toUpperCase()} payment reference generated`);
      }
    }
    const selectedPaymentMethod = paymentMethods.find((payment) => payment.id === method);
    let backendOrder = {
      id: `ORD-LOCAL-${Date.now().toString().slice(-4)}`,
      orderNumber: `ORD-LOCAL-${Date.now().toString().slice(-4)}`,
    };
    try {
      const created = await createOrder.mutateAsync({
        businessId,
        tableId: order.tableId || undefined,
        tableName: order.tableName || order.destination?.tableName || order.destination?.label || undefined,
        staffId: user.id,
        staffName: user.name,
        items: order.items.filter((item) => !item.voided),
        orderType: order.orderType,
        notes: order.orderNote || undefined,
      });
      backendOrder = {
        id: created?.id || created?.orderNumber || backendOrder.id,
        orderNumber: created?.orderNumber || backendOrder.orderNumber,
      };
      order.enqueueSync('Order synced before payment');
    } catch {
      order.enqueueSync('Payment order sync pending', true);
      order.markSyncFailed();
    }
    try {
      await createPayment.mutateAsync({
        businessId,
        orderId: backendOrder.id,
        orderNumber: backendOrder.orderNumber,
        amount: order.total,
        amountPaid,
        paymentMethodId: method,
        paymentMethodName: selectedPaymentMethod?.label ?? method.toUpperCase(),
        staffId: user.id,
      });
      order.enqueueSync('Payment synced to backend');
    } catch {
      order.enqueueSync('Payment backend sync pending', true);
      order.markSyncFailed();
    }
    order.addPrintJob({ type: 'receipt', status: 'failed' });
    order.enqueueSync(`Manual ${method.toUpperCase()} payment recorded`);
    setCompletedReference(reference);
    setSuccess(true);
  };

  const openPrinterSheet = () => {
    setPrinterResult(null);
    setPrinterSheet(true);
  };

  const closePrinterSheet = () => {
    setPrinterResult(null);
    setPrinterSheet(false);
  };

  const queuePrintLater = () => {
    order.addPrintJob({ type: 'receipt', status: 'queued', printerName: 'Front printer' });
    setPrinterResult({
      title: 'Print queued',
      message: 'Receipt was added to the printer fallback queue and can be retried from Settings.',
    });
  };

  const queueDigitalReceipt = () => {
    order.enqueueSync('Digital receipt sent');
    setNotice({
      title: 'Digital receipt queued',
      message: 'Digital receipt delivery is queued and will retry while offline.',
    });
  };

  return (
    <POSScreen
      role="cashier"
      title={t('payment.title')}
      subtitle={user.businessName}
      active="order"
      staffName={user.name}
      onNavigate={navigate as any}
      onBack={() => router.replace('/(cashier)/order')}
    >
      <View style={{ flex: 1, padding: isCompact ? 10 : 14, gap: 12 }}>
        <ResilienceBanner syncQueue={order.syncQueue} printJobs={order.printJobs} />
        {success ? (
          <View style={{ flex: 1, flexDirection: isCompact ? 'column' : 'row', gap: 12 }}>
            <Panel style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              <Text style={{ color: theme.palette.neutral[900], fontSize: 26, fontWeight: '900' }}>{t('pos.payment.success')}</Text>
              <Text style={{ color: theme.palette.neutral[600], fontSize: 14, fontWeight: '800' }}>{method.toUpperCase()} · {formatRupiah(amountPaid)}</Text>
              {completedReference ? (
                <Text style={{ color: theme.palette.neutral[500], fontSize: 12, fontWeight: '800' }}>{completedReference}</Text>
              ) : null}
              <PrimaryButton onPress={openPrinterSheet}>{t('pos.order.printReceipt')}</PrimaryButton>
              <PrimaryButton tone="light" onPress={queueDigitalReceipt}>{t('pos.order.sendDigitalReceipt')}</PrimaryButton>
              <PrimaryButton tone="dark" onPress={() => { order.clearOrder(); router.replace('/(cashier)/order'); }}>{t('pos.order.newOrder')}</PrimaryButton>
            </Panel>
            <ReceiptBlock orderNumber="ORD-LOCAL" businessName={user.businessName} items={order.items} total={order.total} paid={amountPaid} method={method.toUpperCase()} />
          </View>
        ) : (
          <View style={{ flex: 1, flexDirection: isCompact ? 'column' : 'row', gap: 12 }}>
            <Panel style={{ flex: 1 }}>
              <SectionHeader eyebrow="Order" title={order.destination?.label || order.tableName || 'No destination'} />
              <View style={{ marginTop: 12, gap: 10 }}>
                <CustomerChip customer={order.customer} />
                {!hasActiveItems ? (
                  <Panel padding={12} style={{ gap: 8, backgroundColor: theme.palette.neutral[50] }}>
                    <Text style={{ color: theme.palette.neutral[900], fontSize: 15, fontWeight: '900' }}>{t('pos.payment.noActiveOrder')}</Text>
                    <Text style={{ color: theme.palette.neutral[600], fontSize: 12, fontWeight: '800' }}>{t('pos.payment.noActiveOrderDesc')}</Text>
                    <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                      <PrimaryButton style={{ flex: 1 }} onPress={loadDemoOrder}>{t('pos.payment.loadDemoOrder')}</PrimaryButton>
                      <PrimaryButton tone="light" style={{ flex: 1 }} onPress={() => router.replace('/(cashier)/order')}>{t('pos.order.newOrder')}</PrimaryButton>
                    </View>
                  </Panel>
                ) : null}
                <OrderSummary items={order.items} subtotal={order.subtotal} discount={order.discount} fees={feesTotal} total={order.total} onQty={order.updateQuantity} />
              </View>
            </Panel>
            <Panel style={{ flex: 1 }}>
              <SectionHeader eyebrow="Method" title={formatRupiah(order.total)} />
              <View style={{ marginTop: 12, gap: 10 }}>
                {paymentMethods.map((payment) => (
                  <PaymentMethodCard
                    key={payment.id}
                    label={payment.label}
                    meta={payment.meta}
                    type={payment.type}
                    selected={method === payment.id}
                    onPress={() => {
                      setMethod(payment.id);
                      order.setPaymentReference('');
                      setAmount(payment.id === 'cash' ? String(order.total) : '0');
                    }}
                  />
                ))}
                {method !== 'cash' ? <TextField label="Reference" value={order.paymentReference} onChangeText={order.setPaymentReference} placeholder="Approval/reference code" /> : null}
              </View>
            </Panel>
            <Panel style={{ flex: 1 }}>
              <SectionHeader eyebrow="Tendered" title={method === 'cash' ? formatRupiah(amountPaid) : method.toUpperCase()} />
              <View style={{ marginTop: 12, gap: 12 }}>
                {method === 'cash' ? (
                  <>
                    <Numpad onKey={(key) => setAmount((current) => key === '<' ? (current.length <= 1 ? '0' : current.slice(0, -1)) : current === '0' ? key : `${current}${key}`)} />
                    <StatCard label="Change" value={formatRupiah(change)} />
                  </>
                ) : (
                  <StatCard label="Reference" value={order.paymentReference || 'Required'} meta="Manual payment processing only." />
                )}
                {referenceMissing ? (
                  <>
                    <Text style={{ color: theme.palette.semantic.warning, fontSize: 12, fontWeight: '800' }}>Reference is required for {method.toUpperCase()} payments.</Text>
                    <Text style={{ color: theme.palette.neutral[500], fontSize: 12, fontWeight: '800' }}>{t('pos.payment.mockReferenceHint')}</Text>
                  </>
                ) : null}
                <PrimaryButton onPress={finish}>
                  {referenceMissing ? t('pos.payment.completeWithMockReference') : t('pos.order.completePayment')}
                </PrimaryButton>
              </View>
            </Panel>
          </View>
        )}
      </View>

      <OverlaySheet visible={printerSheet} title="Printer fallback" onClose={closePrinterSheet}>
        {printerResult ? (
          <Panel padding={12} style={{ gap: 10 }}>
            <Text style={{ color: theme.palette.neutral[900], fontSize: 16, fontWeight: '900' }}>{printerResult.title}</Text>
            <Text style={{ color: theme.palette.neutral[700], fontSize: 13, fontWeight: '800' }}>{printerResult.message}</Text>
            <PrimaryButton onPress={closePrinterSheet}>Close</PrimaryButton>
          </Panel>
        ) : (
          <>
            <Text style={{ color: theme.palette.neutral[700], fontSize: 13, fontWeight: '800' }}>No physical Bluetooth printer is available in simulator. The print job is stored and can be retried from Settings.</Text>
            <PrimaryButton onPress={queuePrintLater}>Print later</PrimaryButton>
          </>
        )}
      </OverlaySheet>

      <OverlaySheet visible={!!notice} title={notice?.title || ''} onClose={() => setNotice(null)}>
        <Panel padding={12}>
          <Text style={{ color: theme.palette.neutral[700], fontSize: 13, fontWeight: '800' }}>{notice?.message}</Text>
        </Panel>
        <PrimaryButton onPress={() => setNotice(null)}>{t('common.close')}</PrimaryButton>
      </OverlaySheet>
    </POSScreen>
  );
}
