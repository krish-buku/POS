import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { Check, X } from 'lucide-react-native';
import { useAuthStore } from '../../features/auth/store';
import { useOrderStore } from '../../features/order/store';
import { useT } from '../../shared/i18n/store';
import { useAcceptWaiterTransfer, useCreateWaiterTransfer } from '../../shared/hooks/queries';
import { TableTile } from '../../shared/components/TableTile';
import {
  POSScreen,
  OverlaySheet,
  Panel,
  PrimaryButton,
  ResilienceBanner,
  SectionHeader,
  TextField,
  usePOSLayout,
} from '../../shared/pos/components';
import { posTables } from '../../shared/pos/demoData';

export default function WaiterTransferScreen() {
  const router = useRouter();
  const t = useT();
  const { user, needsBusinessSelection } = useAuthStore();
  const order = useOrderStore();
  const { isCompact } = usePOSLayout();
  const createTransfer = useCreateWaiterTransfer();
  const acceptTransfer = useAcceptWaiterTransfer();
  const [targetWaiter, setTargetWaiter] = useState('Dewi');
  const [selectedTable, setSelectedTable] = useState(posTables[1].id);
  const [incomingStatus, setIncomingStatus] = useState<'pending' | 'accepted' | 'rejected'>('pending');
  const [notice, setNotice] = useState<{ title: string; message: string } | null>(null);

  if (needsBusinessSelection) {
    return <Redirect href="/(auth)/select-business" />;
  }

  if (!user?.businessId) {
    return <Redirect href="/(auth)/login" />;
  }

  const selectedTableInfo = posTables.find((table) => table.id === selectedTable);

  const send = () => {
    if (!selectedTableInfo || selectedTableInfo.runningTotal <= 0) {
      setNotice({ title: 'Choose an active table', message: 'Select a table with an open order before sending a waiter transfer.' });
      return;
    }
    const waiterName = targetWaiter.trim();
    if (!waiterName) {
      setNotice({ title: 'Target waiter required', message: 'Enter the waiter who should receive this table.' });
      return;
    }

    order.enqueueSync(`Transfer ${selectedTableInfo.name} to ${waiterName}`);
    createTransfer
      .mutateAsync({ businessId: user.businessId, tableId: selectedTable, fromStaffId: user.id, toStaffName: waiterName })
      .catch(() => undefined);
    setNotice({ title: 'Transfer request queued', message: `${selectedTableInfo.name} is queued for ${waiterName}. It will retry if the backend is offline.` });
  };

  const decideIncoming = (accepted: boolean) => {
    setIncomingStatus(accepted ? 'accepted' : 'rejected');
    order.enqueueSync(`Incoming transfer ${accepted ? 'accepted' : 'rejected'}`);
    acceptTransfer.mutateAsync({ transferId: 'transfer-local-001', accepted }).catch(() => undefined);
    setNotice({
      title: accepted ? 'Transfer accepted' : 'Transfer rejected',
      message: accepted ? 'T4 is now assigned to you and visible in sync queue.' : 'T4 was rejected and the sender will be notified when sync completes.',
    });
  };

  const resetIncoming = () => {
    setIncomingStatus('pending');
    order.enqueueSync('Incoming transfer moved back to pending');
    setNotice({ title: 'Moved back to pending', message: 'The incoming transfer can be accepted or rejected again.' });
  };

  return (
    <POSScreen
      role="waiter"
      title={t('pos.screen.handoff')}
      subtitle={user.businessName}
      active="tables"
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
        <View style={{ flexDirection: isCompact ? 'column' : 'row', gap: 12, flex: 1 }}>
          <Panel style={{ flex: 1.3 }}>
            <SectionHeader eyebrow="Send transfer" title="Choose table" />
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
                  onPress={() => setSelectedTable(table.id)}
                />
              ))}
            </ScrollView>
          </Panel>
          <Panel style={{ flex: 1 }}>
            <SectionHeader eyebrow="Transfer details" title="Send or accept" />
            <View style={{ marginTop: 12, gap: 12 }}>
              <Text style={{ color: '#4B5563', fontSize: 12, fontWeight: '800' }}>
                Selected table: {selectedTableInfo?.name || 'none'} · {selectedTableInfo && selectedTableInfo.runningTotal > 0 ? 'open order' : 'no open order'}
              </Text>
              <TextField label={t('pos.waiter.targetWaiter')} value={targetWaiter} onChangeText={setTargetWaiter} />
              <PrimaryButton disabled={createTransfer.isPending} onPress={send}>
                {createTransfer.isPending ? 'Sending transfer...' : t('pos.waiter.sendTransfer')}
              </PrimaryButton>
              <Panel padding={12}>
                <Text style={{ fontSize: 15, fontWeight: '900' }}>Incoming transfer: T4 from Raka</Text>
                <Text style={{ marginTop: 4, fontSize: 12, fontWeight: '800' }}>Status: {incomingStatus}</Text>
                {incomingStatus === 'pending' ? (
                  <View style={{ marginTop: 10, flexDirection: 'row', gap: 8 }}>
                    <PrimaryButton disabled={acceptTransfer.isPending} style={{ flex: 1 }} onPress={() => decideIncoming(true)}>Accept</PrimaryButton>
                    <PrimaryButton disabled={acceptTransfer.isPending} tone="danger" style={{ flex: 1 }} onPress={() => decideIncoming(false)}>Reject</PrimaryButton>
                  </View>
                ) : (
                  <View style={{ marginTop: 10, gap: 8 }}>
                    <Text style={{ color: '#4B5563', fontSize: 12, fontWeight: '800' }}>
                      Decision saved locally. Move it back if this was tapped by mistake.
                    </Text>
                    <PrimaryButton tone="light" onPress={resetIncoming}>Move back to pending</PrimaryButton>
                  </View>
                )}
              </Panel>
            </View>
          </Panel>
        </View>
      </View>
      <OverlaySheet visible={!!notice} title={notice?.title || ''} onClose={() => setNotice(null)}>
        <Text style={{ color: '#374151', fontSize: 13, fontWeight: '800' }}>{notice?.message}</Text>
        <PrimaryButton onPress={() => setNotice(null)}>{t('common.close')}</PrimaryButton>
      </OverlaySheet>
    </POSScreen>
  );
}
