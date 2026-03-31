"use client";

import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export function useTimeSlots(reportId: string) {
  return useQuery({
    queryKey: ["timeSlots", reportId],
    queryFn: () => api.getTimeSlots(reportId),
    enabled: !!reportId,
  });
}
