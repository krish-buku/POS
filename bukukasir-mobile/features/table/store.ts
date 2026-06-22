import { create } from 'zustand';

interface TableStore {
  selectedTableId: string | null;
  selectTable: (id: string | null) => void;
  clearSelection: () => void;
}

export const useTableStore = create<TableStore>((set) => ({
  selectedTableId: null,
  selectTable: (id) => set({ selectedTableId: id }),
  clearSelection: () => set({ selectedTableId: null }),
}));
