import type { KitchenTicketStatus } from '../../shared/constants/colors';

export interface KitchenTicketItemData {
  id: string;
  name: string;
  quantity: number;
  modifiers: string[];
  notes: string;
}

export interface KitchenTicketData {
  id: string;
  orderId: string;
  orderNumber: string;
  tableName: string;
  items: KitchenTicketItemData[];
  status: KitchenTicketStatus;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
}

export interface KitchenState {
  tickets: KitchenTicketData[];
}

export interface KitchenActions {
  advanceTicket: (ticketId: string) => void;
  getTicketsByStatus: (status: KitchenTicketStatus) => KitchenTicketData[];
  addTicket: (ticket: KitchenTicketData) => void;
  fetchTickets: (businessId?: string) => Promise<void>;
}
