import type { TableStatus } from '../../shared/constants/colors';

export interface TableData {
  id: string;
  businessId: string;
  number: number;
  name: string;
  capacity: number;
  status: TableStatus;
  currentOrderId: string | null;
  assignedStaffId: string | null;
  runningTotal: number;
}

export interface TableState {
  tables: TableData[];
  selectedTableId: string | null;
}

export interface TableActions {
  selectTable: (tableId: string | null) => void;
  updateStatus: (tableId: string, status: TableStatus) => void;
  setRunningTotal: (tableId: string, total: number) => void;
  assignStaff: (tableId: string, staffId: string) => void;
  transferTable: (tableId: string, fromStaffId: string, toStaffId: string) => void;
  setOrder: (tableId: string, orderId: string | null) => void;
  getSelectedTable: () => TableData | null;
  getTablesByStaff: (staffId: string) => TableData[];
  getOpenTables: () => TableData[];
  fetchTables: (businessId?: string) => Promise<void>;
}
