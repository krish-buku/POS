import React, { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View, type LayoutChangeEvent } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { Flame, Send } from 'lucide-react-native';
import { useAuthStore } from '../../features/auth/store';
import { useOrderStore } from '../../features/order/store';
import { useTheme } from '../../shared/theme';
import { useT } from '../../shared/i18n/store';
import { useCategories, useCreateOrder, useMenuItems, useSendBillRequest } from '../../shared/hooks/queries';
import { arr } from '../../shared/lib/safe';
import { formatRupiah } from '../../shared/lib/format';
import { getLocalMenuImageSource, resolveRemoteMenuImageUrl } from '../../shared/lib/menuImages';
import {
  CustomerChip,
  OrderSummary,
  OverlaySheet,
  POSScreen,
  Panel,
  PrimaryButton,
  ResilienceBanner,
  SearchField,
  SectionHeader,
  TextField,
  usePOSLayout,
} from '../../shared/pos/components';

export default function WaiterOrderScreen() {
  const router = useRouter();
  const theme = useTheme();
  const t = useT();
  const { user, needsBusinessSelection } = useAuthStore();
  const order = useOrderStore();
  const { width, isCompact, isPhone } = usePOSLayout();
  const businessId = user?.businessId ?? '';
  const { data: menuData } = useMenuItems(businessId);
  const { data: categoryData } = useCategories(businessId);
  const createOrder = useCreateOrder();
  const sendBill = useSendBillRequest();
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState('');
  const [notice, setNotice] = useState('');
  const [menuGridWidth, setMenuGridWidth] = useState(0);

  const menuItems = arr<any>(menuData);
  const categories = useMemo(() => {
    const stocked = new Set(menuItems.map((item) => item.categoryId || 'uncategorized'));
    const api = arr<any>(categoryData).filter((category) => stocked.has(category.id));
    stocked.forEach((id) => {
      if (!api.some((category) => category.id === id)) api.push({ id, name: 'Lainnya' });
    });
    return api;
  }, [categoryData, menuItems]);
  const activeCategory = categoryId;
  const categoryTabs = useMemo(
    () => [{ id: 'all', name: t('pos.category.all') }, ...categories],
    [categories, t],
  );
  const filtered = menuItems
    .filter((item) => !activeCategory || (item.categoryId || 'uncategorized') === activeCategory)
    .filter((item) => `${item.name} ${item.description}`.toLowerCase().includes(query.trim().toLowerCase()));
  const feesTotal = order.fees.reduce((sum, fee) => sum + fee.amount, 0);
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
  const cartQuantityByMenuId = useMemo(() => {
    const quantities = new Map<string, number>();
    order.items.forEach((item) => {
      if (item.voided) return;
      quantities.set(item.menuItemId, (quantities.get(item.menuItemId) ?? 0) + item.quantity);
    });
    return quantities;
  }, [order.items]);

  if (needsBusinessSelection) {
    return <Redirect href="/(auth)/select-business" />;
  }

  if (!user?.businessId) {
    return <Redirect href="/(auth)/login" />;
  }

  const add = () => {
    if (!selectedItem) return;
    order.addItem({
      menuItemId: selectedItem.id,
      menuItemName: selectedItem.name,
      quantity: qty,
      unitPrice: selectedItem.price || 0,
      modifiers: [],
      notes: note,
      syncState: 'draft',
      course: 'hold',
    });
    setSelectedItem(null);
    setQty(1);
    setNote('');
  };

  const missingTableNotice = 'Pick a table first from My tables before sending kitchen or bill actions.';
  const missingItemsNotice = 'Add at least one menu item before sending this order to the kitchen.';

  const sendToKitchen = async () => {
    if (!order.tableId) {
      setNotice(missingTableNotice);
      return;
    }
    if (order.items.length === 0) {
      setNotice(missingItemsNotice);
      return;
    }
    try {
      await createOrder.mutateAsync({
        businessId,
        tableId: order.tableId,
        staffId: user.id,
        items: order.items,
        orderType: order.orderType,
      });
      order.enqueueSync('Waiter order sent to kitchen');
      setNotice('Sent to kitchen. Cashier will handle payment.');
    } catch {
      order.markSyncFailed();
      setNotice('Order is pending/local and will sync later.');
    }
  };

  const billRequest = async () => {
    if (!order.tableId) {
      setNotice(missingTableNotice);
      return;
    }
    await sendBill.mutateAsync({ businessId, tableId: order.tableId, staffId: user.id });
    order.enqueueSync('Waiter bill request sent');
    setNotice('Bill request sent to cashier.');
  };

  const fireOrder = () => {
    if (!order.tableId) {
      setNotice(missingTableNotice);
      return;
    }
    if (order.items.length === 0) {
      setNotice(missingItemsNotice);
      return;
    }
    order.addPrintJob({ type: 'kitchen', status: 'queued', printerName: 'Kitchen printer' });
    order.enqueueSync('Fire order from waiter');
    setNotice('Fire order sent to kitchen.');
  };

  return (
    <POSScreen
      role="waiter"
      title={`${t('pos.screen.newOrder')} · ${order.tableName || 'Pick Table'}`}
      subtitle={user.businessName}
      active="order"
      staffName={user.name}
      onBack={() => router.replace('/(waiter)/my-tables')}
      onNavigate={(target) => {
        if (target === 'waiter') router.replace('/(waiter)/my-tables');
        if (target === 'order') router.replace('/(waiter)/order');
        if (target === 'tables') router.replace('/(waiter)/transfer');
      }}
    >
      <View style={{ flex: 1, padding: isCompact ? 10 : 14, gap: 12 }}>
        <ResilienceBanner syncQueue={order.syncQueue} printJobs={order.printJobs} />
        <View style={{ flex: 1, flexDirection: isCompact ? 'column' : 'row', gap: 12 }}>
          <Panel style={{ flex: 1.6, minWidth: 0 }}>
            <SectionHeader eyebrow="Waiter order entry" title="Menu" />
            <View style={{ marginTop: 12 }}>
              <SearchField value={query} onChangeText={setQuery} placeholder="Search menu" />
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
                    style={{ paddingHorizontal: 12, height: 36, borderRadius: 8, justifyContent: 'center', backgroundColor: active ? theme.palette.neutral[900] : theme.palette.neutral[100] }}
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
              {filtered.map((item) => (
                <MenuTile
                  key={item.id}
                  item={item}
                  width={menuCardWidth}
                  imageHeight={menuImageHeight}
                  selectedQuantity={cartQuantityByMenuId.get(item.id) ?? 0}
                  onPress={() => setSelectedItem(item)}
                />
              ))}
            </ScrollView>
          </Panel>

          <Panel style={{ width: isCompact ? '100%' : 380, minWidth: isCompact ? undefined : 340 }}>
            <SectionHeader eyebrow="Session subtotal" title={formatRupiah(order.total)} />
            <View style={{ marginTop: 12, gap: 10 }}>
              <CustomerChip customer={order.customer} />
              {!order.tableId ? (
                <Panel padding={12} style={{ gap: 8, backgroundColor: theme.palette.neutral[50] }}>
                  <Text style={{ color: theme.palette.neutral[900], fontSize: 14, fontWeight: '900' }}>No table selected</Text>
                  <Text style={{ color: theme.palette.neutral[600], fontSize: 12, fontWeight: '800' }}>{missingTableNotice}</Text>
                  <PrimaryButton tone="light" onPress={() => router.replace('/(waiter)/my-tables')}>
                    Choose table
                  </PrimaryButton>
                </Panel>
              ) : null}
              <OrderSummary items={order.items} subtotal={order.subtotal} discount={order.discount} fees={feesTotal} total={order.total} onQty={order.updateQuantity} onRemove={order.removeItem} />
              <PrimaryButton onPress={sendToKitchen}>
                Send to Kitchen
              </PrimaryButton>
              <PrimaryButton tone="light" onPress={fireOrder}>
                Fire order
              </PrimaryButton>
              <PrimaryButton tone="light" onPress={billRequest}>
                Bill request
              </PrimaryButton>
              <Panel padding={12} style={{ backgroundColor: theme.palette.neutral[50] }}>
                <Text style={{ color: theme.palette.neutral[600], fontSize: 12, fontWeight: '800' }}>Waiters can't take payment — cashier handles that.</Text>
              </Panel>
            </View>
          </Panel>
        </View>
      </View>

      <OverlaySheet visible={!!selectedItem} title={selectedItem?.name || 'Item'} onClose={() => setSelectedItem(null)}>
        {selectedItem ? (
          <>
            <MenuImage item={selectedItem} />
            <Text style={{ color: theme.palette.neutral[700], fontSize: 13, fontWeight: '700' }}>{selectedItem.description}</Text>
            <TextField label="Notes for kitchen" value={note} onChangeText={setNote} multiline />
            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
              <PrimaryButton tone="light" onPress={() => setQty(Math.max(1, qty - 1))}>-</PrimaryButton>
              <Text style={{ color: theme.palette.neutral[900], fontSize: 24, fontWeight: '900' }}>{qty}</Text>
              <PrimaryButton tone="light" onPress={() => setQty(qty + 1)}>+</PrimaryButton>
            </View>
            <PrimaryButton onPress={add}>Add {formatRupiah((selectedItem.price || 0) * qty)}</PrimaryButton>
          </>
        ) : null}
      </OverlaySheet>

      <OverlaySheet visible={!!notice} title="Waiter update" onClose={() => setNotice('')}>
        <Text style={{ color: theme.palette.neutral[700], fontSize: 14, fontWeight: '800' }}>{notice}</Text>
        <PrimaryButton onPress={() => setNotice('')}>{t('common.close')}</PrimaryButton>
      </OverlaySheet>
    </POSScreen>
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
      testID={`waiter-menu-item-${item.id}`}
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
        minWidth: 28,
        height: 28,
        paddingHorizontal: 8,
        borderRadius: 14,
        backgroundColor: theme.palette.neutral[900],
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '900' }}>x{quantity}</Text>
    </View>
  );
}

function MenuImage({ item, small, height }: { item: any; small?: boolean; height?: number }) {
  const theme = useTheme();
  const local = getLocalMenuImageSource(item);
  const remote = resolveRemoteMenuImageUrl(item.imageUrl);
  const source = local || (remote ? { uri: remote } : null);
  const imageHeight = height ?? (small ? 112 : 170);
  return source ? (
    <Image source={source} resizeMode="cover" style={{ width: '100%', height: imageHeight, backgroundColor: theme.palette.neutral[100] }} />
  ) : (
    <View style={{ height: imageHeight, backgroundColor: theme.palette.neutral[100], alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: theme.palette.neutral[500], fontSize: 12, fontWeight: '900' }}>Menu</Text>
    </View>
  );
}
