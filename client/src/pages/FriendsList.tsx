import { PageTemplate } from "@/components/page-template"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  Filter, 
  Download, 
  MoreHorizontal, 
  User, 
  Tag, 
  MessageSquare,
  ShoppingBag
} from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export default function FriendsListPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFriends, setSelectedFriends] = useState<string[]>([])

  const friends = [
    { id: "U001", name: "田中 太郎", status: "active", tags: ["VIP", "1月購入"], lastActive: "5分前", orders: 12, ltv: "¥148,000" },
    { id: "U002", name: "佐藤 花子", status: "active", tags: ["新規", "クーポン利用"], lastActive: "1時間前", orders: 1, ltv: "¥5,800" },
    { id: "U003", name: "鈴木 一郎", status: "blocked", tags: [], lastActive: "3日前", orders: 3, ltv: "¥24,000" },
    { id: "U004", name: "高橋 美咲", status: "active", tags: ["カート落ち"], lastActive: "10分前", orders: 5, ltv: "¥42,000" },
    { id: "U005", name: "伊藤 健太", status: "active", tags: ["VIP", "誕生日月"], lastActive: "2時間前", orders: 15, ltv: "¥210,000" },
    { id: "U006", name: "渡辺 直人", status: "active", tags: ["メルマガ購読"], lastActive: "1日前", orders: 2, ltv: "¥12,000" },
    { id: "U007", name: "山本 優子", status: "active", tags: ["1月購入"], lastActive: "30分前", orders: 4, ltv: "¥36,500" },
    { id: "U008", name: "中村 敏夫", status: "active", tags: [], lastActive: "5時間前", orders: 0, ltv: "¥0" },
  ]

  const toggleSelect = (id: string) => {
    if (selectedFriends.includes(id)) {
      setSelectedFriends(selectedFriends.filter(fid => fid !== id))
    } else {
      setSelectedFriends([...selectedFriends, id])
    }
  }

  const toggleSelectAll = () => {
    if (selectedFriends.length === friends.length) {
      setSelectedFriends([])
    } else {
      setSelectedFriends(friends.map(f => f.id))
    }
  }

  return (
    <PageTemplate 
      title="友だちリスト" 
      description="LINE公式アカウントの友だち一覧を管理・分析できます。"
      breadcrumbs={[{ label: "友だち管理" }, { label: "友だちリスト" }]}
      actions={
        <div className="flex gap-2">
          <Button variant="outline" className="bg-white gap-2">
            <Download className="w-4 h-4" />
            CSV出力
          </Button>
          <Button className="bg-[#06C755] hover:bg-[#05b34c] text-white gap-2">
            <User className="w-4 h-4" />
            友だち追加
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50 p-4 rounded-lg border border-gray-100">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="名前、タグ、IDで検索..." 
              className="pl-9 bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" className="bg-white gap-2 flex-1 sm:flex-none">
              <Filter className="w-4 h-4" />
              絞り込み
            </Button>
            <Button variant="outline" className="bg-white gap-2 flex-1 sm:flex-none">
              <Tag className="w-4 h-4" />
              タグ一括操作
            </Button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedFriends.length > 0 && (
          <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg flex items-center justify-between animate-in fade-in slide-in-from-top-2">
            <span className="text-sm font-medium text-blue-700">
              {selectedFriends.length}人を選択中
            </span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="bg-white text-blue-700 border-blue-200 hover:bg-blue-50">
                タグ追加
              </Button>
              <Button size="sm" variant="outline" className="bg-white text-blue-700 border-blue-200 hover:bg-blue-50">
                シナリオ配信
              </Button>
              <Button size="sm" variant="outline" className="bg-white text-blue-700 border-blue-200 hover:bg-blue-50">
                一斉配信
              </Button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 w-10">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 text-[#06C755] focus:ring-[#06C755]"
                    checked={selectedFriends.length === friends.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="px-4 py-3 font-medium text-gray-500">ユーザー</th>
                <th className="px-4 py-3 font-medium text-gray-500">ステータス</th>
                <th className="px-4 py-3 font-medium text-gray-500">タグ</th>
                <th className="px-4 py-3 font-medium text-gray-500">最終アクティブ</th>
                <th className="px-4 py-3 font-medium text-gray-500 text-right">注文数</th>
                <th className="px-4 py-3 font-medium text-gray-500 text-right">LTV</th>
                <th className="px-4 py-3 font-medium text-gray-500 text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {friends.map((friend) => (
                <tr key={friend.id} className="hover:bg-gray-50 group transition-colors">
                  <td className="px-4 py-3">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-[#06C755] focus:ring-[#06C755]"
                      checked={selectedFriends.includes(friend.id)}
                      onChange={() => toggleSelect(friend.id)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                        {friend.name.slice(0, 1)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{friend.name}</div>
                        <div className="text-xs text-gray-400">ID: {friend.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "px-2 py-0.5 rounded text-xs font-medium",
                      friend.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    )}>
                      {friend.status === "active" ? "有効" : "ブロック"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {friend.tags.map(tag => (
                        <span key={tag} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs border border-gray-200">
                          {tag}
                        </span>
                      ))}
                      {friend.tags.length === 0 && <span className="text-gray-400 text-xs">-</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{friend.lastActive}</td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">{friend.orders}回</td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">{friend.ltv}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-[#06C755]" title="チャット">
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-blue-600" title="注文履歴">
                        <ShoppingBag className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-900">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="text-sm text-gray-500">
            全 2,124 件中 1 - 8 件を表示
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>前へ</Button>
            <Button variant="outline" size="sm">次へ</Button>
          </div>
        </div>
      </div>
    </PageTemplate>
  )
}
