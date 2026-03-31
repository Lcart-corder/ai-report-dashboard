"use client";

import { api } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function usePendingApprovals(role: string) {
  return useQuery({
    queryKey: ["pendingApprovals", role],
    queryFn: () => api.getPendingApprovals(role),
    enabled: !!role,
  });
}

export function useDailySummary(reportId: string) {
  return useQuery({
    queryKey: ["dailySummary", reportId],
    queryFn: () => api.getDailySummary(reportId),
    enabled: !!reportId,
  });
}

export function useApproveReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      reportId,
      approverEmail,
      comment,
    }: {
      reportId: string;
      approverEmail: string;
      comment?: string;
    }) => api.approveReport(reportId, approverEmail, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pendingApprovals"] });
      queryClient.invalidateQueries({ queryKey: ["dailySummary"] });
      queryClient.invalidateQueries({ queryKey: ["report"] });
    },
  });
}

export function useRejectReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      reportId,
      approverEmail,
      comment,
    }: {
      reportId: string;
      approverEmail: string;
      comment: string;
    }) => api.rejectReport(reportId, approverEmail, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pendingApprovals"] });
      queryClient.invalidateQueries({ queryKey: ["dailySummary"] });
      queryClient.invalidateQueries({ queryKey: ["report"] });
    },
  });
}

export function useStopCodes() {
  return useQuery({
    queryKey: ["stopCodes"],
    queryFn: () => api.getStopCodes(),
    staleTime: 5 * 60 * 1000,
  });
}
