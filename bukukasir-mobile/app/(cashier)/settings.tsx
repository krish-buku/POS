import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { Bluetooth, LockKeyhole, Printer, ShieldCheck, Store, UserPlus, Wifi } from 'lucide-react-native';
import { useAuthStore } from '../../features/auth/store';
import { useOrderStore } from '../../features/order/store';
import { useTableStore } from '../../features/table/store';
import { useTheme } from '../../shared/theme';
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

type Sheet = null | 'pin' | 'printer' | 'staff' | 'business' | 'offline';
type SheetNotice = { title: string; message: string; closeSheet?: boolean };

export default function CashierSettingsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { user, logout, switchBusiness, needsBusinessSelection } = useAuthStore();
  const order = useOrderStore();
  const { isCompact } = usePOSLayout();
  const [sheet, setSheet] = useState<Sheet>(null);
  const [pin, setPin] = useState('');
  const [printerName, setPrinterName] = useState('BUKU Thermal 58');
  const [serviceFee, setServiceFee] = useState('5');
  const [taxRate, setTaxRate] = useState('0');
  const [staffPhone, setStaffPhone] = useState('');
  const [sheetNotice, setSheetNotice] = useState<SheetNotice | null>(null);
  const [confirmLogout, setConfirmLogout] = useState(false);

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

  const openSheet = (nextSheet: Exclude<Sheet, null>) => {
    setSheetNotice(null);
    setSheet(nextSheet);
  };

  const closeSheet = () => {
    setSheet(null);
    setSheetNotice(null);
  };

  const clearTenantState = () => {
    order.clearOrder();
    useTableStore.getState().clearSelection();
  };

  const handleSwitchBusiness = async () => {
    clearTenantState();
    await switchBusiness();
    router.replace('/(auth)/select-business');
  };

  const handleLogout = () => {
    if (!confirmLogout) {
      setConfirmLogout(true);
      return;
    }
    clearTenantState();
    logout();
    router.replace('/(auth)/login');
  };

  const savePin = () => {
    useAuthStore.setState({ pin, isPinSetup: true });
    order.enqueueSync('PIN updated');
    setSheetNotice({ title: 'PIN saved', message: 'The new PIN is active locally and queued for staff security sync.', closeSheet: true });
  };

  const rows = [
    { key: 'business' as const, title: 'Business profile', subtitle: 'Tax, hours, service fee', Icon: Store },
    { key: 'printer' as const, title: 'Printer', subtitle: 'Bluetooth pairing and print jobs', Icon: Printer },
    { key: 'pin' as const, title: 'PIN and app lock', subtitle: 'Change PIN, auto-lock behavior', Icon: LockKeyhole },
    { key: 'staff' as const, title: 'Staff invite', subtitle: 'Cashier, waiter, kitchen roles', Icon: UserPlus },
    { key: 'offline' as const, title: 'Offline queue', subtitle: 'Sync, recovery, audit events', Icon: Wifi },
  ];

  return (
    <POSScreen
      role="cashier"
      title="Settings"
      subtitle={user.businessName}
      active="settings"
      staffName={user.name}
      onNavigate={navigate as any}
    >
      <View style={{ flex: 1, padding: isCompact ? 10 : 14, gap: 12 }}>
        <ResilienceBanner syncQueue={order.syncQueue} printJobs={order.printJobs} recoveryLabel={order.recoveryDraft ? 'Recovery draft available' : undefined} />
        <View style={{ flexDirection: isCompact ? 'column' : 'row', gap: 12, flex: 1 }}>
          <Panel style={{ flex: 1.4 }}>
            <SectionHeader eyebrow="Configuration" title="Store operations" />
            <ScrollView contentContainerStyle={{ gap: 10, paddingTop: 12 }}>
              {rows.map(({ key, title, subtitle, Icon }) => (
                <Pressable
                  key={key}
                  onPress={() => openSheet(key)}
                  accessibilityRole="button"
                  accessibilityLabel={`${title}. ${subtitle}`}
                  style={({ pressed }) => ({
                    padding: 14,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: theme.palette.neutral[200],
                    backgroundColor: pressed ? theme.palette.neutral[100] : '#FFFFFF',
                    flexDirection: 'row',
                    gap: 12,
                    alignItems: 'center',
                  })}
                >
                  <View style={{ width: 42, height: 42, borderRadius: 10, backgroundColor: theme.palette.semantic.infoBg, alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={20} color={theme.palette.brand.navy} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: theme.palette.neutral[900], fontSize: 15, fontWeight: '900' }}>{title}</Text>
                    <Text style={{ marginTop: 3, color: theme.palette.neutral[500], fontSize: 12, fontWeight: '700' }}>{subtitle}</Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </Panel>

          <Panel style={{ flex: 1 }}>
            <SectionHeader eyebrow="Status" title="Device readiness" />
            <View style={{ marginTop: 12, gap: 10 }}>
              <StatusLine label="Printer" value={order.printJobs.some((job) => job.printerName) ? 'Paired' : 'Fallback'} meta={printerName} />
              <StatusLine label="Sync queue" value={String(order.syncQueue.filter((item) => item.status !== 'synced').length)} meta="Queued changes remain local until API succeeds." />
              <StatusLine label="Auto-lock" value="5 min" meta="PIN gate enabled for staff switching." />
              {confirmLogout ? (
                <Panel padding={12} style={{ gap: 4, borderColor: theme.palette.semantic.error, backgroundColor: theme.palette.semantic.errorBg }}>
                  <Text style={{ color: theme.palette.semantic.error, fontSize: 13, fontWeight: '900' }}>Log out of this account?</Text>
                  <Text style={{ color: theme.palette.neutral[700], fontSize: 12, fontWeight: '800' }}>Order drafts, tenant cache, and local table selection will be cleared.</Text>
                </Panel>
              ) : null}
              <PrimaryButton tone="light" onPress={() => router.replace({ pathname: '/(auth)/pin-setup', params: { mode: 'switch-role' } } as any)}>Switch role</PrimaryButton>
              <PrimaryButton tone="light" onPress={() => { void handleSwitchBusiness(); }}>Switch location / business</PrimaryButton>
              <PrimaryButton tone={confirmLogout ? 'danger' : 'light'} onPress={handleLogout}>{confirmLogout ? 'Confirm logout' : 'Logout'}</PrimaryButton>
            </View>
          </Panel>
        </View>
      </View>

      <OverlaySheet visible={sheet === 'business'} title="Business profile" onClose={closeSheet}>
        {sheetNotice ? (
          <ActionNotice notice={sheetNotice} onDismiss={() => sheetNotice.closeSheet ? closeSheet() : setSheetNotice(null)} />
        ) : (
          <>
            <TextField label="Service fee %" value={serviceFee} onChangeText={setServiceFee} keyboardType="number-pad" />
            <TextField label="Tax rate %" value={taxRate} onChangeText={setTaxRate} keyboardType="number-pad" />
            <PrimaryButton onPress={() => {
              order.addFee('Service fee', Math.round(order.subtotal * ((parseInt(serviceFee, 10) || 0) / 100)));
              order.setTaxRate(parseInt(taxRate, 10) || 0);
              setSheetNotice({ title: 'Business setup saved', message: `Service fee ${serviceFee || '0'}% and tax ${taxRate || '0'}% were applied locally.`, closeSheet: true });
            }}>
              Save business setup
            </PrimaryButton>
          </>
        )}
      </OverlaySheet>

      <OverlaySheet visible={sheet === 'printer'} title="Printer settings" onClose={closeSheet}>
        {sheetNotice ? (
          <ActionNotice notice={sheetNotice} onDismiss={() => sheetNotice.closeSheet ? closeSheet() : setSheetNotice(null)} />
        ) : (
          <Panel padding={12} style={{ gap: 8 }}>
            <Bluetooth size={24} color={theme.palette.brand.navy} />
            <Text style={{ color: theme.palette.neutral[900], fontSize: 16, fontWeight: '900' }}>Bluetooth pairing</Text>
            <TextField label="Printer name" value={printerName} onChangeText={setPrinterName} placeholder="Printer name" />
            <PrimaryButton onPress={() => {
              order.addPrintJob({ type: 'receipt', status: 'queued', printerName });
              setSheetNotice({ title: 'Printer saved', message: `${printerName || 'Printer'} is paired in simulator fallback mode.`, closeSheet: true });
            }}>
              Pair and save
            </PrimaryButton>
          </Panel>
        )}
      </OverlaySheet>

      <OverlaySheet visible={sheet === 'pin'} title="PIN and app lock" onClose={closeSheet}>
        {sheetNotice ? (
          <ActionNotice notice={sheetNotice} onDismiss={() => sheetNotice.closeSheet ? closeSheet() : setSheetNotice(null)} />
        ) : (
          <>
            <TextField label="New 6-digit PIN" value={pin} onChangeText={(value) => setPin(value.replace(/\D/g, '').slice(0, 6))} keyboardType="number-pad" />
            <Panel padding={12} style={{ gap: 8, backgroundColor: theme.palette.semantic.successBg }}>
              <ShieldCheck size={22} color={theme.palette.semantic.success} />
              <Text style={{ color: theme.palette.neutral[800], fontSize: 13, fontWeight: '800' }}>Auto-lock after 5 minutes, role switch requires PIN, manager actions require audit note.</Text>
            </Panel>
            <PrimaryButton disabled={pin.length !== 6} onPress={savePin}>Save PIN</PrimaryButton>
          </>
        )}
      </OverlaySheet>

      <OverlaySheet visible={sheet === 'staff'} title="Staff invite" onClose={closeSheet}>
        {sheetNotice ? (
          <ActionNotice notice={sheetNotice} onDismiss={() => sheetNotice.closeSheet ? closeSheet() : setSheetNotice(null)} />
        ) : (
          <>
            <TextField label="Phone" value={staffPhone} onChangeText={setStaffPhone} placeholder="+62" keyboardType="phone-pad" />
            <PrimaryButton onPress={() => {
              if (!staffPhone.trim()) {
                setSheetNotice({ title: 'Phone required', message: 'Enter a staff phone number before sending an invite.' });
                return;
              }
              order.enqueueSync(`Staff invite sent to ${staffPhone}`);
              setSheetNotice({ title: 'Invite queued', message: `Staff invite is queued for ${staffPhone}.`, closeSheet: true });
            }}>
              Send invite
            </PrimaryButton>
          </>
        )}
      </OverlaySheet>

      <OverlaySheet visible={sheet === 'offline'} title="Offline queue" onClose={closeSheet}>
        {order.syncQueue.length === 0 ? (
          <Text style={{ color: theme.palette.neutral[600], fontSize: 13, fontWeight: '700' }}>No queued sync items.</Text>
        ) : (
          order.syncQueue.map((item) => (
            <Panel key={item.id} padding={12}>
              <Text style={{ color: theme.palette.neutral[900], fontSize: 14, fontWeight: '900' }}>{item.label}</Text>
              <Text style={{ marginTop: 3, color: theme.palette.neutral[500], fontSize: 12, fontWeight: '800' }}>{item.status}</Text>
              <PrimaryButton tone="light" style={{ marginTop: 8 }} onPress={() => order.resolveSyncItem(item.id)}>Mark synced</PrimaryButton>
            </Panel>
          ))
        )}
      </OverlaySheet>
    </POSScreen>
  );
}

function StatusLine({ label, value, meta }: { label: string; value: string; meta: string }) {
  const theme = useTheme();
  return (
    <View
      style={{
        minHeight: 62,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme.palette.neutral[200],
        backgroundColor: theme.palette.neutral[0],
        justifyContent: 'center',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <Text style={{ color: theme.palette.neutral[500], fontSize: 11, fontWeight: '900', textTransform: 'uppercase' }}>
          {label}
        </Text>
        <Text style={{ color: theme.palette.neutral[900], fontSize: 15, fontWeight: '900' }}>
          {value}
        </Text>
      </View>
      <Text numberOfLines={2} style={{ marginTop: 4, color: theme.palette.neutral[600], fontSize: 12, fontWeight: '700' }}>
        {meta}
      </Text>
    </View>
  );
}

function ActionNotice({ notice, onDismiss }: { notice: SheetNotice; onDismiss: () => void }) {
  const theme = useTheme();
  return (
    <Panel padding={12} style={{ gap: 10 }}>
      <Text style={{ color: theme.palette.neutral[900], fontSize: 16, fontWeight: '900' }}>{notice.title}</Text>
      <Text style={{ color: theme.palette.neutral[700], fontSize: 13, fontWeight: '800' }}>{notice.message}</Text>
      <PrimaryButton onPress={onDismiss}>{notice.closeSheet ? 'Close' : 'Dismiss'}</PrimaryButton>
    </Panel>
  );
}
