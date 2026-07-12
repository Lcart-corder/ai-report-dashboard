import { Card, PageTitle } from "@/components/ui";
import { IconSettings, IconUsers, IconShield, IconList } from "@/components/icons";
import ResetData from "@/components/ResetData";

const groups = [
  { icon: <IconUsers width={20} height={20} />, title: "ユーザー・権限管理", desc: "利用者の登録、役職、部会兼任、閲覧・編集・承認権限を管理します。" },
  { icon: <IconList width={20} height={20} />, title: "マスタ管理", desc: "部会、選択肢（ステータス・分類）、年度切替、アーカイブを管理します。" },
  { icon: <IconShield width={20} height={20} />, title: "操作履歴（監査ログ）", desc: "誰がいつ何を変更したかの記録を確認します。" },
  { icon: <IconSettings width={20} height={20} />, title: "個人設定", desc: "通知設定、表示設定を変更します。" },
];

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-[1100px] p-4 md:p-6">
      <PageTitle title="設定" subtitle="システムの設定・管理メニュー" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {groups.map((g) => (
          <Card key={g.title} className="flex items-start gap-3 p-5 transition hover:shadow-md">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              {g.icon}
            </div>
            <div>
              <h3 className="font-bold text-slate-800">{g.title}</h3>
              <p className="mt-1 text-sm text-slate-500">{g.desc}</p>
            </div>
          </Card>
        ))}
      </div>
      <Card className="mt-4 p-5">
        <h3 className="font-bold text-slate-800">データ管理（試作版）</h3>
        <p className="mt-1 text-sm text-slate-500">
          プロジェクト・タスク・会議の編集内容はブラウザに保存されます。初期状態に戻すには以下から初期化してください。
        </p>
        <div className="mt-3">
          <ResetData />
        </div>
      </Card>

      <p className="mt-6 text-center text-xs text-slate-400">
        ※ 本画面は試作版のプレースホルダーです。要件定義書 10章「権限管理」・11.5「保守性」に対応します。
      </p>
    </div>
  );
}
