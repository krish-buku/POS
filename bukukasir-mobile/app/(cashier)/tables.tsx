import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { Bluetooth, GitMerge, Grid2X2, MoveRight, Printer, Save, Wrench } from 'lucide-react-native';
import { useAuthStore } from '../../features/auth/store';
import { useOrderStore } from '../../features/order/store';
import { useTheme } from '../../shared/theme';
import { useT } from '../../shared/i18n/store';
import { TableTile } from '../../shared/components/TableTile';
import { formatRupiah } from '../../shared/lib/format';
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
import { openTabSessions, posTables } from '../../shared/pos/demoData';

type Mode = 'open' | 'floor' | 'merge' | 'printer';

export default function CashierTablesScreen() {
  const router = useRouter();
  const theme = useTheme();
  const t = useT();
  const { user, needsBusinessSelection } = useAuthStore();
  const order = useOrderStore();
  const { isCompact } = usePOSLayout();
  const [mode, setMode] = useState<Mode>('open');
  const [selectedTables, setSelectedTables] = useState<string[]>(['table-002', 'table-003']);
  const [editorOpen, setEditorOpen] = useState(false);
  const [printerOpen, setPrinterOpen] = useState(false);
  const [printerName, setPrinterName] = useState('BUKU Thermal 58');
  const [newSection, setNewSection] = useState('Outdoor Patio');
  const [localPending, setLocalPending] = useState(1);
  const [activeTableId, setActiveTableId] = useState<string | null>(null);

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

  const toggleTable = (id: string) => {
    setSelectedTables((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  const openTab = (session: (typeof openTabSessions)[number]) => {
    order.openSession(session);
    router.replace('/(cashier)/order');
  };

  const mergeTables = () => {
    order.enqueueSync(`Merged ${selectedTables.length} tables`);
    setLocalPending((count) => count + 1);
  };

  const activeTable = posTables.find((table) => table.id === activeTableId);
  const activeSession = openTabSessions.find((session) => session.tableId === activeTableId);

  const startTableOrder = () => {
    if (!activeTable) return;
    order.setTable(activeTable.id, activeTable.name);
    setActiveTableId(null);
    router.replace('/(cashier)/order');
  };

  const transferActiveTable = () => {
    if (!activeTable) return;
    setActiveTableId(null);
    router.push(`/(cashier)/transfer?fromTableId=${activeTable.id}`);
  };

  return (
    <POSScreen
      role="cashier"
      title={t('pos.screen.openTables')}
      subtitle={user.businessName}
      active="tables"
      staffName={user.name}
      onNavigate={navigate as any}
    >
      <View style={{ flex: 1, padding: isCompact ? 10 : 14, gap: 12 }}>
        <ResilienceBanner
          syncQueue={order.syncQueue}
          printJobs={order.printJobs}
          recoveryLabel={localPending > 0 ? `${localPending} setup pending/local` : undefined}
          onRetry={() => setLocalPending(0)}
        />

        <View style={{ flexDirection: isCompact ? 'column' : 'row', gap: 12, flex: 1 }}>
          <Panel style={{ flex: 1.5, minWidth: 0 }}>
            <SectionHeader
              eyebrow="Table operations"
              title="Open tabs and floor plan"
              action={
                <SegmentTabs
                  value={mode}
                  onChange={setMode}
                  items={[
                    { key: 'open', label: 'Open tabs' },
                    { key: 'floor', label: 'Floor' },
                    { key: 'merge', label: 'Merge' },
                    { key: 'printer', label: 'Printer' },
                  ]}
                />
              }
            />

            {mode === 'open' ? (
              <ScrollView contentContainerStyle={{ gap: 10, paddingTop: 14 }}>
                {openTabSessions.map((session) => (
                  <Pressable
                    key={session.id}
                    onPress={() => openTab(session)}
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
                    <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: theme.palette.status.openTabBg, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ color: theme.palette.status.openTab, fontSize: 14, fontWeight: '900' }}>{session.tableName}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: theme.palette.neutral[900], fontSize: 15, fontWeight: '900' }}>{session.customerName}</Text>
                      <Text style={{ marginTop: 3, color: theme.palette.neutral[500], fontSize: 12, fontWeight: '700' }}>{session.guestCount} guests · opened {session.openedAt} · {session.status.replace('_', ' ')}</Text>
                    </View>
                    <Text style={{ color: theme.palette.neutral[900], fontSize: 16, fontWeight: '900' }}>{formatRupiah(session.total)}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            ) : null}

            {mode === 'floor' || mode === 'merge' ? (
              <ScrollView contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingTop: 14 }}>
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
                    selected={mode === 'merge' ? selectedTables.includes(table.id) : activeTableId === table.id}
                    pending={localPending > 0 && table.id === 'table-006'}
                    onPress={() => mode === 'merge' ? toggleTable(table.id) : setActiveTableId(table.id)}
                  />
                ))}
              </ScrollView>
            ) : null}

            {mode === 'printer' ? (
              <View style={{ paddingTop: 14, gap: 12 }}>
                <Panel padding={14} style={{ gap: 8 }}>
                  <Bluetooth size={24} color={theme.palette.brand.navy} />
                  <Text style={{ color: theme.palette.neutral[900], fontSize: 17, fontWeight: '900' }}>Bluetooth printer pairing</Text>
                  <Text style={{ color: theme.palette.neutral[600], fontSize: 13, fontWeight: '700' }}>Pairing is simulator-safe: the selected printer is stored and print jobs move to queued/fallback state.</Text>
                  <PrimaryButton onPress={() => setPrinterOpen(true)}>Pair printer</PrimaryButton>
                </Panel>
                <Panel padding={14} style={{ gap: 8 }}>
                  <Printer size={24} color={theme.palette.semantic.warning} />
                  <Text style={{ color: theme.palette.neutral[900], fontSize: 15, fontWeight: '900' }}>Recent print jobs</Text>
                  {order.printJobs.length === 0 ? (
                    <Text style={{ color: theme.palette.neutral[500], fontSize: 12, fontWeight: '700' }}>No print jobs yet.</Text>
                  ) : (
                    order.printJobs.map((job) => (
                      <Text key={job.id} style={{ color: theme.palette.neutral[700], fontSize: 12, fontWeight: '800' }}>{job.type} · {job.status} · {job.printerName || 'fallback'}</Text>
                    ))
                  )}
                </Panel>
              </View>
            ) : null}
          </Panel>

          <Panel style={{ width: isCompact ? '100%' : 360 }}>
            <SectionHeader eyebrow="Controls" title="Table setup" />
            <View style={{ marginTop: 12, gap: 10 }}>
              <StatCard label="Open tabs" value={String(openTabSessions.length)} meta="Bills can be resumed from cashier order." />
              <StatCard label="Selected tables" value={String(selectedTables.length)} meta={selectedTables.join(', ')} />
              <PrimaryButton tone="light" onPress={() => setEditorOpen(true)}>
                Atur denah meja
              </PrimaryButton>
              <PrimaryButton tone="light" onPress={() => setMode('merge')}>
                Merge tables
              </PrimaryButton>
              <PrimaryButton disabled={selectedTables.length < 2} onPress={mergeTables}>
                Merge selected
              </PrimaryButton>
              <PrimaryButton tone="light" onPress={() => setPrinterOpen(true)}>
                Pair printer
              </PrimaryButton>
            </View>
          </Panel>
        </View>
      </View>

      <OverlaySheet visible={editorOpen} title="Floor editor" onClose={() => setEditorOpen(false)}>
        <Panel padding={12} style={{ gap: 10 }}>
          <Grid2X2 size={24} color={theme.palette.brand.navy} />
          <Text style={{ color: theme.palette.neutral[900], fontSize: 16, fontWeight: '900' }}>Dining room layout</Text>
          <Text style={{ color: theme.palette.neutral[600], fontSize: 13, fontWeight: '700' }}>Move tables, update seats, and save as table layout metadata.</Text>
          <TextField label="New section" value={newSection} onChangeText={setNewSection} />
          <PrimaryButton onPress={() => { order.enqueueSync(`Floor layout metadata saved: ${newSection || 'Untitled section'}`); setLocalPending((count) => count + 1); setEditorOpen(false); }}>
            Save layout
          </PrimaryButton>
        </Panel>
      </OverlaySheet>

      <OverlaySheet visible={!!activeTable} title={activeTable ? `${activeTable.name} actions` : ''} onClose={() => setActiveTableId(null)}>
        {activeTable ? (
          <Panel padding={12} style={{ gap: 10 }}>
            <Text style={{ color: theme.palette.neutral[900], fontSize: 18, fontWeight: '900' }}>{activeTable.name}</Text>
            <Text style={{ color: theme.palette.neutral[600], fontSize: 13, fontWeight: '800' }}>
              {activeTable.status} · {activeTable.guests || activeTable.seats} guests · {activeTable.runningTotal > 0 ? formatRupiah(activeTable.runningTotal) : 'No open bill'}
            </Text>
            {activeSession ? (
              <PrimaryButton onPress={() => openTab(activeSession)}>Resume order</PrimaryButton>
            ) : (
              <PrimaryButton onPress={startTableOrder}>New order here</PrimaryButton>
            )}
            <PrimaryButton tone="light" onPress={transferActiveTable}>Transfer table</PrimaryButton>
            <PrimaryButton tone="light" onPress={() => {
              order.enqueueSync(`Bill requested for ${activeTable.name}`);
              setActiveTableId(null);
            }}>
              Request bill
            </PrimaryButton>
          </Panel>
        ) : null}
      </OverlaySheet>

      <OverlaySheet visible={printerOpen} title="Pair printer" onClose={() => setPrinterOpen(false)}>
        <Panel padding={12} style={{ gap: 10 }}>
          <Wrench size={24} color={theme.palette.brand.navy} />
          <TextField label="Printer name" value={printerName} onChangeText={setPrinterName} placeholder="Bluetooth printer" />
          <PrimaryButton onPress={() => {
            order.addPrintJob({ type: 'receipt', status: 'queued', printerName });
            order.enqueueSync(`Printer ${printerName} paired`);
            setPrinterOpen(false);
          }}>
            Connect printer
          </PrimaryButton>
        </Panel>
      </OverlaySheet>
    </POSScreen>
  );
}
