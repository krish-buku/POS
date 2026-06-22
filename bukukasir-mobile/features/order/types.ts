export interface OrderLineItem {
  id: string;
  menuItemId: string;
  menuItemName: string;
  quantity: number;
  unitPrice: number;
  modifiers: string[];
  notes: string;
  subtotal: number;
  syncState?: 'draft' | 'pending' | 'synced' | 'failed';
  course?: 'hold' | 'fire' | 'served';
  voided?: boolean;
  lineDiscount?: number;
}

export interface OrderFeeItem {
  id: string;
  name: string;
  amount: number;
}

export interface OrderCustomer {
  id: string;
  name: string;
  phone: string;
  loyaltyTier?: string;
  visits?: number;
}

export type OrderDestinationType = 'dine_in' | 'open_tab' | 'takeaway' | 'delivery';

export interface OrderDestination {
  type: OrderDestinationType;
  label: string;
  tableId?: string | null;
  tableName?: string;
  guestCount?: number;
  pickupName?: string;
  pickupTime?: string;
  courierName?: string;
  courierPhone?: string;
}

export interface OpenTabSession {
  id: string;
  tableId: string;
  tableName: string;
  customerName: string;
  guestCount: number;
  openedAt: string;
  total: number;
  status: 'open' | 'bill_requested' | 'paid';
}

export interface OrderAdjustment {
  id: string;
  scope: 'order' | 'line';
  lineItemId?: string;
  type: 'discount' | 'fee' | 'void' | 'note';
  label: string;
  amount: number;
  reason?: string;
}

export interface SplitPayment {
  id: string;
  method: 'cash' | 'qris' | 'edc' | 'ewallet';
  amount: number;
  reference?: string;
}

export interface PrintJob {
  id: string;
  type: 'receipt' | 'kitchen' | 'reprint';
  status: 'queued' | 'printed' | 'failed';
  printerName?: string;
  createdAt: string;
}

export interface SyncQueueItem {
  id: string;
  label: string;
  status: 'queued' | 'failed' | 'synced';
  createdAt: string;
}

export interface RecoveryDraft {
  savedAt: string;
  itemCount: number;
  total: number;
  destinationLabel?: string;
}

export interface HeldOrder {
  id: string;
  label: string;
  itemCount: number;
  total: number;
  createdAt: string;
}

export interface CurrentOrderState {
  tableId: string | null;
  tableName: string;
  orderType: 'dine_in' | 'takeaway' | 'delivery';
  customer: OrderCustomer | null;
  destination: OrderDestination | null;
  session: OpenTabSession | null;
  orderNote: string;
  items: OrderLineItem[];
  subtotal: number;
  discount: number;
  discountType: 'percentage' | 'fixed' | null;
  discountValue: number;
  discountReason: string;
  lineAdjustments: OrderAdjustment[];
  tax: number;
  taxRate: number;
  fees: OrderFeeItem[];
  total: number;
  paymentReference: string;
  splitPayments: SplitPayment[];
  printJobs: PrintJob[];
  syncQueue: SyncQueueItem[];
  recoveryDraft: RecoveryDraft | null;
  heldOrders: HeldOrder[];
  syncQueueCount: number;
  failedSyncCount: number;
  recoveryDraftSavedAt: string | null;
}

export interface CurrentOrderActions {
  setTable: (tableId: string | null, tableName: string) => void;
  setOrderType: (type: 'dine_in' | 'takeaway' | 'delivery') => void;
  setCustomer: (customer: OrderCustomer | null) => void;
  setDestination: (destination: OrderDestination | null) => void;
  openSession: (session: OpenTabSession) => void;
  closeSession: () => void;
  setOrderNote: (note: string) => void;
  addItem: (item: Omit<OrderLineItem, 'id' | 'subtotal'>) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateItemNote: (itemId: string, notes: string) => void;
  voidLineItem: (itemId: string, reason?: string) => void;
  applyDiscount: (type: 'percentage' | 'fixed', value: number) => void;
  setDiscountReason: (reason: string) => void;
  removeDiscount: () => void;
  addFee: (name: string, amount: number) => void;
  removeFee: (feeId: string) => void;
  addAdjustment: (adjustment: Omit<OrderAdjustment, 'id'>) => void;
  removeAdjustment: (adjustmentId: string) => void;
  setTaxRate: (rate: number) => void;
  setPaymentReference: (reference: string) => void;
  addSplitPayment: (payment: Omit<SplitPayment, 'id'>) => void;
  removeSplitPayment: (paymentId: string) => void;
  clearSplitPayments: () => void;
  addPrintJob: (job: Omit<PrintJob, 'id' | 'createdAt'>) => void;
  updatePrintJob: (jobId: string, status: PrintJob['status']) => void;
  enqueueSync: (label: string, failed?: boolean) => void;
  resolveSyncItem: (itemId: string) => void;
  holdOrder: (label?: string) => void;
  resumeHeldOrder: (heldOrderId: string) => void;
  markLocalPending: () => void;
  markSyncFailed: () => void;
  markSynced: () => void;
  saveRecoveryDraft: () => void;
  restoreRecoveryDraft: () => void;
  clearRecoveryDraft: () => void;
  clearOrder: () => void;
  recalculate: () => void;
}
