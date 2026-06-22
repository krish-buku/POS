import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Redirect, useLocalSearchParams } from 'expo-router';
import { Bell, Printer, Volume2 } from 'lucide-react-native';
import { useAuthStore } from '../../features/auth/store';
import { useOrderStore } from '../../features/order/store';
import { useTheme } from '../../shared/theme';
import { useT } from '../../shared/i18n/store';
import { useAdvanceKitchenTicket, useKitchenTickets } from '../../shared/hooks/queries';
import { arr } from '../../shared/lib/safe';
import {
  OverlaySheet,
  POSScreen,
  Panel,
  PrimaryButton,
  ResilienceBanner,
  SectionHeader,
  SegmentTabs,
  StatCard,
  TextField,
  usePOSLayout,
} from '../../shared/pos/components';
import { kitchenTickets } from '../../shared/pos/demoData';

type Mode = 'simple' | 'board';
type Status = 'new' | 'preparing' | 'ready';

export default function KitchenQueueScreen() {
  const theme = useTheme();
  const t = useT();
  const params = useLocalSearchParams<{ kdsMode?: string }>();
  const { user, needsBusinessSelection } = useAuthStore();
  const order = useOrderStore();
  const { isCompact } = usePOSLayout();
  const [mode, setMode] = useState<Mode>('simple');
  const [detail, setDetail] = useState<any | null>(null);
  const [reprint, setReprint] = useState<any | null>(null);
  const [printerSheet, setPrinterSheet] = useState(false);
  const [printerName, setPrinterName] = useState('Kitchen printer');
  const [reprintResult, setReprintResult] = useState<{ title: string; message: string } | null>(null);
  const [printerResult, setPrinterResult] = useState<{ title: string; message: string } | null>(null);
  const [soundOn, setSoundOn] = useState(true);
  const [localTicketStatuses, setLocalTicketStatuses] = useState<Record<string, Status>>({});
  const [completedTicketIds, setCompletedTicketIds] = useState<string[]>([]);
  const businessId = user?.businessId ?? '';
  const { data } = useKitchenTickets(businessId, { refetchInterval: 10000 });
  const advance = useAdvanceKitchenTicket();

  useEffect(() => {
    if (params.kdsMode === 'board') setMode('board');
    if (params.kdsMode === 'simple') setMode('simple');
  }, [params.kdsMode]);

  const tickets = useMemo(() => {
    const apiTickets = arr<any>(data);
    const source = apiTickets.length > 0 ? apiTickets : kitchenTickets;
    return source
      .filter((ticket) => !completedTicketIds.includes(ticket.id))
      .map((ticket) => ({
        ...ticket,
        status: localTicketStatuses[ticket.id] || (String(ticket.status || 'new').toLowerCase() as Status),
        items: Array.isArray(ticket.items)
          ? ticket.items.map((item: any) => typeof item === 'string' ? item : `${item.quantity || 1}x ${item.name || item.menuItemName}`)
          : [],
      }));
  }, [completedTicketIds, data, localTicketStatuses]);

  if (needsBusinessSelection) {
    return <Redirect href="/(auth)/select-business" />;
  }

  if (!user?.businessId) {
    return <Redirect href="/(auth)/login" />;
  }

  const nextStatus = (status: Status): Status => status === 'new' ? 'preparing' : status === 'preparing' ? 'ready' : 'ready';
  const previousStatus = (status: Status): Status | null => status === 'ready' ? 'preparing' : status === 'preparing' ? 'new' : null;
  const primaryActionLabel = (status: Status) => status === 'new' ? t('pos.kitchen.startCooking') : status === 'preparing' ? t('pos.kitchen.markReady') : t('pos.kitchen.complete');

  const setTicketStatus = (ticket: any, status: Status) => {
    setLocalTicketStatuses((current) => ({ ...current, [ticket.id]: status }));
    setDetail((current: any | null) => current?.id === ticket.id ? { ...current, status } : current);
  };

  const transitionTicket = async (ticket: any, status: Status, label: string) => {
    setTicketStatus(ticket, status);
    try {
      await advance.mutateAsync({ ticketId: ticket.id, nextStatus: status, businessId });
      order.enqueueSync(label);
    } catch {
      order.enqueueSync(`${label} pending server sync`, true);
    }
  };

  const bump = async (ticket: any) => {
    if (ticket.status === 'ready') {
      setCompletedTicketIds((current) => current.includes(ticket.id) ? current : [...current, ticket.id]);
      setDetail(null);
      order.enqueueSync(`KDS completed ${ticket.orderNumber}`);
      return;
    }
    const next = nextStatus(ticket.status);
    if (next !== ticket.status) {
      await transitionTicket(ticket, next, `KDS moved ${ticket.orderNumber} to ${next}`);
    }
  };

  const moveBack = async (ticket: any) => {
    const previous = previousStatus(ticket.status);
    if (!previous) return;
    await transitionTicket(ticket, previous, `KDS moved back ${ticket.orderNumber} to ${previous}`);
  };

  const grouped = {
    new: tickets.filter((ticket) => ticket.status === 'new'),
    preparing: tickets.filter((ticket) => ticket.status === 'preparing'),
    ready: tickets.filter((ticket) => ticket.status === 'ready'),
  };
  const activeDetail = detail ? tickets.find((ticket) => ticket.id === detail.id) || detail : null;

  const openReprintSheet = (ticket: any) => {
    setReprintResult(null);
    setReprint(ticket);
  };

  const closeReprintSheet = () => {
    setReprint(null);
    setReprintResult(null);
  };

  const closePrinterSheet = () => {
    setPrinterSheet(false);
    setPrinterResult(null);
  };

  const queueReprint = (ticket: any, source: 'sheet' | 'printer' = 'sheet') => {
    order.addPrintJob({ type: 'reprint', status: 'queued', printerName: 'Kitchen printer' });
    const result = {
      title: 'Reprint queued',
      message: `${ticket?.orderNumber || 'Last ticket'} was added to the kitchen printer fallback queue.`,
    };
    if (source === 'printer') {
      setPrinterResult(result);
      return;
    }
    setReprintResult(result);
  };

  const queueTestPrint = () => {
    order.addPrintJob({ type: 'kitchen', status: 'queued', printerName });
    order.enqueueSync(`Kitchen printer ${printerName} test queued`);
    setPrinterResult({
      title: 'Test print queued',
      message: `${printerName || 'Kitchen printer'} test print was added to the local queue.`,
    });
  };

  return (
    <POSScreen
      role="kitchen"
      title={t('pos.screen.kitchen')}
      subtitle={user.businessName}
      active="queue"
      staffName={user.name}
      onNavigate={(target) => {
        if (target === 'queue') setMode('simple');
        if (target === 'settings') setPrinterSheet(true);
      }}
    >
      <View style={{ flex: 1, padding: isCompact ? 10 : 14, gap: 12, backgroundColor: mode === 'simple' ? theme.palette.neutral[900] : theme.palette.neutral[50] }}>
        <View style={{ flexDirection: isCompact ? 'column' : 'row', gap: 10, justifyContent: 'space-between' }}>
          <SegmentTabs
            value={mode}
            onChange={setMode}
            items={[
              { key: 'simple', label: t('pos.kitchen.fatTickets') },
              { key: 'board', label: t('pos.kitchen.boardDetail') },
            ]}
          />
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            <PrimaryButton tone="light" onPress={() => setSoundOn((value) => !value)}>{soundOn ? t('pos.kitchen.soundOn') : t('pos.kitchen.muted')}</PrimaryButton>
            <PrimaryButton tone="light" disabled={tickets.length === 0} onPress={() => openReprintSheet(tickets[0])}>{t('pos.kitchen.reprintLast')}</PrimaryButton>
          </View>
        </View>
        <ResilienceBanner syncQueue={order.syncQueue} printJobs={order.printJobs} />

        {mode === 'simple' ? (
          <ScrollView contentContainerStyle={{ flexDirection: isCompact ? 'column' : 'row', flexWrap: 'wrap', gap: 12, paddingBottom: 20 }}>
            {tickets.map((ticket) => (
              <FatTicket
                key={ticket.id}
                ticket={ticket}
                onDetail={() => setDetail(ticket)}
                onBump={() => bump(ticket)}
                onMoveBack={() => moveBack(ticket)}
                primaryLabel="BUMP"
              />
            ))}
          </ScrollView>
        ) : (
          <View style={{ flexDirection: isCompact ? 'column' : 'row', gap: 12, flex: 1 }}>
            <KdsColumn statusKey="new" title={t('kitchen.new')} tickets={grouped.new} tone={theme.palette.brand.navy} onDetail={setDetail} onBump={bump} onMoveBack={moveBack} primaryLabel={primaryActionLabel} />
            <KdsColumn statusKey="preparing" title={t('kitchen.preparing')} tickets={grouped.preparing} tone={theme.palette.semantic.warning} onDetail={setDetail} onBump={bump} onMoveBack={moveBack} primaryLabel={primaryActionLabel} />
            <KdsColumn statusKey="ready" title={t('kitchen.ready')} tickets={grouped.ready} tone={theme.palette.semantic.success} onDetail={setDetail} onBump={bump} onMoveBack={moveBack} primaryLabel={primaryActionLabel} />
          </View>
        )}
      </View>

      <OverlaySheet visible={!!activeDetail} title={activeDetail?.orderNumber || 'Ticket'} onClose={() => setDetail(null)}>
        {activeDetail ? (
          <>
            <Panel padding={12}>
              <Text style={{ color: theme.palette.neutral[900], fontSize: 18, fontWeight: '900' }}>{activeDetail.tableName}</Text>
              <Text style={{ marginTop: 4, color: theme.palette.neutral[500], fontSize: 12, fontWeight: '800' }}>{activeDetail.elapsed || '04m 12s'} · {activeDetail.status}</Text>
            </Panel>
            {activeDetail.items.map((item: string, index: number) => (
              <Panel key={`${item}-${index}`} padding={12}>
                <Text style={{ color: theme.palette.neutral[900], fontSize: 15, fontWeight: '900' }}>{item}</Text>
              </Panel>
            ))}
            <PrimaryButton onPress={() => bump(activeDetail)}>{primaryActionLabel(activeDetail.status)}</PrimaryButton>
            {activeDetail.status !== 'new' ? (
              <PrimaryButton tone="light" onPress={() => moveBack(activeDetail)}>{t('pos.kitchen.moveBack')}</PrimaryButton>
            ) : null}
            <PrimaryButton tone="light" onPress={() => openReprintSheet(activeDetail)}>{t('pos.kitchen.reprintTicket')}</PrimaryButton>
          </>
        ) : null}
      </OverlaySheet>

      <OverlaySheet visible={!!reprint} title="Kitchen reprint" onClose={closeReprintSheet}>
        {reprintResult ? (
          <Panel padding={12} style={{ gap: 10 }}>
            <Text style={{ color: theme.palette.neutral[900], fontSize: 16, fontWeight: '900' }}>{reprintResult.title}</Text>
            <Text style={{ color: theme.palette.neutral[700], fontSize: 13, fontWeight: '800' }}>{reprintResult.message}</Text>
            <PrimaryButton onPress={closeReprintSheet}>Close</PrimaryButton>
          </Panel>
        ) : (
          <>
            <Panel padding={12} style={{ gap: 8 }}>
              <Printer size={24} color={theme.palette.brand.navy} />
              <Text style={{ color: theme.palette.neutral[900], fontSize: 16, fontWeight: '900' }}>Reprint {reprint?.orderNumber}</Text>
              <Text style={{ color: theme.palette.neutral[600], fontSize: 13, fontWeight: '700' }}>Reprint is queued locally when the kitchen printer is unavailable.</Text>
            </Panel>
            <PrimaryButton onPress={() => queueReprint(reprint)}>Queue reprint</PrimaryButton>
          </>
        )}
      </OverlaySheet>

      <OverlaySheet visible={printerSheet} title="Kitchen printer" onClose={closePrinterSheet}>
        <Panel padding={12} style={{ gap: 8 }}>
          <Printer size={24} color={theme.palette.brand.navy} />
          <Text style={{ color: theme.palette.neutral[900], fontSize: 16, fontWeight: '900' }}>Printer pairing</Text>
          <Text style={{ color: theme.palette.neutral[600], fontSize: 13, fontWeight: '700' }}>Simulator mode stores printer config and queues test/reprint jobs locally.</Text>
          <TextField label="Printer name" value={printerName} onChangeText={setPrinterName} placeholder="Kitchen printer" />
          <PrimaryButton onPress={queueTestPrint}>
            Queue test print
          </PrimaryButton>
          <PrimaryButton tone="light" disabled={tickets.length === 0} onPress={() => {
            if (tickets[0]) queueReprint(tickets[0], 'printer');
          }}>
            {t('pos.kitchen.reprintLastTicket')}
          </PrimaryButton>
        </Panel>
        {printerResult ? (
          <Panel padding={12} style={{ gap: 8, borderColor: theme.palette.semantic.success, backgroundColor: theme.palette.semantic.successBg }}>
            <Text style={{ color: theme.palette.neutral[900], fontSize: 15, fontWeight: '900' }}>{printerResult.title}</Text>
            <Text style={{ color: theme.palette.neutral[700], fontSize: 12, fontWeight: '800' }}>{printerResult.message}</Text>
          </Panel>
        ) : null}
        {order.printJobs.slice(0, 4).map((job) => (
          <Panel key={job.id} padding={12}>
            <Text style={{ color: theme.palette.neutral[900], fontSize: 13, fontWeight: '900' }}>{job.type} · {job.status}</Text>
            <Text style={{ marginTop: 3, color: theme.palette.neutral[500], fontSize: 12, fontWeight: '800' }}>{job.printerName || 'fallback'} · {new Date(job.createdAt).toLocaleTimeString()}</Text>
          </Panel>
        ))}
      </OverlaySheet>
    </POSScreen>
  );
}

function FatTicket({
  ticket,
  onBump,
  onDetail,
  onMoveBack,
  primaryLabel,
}: {
  ticket: any;
  onBump: () => void;
  onDetail: () => void;
  onMoveBack: () => void;
  primaryLabel: string;
}) {
  const theme = useTheme();
  const t = useT();
  const tone = ticket.status === 'new' ? theme.palette.brand.navy : ticket.status === 'preparing' ? theme.palette.semantic.warning : theme.palette.semantic.success;
  return (
    <Panel style={{ width: 360, minHeight: 310, backgroundColor: '#FFFFFF' }}>
      <Pressable
        onPress={onDetail}
        accessibilityRole="button"
        accessibilityLabel={`Open ticket ${ticket.orderNumber}, ${ticket.tableName}`}
        style={{ flex: 1, gap: 10 }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
          <View>
            <Text style={{ color: theme.palette.neutral[900], fontSize: 24, fontWeight: '900' }}>{ticket.tableName}</Text>
            <Text style={{ marginTop: 4, color: theme.palette.neutral[500], fontSize: 12, fontWeight: '900' }}>{ticket.orderNumber}</Text>
          </View>
          <View style={{ paddingHorizontal: 10, height: 32, borderRadius: 999, backgroundColor: tone, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '900', textTransform: 'uppercase' }}>{ticket.status}</Text>
          </View>
        </View>
        <View style={{ gap: 8, flex: 1 }}>
          {ticket.items.map((item: string, index: number) => (
            <Text key={`${item}-${index}`} style={{ color: theme.palette.neutral[800], fontSize: 17, fontWeight: '900' }}>{item}</Text>
          ))}
        </View>
      </Pressable>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {ticket.status !== 'new' ? (
          <PrimaryButton tone="light" style={{ flex: 1 }} onPress={onMoveBack}>{t('pos.kitchen.moveBack')}</PrimaryButton>
        ) : null}
        <PrimaryButton tone={ticket.status === 'ready' ? 'green' : 'dark'} style={{ flex: 1 }} onPress={onBump}>{primaryLabel}</PrimaryButton>
      </View>
    </Panel>
  );
}

function KdsColumn({
  statusKey,
  title,
  tickets,
  tone,
  onDetail,
  onBump,
  onMoveBack,
  primaryLabel,
}: {
  statusKey: Status;
  title: string;
  tickets: any[];
  tone: string;
  onDetail: (ticket: any) => void;
  onBump: (ticket: any) => void;
  onMoveBack: (ticket: any) => void;
  primaryLabel: (status: Status) => string;
}) {
  const theme = useTheme();
  const t = useT();
  return (
    <Panel style={{ flex: 1, minWidth: 260 }}>
      <View testID={`kds-column-${statusKey}`} style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ color: theme.palette.neutral[900], fontSize: 18, fontWeight: '900' }}>{title}</Text>
        <View style={{ minWidth: 28, height: 28, borderRadius: 14, backgroundColor: tone, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '900' }}>{tickets.length}</Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={{ gap: 10, paddingTop: 12 }}>
        {tickets.map((ticket) => (
          <View key={ticket.id} testID={`kds-ticket-${ticket.id}`} style={{ padding: 12, borderRadius: 8, borderWidth: 1, borderColor: theme.palette.neutral[200], backgroundColor: '#FFFFFF', gap: 8 }}>
            <Pressable
              onPress={() => onDetail(ticket)}
              accessibilityRole="button"
              accessibilityLabel={`Open ticket ${ticket.orderNumber}, ${ticket.tableName}`}
              style={({ pressed }) => ({ gap: 8, borderRadius: 8, backgroundColor: pressed ? theme.palette.neutral[100] : '#FFFFFF' })}
            >
              <Text style={{ color: theme.palette.neutral[900], fontSize: 15, fontWeight: '900' }}>{ticket.orderNumber} · {ticket.tableName}</Text>
              {ticket.items.slice(0, 3).map((item: string, index: number) => (
                <Text key={`${item}-${index}`} style={{ color: theme.palette.neutral[700], fontSize: 12, fontWeight: '800' }}>{item}</Text>
              ))}
            </Pressable>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {ticket.status !== 'new' ? (
                <PrimaryButton tone="light" style={{ flex: 1 }} onPress={() => onMoveBack(ticket)}>{t('pos.kitchen.moveBack')}</PrimaryButton>
              ) : null}
              <PrimaryButton tone={ticket.status === 'ready' ? 'green' : 'light'} style={{ flex: 1 }} onPress={() => onBump(ticket)}>{primaryLabel(ticket.status)}</PrimaryButton>
            </View>
          </View>
        ))}
      </ScrollView>
      </View>
    </Panel>
  );
}
