import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import * as api from '../lib/api';

export const useTables = (businessId: string | undefined) =>
  useQuery({
    queryKey: ['tables', businessId],
    queryFn: () => api.getTables(businessId as string),
    refetchInterval: 10_000,
    refetchOnWindowFocus: true,
    placeholderData: keepPreviousData,
    enabled: !!businessId,
  });

export const useFloors = (businessId: string | undefined) =>
  useQuery({
    queryKey: ['floors', businessId],
    queryFn: () => api.getFloors(businessId as string),
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
    enabled: !!businessId,
  });

export const useAreas = (businessId: string | undefined) =>
  useQuery({
    queryKey: ['areas', businessId],
    queryFn: () => api.getAreas(businessId as string),
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
    enabled: !!businessId,
  });

export const useOrders = (businessId: string | undefined) =>
  useQuery({
    queryKey: ['orders', businessId],
    queryFn: () => api.getOrders(businessId as string),
    refetchInterval: 10_000,
    placeholderData: keepPreviousData,
    enabled: !!businessId,
  });

export const useOrder = (orderId: string | undefined) =>
  useQuery({
    queryKey: ['order', orderId],
    queryFn: () => api.getOrderById(orderId as string),
    enabled: !!orderId,
    staleTime: 30_000,
  });

export const useMenuItems = (businessId: string | undefined) =>
  useQuery({
    queryKey: ['menu-items', businessId],
    queryFn: () => api.getMenuItems(businessId as string),
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
    enabled: !!businessId,
  });

export const useCategories = (businessId: string | undefined) =>
  useQuery({
    queryKey: ['categories', businessId],
    queryFn: () => api.getCategories(businessId as string),
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
    enabled: !!businessId,
  });

export const useKitchenTickets = (
  businessId: string | undefined,
  options?: { refetchInterval?: number; enabled?: boolean }
) =>
  useQuery({
    queryKey: ['kitchen-tickets', businessId],
    queryFn: () => api.getKitchenTickets(businessId as string),
    refetchInterval: options?.refetchInterval ?? 10_000,
    placeholderData: keepPreviousData,
    enabled: (options?.enabled ?? true) && !!businessId,
  });

export const usePaymentMethods = (businessId: string | undefined) =>
  useQuery({
    queryKey: ['payment-methods', businessId],
    queryFn: () => api.getPaymentMethods(businessId as string),
    staleTime: 10 * 60 * 1000,
    enabled: !!businessId,
  });

export const useCustomers = (businessId: string | undefined, query = '') =>
  useQuery({
    queryKey: ['customers', businessId, query],
    queryFn: () => api.getCustomers(businessId as string, query),
    staleTime: 60_000,
    enabled: !!businessId,
  });

export const useCreateCustomer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createCustomer,
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['customers', vars.businessId] });
    },
  });
};

export const useOpenTabSessions = (businessId: string | undefined) =>
  useQuery({
    queryKey: ['open-tab-sessions', businessId],
    queryFn: () => api.getOpenTabSessions(businessId as string),
    refetchInterval: 10_000,
    enabled: !!businessId,
  });

export const useCreateOpenTabSession = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createOpenTabSession,
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['open-tab-sessions', vars.businessId] });
      qc.invalidateQueries({ queryKey: ['tables', vars.businessId] });
    },
  });
};

export const useSaveOnboardingSetup = () =>
  useMutation({
    mutationFn: api.saveOnboardingSetup,
  });

export const usePrintJobs = (businessId: string | undefined) =>
  useQuery({
    queryKey: ['print-jobs', businessId],
    queryFn: () => api.getPrintJobs(businessId as string),
    enabled: !!businessId,
  });

export const useCreatePrintJob = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createPrintJob,
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['print-jobs', vars.businessId] });
    },
  });
};

export const useSendBillRequest = () =>
  useMutation({
    mutationFn: api.sendBillRequest,
  });

export const useCreateWaiterTransfer = () =>
  useMutation({
    mutationFn: api.createWaiterTransfer,
  });

export const useAcceptWaiterTransfer = () =>
  useMutation({
    mutationFn: ({ transferId, accepted }: { transferId: string; accepted: boolean }) =>
      api.acceptWaiterTransfer(transferId, accepted),
  });

export const useRecordAuditEvent = () =>
  useMutation({
    mutationFn: api.recordAuditEvent,
  });

export const useCreateOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createOrder,
    networkMode: 'offlineFirst' as const,
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['tables', vars.businessId] });
      qc.invalidateQueries({ queryKey: ['orders', vars.businessId] });
      qc.invalidateQueries({ queryKey: ['kitchen-tickets', vars.businessId] });
    },
  });
};

export const useCreatePayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createPayment,
    networkMode: 'offlineFirst' as const,
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['tables', vars.businessId] });
      qc.invalidateQueries({ queryKey: ['orders', vars.businessId] });
      qc.invalidateQueries({ queryKey: ['order', vars.orderId] });
    },
  });
};

export const useTransferTable = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ fromTableId, toTableId, staffId }: any) =>
      api.transferTable({ fromTableId, toTableId, staffId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tables'] }),
  });
};

export const useMergeTables = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ tableIds, targetTableId }: { tableIds: string[]; targetTableId: string }) =>
      api.mergeTables({ tableIds, targetTableId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tables'] }),
  });
};

export const useVoidOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, reason }: { orderId: string; reason: string }) =>
      api.voidOrder(orderId, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tables'] });
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: ['kitchen-tickets'] });
    },
  });
};

export const useAssignTableStaff = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ tableId, staffId }: any) => api.assignTableStaff(tableId, staffId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tables'] }),
  });
};

export const useUpdateTableStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ tableId, status }: any) => api.updateTableStatus(tableId, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tables'] }),
  });
};

export const useAdvanceKitchenTicket = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ ticketId, nextStatus }: any) =>
      api.advanceKitchenTicket(ticketId, nextStatus),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['kitchen-tickets'] }),
  });
};
