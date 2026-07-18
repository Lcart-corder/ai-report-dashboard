import { useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { GraduationCap } from "lucide-react";

/**
 * 受講者ポータルの入口。ログイン中ユーザーのロールに応じて振り分ける。
 *  - 受講者(会社員) → 自分の学習ポータル /lms/learn/:learnerId
 *  - 未登録        → 初回登録 /lms/register
 *  - 管理系ロール   → 管理ダッシュボード /lms
 */
export default function LmsLearnEntry() {
  const [, navigate] = useLocation();
  const me = trpc.lms.me.useQuery();

  useEffect(() => {
    if (me.isLoading) return;
    const id = me.data;
    if (id?.kind === "learner" && id.learnerId) navigate(`/lms/learn/${id.learnerId}`);
    else if (id && id.role !== "employee") navigate("/lms");
    else navigate("/lms/register");
  }, [me.data, me.isLoading, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="flex flex-col items-center gap-3 text-slate-400">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white">
          <GraduationCap className="h-6 w-6 animate-pulse" />
        </div>
        <span className="text-sm">読み込み中…</span>
      </div>
    </div>
  );
}
