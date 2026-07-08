import { useEffect } from "react";
import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft } from "lucide-react";

/**
 * 修了証の印刷用ページ（FR-12）。
 * ブラウザの印刷ダイアログ →「PDFに保存」で日本語崩れなくPDF化できる。
 */
export default function LmsCertificate() {
  const params = useParams();
  const enrollmentId = Number(params.enrollmentId);
  const cert = trpc.lms.certificates.getByEnrollment.useQuery({ enrollmentId }, { enabled: !!enrollmentId });
  const recordDownload = trpc.lms.certificates.recordDownload.useMutation();

  useEffect(() => {
    if (cert.data) document.title = `修了証_${cert.data.certificateNumber}`;
  }, [cert.data]);

  function print() {
    if (cert.data) recordDownload.mutate({ id: cert.data.id, actor: "print" });
    window.print();
  }

  if (!cert.data) {
    return <div className="p-12 text-center text-slate-400">修了証が見つかりません。修了条件を満たすと発行できます。</div>;
  }
  const c = cert.data;

  return (
    <div className="min-h-screen bg-slate-100 py-8 dark:bg-slate-950">
      <style>{`@media print { .no-print { display: none !important; } body { background: white !important; } .cert-sheet { box-shadow: none !important; margin: 0 !important; } }`}</style>

      <div className="no-print mx-auto mb-4 flex max-w-3xl items-center justify-between px-4">
        <a href={`/lms/learn/enrollment/${enrollmentId}`} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"><ArrowLeft className="h-4 w-4" /> 戻る</a>
        <Button onClick={print}><Printer className="mr-1.5 h-4 w-4" /> 印刷 / PDF保存</Button>
      </div>

      {/* A4横向きイメージの証書 */}
      <div className="cert-sheet mx-auto max-w-3xl bg-white p-12 shadow-lg dark:bg-white">
        <div className="border-4 border-double border-emerald-700 p-10 text-center text-slate-900">
          <div className="text-sm tracking-[0.3em] text-emerald-700">CERTIFICATE OF COMPLETION</div>
          <h1 className="mt-4 text-3xl font-bold tracking-widest">修 了 証</h1>
          <div className="mt-2 text-xs text-slate-500">証明番号: {c.certificateNumber}</div>

          <div className="mt-10 text-2xl font-semibold">{c.learnerName} <span className="text-lg font-normal">殿</span></div>

          <p className="mx-auto mt-8 max-w-xl leading-8">
            あなたは下記のリスキリング研修コースを受講し、<br />
            所定の修了要件（動画視聴・確認チェック・確認テスト・学習レポート）を<br />
            すべて満たしたことをここに証明します。
          </p>

          <div className="mx-auto mt-8 max-w-md rounded-lg bg-slate-50 p-5 text-left text-sm">
            <div className="flex justify-between border-b py-1.5"><span className="text-slate-500">コース名</span><span className="font-medium">{c.courseName}</span></div>
            <div className="flex justify-between border-b py-1.5"><span className="text-slate-500">標準学習時間</span><span className="font-medium">{(c.standardMinutes / 60).toFixed(1)} 時間（{c.standardMinutes}分）</span></div>
            <div className="flex justify-between py-1.5"><span className="text-slate-500">修了日</span><span className="font-medium">{c.completionDate}</span></div>
          </div>

          <div className="mt-12 flex items-end justify-between">
            <div className="text-left text-xs text-slate-400">発行日: {c.completionDate}</div>
            <div className="text-right">
              <div className="text-sm font-medium">{c.issuer}</div>
              <div className="mt-1 border-t border-slate-300 pt-1 text-xs text-slate-400">発行者</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
