import React, { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View, type LayoutChangeEvent } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import {
  ChefHat,
  Clock,
  FileText,
  Flame,
  Percent,
  Printer,
  ReceiptText,
  Save,
  Scissors,
  Send,
  UserPlus,
} from 'lucide-react-native';
import { useAuthStore } from '../../features/auth/store';
import { useOrderStore } from '../../features/order/store';
import { useTheme } from '../../shared/theme';
import {
  useCategories,
  useCreateCustomer,
  useCreateOpenTabSession,
  useCreateOrder,
  useCreatePayment,
  useCreatePrintJob,
  useCustomers,
  useMenuItems,
  useOpenTabSessions,
} from '../../shared/hooks/queries';
import { arr } from '../../shared/lib/safe';
import { formatRupiah } from '../../shared/lib/format';
import { getLocalMenuImageSource, resolveRemoteMenuImageUrl } from '../../shared/lib/menuImages';
import { TableTile } from '../../shared/components/TableTile';
import { useT } from '../../shared/i18n/store';
import type { MenuItem } from '../../shared/lib/mock-data';
import type { OrderCustomer, OrderDestinationType } from '../../features/order/types';
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
  SearchField,
  SectionHeader,
  SegmentTabs,
  StatCard,
  Stepper,
  TextField,
  usePOSLayout,
} from '../../shared/pos/components';
import { openTabSessions, paymentMethods, posCustomers, posTables } from '../../shared/pos/demoData';

type Step = 'items' | 'destination' | 'payment' | 'success';
type DestinationTab = OrderDestinationType;
type AdjustmentSheet = null | 'discount' | 'fee' | 'note' | 'void';
type CreatedOrderRef = { id: string; orderNumber: string };

export default function CashierOrderScreen() {
  const router = useRouter();
  const theme = useTheme();
  const t = useT();
  const { width, isCompact, isPhone } = usePOSLayout();
  const { user, needsBusinessSelection } = useAuthStore();
  const order = useOrderStore();
  const businessId = user?.businessId ?? '';
  const stepLabels = [t('pos.order.step.addItems'), t('pos.order.step.pickDestination'), t('pos.order.step.pay')];

  const { data: menuData } = useMenuItems(businessId);
  const { data: categoryData } = useCategories(businessId);
  const { data: customerData } = useCustomers(businessId, '');
  const { data: apiOpenTabs } = useOpenTabSessions(businessId);
  const createOrder = useCreateOrder();
  const createPayment = useCreatePayment();
  const createCustomer = useCreateCustomer();
  const createOpenTab = useCreateOpenTabSession();
  const createPrintJob = useCreatePrintJob();

  const menuItems = arr<any>(menuData);
  const categories = useMemo(() => {
    const apiCategories = arr<any>(categoryData).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    const stocked = new Set(menuItems.map((item) => item.categoryId || 'uncategorized'));
    const ordered = apiCategories.filter((category) => stocked.has(category.id));
    stocked.forEach((id) => {
      if (!ordered.some((category) => category.id === id)) ordered.push({ id, name: 'Lainnya' });
    });
    return ordered;
  }, [categoryData, menuItems]);

  const [step, setStep] = useState<Step>('items');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [menuQuery, setMenuQuery] = useState('');
  const [destinationTab, setDestinationTab] = useState<DestinationTab>('dine_in');
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [itemQty, setItemQty] = useState(1);
  const [itemNote, setItemNote] = useState('');
  const [selectedModifiers, setSelectedModifiers] = useState<string[]>([]);
  const [customerSheet, setCustomerSheet] = useState(false);
  const [customerQuery, setCustomerQuery] = useState('');
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [guestCount, setGuestCount] = useState('2');
  const [pickupName, setPickupName] = useState('');
  const [pickupTime, setPickupTime] = useState('ASAP');
  const [courierName, setCourierName] = useState('');
  const [courierPhone, setCourierPhone] = useState('');
  const [amountStr, setAmountStr] = useState('0');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'qris' | 'edc' | 'ewallet'>('cash');
  const [adjustmentSheet, setAdjustmentSheet] = useState<AdjustmentSheet>(null);
  const [adjustmentValue, setAdjustmentValue] = useState('');
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [splitSheet, setSplitSheet] = useState(false);
  const [printerSheet, setPrinterSheet] = useState(false);
  const [conflictSheet, setConflictSheet] = useState(false);
  const [recoverySheet, setRecoverySheet] = useState(false);
  const [adjustmentResult, setAdjustmentResult] = useState<{ title: string; message: string } | null>(null);
  const [printerResult, setPrinterResult] = useState<{ title: string; message: string } | null>(null);
  const [splitNotice, setSplitNotice] = useState('');
  const [conflictResult, setConflictResult] = useState<{ title: string; message: string } | null>(null);
  const [openTabSuccess, setOpenTabSuccess] = useState(false);
  const [createdOrderNumber, setCreatedOrderNumber] = useState('ORD-LOCAL');
  const [completedPaymentReference, setCompletedPaymentReference] = useState('');
  const [stepNotice, setStepNotice] = useState<{ title: string; message: string } | null>(null);
  const [menuGridWidth, setMenuGridWidth] = useState(0);

  const activeCategory = categoryId;
  const categoryTabs = useMemo(
    () => [{ id: 'all', name: t('pos.category.all') }, ...categories],
    [categories, t],
  );
  const menuColumns = isPhone ? 1 : 3;
  const menuGridGap = isPhone ? 10 : 14;
  const menuCardWidth =
    menuGridWidth > 0
      ? Math.floor((menuGridWidth - menuGridGap * (menuColumns - 1)) / menuColumns)
      : isPhone
        ? Math.max(280, width - 48)
        : isCompact
          ? 260
          : 286;
  const menuImageHeight = isPhone
    ? 190
    : Math.max(116, Math.min(132, Math.round(menuCardWidth * 0.36)));

  const handleMenuGridLayout = (event: LayoutChangeEvent) => {
    const nextWidth = Math.floor(event.nativeEvent.layout.width);
    setMenuGridWidth((current) => (Math.abs(current - nextWidth) > 2 ? nextWidth : current));
  };

  const filteredItems = useMemo(() => {
    const q = menuQuery.trim().toLowerCase();
    return menuItems
      .filter((item) => !activeCategory || (item.categoryId || 'uncategorized') === activeCategory)
      .filter((item) => `${item.name ?? ''} ${item.description ?? ''}`.toLowerCase().includes(q));
  }, [activeCategory, menuItems, menuQuery]);

  const customers = useMemo(() => {
    const source = arr<OrderCustomer>(customerData).length > 0 ? arr<OrderCustomer>(customerData) : posCustomers;
    const q = customerQuery.trim().toLowerCase();
    if (!q) return source;
    return source.filter((customer) => `${customer.name} ${customer.phone}`.toLowerCase().includes(q));
  }, [customerData, customerQuery]);

  const sessions = arr<any>(apiOpenTabs).length > 0 ? arr<any>(apiOpenTabs) : openTabSessions;
  const feesTotal = order.fees.reduce((sum, fee) => sum + fee.amount, 0);
  const hasActiveItems = order.items.some((item) => !item.voided);
  const cartQuantityByMenuId = useMemo(() => {
    const quantities = new Map<string, number>();
    order.items.forEach((item) => {
      if (item.voided) return;
      quantities.set(item.menuItemId, (quantities.get(item.menuItemId) ?? 0) + item.quantity);
    });
    return quantities;
  }, [order.items]);
  const hasDestination = !!order.destination || !!order.tableId || !!order.session;
  const activeStepIndex = step === 'items' ? 0 : step === 'destination' ? 1 : 2;
  const totalPaid = order.splitPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const enteredAmount = parseInt(amountStr, 10) || 0;
  const amountPaid = order.splitPayments.length > 0 ? totalPaid : paymentMethod === 'cash' ? enteredAmount : order.total;
  const change = Math.max(0, amountPaid - order.total);
  const referenceMissing = paymentMethod !== 'cash' && order.paymentReference.trim().length === 0;
  const splitIncomplete = order.splitPayments.length > 0 && totalPaid < order.total;
  const paymentIncomplete = paymentMethod === 'cash' ? enteredAmount < order.total : referenceMissing;

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

  const goToStep = (index: number) => {
    if (index === 0) {
      setStep('items');
      return;
    }
    if (!hasActiveItems) {
      setStep('items');
      setStepNotice({
        title: t('pos.order.addItemsFirst'),
        message: t('pos.order.addItemsFirstDesc'),
      });
      return;
    }
    if (index === 1) {
      setStep('destination');
      return;
    }
    if (!hasDestination) {
      setStep('destination');
      setStepNotice({
        title: t('pos.order.destinationFirst'),
        message: t('pos.order.destinationFirstDesc'),
      });
      return;
    }
    setStep('payment');
  };

  const openItem = (item: MenuItem) => {
    setSelectedItem(item);
    setItemQty(1);
    setItemNote('');
    setSelectedModifiers([]);
  };

  const modifierTotal = selectedItem?.modifiers
    ?.filter((modifier: any) => selectedModifiers.includes(modifier.name))
    .reduce((sum: number, modifier: any) => sum + (modifier.price || 0), 0) ?? 0;

  const addSelectedItem = () => {
    if (!selectedItem) return;
    order.addItem({
      menuItemId: selectedItem.id,
      menuItemName: selectedItem.name,
      quantity: itemQty,
      unitPrice: (selectedItem.price || 0) + modifierTotal,
      modifiers: selectedModifiers,
      notes: itemNote,
      syncState: 'draft',
      course: 'hold',
    });
    order.saveRecoveryDraft();
    setSelectedItem(null);
  };

  const holdCurrentOrder = () => {
    const count = order.items.filter((item) => !item.voided).reduce((sum, item) => sum + item.quantity, 0);
    order.holdOrder(order.customer?.name);
    setStepNotice({
      title: 'Order held',
      message: `${count} item${count === 1 ? '' : 's'} moved to held orders. Use Recovery to resume it.`,
    });
  };

  const attachCustomer = (customer: OrderCustomer) => {
    order.setCustomer(customer);
    setCustomerSheet(false);
  };

  const createAndAttachCustomer = async () => {
    const name = newCustomerName.trim();
    if (!name) return;
    const created = await createCustomer.mutateAsync({
      businessId,
      name,
      phone: newCustomerPhone.trim(),
    });
    attachCustomer(created as OrderCustomer);
    setNewCustomerName('');
    setNewCustomerPhone('');
  };

  const chooseTable = (table: (typeof posTables)[number]) => {
    order.setDestination({
      type: 'dine_in',
      label: table.name,
      tableId: table.id,
      tableName: table.name,
      guestCount: parseInt(guestCount, 10) || 1,
    });
  };

  const openNewTab = async () => {
    const table = posTables.find((item) => item.status === 'available') ?? posTables[0];
    const session = await createOpenTab.mutateAsync({
      businessId,
      tableId: table.id,
      tableName: table.name,
      customerName: order.customer?.name || 'Walk-in',
      guestCount: parseInt(guestCount, 10) || 1,
      staffId: user.id,
    });
    order.openSession(session as any);
    order.enqueueSync('Open tab session created');
    setOpenTabSuccess(true);
  };

  const useExistingTab = (session: any) => {
    order.openSession(session);
    setStep('payment');
  };

  const confirmTakeaway = () => {
    const isCourier = destinationTab === 'delivery';
    order.setDestination({
      type: isCourier ? 'delivery' : 'takeaway',
      label: isCourier ? 'Courier delivery' : 'Takeaway pickup',
      pickupName: pickupName || order.customer?.name || 'Walk-in',
      pickupTime,
      courierName: isCourier ? courierName : undefined,
      courierPhone: isCourier ? courierPhone : undefined,
    });
    setStep('payment');
  };

  const confirmDestination = () => {
    if (destinationTab === 'open_tab') {
      void openNewTab();
      return;
    }
    if (destinationTab === 'takeaway' || destinationTab === 'delivery') {
      confirmTakeaway();
      return;
    }
    if (!order.destination) chooseTable(posTables[0]);
    setStep('payment');
  };

  const applyAdjustment = () => {
    const raw = parseInt(adjustmentValue.replace(/\D/g, ''), 10) || 0;
    const appliedType = adjustmentSheet || 'adjustment';
    if (adjustmentSheet === 'discount') {
      order.applyDiscount(adjustmentValue.includes('%') ? 'percentage' : 'fixed', adjustmentValue.includes('%') ? raw : raw);
      order.setDiscountReason(adjustmentReason || 'Manager discount');
    }
    if (adjustmentSheet === 'fee') order.addFee(adjustmentReason || 'Service fee', raw || Math.round(order.subtotal * 0.05));
    if (adjustmentSheet === 'note') order.setOrderNote(adjustmentReason || 'Customer requested priority service.');
    if (adjustmentSheet === 'void' && order.items[0]) order.voidLineItem(order.items[0].id, adjustmentReason || 'Manager approved void');
    order.enqueueSync(`${appliedType} applied`);
    setAdjustmentResult({
      title: `${appliedType[0].toUpperCase()}${appliedType.slice(1)} applied`,
      message: `${appliedType} was applied locally and queued for sync/audit.`,
    });
    setAdjustmentValue('');
    setAdjustmentReason('');
  };

  const fireOrder = () => {
    order.enqueueSync('Fire order sent to kitchen');
    order.addPrintJob({ type: 'kitchen', status: 'queued', printerName: 'Kitchen printer' });
    setStepNotice({
      title: 'Fire order queued',
      message: 'Kitchen rush ticket was queued locally and will sync when the kitchen endpoint confirms.',
    });
  };

  const closeAdjustmentSheet = () => {
    setAdjustmentSheet(null);
    setAdjustmentResult(null);
  };

  const openPrinterSheet = () => {
    setPrinterResult(null);
    setPrinterSheet(true);
  };

  const closePrinterSheet = () => {
    setPrinterSheet(false);
    setPrinterResult(null);
  };

  const assignSplitItem = (item: typeof order.items[number]) => {
    order.addSplitPayment({ method: paymentMethod, amount: item.subtotal, reference: `ITEM-${item.id}` });
    setSplitNotice(`${item.menuItemName} assigned to split for ${formatRupiah(item.subtotal)}.`);
  };

  const keepLocalConflict = () => {
    order.enqueueSync('Conflict kept local draft');
    setConflictResult({
      title: 'Local draft kept',
      message: 'This order remains in the local sync queue for audit and retry.',
    });
  };

  const reloadServerConflict = () => {
    order.markSynced();
    setConflictResult({
      title: 'Server version reloaded',
      message: 'The next queued sync item was marked synced and the order can continue.',
    });
  };

  const closeConflictSheet = () => {
    setConflictSheet(false);
    setConflictResult(null);
  };

  const restoreDraft = () => {
    order.restoreRecoveryDraft();
    setRecoverySheet(false);
    setStepNotice({
      title: 'Draft restored',
      message: 'Crash recovery draft timestamp was restored. Continue editing or add items before payment.',
    });
  };

  const resumeHeld = (heldId: string) => {
    order.resumeHeldOrder(heldId);
    setRecoverySheet(false);
    setStep('items');
    setStepNotice({
      title: 'Held order resumed',
      message: 'Held order customer/note was restored. Add the held items again to continue.',
    });
  };

  const queueReceiptPrint = () => {
    order.addPrintJob({ type: 'receipt', status: 'queued', printerName: 'Bluetooth printer' });
    setPrinterResult({
      title: 'Print queued',
      message: 'Receipt was added to the Bluetooth printer fallback queue.',
    });
  };

  const queueDigitalReceipt = () => {
    order.enqueueSync('Digital receipt sent');
    setPrinterResult({
      title: 'Digital receipt queued',
      message: 'Digital receipt delivery is queued and will retry while offline.',
    });
  };

  const sendPostPaymentDigitalReceipt = () => {
    order.enqueueSync('Digital receipt sent');
    setStepNotice({
      title: 'Digital receipt queued',
      message: 'Digital receipt delivery is queued and will retry while offline.',
    });
  };

  const sendToKitchen = async (): Promise<CreatedOrderRef | null> => {
    if (!hasActiveItems) return null;
    try {
      const created = await createOrder.mutateAsync({
        businessId,
        tableId: order.tableId || undefined,
        tableName: order.tableName || order.destination?.tableName || order.destination?.label || undefined,
        staffId: user.id,
        staffName: user.name,
        items: order.items,
        orderType: order.orderType,
        notes: order.orderNote || undefined,
      });
      const orderNumber = created?.orderNumber || `ORD-${Date.now().toString().slice(-6)}`;
      const orderId = created?.id || orderNumber;
      setCreatedOrderNumber(orderNumber);
      order.enqueueSync('Order sent to kitchen');
      fireOrder();
      return { id: orderId, orderNumber };
    } catch {
      const orderNumber = `ORD-LOCAL-${Date.now().toString().slice(-4)}`;
      setCreatedOrderNumber(orderNumber);
      order.markSyncFailed();
      return { id: orderNumber, orderNumber };
    }
  };

  const completePayment = async () => {
    if (!hasActiveItems || splitIncomplete) return;
    if (paymentMethod === 'cash' && paymentIncomplete) {
      setStepNotice({
        title: t('pos.payment.cashShortTitle'),
        message: t('pos.payment.cashShortDesc'),
      });
      return;
    }
    const reference = paymentMethod === 'cash'
      ? ''
      : order.paymentReference.trim() || `${paymentMethod.toUpperCase()}-MOCK-${Date.now().toString().slice(-6)}`;
    if (reference) {
      order.setPaymentReference(reference);
      if (!order.paymentReference.trim()) {
        order.enqueueSync(`Mock ${paymentMethod.toUpperCase()} payment reference generated`);
      }
    }
    const createdOrder = await sendToKitchen();
    if (!createdOrder) return;
    const selectedPaymentMethod = paymentMethods.find((method) => method.id === paymentMethod);
    try {
      await createPayment.mutateAsync({
        businessId,
        orderId: createdOrder.id,
        orderNumber: createdOrder.orderNumber,
        amount: order.total,
        amountPaid,
        paymentMethodId: paymentMethod,
        paymentMethodName: selectedPaymentMethod?.label ?? paymentMethod.toUpperCase(),
        staffId: user.id,
      });
      order.enqueueSync('Payment synced to backend');
    } catch {
      order.enqueueSync('Payment backend sync pending', true);
      order.markSyncFailed();
    }
    try {
      const job = await createPrintJob.mutateAsync({
        businessId,
        orderId: createdOrder.id,
        type: 'receipt',
        printerName: '',
      });
      order.addPrintJob({ type: 'receipt', status: job.status || 'failed', printerName: job.printerName });
    } catch {
      order.addPrintJob({ type: 'receipt', status: 'failed' });
    }
    setCompletedPaymentReference(reference);
    setStepNotice(null);
    setStep('success');
  };

  const startNewOrder = () => {
    order.clearOrder();
    setAmountStr('0');
    setPaymentMethod('cash');
    setCompletedPaymentReference('');
    setStep('items');
  };

  return (
    <POSScreen
      role="cashier"
      title={t('pos.screen.newOrder')}
      subtitle={user.businessName}
      active="order"
      staffName={user.name}
      onNavigate={navigate as any}
    >
      <View style={{ padding: isPhone ? 10 : 14, gap: 12, flex: 1 }}>
        <View style={{ flexDirection: isCompact ? 'column' : 'row', gap: 10, justifyContent: 'space-between' }}>
          <Stepper steps={stepLabels} activeIndex={activeStepIndex} onStep={goToStep} />
          <ResilienceBanner
            syncQueue={order.syncQueue}
            recoveryLabel={order.recoveryDraft ? `Draft ${order.recoveryDraft.itemCount} items` : undefined}
            printJobs={order.printJobs}
            onRetry={() => setRecoverySheet(true)}
            onSyncPress={() => setRecoverySheet(true)}
            onPrinterPress={openPrinterSheet}
          />
        </View>

        {step === 'items' ? (
          <View style={{ flex: 1, flexDirection: isCompact ? 'column' : 'row', gap: 12 }}>
            <Panel style={{ flex: 1.6, minWidth: 0 }}>
              <SectionHeader
                eyebrow="Step 1"
                title={t('pos.order.step.addItems')}
                action={<PrimaryButton tone="light" onPress={() => setCustomerSheet(true)}>{t('pos.order.customer')}</PrimaryButton>}
              />
              <View style={{ marginTop: 12 }}>
                <SearchField value={menuQuery} onChangeText={setMenuQuery} placeholder={t('pos.order.searchMenu')} />
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 12 }}>
                {categoryTabs.map((category) => {
                  const active = category.id === (activeCategory ?? 'all');
                  return (
                    <Pressable
                      key={category.id}
                      onPress={() => setCategoryId(category.id === 'all' ? null : category.id)}
                      accessibilityRole="button"
                      accessibilityLabel={`Category ${category.name}`}
                      accessibilityState={{ selected: active }}
                      style={{
                        height: 36,
                        paddingHorizontal: 12,
                        borderRadius: 8,
                        justifyContent: 'center',
                        backgroundColor: active ? theme.palette.neutral[900] : theme.palette.neutral[100],
                      }}
                    >
                      <Text style={{ color: active ? '#FFFFFF' : theme.palette.neutral[800], fontSize: 12, fontWeight: '900' }}>{category.name}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
              <ScrollView
                onLayout={handleMenuGridLayout}
                contentContainerStyle={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  gap: menuGridGap,
                  paddingBottom: 16,
                }}
              >
                {filteredItems.map((item) => (
                  <MenuTile
                    key={item.id}
                    item={item}
                    width={menuCardWidth}
                    imageHeight={menuImageHeight}
                    selectedQuantity={cartQuantityByMenuId.get(item.id) ?? 0}
                    onPress={() => openItem(item)}
                  />
                ))}
              </ScrollView>
            </Panel>

            <Panel style={{ width: isCompact ? '100%' : 380, minWidth: isCompact ? undefined : 340 }}>
              <SectionHeader eyebrow={t('pos.order.currentOrder')} title={order.destination?.label || t('pos.order.noDestination')} />
              <View style={{ marginTop: 12 }}>
                <CustomerChip customer={order.customer} onPress={() => setCustomerSheet(true)} />
              </View>
              <View style={{ marginTop: 12 }}>
                <OrderSummary
                  items={order.items}
                  subtotal={order.subtotal}
                  discount={order.discount}
                  fees={feesTotal}
                  total={order.total}
                  onQty={order.updateQuantity}
                  onRemove={order.removeItem}
                  onVoid={(itemId) => {
                    order.voidLineItem(itemId, 'Cashier void');
                    order.enqueueSync('Line void pending audit');
                  }}
                />
              </View>
              <View style={{ marginTop: 12, gap: 8 }}>
                <PrimaryButton disabled={!hasActiveItems} onPress={() => setStep('destination')}>{t('pos.order.step.pickDestination')}</PrimaryButton>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <PrimaryButton tone="light" style={{ flex: 1 }} disabled={!hasActiveItems} onPress={holdCurrentOrder}>{t('pos.order.hold')}</PrimaryButton>
                  <PrimaryButton tone="light" style={{ flex: 1 }} onPress={() => setRecoverySheet(true)}>{t('pos.order.recovery')}</PrimaryButton>
                </View>
              </View>
            </Panel>
          </View>
        ) : null}

        {step === 'destination' ? (
          <View style={{ flex: 1, flexDirection: isCompact ? 'column' : 'row', gap: 12 }}>
            <Panel style={{ flex: 1.55, minWidth: 0 }}>
              <SectionHeader eyebrow="Step 2" title={t('pos.order.step.pickDestination')} action={<CustomerChip customer={order.customer} onPress={() => setCustomerSheet(true)} />} />
              <View style={{ marginTop: 12 }}>
                <SegmentTabs
                  value={destinationTab}
                  onChange={setDestinationTab}
                  items={[
                    { key: 'dine_in', label: 'Dine-in', meta: 'Choose table' },
                    { key: 'open_tab', label: 'Open tab', meta: 'Keep running' },
                    { key: 'takeaway', label: 'Pickup', meta: 'Takeaway' },
                    { key: 'delivery', label: 'Courier', meta: 'Delivery' },
                  ]}
                />
              </View>

              {destinationTab === 'dine_in' ? (
                <ScrollView contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingTop: 16 }}>
                  {posTables.map((table) => (
                    <TableTile
                      key={table.id}
                      id={table.id}
                      label={table.name}
                      seats={table.seats}
                      shape={table.shape}
                      status={table.status}
                      runningTotal={table.runningTotal}
                      guests={table.guests}
                      selected={order.tableId === table.id}
                      onPress={() => chooseTable(table)}
                    />
                  ))}
                </ScrollView>
              ) : null}

              {destinationTab === 'open_tab' ? (
                <ScrollView contentContainerStyle={{ gap: 10, paddingTop: 16 }}>
                  {openTabSuccess ? (
                    <Panel padding={12} style={{ borderColor: theme.palette.semantic.success, backgroundColor: theme.palette.semantic.successBg }}>
                      <Text style={{ color: theme.palette.semantic.success, fontSize: 13, fontWeight: '900' }}>Open tab created</Text>
                      <Text style={{ marginTop: 4, color: theme.palette.neutral[700], fontSize: 12, fontWeight: '700' }}>The order is saved to {order.session?.tableName}. Cashier can return when the guest requests bill.</Text>
                    </Panel>
                  ) : null}
                  {sessions.map((session: any) => (
                    <Pressable
                      key={session.id}
                      onPress={() => useExistingTab(session)}
                      accessibilityRole="button"
                      accessibilityLabel={`Resume open tab ${session.tableName}, ${session.customerName}, ${formatRupiah(session.total)}`}
                      style={({ pressed }) => ({
                        padding: 14,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: theme.palette.neutral[200],
                        backgroundColor: pressed ? theme.palette.neutral[100] : '#FFFFFF',
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 12,
                      })}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: theme.palette.neutral[900], fontSize: 15, fontWeight: '900' }}>{session.tableName} · {session.customerName}</Text>
                        <Text style={{ marginTop: 3, color: theme.palette.neutral[500], fontSize: 12, fontWeight: '700' }}>{session.guestCount} guests · opened {session.openedAt}</Text>
                      </View>
                      <Text style={{ color: theme.palette.neutral[900], fontSize: 15, fontWeight: '900' }}>{formatRupiah(session.total)}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              ) : null}

              {destinationTab === 'takeaway' || destinationTab === 'delivery' ? (
                <View style={{ gap: 12, paddingTop: 16, maxWidth: 560 }}>
                  <TextField label="Pickup name" value={pickupName} onChangeText={setPickupName} placeholder={order.customer?.name || 'Walk-in'} />
                  <TextField label="Pickup time" value={pickupTime} onChangeText={setPickupTime} placeholder="ASAP" />
                  {destinationTab === 'delivery' ? (
                    <>
                      <TextField label="Courier name" value={courierName} onChangeText={setCourierName} placeholder="Grab / Gojek courier" />
                      <TextField label="Courier phone" value={courierPhone} onChangeText={setCourierPhone} placeholder="+62" keyboardType="phone-pad" />
                    </>
                  ) : null}
                </View>
              ) : null}
            </Panel>

            <Panel style={{ width: isCompact ? '100%' : 360 }}>
              <SectionHeader eyebrow={t('pos.order.destinationSummary')} title={order.destination?.label || t('pos.order.selectDestination')} />
              <View style={{ marginTop: 12, gap: 10 }}>
                <TextField label="Guests" value={guestCount} onChangeText={setGuestCount} keyboardType="number-pad" />
                <OrderSummary items={order.items} subtotal={order.subtotal} discount={order.discount} fees={feesTotal} total={order.total} />
                <PrimaryButton disabled={!hasActiveItems} onPress={confirmDestination}>
                  {destinationTab === 'open_tab' ? t('pos.order.openTab') : t('pos.order.continueToPay')}
                </PrimaryButton>
              </View>
            </Panel>
          </View>
        ) : null}

        {step === 'payment' ? (
          <View style={{ flex: 1, flexDirection: isCompact ? 'column' : 'row', gap: 12 }}>
            <Panel style={{ flex: 1 }}>
              <SectionHeader eyebrow="Step 3" title={t('pos.order.step.pay')} action={<PrimaryButton tone="light" onPress={() => setStep('destination')}>{t('pos.order.destination')}</PrimaryButton>} />
              <View style={{ marginTop: 12, gap: 10 }}>
                <CustomerChip customer={order.customer} onPress={() => setCustomerSheet(true)} />
                <Panel padding={12} style={{ backgroundColor: theme.palette.neutral[50] }}>
                  <Text style={{ color: theme.palette.neutral[500], fontSize: 11, fontWeight: '900', textTransform: 'uppercase' }}>{t('pos.order.destination')}</Text>
                  <Text style={{ marginTop: 4, color: theme.palette.neutral[900], fontSize: 17, fontWeight: '900' }}>{order.destination?.label || order.tableName || t('pos.order.noDestination')}</Text>
                  {order.orderNote ? <Text style={{ marginTop: 6, color: theme.palette.neutral[600], fontSize: 12, fontWeight: '700' }}>{order.orderNote}</Text> : null}
                </Panel>
                <OrderSummary
                  items={order.items}
                  subtotal={order.subtotal}
                  discount={order.discount}
                  fees={feesTotal}
                  total={order.total}
                  onQty={order.updateQuantity}
                  onVoid={(itemId) => {
                    order.voidLineItem(itemId, 'Payment step void');
                    setAdjustmentSheet('void');
                  }}
                />
              </View>
            </Panel>

            <Panel style={{ flex: 1, minWidth: 0 }}>
              <SectionHeader eyebrow={t('pos.order.manualPayment')} title={formatRupiah(order.total)} />
              <View style={{ marginTop: 12, gap: 10 }}>
                {paymentMethods.map((method) => (
                  <PaymentMethodCard
                    key={method.id}
                    label={method.label}
                    meta={method.meta}
                    type={method.type}
                    selected={paymentMethod === method.id}
                    onPress={() => {
                      setPaymentMethod(method.id);
                      order.setPaymentReference('');
                      setAmountStr(method.id === 'cash' ? String(order.total) : '0');
                    }}
                  />
                ))}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  <ActionButton icon={<Percent size={14} color={theme.palette.brand.navy} />} label="Discount" onPress={() => { setAdjustmentResult(null); setAdjustmentSheet('discount'); }} />
                  <ActionButton icon={<FileText size={14} color={theme.palette.brand.navy} />} label="Fee" onPress={() => { setAdjustmentResult(null); setAdjustmentSheet('fee'); }} />
                  <ActionButton icon={<Scissors size={14} color={theme.palette.brand.navy} />} label="Split" onPress={() => { setSplitNotice(''); setSplitSheet(true); }} />
                  <ActionButton icon={<Flame size={14} color={theme.palette.brand.navy} />} label="Fire" onPress={fireOrder} />
                  <ActionButton icon={<ChefHat size={14} color={theme.palette.brand.navy} />} label="Conflict" onPress={() => setConflictSheet(true)} />
                </View>
              </View>
            </Panel>

            <Panel style={{ flex: 1 }}>
              <SectionHeader eyebrow={paymentMethod === 'cash' ? t('pos.order.cashTendered') : t('pos.order.paymentReference')} title={paymentMethod === 'cash' ? formatRupiah(enteredAmount) : paymentMethod.toUpperCase()} />
              <View style={{ marginTop: 12, gap: 12 }}>
                {paymentMethod === 'cash' ? (
                  <>
                    <Numpad onKey={(key) => {
                      setAmountStr((current) => {
                        if (key === '<') return current.length <= 1 ? '0' : current.slice(0, -1);
                        if (current === '0') return key === '00' ? '0' : key;
                        return `${current}${key}`;
                      });
                    }} />
                    <StatCard label="Change" value={formatRupiah(change)} tone={theme.palette.semantic.success} />
                  </>
                ) : (
                  <>
                    <TextField label="Reference" value={order.paymentReference} onChangeText={order.setPaymentReference} placeholder={`${paymentMethod.toUpperCase()} approval code`} />
                    <StatCard label="Due" value={formatRupiah(order.total)} meta="Manual payment recorded after cashier confirms reference." />
                  </>
                )}
                {referenceMissing ? (
                  <>
                    <Text style={{ color: theme.palette.semantic.warning, fontSize: 12, fontWeight: '800' }}>Reference is required for {paymentMethod.toUpperCase()} payments.</Text>
                    <Text style={{ color: theme.palette.neutral[500], fontSize: 12, fontWeight: '800' }}>{t('pos.payment.mockReferenceHint')}</Text>
                  </>
                ) : null}
                {splitIncomplete ? (
                  <Text style={{ color: theme.palette.semantic.warning, fontSize: 12, fontWeight: '800' }}>Split assignments must cover the full total.</Text>
                ) : null}
                <PrimaryButton disabled={!hasActiveItems || splitIncomplete} onPress={completePayment}>
                  {referenceMissing ? t('pos.payment.completeWithMockReference') : t('pos.order.completePayment')}
                </PrimaryButton>
              </View>
            </Panel>
          </View>
        ) : null}

        {step === 'success' ? (
          <View style={{ flex: 1, flexDirection: isCompact ? 'column' : 'row', gap: 12 }}>
            <Panel style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 }}>
              <View style={{ width: 86, height: 86, borderRadius: 43, backgroundColor: theme.palette.semantic.successBg, alignItems: 'center', justifyContent: 'center' }}>
                <ReceiptText size={38} color={theme.palette.semantic.success} />
              </View>
              <Text style={{ color: theme.palette.neutral[900], fontSize: 25, fontWeight: '900' }}>{t('pos.payment.success')}</Text>
              <Text style={{ color: theme.palette.neutral[600], fontSize: 14, fontWeight: '700' }}>{createdOrderNumber} · {paymentMethod.toUpperCase()} · {formatRupiah(amountPaid)}</Text>
              {completedPaymentReference ? (
                <Text style={{ color: theme.palette.neutral[500], fontSize: 12, fontWeight: '800' }}>{completedPaymentReference}</Text>
              ) : null}
              <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                <PrimaryButton onPress={openPrinterSheet}>{t('pos.order.printReceipt')}</PrimaryButton>
                <PrimaryButton tone="light" onPress={sendPostPaymentDigitalReceipt}>{t('pos.order.sendDigitalReceipt')}</PrimaryButton>
                <PrimaryButton tone="dark" onPress={startNewOrder}>{t('pos.order.newOrder')}</PrimaryButton>
              </View>
            </Panel>
            <ReceiptBlock
              orderNumber={createdOrderNumber}
              businessName={user.businessName}
              items={order.items}
              total={order.total}
              paid={amountPaid}
              method={paymentMethod.toUpperCase()}
            />
          </View>
        ) : null}
      </View>

      <OverlaySheet visible={!!selectedItem} title={selectedItem?.name || 'Item'} onClose={() => setSelectedItem(null)}>
        {selectedItem ? (
          <>
            <MenuImage item={selectedItem} large />
            <Text style={{ color: theme.palette.neutral[600], fontSize: 13, fontWeight: '700' }}>{selectedItem.description || 'Customize item before adding to order.'}</Text>
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
              {(selectedItem.modifiers || []).map((modifier: any) => {
                const selected = selectedModifiers.includes(modifier.name);
                return (
                  <Pressable
                    key={modifier.id || modifier.name}
                    onPress={() => setSelectedModifiers((current) => selected ? current.filter((name) => name !== modifier.name) : [...current, modifier.name])}
                    accessibilityRole="button"
                    accessibilityLabel={`${selected ? 'Remove' : 'Add'} modifier ${modifier.name}${modifier.price ? ` ${formatRupiah(modifier.price)}` : ''}`}
                    accessibilityState={{ selected }}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: selected ? theme.palette.brand.navy : theme.palette.neutral[200],
                      backgroundColor: selected ? theme.palette.semantic.infoBg : '#FFFFFF',
                    }}
                  >
                    <Text style={{ color: theme.palette.neutral[900], fontSize: 12, fontWeight: '900' }}>{modifier.name} {modifier.price ? `+${formatRupiah(modifier.price)}` : ''}</Text>
                  </Pressable>
                );
              })}
            </View>
            <TextField label="Special instructions" value={itemNote} onChangeText={setItemNote} placeholder="No onion, spicy level, allergies" multiline />
            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: theme.palette.neutral[500], fontSize: 11, fontWeight: '900' }}>Quantity</Text>
                <Text style={{ color: theme.palette.neutral[900], fontSize: 24, fontWeight: '900' }}>{itemQty}</Text>
              </View>
              <PrimaryButton tone="light" onPress={() => setItemQty(Math.max(1, itemQty - 1))}>-</PrimaryButton>
              <PrimaryButton tone="light" onPress={() => setItemQty(itemQty + 1)}>+</PrimaryButton>
            </View>
            <PrimaryButton onPress={addSelectedItem}>Add {formatRupiah(((selectedItem.price || 0) + modifierTotal) * itemQty)}</PrimaryButton>
          </>
        ) : null}
      </OverlaySheet>

      <OverlaySheet visible={customerSheet} title="Customer" onClose={() => setCustomerSheet(false)}>
        <SearchField value={customerQuery} onChangeText={setCustomerQuery} placeholder="Search customer" />
        {customers.map((customer) => (
          <CustomerChip key={customer.id} customer={customer} onPress={() => attachCustomer(customer)} />
        ))}
        <Panel padding={12} style={{ gap: 10 }}>
          <SectionHeader eyebrow="Create" title="New customer" />
          <TextField label="Name" value={newCustomerName} onChangeText={setNewCustomerName} placeholder="Customer name" />
          <TextField label="Phone" value={newCustomerPhone} onChangeText={setNewCustomerPhone} placeholder="+62" keyboardType="phone-pad" />
          <PrimaryButton onPress={createAndAttachCustomer}>Create customer</PrimaryButton>
        </Panel>
      </OverlaySheet>

      <OverlaySheet visible={!!adjustmentSheet} title="Order adjustment" onClose={closeAdjustmentSheet}>
        {adjustmentResult ? (
          <InlineActionNotice title={adjustmentResult.title} message={adjustmentResult.message} onClose={closeAdjustmentSheet} />
        ) : (
          <>
            <TextField label="Value" value={adjustmentValue} onChangeText={setAdjustmentValue} placeholder={adjustmentSheet === 'discount' ? '10% or 10000' : 'Amount'} keyboardType="default" />
            <TextField label="Reason / note" value={adjustmentReason} onChangeText={setAdjustmentReason} placeholder="Manager approved, promo, customer note" multiline />
            <PrimaryButton onPress={applyAdjustment}>Apply {adjustmentSheet}</PrimaryButton>
          </>
        )}
      </OverlaySheet>

      <OverlaySheet visible={splitSheet} title="Split bill by item" onClose={() => setSplitSheet(false)}>
        {order.items.filter((item) => !item.voided).map((item) => (
          <Panel key={item.id} padding={12}>
            <Text style={{ color: theme.palette.neutral[900], fontSize: 14, fontWeight: '900' }}>{item.quantity}x {item.menuItemName}</Text>
            <Text style={{ marginTop: 4, color: theme.palette.neutral[500], fontSize: 12, fontWeight: '800' }}>{formatRupiah(item.subtotal)}</Text>
            <PrimaryButton
              tone="light"
              style={{ marginTop: 10 }}
              onPress={() => assignSplitItem(item)}
            >
              Assign to split
            </PrimaryButton>
          </Panel>
        ))}
        <StatCard label="Split total" value={formatRupiah(totalPaid)} meta={`${order.splitPayments.length} payments assigned`} />
        {splitNotice ? (
          <Panel padding={12} style={{ borderColor: theme.palette.semantic.success, backgroundColor: theme.palette.semantic.successBg }}>
            <Text style={{ color: theme.palette.neutral[800], fontSize: 13, fontWeight: '800' }}>{splitNotice}</Text>
          </Panel>
        ) : null}
      </OverlaySheet>

      <OverlaySheet visible={printerSheet} title="Printer fallback" onClose={closePrinterSheet}>
        {printerResult ? (
          <InlineActionNotice title={printerResult.title} message={printerResult.message} onClose={closePrinterSheet} />
        ) : (
          <>
            <Panel padding={12} style={{ gap: 8, backgroundColor: theme.palette.semantic.warningBg, borderColor: theme.palette.semantic.warning }}>
              <Printer size={22} color={theme.palette.semantic.warning} />
              <Text style={{ color: theme.palette.neutral[900], fontSize: 16, fontWeight: '900' }}>{t('pos.printer.unavailable')}</Text>
              <Text style={{ color: theme.palette.neutral[700], fontSize: 13, fontWeight: '700' }}>The print job is queued locally. Pair a Bluetooth printer from Settings or send a digital receipt.</Text>
            </Panel>
            <PrimaryButton onPress={queueReceiptPrint}>Print later</PrimaryButton>
            <PrimaryButton tone="light" onPress={queueDigitalReceipt}>Send digital receipt</PrimaryButton>
          </>
        )}
      </OverlaySheet>

      <OverlaySheet visible={!!stepNotice} title={stepNotice?.title || ''} onClose={() => setStepNotice(null)}>
        <Panel padding={12} style={{ gap: 8 }}>
          <Text style={{ color: theme.palette.neutral[700], fontSize: 13, fontWeight: '800' }}>{stepNotice?.message}</Text>
        </Panel>
        <PrimaryButton onPress={() => setStepNotice(null)}>{t('common.close')}</PrimaryButton>
      </OverlaySheet>

      <OverlaySheet visible={conflictSheet} title="Conflict resolution" onClose={closeConflictSheet}>
        {conflictResult ? (
          <InlineActionNotice title={conflictResult.title} message={conflictResult.message} onClose={closeConflictSheet} />
        ) : (
          <>
            <Panel padding={12} style={{ gap: 8 }}>
              <Clock size={20} color={theme.palette.semantic.warning} />
              <Text style={{ color: theme.palette.neutral[900], fontSize: 15, fontWeight: '900' }}>Table changed on another device</Text>
              <Text style={{ color: theme.palette.neutral[600], fontSize: 13, fontWeight: '700' }}>Keep local draft, reload server version, or merge the item changes before taking payment.</Text>
            </Panel>
            <PrimaryButton onPress={keepLocalConflict}>Keep local</PrimaryButton>
            <PrimaryButton tone="light" onPress={reloadServerConflict}>Reload server</PrimaryButton>
          </>
        )}
      </OverlaySheet>

      <OverlaySheet visible={recoverySheet} title="Recovery and held orders" onClose={() => setRecoverySheet(false)}>
        {!order.recoveryDraft && order.heldOrders.length === 0 ? (
          <Panel padding={12}>
            <Text style={{ color: theme.palette.neutral[700], fontSize: 13, fontWeight: '800' }}>{t('pos.order.noRecovery')}</Text>
          </Panel>
        ) : null}
        {order.recoveryDraft ? (
          <Panel padding={12}>
            <Text style={{ color: theme.palette.neutral[900], fontSize: 14, fontWeight: '900' }}>Crash recovery draft</Text>
            <Text style={{ marginTop: 4, color: theme.palette.neutral[600], fontSize: 12, fontWeight: '700' }}>{order.recoveryDraft.itemCount} items · {formatRupiah(order.recoveryDraft.total)}</Text>
            <PrimaryButton tone="light" style={{ marginTop: 10 }} onPress={restoreDraft}>Restore draft</PrimaryButton>
          </Panel>
        ) : null}
        {order.heldOrders.map((held) => (
          <Panel key={held.id} padding={12}>
            <Text style={{ color: theme.palette.neutral[900], fontSize: 14, fontWeight: '900' }}>{held.label}</Text>
            <Text style={{ marginTop: 4, color: theme.palette.neutral[600], fontSize: 12, fontWeight: '700' }}>{held.itemCount} items · {formatRupiah(held.total)}</Text>
            <PrimaryButton tone="light" style={{ marginTop: 10 }} onPress={() => resumeHeld(held.id)}>Resume</PrimaryButton>
          </Panel>
        ))}
      </OverlaySheet>
    </POSScreen>
  );
}

function ActionButton({ icon, label, onPress }: { icon: React.ReactNode; label: string; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => ({
        minHeight: 36,
        paddingHorizontal: 10,
        borderRadius: 8,
        backgroundColor: pressed ? theme.palette.neutral[200] : theme.palette.neutral[100],
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
      })}
    >
      {icon}
      <Text style={{ color: theme.palette.neutral[800], fontSize: 12, fontWeight: '900' }}>{label}</Text>
    </Pressable>
  );
}

function InlineActionNotice({ title, message, onClose }: { title: string; message: string; onClose: () => void }) {
  const theme = useTheme();
  return (
    <Panel padding={12} style={{ gap: 10 }}>
      <Text style={{ color: theme.palette.neutral[900], fontSize: 16, fontWeight: '900' }}>{title}</Text>
      <Text style={{ color: theme.palette.neutral[700], fontSize: 13, fontWeight: '800' }}>{message}</Text>
      <PrimaryButton onPress={onClose}>Close</PrimaryButton>
    </Panel>
  );
}

function MenuTile({
  item,
  width,
  imageHeight,
  selectedQuantity,
  onPress,
}: {
  item: any;
  width: number;
  imageHeight: number;
  selectedQuantity: number;
  onPress: () => void;
}) {
  const theme = useTheme();
  const isSelected = selectedQuantity > 0;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${item.name}. ${formatRupiah(item.price || 0)}`}
      accessibilityState={{ selected: isSelected }}
      aria-selected={isSelected}
      testID={`menu-item-${item.id}`}
      style={({ pressed }) => ({
        width,
        height: imageHeight + 104,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: isSelected ? theme.palette.neutral[900] : theme.palette.neutral[200],
        backgroundColor: pressed ? theme.palette.neutral[100] : '#FFFFFF',
        overflow: 'hidden',
      })}
    >
      <MenuImage item={item} height={imageHeight} />
      {isSelected ? <SelectedQuantityBadge quantity={selectedQuantity} /> : null}
      <View style={{ padding: 12, gap: 6, flex: 1 }}>
        <Text numberOfLines={2} style={{ color: theme.palette.neutral[900], fontSize: 16, lineHeight: 20, fontWeight: '900' }}>{item.name}</Text>
        <Text numberOfLines={2} style={{ color: theme.palette.neutral[500], fontSize: 12, lineHeight: 16, fontWeight: '700', minHeight: 32 }}>{item.description}</Text>
        <Text style={{ marginTop: 'auto', color: theme.palette.neutral[900], fontSize: 16, fontWeight: '900' }}>{formatRupiah(item.price || 0)}</Text>
      </View>
    </Pressable>
  );
}

function SelectedQuantityBadge({ quantity }: { quantity: number }) {
  const theme = useTheme();
  return (
    <View
      style={{
        position: 'absolute',
        top: 8,
        right: 8,
        minWidth: 30,
        height: 30,
        paddingHorizontal: 8,
        borderRadius: 15,
        backgroundColor: theme.palette.neutral[900],
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '900' }}>x{quantity}</Text>
    </View>
  );
}

function MenuImage({ item, large, height }: { item: any; large?: boolean; height?: number }) {
  const theme = useTheme();
  const local = getLocalMenuImageSource(item);
  const remote = resolveRemoteMenuImageUrl(item.imageUrl);
  const source = local || (remote ? { uri: remote } : null);
  const imageHeight = height ?? (large ? 180 : 112);
  return source ? (
    <Image source={source} resizeMode="cover" style={{ width: '100%', height: imageHeight, backgroundColor: theme.palette.neutral[100] }} />
  ) : (
    <View style={{ height: imageHeight, backgroundColor: theme.palette.neutral[100], alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: theme.palette.neutral[500], fontSize: 12, fontWeight: '900' }}>Menu</Text>
    </View>
  );
}
