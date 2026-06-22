import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from './api'

// ─── Queries ───

export function useCategories(businessId?: string) {
  return useQuery({
    queryKey: ['categories', businessId],
    queryFn: () => api.getCategories(businessId),
  })
}

export function useMenuItems(businessId: string) {
  return useQuery({
    queryKey: ['menuItems', businessId],
    queryFn: () => api.getMenuItems(businessId),
    enabled: !!businessId,
  })
}

export function useStaff(businessId: string) {
  return useQuery({
    queryKey: ['staff', businessId],
    queryFn: () => api.getStaff(businessId),
    enabled: !!businessId,
  })
}

export function useOrders(businessId: string) {
  return useQuery({
    queryKey: ['orders', businessId],
    queryFn: () => api.getOrders(businessId),
    enabled: !!businessId,
    staleTime: 30_000,
  })
}

export function useTables(businessId: string) {
  return useQuery({
    queryKey: ['tables', businessId],
    queryFn: () => api.getTables(businessId),
    enabled: !!businessId,
    staleTime: 60_000,
  })
}

export function useFloors(businessId: string) {
  return useQuery({
    queryKey: ['floors', businessId],
    queryFn: () => api.getFloors(businessId),
    enabled: !!businessId,
    staleTime: 60_000,
  })
}

export function useAreas(businessId: string, floorId?: string) {
  return useQuery({
    queryKey: ['areas', businessId, floorId],
    queryFn: () => api.getAreas(businessId, floorId),
    enabled: !!businessId,
    staleTime: 60_000,
  })
}

export function useCreateFloor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.createFloor,
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ['floors', v.businessId] }),
  })
}

export function useUpdateFloor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name: string; businessId: string; sortOrder: number } }) =>
      api.updateFloor(id, data),
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ['floors', v.data.businessId] }),
  })
}

export function useDeleteFloor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, businessId }: { id: string; businessId: string }) =>
      api.deleteFloor(id).then(() => ({ businessId })),
    onSuccess: (v) => {
      qc.invalidateQueries({ queryKey: ['floors', v.businessId] })
      qc.invalidateQueries({ queryKey: ['areas', v.businessId] })
    },
  })
}

export function useCreateArea() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.createArea,
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ['areas', v.businessId] }),
  })
}

export function useUpdateArea() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name: string; floorId: string; businessId: string; sortOrder: number } }) =>
      api.updateArea(id, data),
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ['areas', v.data.businessId] }),
  })
}

export function useDeleteArea() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, businessId }: { id: string; businessId: string }) =>
      api.deleteArea(id).then(() => ({ businessId })),
    onSuccess: (v) => qc.invalidateQueries({ queryKey: ['areas', v.businessId] }),
  })
}

export function usePaymentMethods(businessId: string) {
  return useQuery({
    queryKey: ['paymentMethods', businessId],
    queryFn: () => api.getPaymentMethods(businessId),
    enabled: !!businessId,
  })
}

export function usePayments(businessId?: string | null) {
  return useQuery({
    queryKey: ['payments', businessId ?? 'all'],
    queryFn: () => api.getPayments(businessId ?? undefined),
    enabled: businessId !== undefined,
    staleTime: 30_000,
  })
}

export function useKitchenTickets(businessId: string) {
  return useQuery({
    queryKey: ['kitchenTickets', businessId],
    queryFn: () => api.getKitchenTickets(businessId),
    enabled: !!businessId,
  })
}

export function useBusiness(id: string) {
  return useQuery({
    queryKey: ['business', id],
    queryFn: () => api.getBusiness(id),
    enabled: !!id,
  })
}

export function useBusinesses() {
  return useQuery({
    queryKey: ['businesses'],
    queryFn: api.getBusinesses,
  })
}

export function useDailySummary(date?: string, businessId?: string | null) {
  return useQuery({
    queryKey: ['reports', 'daily-summary', date, businessId ?? 'all'],
    queryFn: () => api.getDailySummary(date, businessId ?? undefined),
  })
}

export function useSalesReport(period?: string, businessId?: string | null) {
  return useQuery({
    queryKey: ['reports', 'sales', period, businessId ?? 'all'],
    queryFn: () => api.getSalesReport(period, businessId ?? undefined),
  })
}

export function usePaymentMethodReport(businessId?: string | null) {
  return useQuery({
    queryKey: ['reports', 'payment-methods', businessId ?? 'all'],
    queryFn: () => api.getPaymentMethodReport(businessId ?? undefined),
  })
}

export function useTopItems(limit?: number, businessId?: string | null) {
  return useQuery({
    queryKey: ['reports', 'top-items', limit, businessId ?? 'all'],
    queryFn: () => api.getTopItems(limit, businessId ?? undefined),
  })
}

export function useStaffPerformance(businessId?: string | null) {
  return useQuery({
    queryKey: ['reports', 'staff-performance', businessId ?? 'all'],
    queryFn: () => api.getStaffPerformance(businessId ?? undefined),
  })
}

export function usePromotions(businessId: string) {
  return useQuery({
    queryKey: ['promotions', businessId],
    queryFn: () => api.getPromotions(businessId),
    enabled: !!businessId,
  })
}

export function useTaxConfigs(businessId: string) {
  return useQuery({
    queryKey: ['taxConfigs', businessId],
    queryFn: () => api.getTaxConfigs(businessId),
    enabled: !!businessId,
  })
}

export function useReceiptTemplate(businessId: string) {
  return useQuery({
    queryKey: ['receiptTemplate', businessId],
    queryFn: () => api.getReceiptTemplate(businessId),
    enabled: !!businessId,
  })
}

// ─── Mutations ───

export function useCreateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.createCategory,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }) },
  })
}

export function useUpdateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; name: string; description: string; businessId: string; sortOrder?: number; imageUrl?: string }) =>
      api.updateCategory(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }) },
  })
}

export function useDeleteCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.deleteCategory,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }) },
  })
}

export function useCreateMenuItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.createMenuItem,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['menuItems'] }) },
  })
}

export function useUpdateMenuItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; name: string; description: string; price: number; categoryId: string; businessId: string; imageUrl?: string }) =>
      api.updateMenuItem(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['menuItems'] }) },
  })
}

export function useDeleteMenuItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.deleteMenuItem,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['menuItems'] }) },
  })
}

export function useCreateStaff() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.createStaff,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['staff'] }) },
  })
}

export function useUpdateStaff() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; name: string; phone: string; role: string; businessId: string; active?: boolean }) =>
      api.updateStaff(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['staff'] }) },
  })
}

export function useDeleteStaff() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.deleteStaff,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['staff'] }) },
  })
}

export function useResetStaffPin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.resetStaffPin,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['staff'] }) },
  })
}

export function useToggleMenuItemAvailability() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, available }: { id: string; available: boolean }) =>
      api.toggleMenuItemAvailability(id, available),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['menuItems'] }) },
  })
}

export function useCreatePaymentMethod() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.createPaymentMethod,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['paymentMethods'] }) },
  })
}

export function useUpdatePaymentMethod() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; name: string; type: string; active: boolean; businessId: string }) =>
      api.updatePaymentMethod(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['paymentMethods'] }) },
  })
}

export function useDeletePaymentMethod() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.deletePaymentMethod,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['paymentMethods'] }) },
  })
}

export function useUpdateBusiness() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; name: string; type?: string; address?: string; phone?: string; email?: string; ppnEnabled?: boolean; ppnRate?: number; ppnMode?: string; showTaxLabel?: boolean }) =>
      api.updateBusiness(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['business'] }) },
  })
}

export function useCreateBusiness() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.createBusiness,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['businesses'] })
    },
  })
}

export function useCreatePromotion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.createPromotion,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['promotions'] }) },
  })
}

export function useUpdatePromotion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; [key: string]: any }) =>
      api.updatePromotion(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['promotions'] }) },
  })
}

export function useDeletePromotion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.deletePromotion,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['promotions'] }) },
  })
}

export function useCreateTaxConfig() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.createTaxConfig,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['taxConfigs'] }) },
  })
}

export function useUpdateTaxConfig() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; businessId: string; name: string; rate: number; inclusive: boolean; active: boolean; priority?: number }) =>
      api.updateTaxConfig(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['taxConfigs'] }) },
  })
}

export function useDeleteTaxConfig() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.deleteTaxConfig,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['taxConfigs'] }) },
  })
}

export function useUpdateReceiptTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.updateReceiptTemplate,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['receiptTemplate'] }) },
  })
}
