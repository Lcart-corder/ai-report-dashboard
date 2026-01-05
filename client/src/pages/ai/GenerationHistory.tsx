import React, { useState } from "react";
import { PageTemplate } from "@/components/page-template";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  History,
  FileText,
  MessageSquare,
  Sparkles,
  TrendingUp,
  Search,
  Filter,
  Calendar,
  User,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";

// Types
interface GenerationLog {
  id: string;
  type: 'text' | 'report' | 'analysis' | 'recommendation';
  feature: string;
  prompt: string;
  result: string;
  status: 'success' | 'failed' | 'partial';
  tokens: number;
  duration: number; // in seconds
  createdAt: string;
  createdBy: string;
}

export default function GenerationHistoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Mock data
  const logs: GenerationLog[] = [
    {
      id: "1",
      type: "text",
      feature: "一斉配信 - AI文章生成",
      prompt: "新春セールのお知らせメッセージを作成してください",
      result: "【新春セール開催中🎍】\n\n明けましておめでとうございます！\n本日より新春セールを開催いたします。\n\n対象商品が最大50%OFF！\nこの機会をお見逃しなく✨",
      status: "success",
      tokens: 245,
      duration: 3.2,
      createdAt: "2024-01-15 14:30:22",
      createdBy: "山田太郎"
    },
    {
      id: "2",
      type: "report",
      feature: "AI分析レポート",
      prompt: "2024年1月第2週の売上分析レポートを生成",
      result: "売上が前週比+18%増加。新規顧客獲得が好調で、Instagram広告経由のCVRが2.1%から2.8%に向上...",
      status: "success",
      tokens: 1842,
      duration: 12.5,
      createdAt: "2024-01-14 11:00:15",
      createdBy: "山田太郎"
    },
    {
      id: "3",
      type: "analysis",
      feature: "AI分析・改善提案",
      prompt: "EC KPIの分析と改善提案を実行",
      result: "CVR改善の余地あり。カート放棄率が85%と高く、送料無料ラインの引き下げを推奨...",
      status: "success",
      tokens: 2156,
      duration: 15.8,
      createdAt: "2024-01-13 16:45:30",
      createdBy: "佐藤花子"
    },
    {
      id: "4",
      type: "text",
      feature: "一斉配信 - AI文章生成",
      prompt: "商品レビュー依頼メッセージを作成",
      result: "ご購入ありがとうございます！\n\n商品はいかがでしたか？\nぜひレビューをお聞かせください🙏",
      status: "success",
      tokens: 198,
      duration: 2.8,
      createdAt: "2024-01-12 10:20:05",
      createdBy: "山田太郎"
    },
    {
      id: "5",
      type: "recommendation",
      feature: "AI分析・改善提案",
      prompt: "リピート率向上のための施策提案",
      result: "購入後30日目のフォローアップメッセージ、ポイントプログラムの導入、定期購入プランの提案...",
      status: "success",
      tokens: 1523,
      duration: 9.3,
      createdAt: "2024-01-11 09:15:40",
      createdBy: "佐藤花子"
    },
    {
      id: "6",
      type: "text",
      feature: "一斉配信 - AI文章生成",
      prompt: "在庫復活のお知らせメッセージ",
      result: "",
      status: "failed",
      tokens: 0,
      duration: 0,
      createdAt: "2024-01-10 15:30:12",
      createdBy: "山田太郎"
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'text': return <MessageSquare className="w-4 h-4" />;
      case 'report': return <FileText className="w-4 h-4" />;
      case 'analysis': return <TrendingUp className="w-4 h-4" />;
      case 'recommendation': return <Sparkles className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'text': return '文章生成';
      case 'report': return 'レポート生成';
      case 'analysis': return '分析実行';
      case 'recommendation': return '推奨提案';
      default: return type;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-700 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />成功</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-700 border-red-200"><XCircle className="w-3 h-3 mr-1" />失敗</Badge>;
      case 'partial':
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200"><AlertCircle className="w-3 h-3 mr-1" />部分成功</Badge>;
      default:
        return null;
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = searchQuery === "" || 
      log.feature.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.prompt.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === "all" || log.type === filterType;
    const matchesStatus = filterStatus === "all" || log.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const totalTokens = logs.reduce((sum, log) => sum + log.tokens, 0);
  const successRate = (logs.filter(log => log.status === 'success').length / logs.length * 100).toFixed(1);

  return (
    <PageTemplate
      title="AI生成履歴"
      description="AI機能の利用履歴とログを確認します。"
      breadcrumbs={[{ label: "AI" }, { label: "生成履歴" }]}
    >
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-500 mb-1">総実行回数</div>
              <div className="text-2xl font-bold">{logs.length}回</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-500 mb-1">成功率</div>
              <div className="text-2xl font-bold text-green-600">{successRate}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-500 mb-1">総トークン数</div>
              <div className="text-2xl font-bold">{totalTokens.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-500 mb-1">平均処理時間</div>
              <div className="text-2xl font-bold">
                {(logs.reduce((sum, log) => sum + log.duration, 0) / logs.length).toFixed(1)}秒
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="機能名やプロンプトで検索..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue placeholder="タイプで絞り込み" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">すべてのタイプ</SelectItem>
                    <SelectItem value="text">文章生成</SelectItem>
                    <SelectItem value="report">レポート生成</SelectItem>
                    <SelectItem value="analysis">分析実行</SelectItem>
                    <SelectItem value="recommendation">推奨提案</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full md:w-48">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="ステータスで絞り込み" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">すべてのステータス</SelectItem>
                    <SelectItem value="success">成功</SelectItem>
                    <SelectItem value="failed">失敗</SelectItem>
                    <SelectItem value="partial">部分成功</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logs List */}
        <div className="space-y-3">
          {filteredLogs.map(log => (
            <Card key={log.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
                      {getTypeIcon(log.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{log.feature}</span>
                        <Badge variant="outline">{getTypeLabel(log.type)}</Badge>
                        {getStatusBadge(log.status)}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {log.createdAt}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {log.createdBy}
                        </span>
                        {log.status === 'success' && (
                          <>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {log.duration}秒
                            </span>
                            <span>{log.tokens.toLocaleString()} tokens</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <div className="text-xs font-medium text-gray-500 mb-1">プロンプト:</div>
                    <div className="text-sm text-gray-700 bg-gray-50 rounded p-2">
                      {log.prompt}
                    </div>
                  </div>

                  {log.status === 'success' && log.result && (
                    <div>
                      <div className="text-xs font-medium text-gray-500 mb-1">生成結果:</div>
                      <div className="text-sm text-gray-700 bg-blue-50 rounded p-2 border border-blue-200">
                        {log.result.length > 200 ? `${log.result.substring(0, 200)}...` : log.result}
                      </div>
                    </div>
                  )}

                  {log.status === 'failed' && (
                    <div className="text-sm text-red-600 bg-red-50 rounded p-2 border border-red-200">
                      生成に失敗しました。APIエラーまたはタイムアウトの可能性があります。
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredLogs.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <History className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">履歴がありません</h3>
              <p className="text-gray-500 text-center max-w-md">
                {searchQuery || filterType !== "all" || filterStatus !== "all"
                  ? "検索条件に一致する履歴が見つかりませんでした。"
                  : "AI機能を使用すると、ここに履歴が表示されます。"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </PageTemplate>
  );
}
