"use client";

import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/components/providers/ToastProvider";
import { dashboardService } from "@/services/dashboard.service";
import { DashboardAnalytics } from "@/types";

export function useDashboardAnalytics() {
  const { toast } = useToast();
  const [data, setData] = useState<DashboardAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      setData(await dashboardService.overview());
    } catch {
      toast({ title: "Dashboard failed to load", description: "Please try again.", variant: "error" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, isLoading, refresh: load };
}
