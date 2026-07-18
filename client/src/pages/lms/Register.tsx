import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { GraduationCap, KeyRound, CheckCircle2, XCircle } from "lucide-react";

const REASON_MSG: Record<string, string> = {
  not_found: "マスターキーが見つかりません",
  inactive: "このキーは停止されています",
  expired: "有効期限切れです",
  max_uses_reached: "利用回数の上限に達しています",
  database_unavailable: "データベースに接続できません",
};

export default function LmsRegister() {
  const [, navigate] = useLocation();
  const me = trpc.lms.me.useQuery();

  const [keyCode, setKeyCode] = useState("");
  const [form, setForm] = useState({ name: "", employeeNumber: "", department: "" });

  // 既に受講者として登録済みなら学習ポータルへ
  useEffect(() => {
    if (me.data?.kind === "learner" && me.data.learnerId) {
      navigate(`/lms/learn/${me.data.learnerId}`);
    }
  }, [me.data, navigate]);

  const validate = trpc.lms.register.validateKey.useQuery(
    { keyCode },
    { enabled: keyCode.trim().length >= 6, retry: false },
  );

  const submit = trpc.lms.register.submit.useMutation({
    onSuccess: r => {
      toast.success(r.linked ? "登録が完了しました（招待とリンク）" : "登録が完了しました");
      navigate(`/lms/learn/${r.learnerId}`);
    },
    onError: e => toast.error(e.message),
  });

  const keyValid = validate.data?.valid === true;
  const keyReason = validate.data && !validate.data.valid ? (REASON_MSG[validate.data.reason ?? ""] ?? "無効なキーです") : null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white">
            <GraduationCap className="h-6 w-6" />
          </div>
          <CardTitle className="text-lg">リスキリング研修 初回登録</CardTitle>
          <p className="text-sm text-slate-500">会社から配布されたマスターキーを入力してください。</p>
          {me.data?.email && <p className="text-xs text-slate-400">ログイン中: {me.data.email}</p>}
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="flex items-center gap-1"><KeyRound className="h-4 w-4" /> マスターキー *</Label>
            <Input
              value={keyCode}
              onChange={e => setKeyCode(e.target.value.toUpperCase())}
              placeholder="XXXX-XXXX-XXXX"
              className="font-mono tracking-wider"
            />
            {keyCode.trim().length >= 6 && (
              <div className="mt-1 text-xs">
                {validate.isFetching ? <span className="text-slate-400">確認中…</span>
                  : keyValid ? <span className="flex items-center gap-1 text-emerald-600"><CheckCircle2 className="h-3.5 w-3.5" /> 有効なキーです</span> /* 有効=緑は意味色として維持 */
                  : <span className="flex items-center gap-1 text-rose-500"><XCircle className="h-3.5 w-3.5" /> {keyReason}</span>}
              </div>
            )}
          </div>

          <div>
            <Label>氏名</Label>
            <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder={me.data?.name || "山田 太郎"} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div><Label>社員番号</Label><Input value={form.employeeNumber} onChange={e => setForm({ ...form, employeeNumber: e.target.value })} /></div>
            <div><Label>部署</Label><Input value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} /></div>
          </div>

          <Button
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={!keyValid || submit.isPending}
            onClick={() => submit.mutate({ keyCode, name: form.name || undefined, employeeNumber: form.employeeNumber || undefined, department: form.department || undefined })}
          >
            {submit.isPending ? "登録中…" : "登録して受講を開始"}
          </Button>
          <p className="text-center text-xs text-slate-400">マスターキーが無いと登録できません。会社の担当者にご確認ください。</p>
        </CardContent>
      </Card>
    </div>
  );
}
