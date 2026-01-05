import React, { useState } from "react";
import { PageTemplate } from "@/components/page-template";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { 
  Sparkles, 
  FileText, 
  Calendar,
  Download,
  Eye,
  Trash2,
  Plus,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react";
import { toast } from "sonner";

// Types
interface AIReport {
  id: string;
  title: string;
  type: 'weekly' | 'monthly' | 'custom';
  status: 'completed' | 'generating' | 'failed';
  createdAt: string;
  summary: string;
  insights: number;
  recommendations: number;
}

export default function AIReportsPage() {
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<AIReport | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Form state
  const [reportTitle, setReportTitle] = useState("");
  const [reportType, setReportType] = useState<string>("weekly");
  const [reportFocus, setReportFocus] = useState("");

  // Mock data
  const reports: AIReport[] = [
    {
      id: "1",
      title: "2024年1月第1週 売上分析レポート",
      type: "weekly",
      status: "completed",
      createdAt: "2024-01-07 10:30",
      summary: "売上が前週比+15%増加。新規顧客獲得が好調で、特にInstagram広告経由のCVRが向上しています。",
      insights: 8,
      recommendations: 5
    },
    {
      id: "2",
      title: "12月度 総合パフォーマンスレポート",
      type: "monthly",
      status: "completed",
      createdAt: "2024-01-01 09:00",
      summary: "年末商戦で過去最高売上を記録。リピート率が目標を上回り、顧客ロイヤルティ向上施策が奏功しました。",
      insights: 12,
      recommendations: 7
    },
    {
      id: "3",
      title: "カート放棄率改善レポート",
      type: "custom",
      status: "completed",
      createdAt: "2023-12-28 14:20",
      summary: "カート放棄率が85%から78%に改善。送料無料施策とリマインダーメッセージが効果的でした。",
      insights: 6,
      recommendations: 4
    },
    {
      id: "4",
      title: "2024年1月第2週 売上分析レポート",
      type: "weekly",
      status: "generating",
      createdAt: "2024-01-14 11:00",
      summary: "",
      insights: 0,
      recommendations: 0
    }
  ];

  const handleGenerate = async () => {
    if (!reportTitle.trim()) {
      toast.error("レポートタイトルを入力してください");
      return;
    }

    setIsGenerating(true);
    try {
      // TODO: 実際のAI生成API呼び出しに置き換える
      await new Promise(resolve => setTimeout(resolve, 3000));
      toast.success("レポート生成を開始しました", {
        description: "完了まで数分かかる場合があります"
      });
      setIsGenerateDialogOpen(false);
      setReportTitle("");
      setReportFocus("");
    } catch (error) {
      toast.error("レポート生成に失敗しました");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleView = (report: AIReport) => {
    setSelectedReport(report);
    setIsViewDialogOpen(true);
  };

  const handleDelete = (reportId: string) => {
    toast.success("レポートを削除しました");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-700 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />完了</Badge>;
      case 'generating':
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200"><Clock className="w-3 h-3 mr-1" />生成中</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-700 border-red-200"><AlertCircle className="w-3 h-3 mr-1" />失敗</Badge>;
      default:
        return null;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'weekly': return '週次レポート';
      case 'monthly': return '月次レポート';
      case 'custom': return 'カスタムレポート';
      default: return type;
    }
  };

  return (
    <PageTemplate
      title="AI分析レポート"
      description="AIが自動生成したビジネス分析レポートを確認・管理します。"
      breadcrumbs={[{ label: "AI" }, { label: "分析レポート" }]}
      actions={
        <Button 
          onClick={() => setIsGenerateDialogOpen(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white gap-2"
        >
          <Plus className="w-4 h-4" />
          新規レポート生成
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Reports List */}
        <div className="grid grid-cols-1 gap-4">
          {reports.map(report => (
            <Card key={report.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{report.title}</h3>
                      {getStatusBadge(report.status)}
                      <Badge variant="outline">{getTypeLabel(report.type)}</Badge>
                    </div>
                    
                    {report.status === 'completed' && (
                      <>
                        <p className="text-gray-600 text-sm mb-3">{report.summary}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <TrendingUp className="w-4 h-4" />
                            {report.insights}件の洞察
                          </span>
                          <span className="flex items-center gap-1">
                            <Sparkles className="w-4 h-4" />
                            {report.recommendations}件の推奨アクション
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {report.createdAt}
                          </span>
                        </div>
                      </>
                    )}

                    {report.status === 'generating' && (
                      <div className="flex items-center gap-2 text-blue-600">
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm">AIがレポートを生成しています...</span>
                      </div>
                    )}
                  </div>

                  {report.status === 'completed' && (
                    <div className="flex gap-2 ml-4">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleView(report)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        表示
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        ダウンロード
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDelete(report.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {reports.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">レポートがありません</h3>
              <p className="text-gray-500 text-center max-w-md mb-6">
                AIが自動でビジネス分析レポートを生成します。
                まずは新規レポートを作成してみましょう。
              </p>
              <Button 
                onClick={() => setIsGenerateDialogOpen(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white gap-2"
              >
                <Plus className="w-4 h-4" />
                新規レポート生成
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Generate Dialog */}
      <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              新規レポート生成
            </DialogTitle>
            <DialogDescription>
              AIが指定した条件でビジネス分析レポートを自動生成します。
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="title">レポートタイトル</Label>
              <Input
                id="title"
                placeholder="例: 2024年1月第3週 売上分析レポート"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="type">レポートタイプ</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">週次レポート</SelectItem>
                  <SelectItem value="monthly">月次レポート</SelectItem>
                  <SelectItem value="custom">カスタムレポート</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="focus">分析の焦点（任意）</Label>
              <Textarea
                id="focus"
                placeholder="例: カート放棄率の改善、新規顧客獲得施策の効果測定"
                value={reportFocus}
                onChange={(e) => setReportFocus(e.target.value)}
                rows={3}
              />
              <p className="text-xs text-gray-500 mt-1">
                特定のテーマに焦点を当てたい場合は入力してください。
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsGenerateDialogOpen(false)}
              disabled={isGenerating}
            >
              キャンセル
            </Button>
            <Button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className="bg-purple-600 hover:bg-purple-700 text-white gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  レポート生成
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedReport?.title}</DialogTitle>
            <DialogDescription>
              {selectedReport?.createdAt} に生成
            </DialogDescription>
          </DialogHeader>

          {selectedReport && (
            <div className="space-y-6 py-4">
              <div>
                <h4 className="font-semibold mb-2">サマリー</h4>
                <p className="text-gray-600">{selectedReport.summary}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-3">主要な洞察</h4>
                <div className="space-y-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="border rounded-lg p-3 bg-blue-50 border-blue-200">
                      <p className="text-sm text-gray-700">
                        洞察 {i}: サンプルの洞察テキストがここに表示されます。実際のデータに基づいた分析結果が表示されます。
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">推奨アクション</h4>
                <div className="space-y-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="border rounded-lg p-3 bg-purple-50 border-purple-200">
                      <p className="text-sm text-gray-700 mb-2">
                        アクション {i}: サンプルの推奨アクションがここに表示されます。
                      </p>
                      <Button size="sm" variant="outline">実行する</Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              閉じる
            </Button>
            <Button className="gap-2">
              <Download className="w-4 h-4" />
              PDFダウンロード
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTemplate>
  );
}
