// 営業マン収益シミュレーター 共通レイアウト
// モバイルファーストの縦長フレーム + 下部ナビゲーション

import { Link, Route, Switch, useLocation } from "wouter";
import { lazy, Suspense } from "react";
import {
  BarChart3,
  Calculator,
  FolderKanban,
  LayoutDashboard,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SimulatorProvider } from "@/contexts/SimulatorContext";

const Dashboard = lazy(() => import("./Dashboard"));
const InputBasic = lazy(() => import("./InputBasic"));
const InputContracts = lazy(() => import("./InputContracts"));
const InputReferral = lazy(() => import("./InputReferral"));
const Result = lazy(() => import("./Result"));
const Breakdown = lazy(() => import("./Breakdown"));
const GoalSimulation = lazy(() => import("./GoalSimulation"));
const RankCompare = lazy(() => import("./RankCompare"));
const Pipeline = lazy(() => import("./Pipeline"));
const History = lazy(() => import("./History"));
const SimSettings = lazy(() => import("./SimSettings"));

interface NavItem {
  label: string;
  icon: typeof LayoutDashboard;
  href: string;
  /** アクティブ判定に使う追加のパス接頭辞 */
  match: (path: string) => boolean;
}

const NAV: NavItem[] = [
  {
    label: "ダッシュボード",
    icon: LayoutDashboard,
    href: "/simulator",
    match: (p) => p === "/simulator" || p === "/simulator/",
  },
  {
    label: "シミュレーション",
    icon: Calculator,
    href: "/simulator/input/basic",
    match: (p) =>
      p.startsWith("/simulator/input") ||
      p.startsWith("/simulator/result") ||
      p.startsWith("/simulator/breakdown") ||
      p.startsWith("/simulator/goal") ||
      p.startsWith("/simulator/compare"),
  },
  {
    label: "案件管理",
    icon: FolderKanban,
    href: "/simulator/pipeline",
    match: (p) => p.startsWith("/simulator/pipeline"),
  },
  {
    label: "収益履歴",
    icon: BarChart3,
    href: "/simulator/history",
    match: (p) => p.startsWith("/simulator/history"),
  },
  {
    label: "設定",
    icon: Settings,
    href: "/simulator/settings",
    match: (p) => p.startsWith("/simulator/settings"),
  },
];

function BottomNav() {
  const [location] = useLocation();
  return (
    <nav className="sticky bottom-0 z-20 grid grid-cols-5 border-t border-slate-200 bg-white/95 backdrop-blur">
      {NAV.map((item) => {
        const active = item.match(location);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 py-2 text-[10px] font-medium transition-colors",
              active ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
            )}
          >
            <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 1.8} />
            <span className="leading-none">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function ScreenLoader() {
  return (
    <div className="flex h-full min-h-[300px] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
    </div>
  );
}

export default function SimulatorLayout() {
  return (
    <SimulatorProvider>
      <div className="flex min-h-screen justify-center bg-slate-100 p-0 sm:p-6">
        <div className="flex min-h-screen w-full max-w-md flex-col bg-slate-50 shadow-xl sm:min-h-0 sm:rounded-3xl sm:overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <Suspense fallback={<ScreenLoader />}>
              <Switch>
                <Route path="/simulator" component={Dashboard} />
                <Route path="/simulator/input/basic" component={InputBasic} />
                <Route
                  path="/simulator/input/contracts"
                  component={InputContracts}
                />
                <Route
                  path="/simulator/input/referral"
                  component={InputReferral}
                />
                <Route path="/simulator/result" component={Result} />
                <Route path="/simulator/breakdown" component={Breakdown} />
                <Route path="/simulator/goal" component={GoalSimulation} />
                <Route path="/simulator/compare" component={RankCompare} />
                <Route path="/simulator/pipeline" component={Pipeline} />
                <Route path="/simulator/history" component={History} />
                <Route path="/simulator/settings" component={SimSettings} />
                <Route component={Dashboard} />
              </Switch>
            </Suspense>
          </div>
          <BottomNav />
        </div>
      </div>
    </SimulatorProvider>
  );
}
