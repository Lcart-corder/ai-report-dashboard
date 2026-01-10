import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  QrCode,
  Plus,
  Download,
  BarChart3,
  Users,
  Eye,
  Calendar,
  Folder,
  MoreVertical,
  Copy,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

interface QRCodeAction {
  id: string;
  name: string;
  folder: string;
  targetAudience: "new" | "all";
  url: string;
  qrCode: string;
  urlReads: number;
  friendAdds: number;
  actionExecutions: number;
  validUntil: string | null;
  isActive: boolean;
  createdAt: string;
  lastEdited: string;
  actions: string[];
}

export default function QRCodeActionManager() {
  const [qrActions, setQrActions] = useState<QRCodeAction[]>([
    {
      id: "1",
      name: "店舗来店キャンペーン",
      folder: "キャンペーン",
      targetAudience: "all",
      url: "https://lme.jp/qr/store-campaign",
      qrCode: "/qr-sample.png",
      urlReads: 1234,
      friendAdds: 856,
      actionExecutions: 723,
      validUntil: "2026-03-31",
      isActive: true,
      createdAt: "2026-01-01",
      lastEdited: "2026-01-10",
      actions: ["メッセージ送信", "タグ付与"],
    },
    {
      id: "2",
      name: "SNS流入",
      folder: "SNS",
      targetAudience: "new",
      url: "https://lme.jp/qr/sns-inflow",
      qrCode: "/qr-sample.png",
      urlReads: 3421,
      friendAdds: 2156,
      actionExecutions: 2156,
      validUntil: null,
      isActive: true,
      createdAt: "2025-12-15",
      lastEdited: "2026-01-05",
      actions: ["あいさつメッセージ", "タグ付与"],
    },
  ]);

  const [filterTarget, setFilterTarget] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<QRCodeAction | null>(null);

  const [newAction, setNewAction] = useState({
    name: "",
    folder: "",
    targetAudience: "new" as "new" | "all",
    validUntil: "",
    actions: [] as string[],
  });

  const handleCreateAction = () => {
    const action: QRCodeAction = {
      id: Date.now().toString(),
      name: newAction.name,
      folder: newAction.folder,
      targetAudience: newAction.targetAudience,
      url: `https://lme.jp/qr/${Date.now()}`,
      qrCode: "/qr-sample.png",
      urlReads: 0,
      friendAdds: 0,
      actionExecutions: 0,
      validUntil: newAction.validUntil || null,
      isActive: true,
      createdAt: new Date().toISOString().split("T")[0],
      lastEdited: new Date().toISOString().split("T")[0],
      actions: newAction.actions,
    };

    setQrActions([...qrActions, action]);
    setIsCreateDialogOpen(false);
    setNewAction({
      name: "",
      folder: "",
      targetAudience: "new",
      validUntil: "",
      actions: [],
    });
    toast.success("QRコードアクションを作成しました");
  };

  const handleToggleActive = (id: string) => {
    setQrActions(
      qrActions.map((action) =>
        action.id === id ? { ...action, isActive: !action.isActive } : action
      )
    );
    toast.success("稼働状態を変更しました");
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("URLをコピーしました");
  };

  const handleDownloadQR = (name: string) => {
    toast.success(`${name}のQRコードをダウンロードしました`);
  };

  const handleExportCSV = (id: string) => {
    toast.success("CSVをダウンロードしました");
  };

  const handleDelete = (id: string) => {
    setQrActions(qrActions.filter((action) => action.id !== id));
    toast.success("QRコードアクションを削除しました（90日後に完全削除されます）");
  };

  const filteredActions = qrActions.filter((action) => {
    if (filterTarget !== "all" && action.targetAudience !== filterTarget) return false;
    if (searchQuery && !action.name.includes(searchQuery)) return false;
    return true;
  });

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">QRコードアクション</h1>
          <p className="text-gray-600">
            QRコードを発行して流入経路を分析し、自動アクションを実行できます
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg">
              <Plus className="w-4 h-4 mr-2" />
              新規作成
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>QRコードアクションの新規作成</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>管理名</Label>
                <Input
                  placeholder="例：店舗来店キャンペーン"
                  value={newAction.name}
                  onChange={(e) => setNewAction({ ...newAction, name: e.target.value })}
                />
              </div>
              <div>
                <Label>フォルダ</Label>
                <Select
                  value={newAction.folder}
                  onValueChange={(value) => setNewAction({ ...newAction, folder: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="フォルダを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="キャンペーン">キャンペーン</SelectItem>
                    <SelectItem value="SNS">SNS</SelectItem>
                    <SelectItem value="店舗">店舗</SelectItem>
                    <SelectItem value="その他">その他</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>稼働対象</Label>
                <Select
                  value={newAction.targetAudience}
                  onValueChange={(value: "new" | "all") =>
                    setNewAction({ ...newAction, targetAudience: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">新規友だちのみ</SelectItem>
                    <SelectItem value="all">全ての友だち</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500 mt-1">
                  {newAction.targetAudience === "new"
                    ? "初めて友だち追加するユーザーのみが対象です"
                    : "新規・既存・ブロック解除した全てのユーザーが対象です"}
                </p>
              </div>
              <div>
                <Label>有効期限（オプション）</Label>
                <Input
                  type="date"
                  value={newAction.validUntil}
                  onChange={(e) => setNewAction({ ...newAction, validUntil: e.target.value })}
                />
              </div>
              <div>
                <Label>アクション設定</Label>
                <div className="space-y-2 mt-2">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="action-message" />
                    <label htmlFor="action-message">メッセージ送信</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="action-tag" />
                    <label htmlFor="action-tag">タグ付与</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="action-richmenu" />
                    <label htmlFor="action-richmenu">リッチメニュー切り替え</label>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  キャンセル
                </Button>
                <Button onClick={handleCreateAction}>作成</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Select value={filterTarget} onValueChange={setFilterTarget}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全件表示</SelectItem>
                <SelectItem value="new">新規友だちのみ</SelectItem>
                <SelectItem value="all">全ての友だち</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="管理名で検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {filteredActions.map((action) => (
          <Card key={action.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold">{action.name}</h3>
                    <Badge variant={action.isActive ? "default" : "secondary"}>
                      {action.isActive ? "稼働中" : "停止中"}
                    </Badge>
                    <Badge variant="outline">{action.folder}</Badge>
                    <Badge variant="outline">
                      {action.targetAudience === "new" ? "新規友だちのみ" : "全ての友だち"}
                    </Badge>
                    {action.validUntil && (
                      <Badge variant="outline">
                        <Calendar className="w-3 h-3 mr-1" />
                        {action.validUntil}まで
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">URL読み込み</p>
                        <p className="text-xl font-semibold">{action.urlReads.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">友だち追加</p>
                        <p className="text-xl font-semibold">{action.friendAdds.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">アクション稼働</p>
                        <p className="text-xl font-semibold">
                          {action.actionExecutions.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {action.actions.map((actionType) => (
                      <Badge key={actionType} variant="secondary">
                        {actionType}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>作成日: {action.createdAt}</span>
                    <span>•</span>
                    <span>最終編集: {action.lastEdited}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadQR(action.name)}
                  >
                    <QrCode className="w-4 h-4 mr-1" />
                    QR表示
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedAction(action);
                      setIsDetailDialogOpen(true);
                    }}
                  >
                    <BarChart3 className="w-4 h-4 mr-1" />
                    データ詳細
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportCSV(action.id)}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    CSV
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyUrl(action.url)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Switch
                    checked={action.isActive}
                    onCheckedChange={() => handleToggleActive(action.id)}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(action.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* データ詳細ダイアログ */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>データ詳細 - {selectedAction?.name}</DialogTitle>
          </DialogHeader>
          {selectedAction && (
            <Tabs defaultValue="stats">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="stats">数値情報</TabsTrigger>
                <TabsTrigger value="friends">友だち一覧</TabsTrigger>
                <TabsTrigger value="details">分岐詳細</TabsTrigger>
              </TabsList>

              <TabsContent value="stats" className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-500">
                        URL読み込み
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">{selectedAction.urlReads.toLocaleString()}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-500">
                        友だち追加
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">{selectedAction.friendAdds.toLocaleString()}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-500">
                        アクション稼働
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">
                        {selectedAction.actionExecutions.toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>
                </div>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">グラフ表示エリア</p>
                </div>
              </TabsContent>

              <TabsContent value="friends" className="space-y-4">
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                          友だち追加日時
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                          LINE名
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                          タグ
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      <tr>
                        <td className="px-4 py-3 text-sm">2026-01-10 14:30</td>
                        <td className="px-4 py-3 text-sm">山田太郎</td>
                        <td className="px-4 py-3 text-sm">
                          <Badge variant="secondary">店舗来店</Badge>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm">2026-01-10 13:15</td>
                        <td className="px-4 py-3 text-sm">佐藤花子</td>
                        <td className="px-4 py-3 text-sm">
                          <Badge variant="secondary">店舗来店</Badge>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              <TabsContent value="details" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">実行されたアクション</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {selectedAction.actions.map((action, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded">
                          <span>{action}</span>
                          <Badge>{selectedAction.actionExecutions}回</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
