import { PageTemplate } from "@/components/page-template"
import { Button } from "@/components/ui/button"
import { Construction } from "lucide-react"
import { useLocation } from "wouter"

export default function PlaceholderPage() {
  const [location] = useLocation()
  
  // URLからタイトルを生成する簡易ロジック
  const getPageInfo = (path: string) => {
    const segments = path.split('/').filter(Boolean)
    const lastSegment = segments[segments.length - 1]
    
    const titleMap: Record<string, string> = {
      "friends": "友だち管理",
      "list": "友だちリスト",
      "tags": "タグ管理",
      "blocked": "ブロックリスト",
      "messages": "メッセージ",
      "broadcast": "一斉配信",
      "step": "ステップ配信",
      "auto-reply": "自動応答",
      "templates": "テンプレート",
      "events": "予約・イベント",
      "calendar": "予約カレンダー",
      "participants": "参加者管理",
      "forms": "フォーム",
      "responses": "回答一覧",
      "create": "作成",
      "analysis": "分析",
      "ai": "AI機能",
      "history": "生成履歴",
      "settings": "設定",
      "integrations": "連携設定",
      "shopify": "Shopify連携",
      "line": "LINE公式アカウント連携",
      "admin": "管理",
      "account": "アカウント設定",
      "members": "メンバー管理",
      "billing": "プラン・支払い"
    }

    return {
      title: titleMap[lastSegment] || "ページ",
      breadcrumbs: segments.map(s => ({ label: titleMap[s] || s }))
    }
  }

  const { title, breadcrumbs } = getPageInfo(location)

  return (
    <PageTemplate 
      title={title} 
      description={`${title}の管理・設定を行います。`}
      breadcrumbs={breadcrumbs}
      actions={
        <Button className="bg-[#06C755] hover:bg-[#05b34c] text-white">
          新規作成
        </Button>
      }
    >
      <div className="flex flex-col items-center justify-center h-[400px] text-center space-y-4">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
          <Construction className="w-8 h-8 text-gray-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">準備中</h3>
          <p className="text-gray-500 mt-1 max-w-md">
            この機能は現在開発中です。順次公開予定ですので、もうしばらくお待ちください。
          </p>
        </div>
        <Button variant="outline" onClick={() => window.history.back()}>
          前のページに戻る
        </Button>
      </div>
    </PageTemplate>
  )
}
