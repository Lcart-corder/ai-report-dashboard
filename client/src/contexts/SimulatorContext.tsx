// 営業マン収益シミュレーターの共有状態
// - 入力条件（SimulationInput）
// - 案件パイプライン（Deal[]）
// - 収益履歴（RevenueRecord[]）
// をまとめて管理し、localStorage に永続化する。

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { calculate } from "@/lib/simulator/calc";
import { DEFAULT_INPUT } from "@/lib/simulator/constants";
import { loadState, saveState } from "@/lib/simulator/storage";
import type {
  Deal,
  RevenueRecord,
  SimulationInput,
  SimulationResult,
} from "@/lib/simulator/types";

/** モックアップ画面9のサンプル案件 */
const SAMPLE_DEALS: Deal[] = [
  {
    id: "d1",
    companyName: "株式会社サンプル",
    plan: "10man",
    monthlyAmount: 100000,
    status: "negotiating",
    date: "2025-05-20",
  },
  {
    id: "d2",
    companyName: "株式会社ABC",
    plan: "5man",
    monthlyAmount: 50000,
    status: "waiting",
    date: "2025-05-25",
  },
  {
    id: "d3",
    companyName: "株式会社XYZ",
    plan: "10man",
    monthlyAmount: 100000,
    status: "negotiating",
    date: "2025-05-28",
  },
  {
    id: "d4",
    companyName: "株式会社DEF",
    plan: "5man",
    monthlyAmount: 50000,
    status: "contracted",
    date: "2025-05-10",
  },
];

/** モックアップ画面10のサンプル履歴 */
const SAMPLE_HISTORY: RevenueRecord[] = [
  { month: "2025-05", amount: 256000, projected: true },
  { month: "2025-04", amount: 198000, projected: false },
  { month: "2025-03", amount: 173000, projected: false },
  { month: "2025-02", amount: 158000, projected: false },
  { month: "2025-01", amount: 152000, projected: false },
];

interface SimulatorContextValue {
  input: SimulationInput;
  result: SimulationResult;
  deals: Deal[];
  history: RevenueRecord[];
  updateInput: (patch: Partial<SimulationInput>) => void;
  resetInput: () => void;
  addDeal: (deal: Omit<Deal, "id">) => void;
  updateDeal: (id: string, patch: Partial<Deal>) => void;
  removeDeal: (id: string) => void;
}

const SimulatorContext = createContext<SimulatorContextValue | null>(null);

export function SimulatorProvider({ children }: { children: ReactNode }) {
  const [input, setInput] = useState<SimulationInput>(() =>
    loadState("input", DEFAULT_INPUT)
  );
  const [deals, setDeals] = useState<Deal[]>(() =>
    loadState("deals", SAMPLE_DEALS)
  );
  const [history] = useState<RevenueRecord[]>(() =>
    loadState("history", SAMPLE_HISTORY)
  );

  const persistInput = useCallback((next: SimulationInput) => {
    setInput(next);
    saveState("input", next);
  }, []);

  const persistDeals = useCallback((next: Deal[]) => {
    setDeals(next);
    saveState("deals", next);
  }, []);

  const updateInput = useCallback(
    (patch: Partial<SimulationInput>) => {
      persistInput({ ...input, ...patch });
    },
    [input, persistInput]
  );

  const resetInput = useCallback(() => {
    persistInput(DEFAULT_INPUT);
  }, [persistInput]);

  const addDeal = useCallback(
    (deal: Omit<Deal, "id">) => {
      const id = "d" + Math.floor(performance.now()).toString(36) + deals.length;
      persistDeals([{ ...deal, id }, ...deals]);
    },
    [deals, persistDeals]
  );

  const updateDeal = useCallback(
    (id: string, patch: Partial<Deal>) => {
      persistDeals(deals.map((d) => (d.id === id ? { ...d, ...patch } : d)));
    },
    [deals, persistDeals]
  );

  const removeDeal = useCallback(
    (id: string) => {
      persistDeals(deals.filter((d) => d.id !== id));
    },
    [deals, persistDeals]
  );

  const result = useMemo(() => calculate(input), [input]);

  const value = useMemo(
    () => ({
      input,
      result,
      deals,
      history,
      updateInput,
      resetInput,
      addDeal,
      updateDeal,
      removeDeal,
    }),
    [
      input,
      result,
      deals,
      history,
      updateInput,
      resetInput,
      addDeal,
      updateDeal,
      removeDeal,
    ]
  );

  return (
    <SimulatorContext.Provider value={value}>
      {children}
    </SimulatorContext.Provider>
  );
}

export function useSimulator(): SimulatorContextValue {
  const ctx = useContext(SimulatorContext);
  if (!ctx) {
    throw new Error("useSimulator は SimulatorProvider の内側で使用してください");
  }
  return ctx;
}
