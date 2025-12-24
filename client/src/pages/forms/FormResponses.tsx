import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Download, 
  Filter, 
  FileText, 
  User, 
  Calendar as CalendarIcon,
  Eye
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock data for form responses
const MOCK_RESPONSES = [
  {
    id: "res_001",
    form_name: "初回アンケート",
    user_name: "山田 太郎",
    user_avatar: null,
    submitted_at: "2024-03-15 14:30",
    status: "completed",
    summary: "興味あり: 新商品, 予算: 10万円〜"
  },
  {
    id: "res_002",
    form_name: "来店予約フォーム",
    user_name: "鈴木 花子",
    user_avatar: null,
    submitted_at: "2024-03-15 13:15",
    status: "completed",
    summary: "希望日時: 3/20 14:00, 人数: 2名"
  },
  {
    id: "res_003",
    form_name: "初回アンケート",
    user_name: "佐藤 次郎",
    user_avatar: null,
    submitted_at: "2024-03-14 18:45",
    status: "partial",
    summary: "興味あり: セール情報, 予算: 未回答"
  },
  {
    id: "res_004",
    form_name: "お問い合わせ",
    user_name: "田中 美咲",
    user_avatar: null,
    submitted_at: "2024-03-14 10:20",
    status: "completed",
    summary: "件名: 返品について, 内容: サイズが合わなかったため..."
  },
  {
    id: "res_005",
    form_name: "キャンペーン応募",
    user_name: "高橋 健一",
    user_avatar: null,
    submitted_at: "2024-03-13 22:10",
    status: "completed",
    summary: "希望賞品: Aコース"
  }
];

export default function FormResponsesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedForm, setSelectedForm] = useState("all");

  const filteredResponses = MOCK_RESPONSES.filter(res => {
    const matchesSearch = 
      res.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesForm = selectedForm === "all" || res.form_name === selectedForm;
    return matchesSearch && matchesForm;
  });

  return (
    <div className="h-full flex flex-col">
      <div className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">回答一覧</h1>
            <p className="text-sm text-gray-500 mt-1">
              フォームに寄せられた回答を確認・管理します
            </p>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            CSVエクスポート
          </Button>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="名前や回答内容で検索..." 
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select value={selectedForm} onValueChange={setSelectedForm}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="フォームで絞り込み" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全てのフォーム</SelectItem>
              <SelectItem value="初回アンケート">初回アンケート</SelectItem>
              <SelectItem value="来店予約フォーム">来店予約フォーム</SelectItem>
              <SelectItem value="お問い合わせ">お問い合わせ</SelectItem>
              <SelectItem value="キャンペーン応募">キャンペーン応募</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="ghost" size="icon">
            <Filter className="w-4 h-4 text-gray-500" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>回答データ</CardTitle>
                <CardDescription>全 {filteredResponses.length} 件の回答が表示されています</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>回答日時</TableHead>
                  <TableHead>回答者</TableHead>
                  <TableHead>フォーム名</TableHead>
                  <TableHead>回答内容（要約）</TableHead>
                  <TableHead>ステータス</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResponses.map((res) => (
                  <TableRow key={res.id} className="cursor-pointer hover:bg-slate-50">
                    <TableCell className="whitespace-nowrap text-gray-500">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-3 h-3" />
                        {res.submitted_at}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                          <User className="w-3 h-3 text-gray-500" />
                        </div>
                        <span className="font-medium">{res.user_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-normal">
                        <FileText className="w-3 h-3 mr-1" />
                        {res.form_name}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate text-gray-600">
                      {res.summary}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={res.status === 'completed' ? 'default' : 'secondary'}
                        className={res.status === 'completed' ? 'bg-green-100 text-green-700 hover:bg-green-100' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100'}
                      >
                        {res.status === 'completed' ? '完了' : '途中'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
