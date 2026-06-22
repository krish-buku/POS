import { create } from 'zustand';
import type { KitchenState, KitchenActions, KitchenTicketData } from './types';
import type { KitchenTicketStatus } from '../../shared/constants/colors';
import { api } from '../../shared/lib/api';

interface KitchenStore extends KitchenState, KitchenActions {}

export const useKitchenStore = create<KitchenStore>((set, get) => ({
  // State
  tickets: [],

  // Actions
  fetchTickets: async (businessId?: string) => {
    try {
      if (!businessId) throw new Error('kitchen.fetchTickets requires businessId');
      const data = await api.getKitchenTickets(businessId);
      const tickets: KitchenTicketData[] = data.map((item: any) => ({
        id: item.id,
        orderId: item.orderId,
        orderNumber: item.orderNumber,
        tableName: item.tableName,
        items: item.items,
        status: item.status.toLowerCase() as KitchenTicketStatus,
        createdAt: item.createdAt,
        startedAt: item.startedAt || null,
        completedAt: item.completedAt || null,
      }));
      set({ tickets });
    } catch (e) {
      console.log('Failed to fetch kitchen tickets from API:', e);
    }
  },

  advanceTicket: (ticketId) => {
    const now = new Date().toISOString();
    set((state) => ({
      tickets: state.tickets.map((t) => {
        if (t.id !== ticketId) return t;

        const statusFlow: Record<KitchenTicketStatus, KitchenTicketStatus | null> = {
          new: 'preparing',
          preparing: 'ready',
          ready: null,
        };

        const nextStatus = statusFlow[t.status];
        if (!nextStatus) return t;

        return {
          ...t,
          status: nextStatus,
          startedAt: nextStatus === 'preparing' ? now : t.startedAt,
          completedAt: nextStatus === 'ready' ? now : t.completedAt,
        };
      }),
    }));
  },

  getTicketsByStatus: (status) => {
    return get().tickets.filter((t) => t.status === status);
  },

  addTicket: (ticket) => {
    set((state) => ({
      tickets: [ticket, ...state.tickets],
    }));
  },
}));
