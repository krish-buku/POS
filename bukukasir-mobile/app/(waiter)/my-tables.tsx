import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { ReceiptText, Send, UserRound } from 'lucide-react-native';
import { useAuthStore } from '../../features/auth/store';
import { useOrderStore } from '../../features/order/store';
import { useTheme } from '../../shared/theme';
import { useT } from '../../shared/i18n/store';
import { useCreateWaiterTransfer, useSendBillRequest } from '../../shared/hooks/queries';
import { TableTile } from '../../shared/components/TableTile';
import { formatRupiah } from '../../shared/lib/format';
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
import { openTabSessions, posTables } from '../../shared/pos/demoData';

export default function WaiterMyTablesScreen() {
  const router = useRouter();
  const theme = useTheme();
  const t = useT();
  const { user, needsBusinessSelection } = useAuthStore();
  const order = useOrderStore();
  const { isCompact } = usePOSLayout();
  const sendBill = useSendBillRequest();
  const createTransfer = useCreateWaiterTransfer();
  const [handoffSheet, setHandoffSheet] = useState(false);
  const [targetWaiter, setTargetWaiter] = useState('Dewi');
  const [selectedTable, setSelectedTable] = useState(posTables[1].id);
  const [notice, setNotice] = useState<{ title: string; message: string } | null>(null);
  const [handoffResult, setHandoffResult] = useState<{ title: string; message: string } | null>(null);

  if (needsBusinessSelection) {
    return <Redirect href="/(auth)/select-business" />;
  }

  if (!user?.businessId) {
    return <Redirect href="/(auth)/login" />;
  }

  const startOrder = (table: (typeof posTables)[number]) => {
    order.setDestination({ type: 'dine_in', label: table.name, tableId: table.id, tableName: table.name, guestCount: table.guests || 2 });
    router.replace('/(waiter)/order');
  };

  const requestBill = () => {
    const tableName = posTables.find((table) => table.id === selectedTable)?.name || selectedTable;
    order.enqueueSync('Bill request sent to cashier');
    sendBill.mutateAsync({ businessId: user.businessId, tableId: selectedTable, staffId: user.id }).catch(() => undefined);
    setNotice({
      title: 'Bill request queued',
      message: `${tableName} was marked ready to pay and will notify cashier when sync completes.`,
    });
  };

  const submitTransfer = () => {
    const waiterName = targetWaiter.trim();
    if (!waiterName) {
      setHandoffResult({
        title: 'Target waiter required',
        message: 'Enter a waiter name before sending this handoff.',
      });
      return;
    }
    const tableName = posTables.find((table) => table.id === selectedTable)?.name || selectedTable;
    order.enqueueSync(`Waiter handoff pending/local to ${waiterName}`);
    createTransfer
      .mutateAsync({ businessId: user.businessId, tableId: selectedTable, fromStaffId: user.id, toStaffName: waiterName })
      .catch(() => undefined);
    setHandoffResult({
      title: 'Handoff queued',
      message: `${tableName} handoff is queued for ${waiterName}.`,
    });
  };

  const openHandoffSheet = () => {
    setHandoffResult(null);
    setHandoffSheet(true);
  };

  const closeHandoffSheet = () => {
    setHandoffResult(null);
    setHandoffSheet(false);
  };

  return (
    <POSScreen
      role="waiter"
      title={t('pos.screen.myTables')}
      subtitle={user.businessName}
      active="waiter"
      staffName={user.name}
      onNavigate={(target) => {
        if (target === 'waiter') router.replace('/(waiter)/my-tables');
        if (target === 'order') router.replace('/(waiter)/order');
        if (target === 'tables') router.replace('/(waiter)/transfer');
      }}
    >
      <View style={{ flex: 1, padding: isCompact ? 10 : 14, gap: 12 }}>
        <ResilienceBanner syncQueue={order.syncQueue} printJobs={order.printJobs} />
        <View style={{ flexDirection: isCompact ? 'column' : 'row', gap: 12, flex: 1 }}>
          <Panel style={{ flex: 1.4 }}>
            <SectionHeader eyebrow={`${t('pos.role.waiter')}: ${user.name}`} title={t('pos.waiter.assignedTables')} />
            <ScrollView contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingTop: 14 }}>
              {posTables.slice(0, 6).map((table) => (
                <TableTile
                  key={table.id}
                  id={table.id}
                  label={table.name}
                  seats={table.seats}
                  shape={table.shape}
                  status={table.status}
                  runningTotal={table.runningTotal}
                  guests={table.guests}
                  selected={selectedTable === table.id}
                  onPress={() => {
                    setSelectedTable(table.id);
                    startOrder(table);
                  }}
                  onLongPress={() => {
                    setSelectedTable(table.id);
                    openHandoffSheet();
                  }}
                />
              ))}
            </ScrollView>
          </Panel>
          <Panel style={{ flex: 1 }}>
            <SectionHeader eyebrow={t('pos.waiter.controls')} title={posTables.find((table) => table.id === selectedTable)?.name || 'Table'} />
            <View style={{ marginTop: 12, gap: 10 }}>
              {openTabSessions.map((session) => (
                <Panel key={session.id} padding={12}>
                  <Text style={{ color: theme.palette.neutral[900], fontSize: 14, fontWeight: '900' }}>{session.tableName} · {session.customerName}</Text>
                  <Text style={{ marginTop: 4, color: theme.palette.neutral[600], fontSize: 12, fontWeight: '700' }}>{formatRupiah(session.total)} · {session.status.replace('_', ' ')}</Text>
                </Panel>
              ))}
              <PrimaryButton onPress={() => startOrder(posTables.find((table) => table.id === selectedTable) || posTables[0])}>
                {t('pos.waiter.takeOrder')}
              </PrimaryButton>
              <PrimaryButton tone="light" onPress={requestBill}>
                {t('pos.waiter.billRequest')}
              </PrimaryButton>
              <PrimaryButton tone="light" onPress={openHandoffSheet}>
                {t('pos.waiter.handoffTable')}
              </PrimaryButton>
              <Panel padding={12} style={{ backgroundColor: theme.palette.neutral[50] }}>
                <Text style={{ color: theme.palette.neutral[600], fontSize: 12, fontWeight: '800' }}>{t('pos.waiter.noPayment')}</Text>
              </Panel>
            </View>
          </Panel>
        </View>
      </View>

      <OverlaySheet visible={handoffSheet} title={t('pos.waiter.tableTransfer')} onClose={closeHandoffSheet}>
        {handoffResult ? (
          <Panel padding={12} style={{ gap: 10 }}>
            <Text style={{ color: theme.palette.neutral[900], fontSize: 16, fontWeight: '900' }}>{handoffResult.title}</Text>
            <Text style={{ color: theme.palette.neutral[700], fontSize: 13, fontWeight: '800' }}>{handoffResult.message}</Text>
            <PrimaryButton onPress={closeHandoffSheet}>Close</PrimaryButton>
          </Panel>
        ) : (
          <Panel padding={12} style={{ gap: 8 }}>
            <UserRound size={24} color={theme.palette.roles.waiter} />
            <Text style={{ color: theme.palette.neutral[900], fontSize: 16, fontWeight: '900' }}>{t('pos.waiter.sendHandoff')}</Text>
            <Text style={{ color: theme.palette.neutral[600], fontSize: 13, fontWeight: '700' }}>{t('pos.waiter.handoffDecision')}</Text>
            <TextField label={t('pos.waiter.targetWaiter')} value={targetWaiter} onChangeText={setTargetWaiter} />
            <PrimaryButton onPress={submitTransfer}>{t('pos.waiter.sendTransfer')}</PrimaryButton>
          </Panel>
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
