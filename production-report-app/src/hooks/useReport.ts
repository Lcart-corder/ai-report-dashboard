"use client";

import { api } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useReport(reportId: string) {
  return useQuery({
    queryKey: ["report", reportId],
    queryFn: () => api.getReport(reportId),
    enabled: !!reportId,
  });
}

export function useReportsByDate(date: string) {
  return useQuery({
    queryKey: ["reportsByDate", date],
    queryFn: () => api.getReportsByDate(date),
    enabled: !!date,
  });
}

export function useMyReports(email: string) {
  return useQuery({
    queryKey: ["myReports", email],
    queryFn: () => api.getMyReports(email),
    enabled: !!email,
  });
}

export function useCreateReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      reportDate,
      machineNo,
      email,
    }: {
      reportDate: string;
      machineNo: string;
      email: string;
    }) => api.createReport(reportDate, machineNo, email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reportsByDate"] });
      queryClient.invalidateQueries({ queryKey: ["myReports"] });
    },
  });
}

export function useSubmitForApproval() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reportId: string) => api.submitForApproval(reportId),
    onSuccess: (_, reportId) => {
      queryClient.invalidateQueries({ queryKey: ["report", reportId] });
      queryClient.invalidateQueries({ queryKey: ["dailySummary", reportId] });
    },
  });
}
