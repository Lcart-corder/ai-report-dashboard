"use client";

import { api } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useProductionInput(slotId: string) {
  return useQuery({
    queryKey: ["productionInput", slotId],
    queryFn: () => api.getProductionInput(slotId),
    enabled: !!slotId,
  });
}

export function useSaveProductionInput() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api.saveProductionInput(data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: ["productionInput"],
      });
      queryClient.invalidateQueries({
        queryKey: ["timeSlots"],
      });
      queryClient.invalidateQueries({
        queryKey: ["report"],
      });
      queryClient.invalidateQueries({
        queryKey: ["dailySummary"],
      });
      return result;
    },
  });
}

export function useDeleteProductionInput() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      slotId,
      reportId,
    }: {
      slotId: string;
      reportId: string;
    }) => api.deleteProductionInput(slotId, reportId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productionInput"] });
      queryClient.invalidateQueries({ queryKey: ["timeSlots"] });
      queryClient.invalidateQueries({ queryKey: ["report"] });
    },
  });
}
