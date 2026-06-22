import { create } from 'zustand';
import type {
  CurrentOrderActions,
  CurrentOrderState,
  HeldOrder,
  OrderAdjustment,
  OrderFeeItem,
  OrderLineItem,
  PrintJob,
  SplitPayment,
  SyncQueueItem,
} from './types';

let itemIdCounter = 0;
let feeIdCounter = 0;
let adjustmentIdCounter = 0;
let splitIdCounter = 0;
let printJobIdCounter = 0;
let syncIdCounter = 0;
let heldIdCounter = 0;

function nextId(prefix: string, counter: number): string {
  return `${prefix}-${Date.now()}-${counter}`;
}

function generateItemId(): string {
  itemIdCounter += 1;
  return nextId('item', itemIdCounter);
}

function generateFeeId(): string {
  feeIdCounter += 1;
  return nextId('fee', feeIdCounter);
}

function generateAdjustmentId(): string {
  adjustmentIdCounter += 1;
  return nextId('adj', adjustmentIdCounter);
}

function generateSplitId(): string {
  splitIdCounter += 1;
  return nextId('split', splitIdCounter);
}

function generatePrintJobId(): string {
  printJobIdCounter += 1;
  return nextId('print', printJobIdCounter);
}

function generateSyncId(): string {
  syncIdCounter += 1;
  return nextId('sync', syncIdCounter);
}

function generateHeldId(): string {
  heldIdCounter += 1;
  return nextId('held', heldIdCounter);
}

function calculateTotals(state: {
  items: OrderLineItem[];
  discountType: 'percentage' | 'fixed' | null;
  discountValue: number;
  taxRate: number;
  fees: OrderFeeItem[];
  lineAdjustments: OrderAdjustment[];
}) {
  const activeItems = state.items.filter((item) => !item.voided);
  const rawSubtotal = activeItems.reduce((sum, item) => sum + item.subtotal, 0);
  const lineDiscount = state.lineAdjustments
    .filter((adjustment) => adjustment.type === 'discount')
    .reduce((sum, adjustment) => sum + Math.max(0, adjustment.amount), 0);
  const subtotal = Math.max(0, rawSubtotal - lineDiscount);

  let discount = 0;
  if (state.discountType === 'percentage') {
    discount = Math.round(subtotal * (state.discountValue / 100));
  } else if (state.discountType === 'fixed') {
    discount = state.discountValue;
  }

  const afterDiscount = Math.max(0, subtotal - discount);
  const tax = Math.round(afterDiscount * (state.taxRate / 100));
  const feesTotal =
    state.fees.reduce((sum, fee) => sum + fee.amount, 0) +
    state.lineAdjustments
      .filter((adjustment) => adjustment.type === 'fee')
      .reduce((sum, adjustment) => sum + adjustment.amount, 0);
  const total = Math.max(0, afterDiscount + tax + feesTotal);

  return { subtotal, discount, tax, total };
}

const initialState: CurrentOrderState = {
  tableId: null,
  tableName: '',
  orderType: 'dine_in',
  customer: null,
  destination: null,
  session: null,
  orderNote: '',
  items: [],
  subtotal: 0,
  discount: 0,
  discountType: null,
  discountValue: 0,
  discountReason: '',
  lineAdjustments: [],
  tax: 0,
  taxRate: 0,
  fees: [],
  total: 0,
  paymentReference: '',
  splitPayments: [],
  printJobs: [],
  syncQueue: [],
  recoveryDraft: null,
  heldOrders: [],
  syncQueueCount: 0,
  failedSyncCount: 0,
  recoveryDraftSavedAt: null,
};

interface OrderStore extends CurrentOrderState, CurrentOrderActions {}

function patchTotals(state: CurrentOrderState, patch: Partial<CurrentOrderState>) {
  const next = { ...state, ...patch } as CurrentOrderState;
  return { ...patch, ...calculateTotals(next) };
}

export const useOrderStore = create<OrderStore>((set, get) => ({
  ...initialState,

  setTable: (tableId, tableName) => {
    set({ tableId, tableName });
  },

  setOrderType: (type) => {
    set({ orderType: type });
  },

  setCustomer: (customer) => {
    set({ customer });
  },

  setDestination: (destination) => {
    const orderType =
      destination?.type === 'takeaway' || destination?.type === 'delivery'
        ? destination.type
        : 'dine_in';
    set({
      destination,
      orderType,
      tableId: destination?.tableId ?? null,
      tableName: destination?.tableName ?? destination?.label ?? '',
    });
  },

  openSession: (session) => {
    set({
      session,
      tableId: session.tableId,
      tableName: session.tableName,
      destination: {
        type: 'open_tab',
        label: `Open tab ${session.tableName}`,
        tableId: session.tableId,
        tableName: session.tableName,
        guestCount: session.guestCount,
      },
    });
  },

  closeSession: () => {
    set({ session: null });
  },

  setOrderNote: (orderNote) => {
    set({ orderNote });
  },

  addItem: (item) => {
    const state = get();
    const activeItems = state.items.filter((i) => !i.voided);
    const existingItem = activeItems.find(
      (i) =>
        i.menuItemId === item.menuItemId &&
        JSON.stringify(i.modifiers) === JSON.stringify(item.modifiers) &&
        i.notes === item.notes
    );

    let newItems: OrderLineItem[];
    if (existingItem) {
      newItems = state.items.map((i) =>
        i.id === existingItem.id
          ? {
              ...i,
              quantity: i.quantity + item.quantity,
              subtotal: (i.quantity + item.quantity) * i.unitPrice,
              syncState: 'draft',
            }
          : i
      );
    } else {
      const newItem: OrderLineItem = {
        ...item,
        id: generateItemId(),
        subtotal: item.quantity * item.unitPrice,
        course: item.course ?? 'hold',
      };
      newItems = [...state.items, newItem];
    }

    set(patchTotals(state, { items: newItems, recoveryDraftSavedAt: new Date().toISOString() }));
  },

  removeItem: (itemId) => {
    const state = get();
    const newItems = state.items.filter((i) => i.id !== itemId);
    const lineAdjustments = state.lineAdjustments.filter((a) => a.lineItemId !== itemId);
    set(patchTotals(state, { items: newItems, lineAdjustments }));
  },

  updateQuantity: (itemId, quantity) => {
    const state = get();
    if (quantity <= 0) {
      const newItems = state.items.filter((i) => i.id !== itemId);
      const lineAdjustments = state.lineAdjustments.filter((a) => a.lineItemId !== itemId);
      set(patchTotals(state, { items: newItems, lineAdjustments }));
      return;
    }

    const newItems = state.items.map((i) =>
      i.id === itemId
        ? { ...i, quantity, subtotal: quantity * i.unitPrice, syncState: 'draft' as const }
        : i
    );
    set(patchTotals(state, { items: newItems }));
  },

  updateItemNote: (itemId, notes) => {
    set((state) => ({
      items: state.items.map((item) => (item.id === itemId ? { ...item, notes } : item)),
    }));
  },

  voidLineItem: (itemId, reason) => {
    const state = get();
    const item = state.items.find((line) => line.id === itemId);
    if (!item) return;
    const newItems = state.items.map((line) =>
      line.id === itemId ? { ...line, voided: true, syncState: 'pending' as const } : line
    );
    const adjustment: OrderAdjustment = {
      id: generateAdjustmentId(),
      scope: 'line',
      lineItemId: itemId,
      type: 'void',
      label: `Void ${item.menuItemName}`,
      amount: item.subtotal,
      reason,
    };
    set(
      patchTotals(state, {
        items: newItems,
        lineAdjustments: [...state.lineAdjustments, adjustment],
      })
    );
  },

  applyDiscount: (type, value) => {
    const state = get();
    set(patchTotals(state, { discountType: type, discountValue: value }));
  },

  setDiscountReason: (discountReason) => {
    set({ discountReason });
  },

  removeDiscount: () => {
    const state = get();
    set(patchTotals(state, { discountType: null, discountValue: 0, discountReason: '' }));
  },

  addFee: (name, amount) => {
    const state = get();
    const newFee: OrderFeeItem = { id: generateFeeId(), name, amount };
    set(patchTotals(state, { fees: [...state.fees, newFee] }));
  },

  removeFee: (feeId) => {
    const state = get();
    set(patchTotals(state, { fees: state.fees.filter((f) => f.id !== feeId) }));
  },

  addAdjustment: (adjustment) => {
    const state = get();
    const nextAdjustment: OrderAdjustment = {
      ...adjustment,
      id: generateAdjustmentId(),
    };
    const lineAdjustments = [...state.lineAdjustments, nextAdjustment];
    set(patchTotals(state, { lineAdjustments }));
  },

  removeAdjustment: (adjustmentId) => {
    const state = get();
    set(
      patchTotals(state, {
        lineAdjustments: state.lineAdjustments.filter((adjustment) => adjustment.id !== adjustmentId),
      })
    );
  },

  setTaxRate: (taxRate) => {
    const state = get();
    set(patchTotals(state, { taxRate }));
  },

  setPaymentReference: (paymentReference) => {
    set({ paymentReference });
  },

  addSplitPayment: (payment) => {
    const split: SplitPayment = { ...payment, id: generateSplitId() };
    set((state) => ({ splitPayments: [...state.splitPayments, split] }));
  },

  removeSplitPayment: (paymentId) => {
    set((state) => ({
      splitPayments: state.splitPayments.filter((payment) => payment.id !== paymentId),
    }));
  },

  clearSplitPayments: () => {
    set({ splitPayments: [] });
  },

  addPrintJob: (job) => {
    const printJob: PrintJob = {
      ...job,
      id: generatePrintJobId(),
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ printJobs: [printJob, ...state.printJobs] }));
  },

  updatePrintJob: (jobId, status) => {
    set((state) => ({
      printJobs: state.printJobs.map((job) => (job.id === jobId ? { ...job, status } : job)),
    }));
  },

  enqueueSync: (label, failed = false) => {
    const item: SyncQueueItem = {
      id: generateSyncId(),
      label,
      status: failed ? 'failed' : 'queued',
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      syncQueue: [item, ...state.syncQueue],
      syncQueueCount: failed ? state.syncQueueCount : state.syncQueueCount + 1,
      failedSyncCount: failed ? state.failedSyncCount + 1 : state.failedSyncCount,
    }));
  },

  resolveSyncItem: (itemId) => {
    set((state) => ({
      syncQueue: state.syncQueue.map((item) =>
        item.id === itemId ? { ...item, status: 'synced' as const } : item
      ),
      syncQueueCount: Math.max(0, state.syncQueueCount - 1),
      failedSyncCount: Math.max(
        0,
        state.syncQueue.filter((item) => item.status === 'failed' && item.id !== itemId).length
      ),
    }));
  },

  holdOrder: (label) => {
    const state = get();
    if (state.items.length === 0) return;
    const heldOrder: HeldOrder = {
      id: generateHeldId(),
      label: label || state.customer?.name || state.destination?.label || state.tableName || 'Held order',
      itemCount: state.items.reduce((sum, item) => sum + item.quantity, 0),
      total: state.total,
      createdAt: new Date().toISOString(),
    };
    set({
      ...initialState,
      heldOrders: [heldOrder, ...state.heldOrders],
      syncQueue: state.syncQueue,
      printJobs: state.printJobs,
    });
  },

  resumeHeldOrder: (heldOrderId) => {
    const state = get();
    const held = state.heldOrders.find((order) => order.id === heldOrderId);
    if (!held) return;
    set({
      customer: { id: held.id, name: held.label, phone: '', loyaltyTier: 'Held' },
      orderNote: 'Resumed held order. Add items again to continue.',
      heldOrders: state.heldOrders.filter((order) => order.id !== heldOrderId),
      recoveryDraftSavedAt: held.createdAt,
    });
  },

  markLocalPending: () => {
    get().enqueueSync('Order change queued');
  },

  markSyncFailed: () => {
    get().enqueueSync('Sync failed, retry required', true);
  },

  markSynced: () => {
    const firstQueued = get().syncQueue.find((item) => item.status !== 'synced');
    if (firstQueued) {
      get().resolveSyncItem(firstQueued.id);
      return;
    }
    set({ syncQueueCount: 0, failedSyncCount: 0 });
  },

  saveRecoveryDraft: () => {
    const state = get();
    const savedAt = new Date().toISOString();
    set({
      recoveryDraftSavedAt: savedAt,
      recoveryDraft: {
        savedAt,
        itemCount: state.items.reduce((sum, item) => sum + item.quantity, 0),
        total: state.total,
        destinationLabel: state.destination?.label || state.tableName,
      },
    });
  },

  restoreRecoveryDraft: () => {
    const state = get();
    if (!state.recoveryDraft) return;
    set({ recoveryDraftSavedAt: state.recoveryDraft.savedAt });
  },

  clearRecoveryDraft: () => {
    set({ recoveryDraft: null, recoveryDraftSavedAt: null });
  },

  clearOrder: () => {
    const { heldOrders, printJobs, syncQueue } = get();
    set({
      ...initialState,
      heldOrders,
      printJobs,
      syncQueue,
      syncQueueCount: syncQueue.filter((item) => item.status === 'queued').length,
      failedSyncCount: syncQueue.filter((item) => item.status === 'failed').length,
    });
  },

  recalculate: () => {
    const state = get();
    set(calculateTotals(state));
  },
}));
