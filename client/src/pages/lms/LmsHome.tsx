import { lazy, Suspense, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { GraduationCap } from "lucide-react";

const AdminDashboard = lazy(() => import("./AdminDashboard"));
const CompanyRepHome = lazy(() => import("./CompanyRepHome"));
const PartnerHome = lazy(() => import("./PartnerHome"));

function Splash({ text }: { text: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="flex flex-col items-center gap-3 text-slate-400">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white"><GraduationCap className="h-6 w-6 animate-pulse" /></div>
        <span className="text-sm">{text}</span>
      </div>
    </div>
  );
}

/**
 * /lms の入口。ログイン中ロールに応じてホーム画面を出し分ける。
 *  - operator_admin / project_manager → 全体管理ダッシュボード
 *  - company_rep → 自社ダッシュボード
 *  - partner_admin → 協業先ダッシュボード
 *  - instructor → コース管理へ、 advisor → 社労士確認へ、 employee → 学習ポータルへ
 */
export default function LmsHome() {
  const [, navigate] = useLocation();
  const me = trpc.lms.me.useQuery();

  useEffect(() => {
    const id = me.data;
    if (!id) return;
    if (id.role === "instructor") navigate("/lms/courses");
    else if (id.role === "advisor") navigate("/lms/advisor");
    else if (id.role === "employee") navigate(id.learnerId ? `/lms/learn/${id.learnerId}` : "/lms/learn");
  }, [me.data, navigate]);

  if (me.isLoading) return <Splash text="読み込み中…" />;
  const id = me.data;
  if (!id) return <Splash text="アクセス権を確認しています…" />;

  if (id.role === "operator_admin" || id.role === "project_manager") {
    return <Suspense fallback={<Splash text="読み込み中…" />}><AdminDashboard /></Suspense>;
  }
  if (id.role === "company_rep") {
    if (id.companyId == null) return <Splash text="担当企業が未設定です。運営にお問い合わせください。" />;
    return <Suspense fallback={<Splash text="読み込み中…" />}><CompanyRepHome companyId={id.companyId} /></Suspense>;
  }
  if (id.role === "partner_admin") {
    if (id.partnerId == null) return <Splash text="担当協業先が未設定です。運営にお問い合わせください。" />;
    return <Suspense fallback={<Splash text="読み込み中…" />}><PartnerHome partnerId={id.partnerId} /></Suspense>;
  }
  return <Splash text="リダイレクトしています…" />;
}
