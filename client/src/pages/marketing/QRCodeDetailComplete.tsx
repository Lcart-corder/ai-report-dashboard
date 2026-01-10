import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Save,
  Eye,
  QrCode,
  Download,
  Plus,
  Trash2,
  Copy,
  ExternalLink,
  Settings,
  Tag,
  MessageSquare,
  Menu,
  Users,
  Gift,
  Trophy,
  Link,
  Code,
  Upload,
  Image,
  Palette,
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle,
  Info,
} from "lucide-react";
import { toast } from "sonner";

// エルメアクションの種類
const ACTION_TYPES = [
  { id: "tag_add", name: "タグ追加", icon: Tag, color: "bg-blue-100 text-blue-700" },
  { id: "tag_remove", name: "タグ削除", icon: Tag, color: "bg-red-100 text-red-700" },
  { id: "template", name: "テンプレート送信", icon: MessageSquare, color: "bg-green-100 text-green-700" },
  { id: "rich_menu", name: "リッチメニュー変更", icon: Menu, color: "bg-purple-100 text-purple-700" },
  { id: "friend_info", name: "友だち情報更新", icon: Users, color: "bg-orange-100 text-orange-700" },
  { id: "step", name: "ステップ配信開始", icon: Clock, color: "bg-cyan-100 text-cyan-700" },
  { id: "reminder", name: "リマインダー設定", icon: Calendar, color: "bg-yellow-100 text-yellow-700" },
];

// QRコードフレームの種類
const QR_FRAMES = [
  { id: "none", name: "フレームなし" },
  { id: "simple", name: "シンプル枠" },
  { id: "rounded", name: "角丸枠" },
  { id: "scan_me", name: "SCAN ME" },
  { id: "line_add", name: "LINE友だち追加" },
  { id: "custom", name: "カスタム" },
];

// グラデーションプリセット
const GRADIENT_PRESETS = [
  { id: "none", name: "単色", colors: ["#000000"] },
  { id: "blue_purple", name: "ブルー→パープル", colors: ["#3B82F6", "#8B5CF6"] },
  { id: "green_teal", name: "グリーン→ティール", colors: ["#10B981", "#14B8A6"] },
  { id: "orange_red", name: "オレンジ→レッド", colors: ["#F97316", "#EF4444"] },
  { id: "pink_purple", name: "ピンク→パープル", colors: ["#EC4899", "#8B5CF6"] },
  { id: "custom", name: "カスタム", colors: ["#000000", "#000000"] },
];

interface ActionItem {
  id: string;
  type: string;
  config: Record<string, string>;
}

interface ReferralReward {
  id: string;
  count: number;
  message: string;
  actions: ActionItem[];
}

export default function QRCodeDetailComplete() {
  const { id } = useParams();
  const navigate = useNavigate();

  // 基本設定
  const [qrName, setQrName] = useState("新規QRコード");
  const [actionFrequency, setActionFrequency] = useState("unlimited");
  const [targetAudience, setTargetAudience] = useState("all");
  const [message, setMessage] = useState("");
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [useGreeting, setUseGreeting] = useState({
    newFriend: false,
    existingFriend: false,
    unblocked: false,
  });
  const [consecutiveLimit, setConsecutiveLimit] = useState("none");
  const [limitHours, setLimitHours] = useState("24");

  // 稼働設定
  const [isActive, setIsActive] = useState(true);
  const [offlineAction, setOfflineAction] = useState("text");
  const [offlineMessage, setOfflineMessage] = useState("現在このQRコードは利用できません。");
  const [offlineUrl, setOfflineUrl] = useState("");
  const [useSchedule, setUseSchedule] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [hasEndDate, setHasEndDate] = useState(false);
  const [weekdaySchedule, setWeekdaySchedule] = useState({
    mon: true, tue: true, wed: true, thu: true, fri: true, sat: true, sun: true,
  });
  const [timeSchedule, setTimeSchedule] = useState({ start: "09:00", end: "21:00" });
  const [useTimeSchedule, setUseTimeSchedule] = useState(false);

  // 紹介時アクション
  const [referralEnabled, setReferralEnabled] = useState(false);
  const [referrerPageTitle, setReferrerPageTitle] = useState("友だちを紹介してください！");
  const [referrerPageDescription, setReferrerPageDescription] = useState("");
  const [referrerMessage, setReferrerMessage] = useState("");
  const [referrerRewardMessage, setReferrerRewardMessage] = useState("");
  const [refereeMessage, setRefereeMessage] = useState("");
  const [referralRewards, setReferralRewards] = useState<ReferralReward[]>([
    { id: "1", count: 1, message: "1人紹介ありがとうございます！", actions: [] },
    { id: "2", count: 5, message: "5人紹介達成！特典をプレゼント！", actions: [] },
    { id: "3", count: 10, message: "10人紹介達成！VIP特典をプレゼント！", actions: [] },
  ]);
  const [showRanking, setShowRanking] = useState(false);
  const [rankingPeriod, setRankingPeriod] = useState("monthly");

  // オプション設定
  const [showLogo, setShowLogo] = useState(true);
  const [customLogo, setCustomLogo] = useState("");
  const [logoPosition, setLogoPosition] = useState("center");
  const [qrColor, setQrColor] = useState("#000000");
  const [qrBgColor, setQrBgColor] = useState("#FFFFFF");
  const [useGradient, setUseGradient] = useState(false);
  const [gradientPreset, setGradientPreset] = useState("none");
  const [gradientColors, setGradientColors] = useState(["#000000", "#000000"]);
  const [gradientDirection, setGradientDirection] = useState("to-right");
  const [qrFrame, setQrFrame] = useState("none");
  const [frameText, setFrameText] = useState("友だち追加");
  const [qrSize, setQrSize] = useState("256");
  const [errorCorrection, setErrorCorrection] = useState("M");
  const [browserDesign, setBrowserDesign] = useState("default");
  const [browserText, setBrowserText] = useState("");
  const [browserImage, setBrowserImage] = useState("");
  const [browserBgColor, setBrowserBgColor] = useState("#FFFFFF");

  // 外部連携
  const [htmlTag, setHtmlTag] = useState("");
  const [lpEnabled, setLpEnabled] = useState(false);
  const [lpParams, setLpParams] = useState<{ key: string; value: string }[]>([]);
  const [importEnabled, setImportEnabled] = useState(false);
  const [importFields, setImportFields] = useState<{ param: string; field: string }[]>([]);
  const [exportEnabled, setExportEnabled] = useState(false);
  const [exportUrl, setExportUrl] = useState("");
  const [exportFields, setExportFields] = useState<string[]>([]);

  // ダイアログ
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [selectedActionType, setSelectedActionType] = useState("");
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showLpDialog, setShowLpDialog] = useState(false);

  // QRコードURL
  const qrUrl = `https://line.me/R/ti/p/@example?qr=${id}`;

  const handleSave = () => {
    toast.success("設定を保存しました");
  };

  const handlePreview = () => {
    toast.info("プレビューを表示します");
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(qrUrl);
    toast.success("URLをコピーしました");
  };

  const handleDownloadQR = () => {
    toast.success("QRコードをダウンロードしました");
  };

  const addAction = (type: string) => {
    const newAction: ActionItem = {
      id: Date.now().toString(),
      type,
      config: {},
    };
    setActions([...actions, newAction]);
    setShowActionDialog(false);
    toast.success("アクションを追加しました");
  };

  const removeAction = (actionId: string) => {
    setActions(actions.filter((a) => a.id !== actionId));
  };

  const addLpParam = () => {
    setLpParams([...lpParams, { key: "", value: "" }]);
  };

  const removeLpParam = (index: number) => {
    setLpParams(lpParams.filter((_, i) => i !== index));
  };

  const addImportField = () => {
    setImportFields([...importFields, { param: "", field: "" }]);
  };

  const removeImportField = (index: number) => {
    setImportFields(importFields.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto p-6">
        {/* ヘッダー */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/marketing/qr-code")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">QRコードアクション詳細設定</h1>
                <Badge variant={isActive ? "default" : "secondary"}>
                  {isActive ? "稼働中" : "停止中"}
                </Badge>
              </div>
              <p className="text-sm text-gray-500">ID: {id}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCopyUrl}>
              <Copy className="w-4 h-4 mr-2" />
              URLをコピー
            </Button>
            <Button variant="outline" onClick={handlePreview}>
              <Eye className="w-4 h-4 mr-2" />
              プレビュー
            </Button>
            <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
              <Save className="w-4 h-4 mr-2" />
              保存
            </Button>
          </div>
        </div>

        {/* QRコード名 */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label>QRコード名</Label>
                <Input
                  value={qrName}
                  onChange={(e) => setQrName(e.target.value)}
                  placeholder="QRコードの名前を入力"
                  className="mt-1"
                />
              </div>
              <div className="text-right">
                <Label className="text-gray-500">URL</Label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="text-sm bg-gray-100 px-3 py-2 rounded">{qrUrl}</code>
                  <Button variant="ghost" size="icon" onClick={handleCopyUrl}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white">
            <TabsTrigger value="basic">基本設定</TabsTrigger>
            <TabsTrigger value="status">稼働設定</TabsTrigger>
            <TabsTrigger value="referral">紹介時アクション</TabsTrigger>
            <TabsTrigger value="options">オプション</TabsTrigger>
            <TabsTrigger value="external">外部連携</TabsTrigger>
          </TabsList>

          {/* ============================================================ */}
          {/* 基本設定 */}
          {/* ============================================================ */}
          <TabsContent value="basic" className="space-y-6">
            {/* 稼働対象 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  稼働対象
                </CardTitle>
                <CardDescription>
                  このQRコードでアクションを稼働させる対象を選択します
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={targetAudience} onValueChange={setTargetAudience}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="new_only" id="new_only" />
                    <Label htmlFor="new_only">新規友だちのみ</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="all" />
                    <Label htmlFor="all">全ての友だち</Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* 読み込み時アクション */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  読み込み時アクション
                </CardTitle>
                <CardDescription>
                  QRコードを読み取った際に実行するアクションを設定します
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* アクション稼働回数 */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">アクション稼働回数</Label>
                  <RadioGroup value={actionFrequency} onValueChange={setActionFrequency}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="unlimited" id="unlimited" />
                      <Label htmlFor="unlimited">何度でもアクション稼働</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="once" id="once" />
                      <Label htmlFor="once">1度のみアクション稼働</Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* 送信するメッセージ */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">送信するメッセージを登録</Label>
                  <Textarea
                    placeholder="QRコードを読み取った際に送信するメッセージを入力してください"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="min-h-[120px]"
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm">
                      <Plus className="w-3 h-3 mr-1" />
                      LINE名を挿入
                    </Button>
                    <Button variant="outline" size="sm">
                      <Plus className="w-3 h-3 mr-1" />
                      友だち情報を挿入
                    </Button>
                    <Button variant="outline" size="sm">
                      <Plus className="w-3 h-3 mr-1" />
                      絵文字を挿入
                    </Button>
                  </div>
                </div>

                {/* エルメアクション */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">エルメアクション</Label>
                  
                  {/* 追加済みアクション一覧 */}
                  {actions.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {actions.map((action) => {
                        const actionType = ACTION_TYPES.find((t) => t.id === action.type);
                        return (
                          <div
                            key={action.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <Badge className={actionType?.color}>
                                {actionType && <actionType.icon className="w-3 h-3 mr-1" />}
                                {actionType?.name}
                              </Badge>
                              <span className="text-sm text-gray-600">
                                {Object.values(action.config).join(", ") || "設定なし"}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeAction(action.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowActionDialog(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    アクション追加・編集
                  </Button>
                  <p className="text-sm text-gray-500">
                    テンプレートやタグ設定などのエルメアクションを複数設定できます
                  </p>
                </div>

                {/* あいさつメッセージの併用 */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">あいさつメッセージの併用</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="greeting-new"
                        checked={useGreeting.newFriend}
                        onCheckedChange={(checked) =>
                          setUseGreeting({ ...useGreeting, newFriend: checked as boolean })
                        }
                      />
                      <Label htmlFor="greeting-new">新規友だち用あいさつメッセージを併用</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="greeting-existing"
                        checked={useGreeting.existingFriend}
                        onCheckedChange={(checked) =>
                          setUseGreeting({ ...useGreeting, existingFriend: checked as boolean })
                        }
                      />
                      <Label htmlFor="greeting-existing">既存友だち用あいさつメッセージを併用</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="greeting-unblocked"
                        checked={useGreeting.unblocked}
                        onCheckedChange={(checked) =>
                          setUseGreeting({ ...useGreeting, unblocked: checked as boolean })
                        }
                      />
                      <Label htmlFor="greeting-unblocked">ブロックを解除した友だち用あいさつメッセージを併用</Label>
                    </div>
                  </div>
                </div>

                {/* 連続アクション制限 */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">連続アクション制限</Label>
                  <RadioGroup value={consecutiveLimit} onValueChange={setConsecutiveLimit}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="none" id="limit-none" />
                      <Label htmlFor="limit-none">設定しない</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="daily" id="limit-daily" />
                      <Label htmlFor="limit-daily">アクション稼働当日中は稼働しない（翌0:00にリセット）</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="hours" id="limit-hours" />
                      <Label htmlFor="limit-hours">アクション稼働後、時間経過で再稼働可能</Label>
                    </div>
                  </RadioGroup>
                  {consecutiveLimit === "hours" && (
                    <div className="ml-6 flex items-center gap-2">
                      <Input
                        type="number"
                        value={limitHours}
                        onChange={(e) => setLimitHours(e.target.value)}
                        className="w-24"
                      />
                      <span>時間後に再稼働</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ============================================================ */}
          {/* 稼働設定 */}
          {/* ============================================================ */}
          <TabsContent value="status" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  稼働ON・OFFの設定
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 稼働状態 */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <Label className="text-base font-medium">稼働状態</Label>
                    <p className="text-sm text-gray-500">QRコードの稼働状態を切り替えます</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={isActive ? "default" : "secondary"} className="text-sm">
                      {isActive ? "稼働ON" : "稼働OFF"}
                    </Badge>
                    <Switch checked={isActive} onCheckedChange={setIsActive} />
                  </div>
                </div>

                {/* 稼働OFF時の動作 */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">稼働OFF時の動作</Label>
                  <RadioGroup value={offlineAction} onValueChange={setOfflineAction}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="text" id="offline-text" />
                      <Label htmlFor="offline-text">テキスト表示</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="url" id="offline-url" />
                      <Label htmlFor="offline-url">指定ページに遷移</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="friend" id="offline-friend" />
                      <Label htmlFor="offline-friend">友だち追加ページを表示</Label>
                    </div>
                  </RadioGroup>

                  {offlineAction === "text" && (
                    <Textarea
                      placeholder="稼働OFFの際に表示するメッセージ"
                      value={offlineMessage}
                      onChange={(e) => setOfflineMessage(e.target.value)}
                      className="min-h-[100px]"
                    />
                  )}

                  {offlineAction === "url" && (
                    <Input
                      placeholder="https://example.com"
                      value={offlineUrl}
                      onChange={(e) => setOfflineUrl(e.target.value)}
                    />
                  )}
                </div>

                {/* スケジュール設定 */}
                <div className="space-y-4 border-t pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">スケジュール設定</Label>
                      <p className="text-sm text-gray-500">期間を指定して自動で稼働ON/OFFを切り替えます</p>
                    </div>
                    <Switch checked={useSchedule} onCheckedChange={setUseSchedule} />
                  </div>

                  {useSchedule && (
                    <div className="space-y-4 ml-6 p-4 bg-gray-50 rounded-lg">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>開始日時</Label>
                          <Input
                            type="datetime-local"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 mb-2">
                            <Checkbox
                              id="has-end-date"
                              checked={hasEndDate}
                              onCheckedChange={(checked) => setHasEndDate(checked as boolean)}
                            />
                            <Label htmlFor="has-end-date">終了日時を設定</Label>
                          </div>
                          {hasEndDate && (
                            <Input
                              type="datetime-local"
                              value={endDate}
                              onChange={(e) => setEndDate(e.target.value)}
                            />
                          )}
                        </div>
                      </div>

                      {/* 曜日指定 */}
                      <div className="space-y-2">
                        <Label>稼働曜日</Label>
                        <div className="flex gap-2">
                          {[
                            { key: "mon", label: "月" },
                            { key: "tue", label: "火" },
                            { key: "wed", label: "水" },
                            { key: "thu", label: "木" },
                            { key: "fri", label: "金" },
                            { key: "sat", label: "土" },
                            { key: "sun", label: "日" },
                          ].map((day) => (
                            <Button
                              key={day.key}
                              variant={weekdaySchedule[day.key as keyof typeof weekdaySchedule] ? "default" : "outline"}
                              size="sm"
                              onClick={() =>
                                setWeekdaySchedule({
                                  ...weekdaySchedule,
                                  [day.key]: !weekdaySchedule[day.key as keyof typeof weekdaySchedule],
                                })
                              }
                            >
                              {day.label}
                            </Button>
                          ))}
                        </div>
                      </div>

                      {/* 時間指定 */}
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="use-time-schedule"
                            checked={useTimeSchedule}
                            onCheckedChange={(checked) => setUseTimeSchedule(checked as boolean)}
                          />
                          <Label htmlFor="use-time-schedule">時間帯を指定</Label>
                        </div>
                        {useTimeSchedule && (
                          <div className="flex items-center gap-2">
                            <Input
                              type="time"
                              value={timeSchedule.start}
                              onChange={(e) => setTimeSchedule({ ...timeSchedule, start: e.target.value })}
                              className="w-32"
                            />
                            <span>〜</span>
                            <Input
                              type="time"
                              value={timeSchedule.end}
                              onChange={(e) => setTimeSchedule({ ...timeSchedule, end: e.target.value })}
                              className="w-32"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ============================================================ */}
          {/* 紹介時アクション */}
          {/* ============================================================ */}
          <TabsContent value="referral" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="w-5 h-5" />
                  紹介時アクション
                </CardTitle>
                <CardDescription>
                  友だちが他の人を紹介した際のアクションを設定します
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <Label className="text-base font-medium">紹介時アクションを利用</Label>
                    <p className="text-sm text-gray-500">友だち紹介機能を有効にします</p>
                  </div>
                  <Switch checked={referralEnabled} onCheckedChange={setReferralEnabled} />
                </div>

                {referralEnabled && (
                  <>
                    {/* 紹介元の設定 */}
                    <div className="space-y-4 border-t pt-6">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        紹介元の設定
                      </h3>
                      
                      <div className="space-y-3">
                        <Label>案内ページのタイトル</Label>
                        <Input
                          placeholder="友だちを紹介してください！"
                          value={referrerPageTitle}
                          onChange={(e) => setReferrerPageTitle(e.target.value)}
                        />
                      </div>

                      <div className="space-y-3">
                        <Label>案内ページの説明文</Label>
                        <Textarea
                          placeholder="紹介ページに表示する説明文を入力してください"
                          value={referrerPageDescription}
                          onChange={(e) => setReferrerPageDescription(e.target.value)}
                          className="min-h-[100px]"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label>紹介成功時に送信するメッセージ</Label>
                        <Textarea
                          placeholder="紹介先が友だち追加した時に紹介元が受け取るメッセージ"
                          value={referrerRewardMessage}
                          onChange={(e) => setReferrerRewardMessage(e.target.value)}
                          className="min-h-[100px]"
                        />
                        <Button variant="outline" className="w-full">
                          <Plus className="w-4 h-4 mr-2" />
                          アクション追加・編集
                        </Button>
                      </div>
                    </div>

                    {/* 紹介先の設定 */}
                    <div className="space-y-4 border-t pt-6">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        紹介先の設定
                      </h3>
                      
                      <div className="space-y-3">
                        <Label>紹介先に送信するメッセージ</Label>
                        <Textarea
                          placeholder="紹介先が友だち追加した時に受け取るメッセージ"
                          value={refereeMessage}
                          onChange={(e) => setRefereeMessage(e.target.value)}
                          className="min-h-[100px]"
                        />
                        <Button variant="outline" className="w-full">
                          <Plus className="w-4 h-4 mr-2" />
                          アクション追加・編集
                        </Button>
                      </div>
                    </div>

                    {/* 紹介特典の設定 */}
                    <div className="space-y-4 border-t pt-6">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Gift className="w-5 h-5" />
                        紹介特典の設定
                      </h3>
                      
                      <div className="space-y-3">
                        {referralRewards.map((reward, index) => (
                          <div key={reward.id} className="p-4 bg-gray-50 rounded-lg space-y-3">
                            <div className="flex items-center justify-between">
                              <Badge variant="outline">{reward.count}人紹介達成</Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  setReferralRewards(referralRewards.filter((r) => r.id !== reward.id))
                                }
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                            <Input
                              placeholder="特典メッセージ"
                              value={reward.message}
                              onChange={(e) => {
                                const newRewards = [...referralRewards];
                                newRewards[index].message = e.target.value;
                                setReferralRewards(newRewards);
                              }}
                            />
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() =>
                            setReferralRewards([
                              ...referralRewards,
                              { id: Date.now().toString(), count: referralRewards.length + 1, message: "", actions: [] },
                            ])
                          }
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          特典を追加
                        </Button>
                      </div>
                    </div>

                    {/* 紹介ランキング */}
                    <div className="space-y-4 border-t pt-6">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Trophy className="w-5 h-5" />
                        紹介ランキング
                      </h3>
                      
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <Label className="text-base font-medium">ランキングを表示</Label>
                          <p className="text-sm text-gray-500">紹介人数のランキングを表示します</p>
                        </div>
                        <Switch checked={showRanking} onCheckedChange={setShowRanking} />
                      </div>

                      {showRanking && (
                        <div className="space-y-3">
                          <Label>ランキング集計期間</Label>
                          <Select value={rankingPeriod} onValueChange={setRankingPeriod}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="weekly">週間</SelectItem>
                              <SelectItem value="monthly">月間</SelectItem>
                              <SelectItem value="all">全期間</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ============================================================ */}
          {/* オプション設定 */}
          {/* ============================================================ */}
          <TabsContent value="options" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* QRコードデザイン */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    QRコードデザイン
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* ロゴ画像 */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>ロゴ画像を表示</Label>
                      <Switch checked={showLogo} onCheckedChange={setShowLogo} />
                    </div>
                    {showLogo && (
                      <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                        <Label>カスタムロゴ（オプション）</Label>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setCustomLogo(URL.createObjectURL(file));
                            }
                          }}
                        />
                        <Select value={logoPosition} onValueChange={setLogoPosition}>
                          <SelectTrigger>
                            <SelectValue placeholder="ロゴの位置" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="center">中央</SelectItem>
                            <SelectItem value="top">上部</SelectItem>
                            <SelectItem value="bottom">下部</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  {/* QRコードカラー */}
                  <div className="space-y-3">
                    <Label>QRコードカラー</Label>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">グラデーションを使用</span>
                      <Switch checked={useGradient} onCheckedChange={setUseGradient} />
                    </div>

                    {!useGradient ? (
                      <div className="flex items-center gap-3">
                        <Input
                          type="color"
                          value={qrColor}
                          onChange={(e) => setQrColor(e.target.value)}
                          className="w-20 h-10"
                        />
                        <Input
                          type="text"
                          value={qrColor}
                          onChange={(e) => setQrColor(e.target.value)}
                          className="flex-1"
                          placeholder="#000000"
                        />
                      </div>
                    ) : (
                      <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                        <Select value={gradientPreset} onValueChange={(value) => {
                          setGradientPreset(value);
                          const preset = GRADIENT_PRESETS.find((p) => p.id === value);
                          if (preset && preset.colors.length === 2) {
                            setGradientColors(preset.colors);
                          }
                        }}>
                          <SelectTrigger>
                            <SelectValue placeholder="プリセットを選択" />
                          </SelectTrigger>
                          <SelectContent>
                            {GRADIENT_PRESETS.filter((p) => p.id !== "none").map((preset) => (
                              <SelectItem key={preset.id} value={preset.id}>
                                {preset.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <Label className="text-xs">開始色</Label>
                            <div className="flex items-center gap-2">
                              <Input
                                type="color"
                                value={gradientColors[0]}
                                onChange={(e) => setGradientColors([e.target.value, gradientColors[1]])}
                                className="w-12 h-8"
                              />
                              <Input
                                type="text"
                                value={gradientColors[0]}
                                onChange={(e) => setGradientColors([e.target.value, gradientColors[1]])}
                                className="flex-1 text-xs"
                              />
                            </div>
                          </div>
                          <div className="flex-1">
                            <Label className="text-xs">終了色</Label>
                            <div className="flex items-center gap-2">
                              <Input
                                type="color"
                                value={gradientColors[1]}
                                onChange={(e) => setGradientColors([gradientColors[0], e.target.value])}
                                className="w-12 h-8"
                              />
                              <Input
                                type="text"
                                value={gradientColors[1]}
                                onChange={(e) => setGradientColors([gradientColors[0], e.target.value])}
                                className="flex-1 text-xs"
                              />
                            </div>
                          </div>
                        </div>

                        <Select value={gradientDirection} onValueChange={setGradientDirection}>
                          <SelectTrigger>
                            <SelectValue placeholder="グラデーション方向" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="to-right">左から右</SelectItem>
                            <SelectItem value="to-left">右から左</SelectItem>
                            <SelectItem value="to-bottom">上から下</SelectItem>
                            <SelectItem value="to-top">下から上</SelectItem>
                            <SelectItem value="to-br">左上から右下</SelectItem>
                            <SelectItem value="to-bl">右上から左下</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  {/* 背景色 */}
                  <div className="space-y-3">
                    <Label>背景色</Label>
                    <div className="flex items-center gap-3">
                      <Input
                        type="color"
                        value={qrBgColor}
                        onChange={(e) => setQrBgColor(e.target.value)}
                        className="w-20 h-10"
                      />
                      <Input
                        type="text"
                        value={qrBgColor}
                        onChange={(e) => setQrBgColor(e.target.value)}
                        className="flex-1"
                        placeholder="#FFFFFF"
                      />
                    </div>
                  </div>

                  {/* フレーム */}
                  <div className="space-y-3">
                    <Label>フレーム</Label>
                    <Select value={qrFrame} onValueChange={setQrFrame}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {QR_FRAMES.map((frame) => (
                          <SelectItem key={frame.id} value={frame.id}>
                            {frame.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {(qrFrame === "custom" || qrFrame === "scan_me" || qrFrame === "line_add") && (
                      <Input
                        placeholder="フレームテキスト"
                        value={frameText}
                        onChange={(e) => setFrameText(e.target.value)}
                      />
                    )}
                  </div>

                  {/* サイズ */}
                  <div className="space-y-3">
                    <Label>QRコードサイズ</Label>
                    <Select value={qrSize} onValueChange={setQrSize}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="128">128px（小）</SelectItem>
                        <SelectItem value="256">256px（中）</SelectItem>
                        <SelectItem value="512">512px（大）</SelectItem>
                        <SelectItem value="1024">1024px（特大）</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* エラー訂正レベル */}
                  <div className="space-y-3">
                    <Label>エラー訂正レベル</Label>
                    <Select value={errorCorrection} onValueChange={setErrorCorrection}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="L">L（7%）- 最小</SelectItem>
                        <SelectItem value="M">M（15%）- 標準</SelectItem>
                        <SelectItem value="Q">Q（25%）- 高</SelectItem>
                        <SelectItem value="H">H（30%）- 最高</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500">
                      ロゴを入れる場合は「高」以上を推奨します
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* QRコードプレビュー */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <QrCode className="w-5 h-5" />
                    QRコードプレビュー
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className="flex items-center justify-center p-8 rounded-lg"
                    style={{ backgroundColor: qrBgColor }}
                  >
                    <div className="text-center">
                      <div
                        className={`w-48 h-48 mx-auto mb-4 flex items-center justify-center rounded-lg ${
                          qrFrame !== "none" ? "border-4 border-gray-800 p-2" : ""
                        }`}
                        style={{
                          background: useGradient
                            ? `linear-gradient(${gradientDirection.replace("to-", "to ")}, ${gradientColors[0]}, ${gradientColors[1]})`
                            : qrColor,
                        }}
                      >
                        <QrCode className="w-full h-full text-white" />
                      </div>
                      {qrFrame !== "none" && (
                        <p className="text-sm font-medium mb-4">{frameText}</p>
                      )}
                      <div className="flex gap-2 justify-center">
                        <Button variant="outline" size="sm" onClick={handleDownloadQR}>
                          <Download className="w-4 h-4 mr-2" />
                          PNG
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleDownloadQR}>
                          <Download className="w-4 h-4 mr-2" />
                          SVG
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleDownloadQR}>
                          <Download className="w-4 h-4 mr-2" />
                          PDF
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ブラウザページデザイン */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="w-5 h-5" />
                  ブラウザページデザイン
                </CardTitle>
                <CardDescription>
                  QRコードを読み取った際に表示されるページのデザインを設定します
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>デザインタイプ</Label>
                  <Select value={browserDesign} onValueChange={setBrowserDesign}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">デフォルト</SelectItem>
                      <SelectItem value="text">テキストあり</SelectItem>
                      <SelectItem value="image">画像あり</SelectItem>
                      <SelectItem value="custom">カスタム</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {browserDesign === "text" && (
                  <div className="space-y-3">
                    <Label>表示テキスト</Label>
                    <Textarea
                      placeholder="QRコードを読み取る際に表示したいメッセージ"
                      value={browserText}
                      onChange={(e) => setBrowserText(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>
                )}

                {browserDesign === "image" && (
                  <div className="space-y-3">
                    <Label>表示画像</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setBrowserImage(URL.createObjectURL(file));
                        }
                      }}
                    />
                  </div>
                )}

                {browserDesign === "custom" && (
                  <div className="space-y-3">
                    <Label>背景色</Label>
                    <div className="flex items-center gap-3">
                      <Input
                        type="color"
                        value={browserBgColor}
                        onChange={(e) => setBrowserBgColor(e.target.value)}
                        className="w-20 h-10"
                      />
                      <Input
                        type="text"
                        value={browserBgColor}
                        onChange={(e) => setBrowserBgColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ============================================================ */}
          {/* 外部連携 */}
          {/* ============================================================ */}
          <TabsContent value="external" className="space-y-6">
            {/* HTMLタグ挿入 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  HTMLタグ挿入
                </CardTitle>
                <CardDescription>
                  友だち追加後のLINE画面上にHTMLタグを挿入できます
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  placeholder="外部サービスの計測タグを入力してください（例：Google Analytics, Facebook Pixel）"
                  value={htmlTag}
                  onChange={(e) => setHtmlTag(e.target.value)}
                  className="min-h-[150px] font-mono text-sm"
                />
                <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-800">
                    HTMLタグは友だち追加完了後に実行されます。計測タグやコンバージョンタグを設置できます。
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* パラメーターインポート */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  パラメーターインポート
                </CardTitle>
                <CardDescription>
                  他社システムの顧客情報をエルメに取り込むことができます
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <Label className="text-base font-medium">パラメーターインポートを有効化</Label>
                    <p className="text-sm text-gray-500">URLパラメーターから友だち情報を取得します</p>
                  </div>
                  <Switch checked={importEnabled} onCheckedChange={setImportEnabled} />
                </div>

                {importEnabled && (
                  <div className="space-y-3">
                    <Label>インポートフィールド設定</Label>
                    {importFields.map((field, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          placeholder="URLパラメーター名"
                          value={field.param}
                          onChange={(e) => {
                            const newFields = [...importFields];
                            newFields[index].param = e.target.value;
                            setImportFields(newFields);
                          }}
                          className="flex-1"
                        />
                        <span>→</span>
                        <Select
                          value={field.field}
                          onValueChange={(value) => {
                            const newFields = [...importFields];
                            newFields[index].field = value;
                            setImportFields(newFields);
                          }}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="友だち情報フィールド" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="name">氏名</SelectItem>
                            <SelectItem value="email">メールアドレス</SelectItem>
                            <SelectItem value="phone">電話番号</SelectItem>
                            <SelectItem value="custom1">カスタム1</SelectItem>
                            <SelectItem value="custom2">カスタム2</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeImportField(index)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" onClick={addImportField}>
                      <Plus className="w-4 h-4 mr-2" />
                      フィールドを追加
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* パラメーターエクスポート */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  パラメーターエクスポート
                </CardTitle>
                <CardDescription>
                  友だち追加時に外部システムへ顧客情報を自動送信できます
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <Label className="text-base font-medium">パラメーターエクスポートを有効化</Label>
                    <p className="text-sm text-gray-500">友だち追加時にWebhookを送信します</p>
                  </div>
                  <Switch checked={exportEnabled} onCheckedChange={setExportEnabled} />
                </div>

                {exportEnabled && (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label>Webhook URL</Label>
                      <Input
                        placeholder="https://example.com/webhook"
                        value={exportUrl}
                        onChange={(e) => setExportUrl(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>送信するフィールド</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {["LINE ID", "表示名", "友だち追加日時", "QRコード名", "タグ", "カスタムフィールド"].map(
                          (field) => (
                            <div key={field} className="flex items-center space-x-2">
                              <Checkbox
                                id={`export-${field}`}
                                checked={exportFields.includes(field)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setExportFields([...exportFields, field]);
                                  } else {
                                    setExportFields(exportFields.filter((f) => f !== field));
                                  }
                                }}
                              />
                              <Label htmlFor={`export-${field}`}>{field}</Label>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* LP連携 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link className="w-5 h-5" />
                  LP連携
                </CardTitle>
                <CardDescription>
                  複数の広告を出稿している場合、1つのQRコードで流入経路を記録できます
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <Label className="text-base font-medium">LP連携を有効化</Label>
                    <p className="text-sm text-gray-500">URLパラメーターで流入経路を識別します</p>
                  </div>
                  <Switch checked={lpEnabled} onCheckedChange={setLpEnabled} />
                </div>

                {lpEnabled && (
                  <div className="space-y-3">
                    <Label>LP識別パラメーター</Label>
                    {lpParams.map((param, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          placeholder="パラメーター名（例：utm_source）"
                          value={param.key}
                          onChange={(e) => {
                            const newParams = [...lpParams];
                            newParams[index].key = e.target.value;
                            setLpParams(newParams);
                          }}
                          className="flex-1"
                        />
                        <Input
                          placeholder="値（例：facebook）"
                          value={param.value}
                          onChange={(e) => {
                            const newParams = [...lpParams];
                            newParams[index].value = e.target.value;
                            setLpParams(newParams);
                          }}
                          className="flex-1"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeLpParam(index)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" onClick={addLpParam}>
                      <Plus className="w-4 h-4 mr-2" />
                      パラメーターを追加
                    </Button>

                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>使用例：</strong><br />
                        {qrUrl}?utm_source=facebook&utm_campaign=summer_sale
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* アクション追加ダイアログ */}
      <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>エルメアクションを追加</DialogTitle>
            <DialogDescription>
              QRコード読み取り時に実行するアクションを選択してください
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-4">
            {ACTION_TYPES.map((action) => (
              <Button
                key={action.id}
                variant="outline"
                className="h-auto p-4 justify-start"
                onClick={() => addAction(action.id)}
              >
                <action.icon className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <div className="font-medium">{action.name}</div>
                </div>
              </Button>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowActionDialog(false)}>
              キャンセル
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
