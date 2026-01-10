import React, { useState } from "react";
import { useParams, useLocation } from "wouter";
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
  ArrowLeft,
  Save,
  Eye,
  QrCode,
  Download,
  Copy,
  Settings,
  MessageSquare,
  Clock,
  Gift,
  Palette,
  Link,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

export default function QRCodeDetailComplete() {
  const params = useParams();
  const id = params.id || "new";
  const [, setLocation] = useLocation();
  const isNewMode = id === "new";
  const [currentStep, setCurrentStep] = useState(0);

  // 基本設定
  const [qrName, setQrName] = useState("新規QRコード");
  const [actionFrequency, setActionFrequency] = useState("unlimited");
  const [targetAudience, setTargetAudience] = useState("all");
  const [message, setMessage] = useState("");
  const [useGreeting, setUseGreeting] = useState(false);
  const [consecutiveLimit, setConsecutiveLimit] = useState("none");

  // 稼働設定
  const [isActive, setIsActive] = useState(true);
  const [offlineAction, setOfflineAction] = useState("text");
  const [offlineMessage, setOfflineMessage] = useState("現在このQRコードは利用できません。");
  const [useSchedule, setUseSchedule] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // 紹介時アクション
  const [referralEnabled, setReferralEnabled] = useState(false);
  const [referrerPageTitle, setReferrerPageTitle] = useState("友だちを紹介してください！");
  const [referrerMessage, setReferrerMessage] = useState("");

  // オプション設定
  const [showLogo, setShowLogo] = useState(true);
  const [qrColor, setQrColor] = useState("#000000");
  const [qrBgColor, setQrBgColor] = useState("#FFFFFF");
  const [qrFrame, setQrFrame] = useState("none");

  // 外部連携
  const [htmlTag, setHtmlTag] = useState("");
  const [lpEnabled, setLpEnabled] = useState(false);

  // QRコードURL
  const qrUrl = `https://line.me/R/ti/p/@example?qr=${id}`;

  const handleSave = () => {
    if (isNewMode) {
      // 新規作成時はデータを保存して管理ページに戻る
      const newId = Date.now().toString();
      toast.success("QRコードを作成しました");
      setLocation("/marketing/qr-code");
    } else {
      toast.success("設定を保存しました");
    }
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

  const handleBack = () => {
    setLocation("/marketing/qr-code");
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{isNewMode ? "QRコードの新規作成" : qrName}</h1>
            <p className="text-gray-600">{isNewMode ? "必要な情報を入力してQRコードを作成しましょう" : "QRコードの詳細設定"}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePreview}>
            <Eye className="w-4 h-4 mr-2" />
            プレビュー
          </Button>
          <Button onClick={handleSave}>
            {isNewMode ? <CheckCircle className="w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            {isNewMode ? "作成して完了" : "保存"}
          </Button>
        </div>
      </div>

      {/* 新規作成モードのガイド */}
      {isNewMode && (
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center flex-shrink-0">
                <Settings className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">設定ガイド</h3>
                <p className="text-sm text-gray-700 mb-4">
                  以下のタブを順番に設定していきましょう。必須項目を入力後、「作成して完了」ボタンをクリックしてください。
                </p>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline" className="bg-white">
                    <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
                    1. 基本設定（必須）
                  </Badge>
                  <Badge variant="outline" className="bg-white">
                    <Clock className="w-3 h-3 mr-1 text-gray-400" />
                    2. 稼働設定
                  </Badge>
                  <Badge variant="outline" className="bg-white">
                    <Gift className="w-3 h-3 mr-1 text-gray-400" />
                    3. 紹介時アクション
                  </Badge>
                  <Badge variant="outline" className="bg-white">
                    <Palette className="w-3 h-3 mr-1 text-gray-400" />
                    4. オプション
                  </Badge>
                  <Badge variant="outline" className="bg-white">
                    <Link className="w-3 h-3 mr-1 text-gray-400" />
                    5. 外部連携
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* QRコード情報カード */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center">
              <QrCode className="w-16 h-16 text-gray-400" />
            </div>
            <div className="flex-1">
              <div className="space-y-2">
                <div>
                  <Label className="text-sm text-gray-600">QRコードURL</Label>
                  <div className="flex gap-2 mt-1">
                    <Input value={qrUrl} readOnly className="font-mono text-sm" />
                    <Button variant="outline" size="icon" onClick={handleCopyUrl}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleDownloadQR}>
                    <Download className="w-4 h-4 mr-2" />
                    QRコードをダウンロード
                  </Button>
                  <Badge variant={isActive ? "default" : "secondary"}>
                    {isActive ? "稼働中" : "停止中"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* タブ */}
      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic">
            <Settings className="w-4 h-4 mr-2" />
            基本設定
          </TabsTrigger>
          <TabsTrigger value="operation">
            <Clock className="w-4 h-4 mr-2" />
            稼働設定
          </TabsTrigger>
          <TabsTrigger value="referral">
            <Gift className="w-4 h-4 mr-2" />
            紹介時アクション
          </TabsTrigger>
          <TabsTrigger value="options">
            <Palette className="w-4 h-4 mr-2" />
            オプション
          </TabsTrigger>
          <TabsTrigger value="integration">
            <Link className="w-4 h-4 mr-2" />
            外部連携
          </TabsTrigger>
        </TabsList>

        {/* 基本設定タブ */}
        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                基本情報
                {isNewMode && <Badge variant="destructive" className="text-xs">必須</Badge>}
              </CardTitle>
              <CardDescription>
                {isNewMode 
                  ? "QRコードの名前と対象となる友だちを設定します。これらは必須項目です。"
                  : "QRコードの名前と基本設定を行います"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="flex items-center gap-2">
                  管理名
                  {isNewMode && <span className="text-red-500 text-xs">*</span>}
                </Label>
                <Input
                  value={qrName}
                  onChange={(e) => setQrName(e.target.value)}
                  placeholder="例：店舗来店キャンペーン"
                  className={isNewMode && !qrName ? "border-red-300" : ""}
                />
                {isNewMode && !qrName && (
                  <p className="text-sm text-red-500 mt-1">管理名を入力してください</p>
                )}
              </div>

              <div>
                <Label>稼働対象</Label>
                <Select value={targetAudience} onValueChange={setTargetAudience}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">新規友だちのみ</SelectItem>
                    <SelectItem value="all">全ての友だち</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500 mt-1">
                  {targetAudience === "new"
                    ? "初めて友だち追加するユーザーのみが対象です"
                    : "新規・既存・ブロック解除した全てのユーザーが対象です"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>読み込み時アクション</CardTitle>
              <CardDescription>
                {isNewMode
                  ? "QRコードを読み取ったときに送信するメッセージを設定できます。（オプション）"
                  : "QRコード読み取り時に実行するアクションを設定します"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>メッセージ送信</Label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="QRコード読み取り時に送信するメッセージを入力してください"
                  rows={4}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>あいさつメッセージを併用</Label>
                  <p className="text-sm text-gray-500">
                    友だち追加時のあいさつメッセージも送信します
                  </p>
                </div>
                <Switch checked={useGreeting} onCheckedChange={setUseGreeting} />
              </div>

              <div>
                <Label>連続アクション制限</Label>
                <Select value={consecutiveLimit} onValueChange={setConsecutiveLimit}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">制限なし</SelectItem>
                    <SelectItem value="24h">24時間に1回まで</SelectItem>
                    <SelectItem value="7d">7日間に1回まで</SelectItem>
                    <SelectItem value="30d">30日間に1回まで</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500 mt-1">
                  同じユーザーが連続してQRコードを読み取った場合の制限を設定します
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 稼働設定タブ */}
        <TabsContent value="operation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>稼働ON・OFF設定</CardTitle>
              <CardDescription>QRコードの稼働状態を管理します</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>稼働状態</Label>
                  <p className="text-sm text-gray-500">
                    OFFにするとQRコードが無効になります
                  </p>
                </div>
                <Switch checked={isActive} onCheckedChange={setIsActive} />
              </div>

              {!isActive && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <Label>稼働OFF時の動作</Label>
                    <RadioGroup value={offlineAction} onValueChange={setOfflineAction}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="text" id="offline-text" />
                        <Label htmlFor="offline-text">テキストメッセージを表示</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="url" id="offline-url" />
                        <Label htmlFor="offline-url">指定URLにリダイレクト</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="nothing" id="offline-nothing" />
                        <Label htmlFor="offline-nothing">何もしない</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {offlineAction === "text" && (
                    <div>
                      <Label>表示メッセージ</Label>
                      <Textarea
                        value={offlineMessage}
                        onChange={(e) => setOfflineMessage(e.target.value)}
                        rows={3}
                      />
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>スケジュール設定</CardTitle>
              <CardDescription>稼働期間や時間帯を指定できます</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>スケジュール設定を使用</Label>
                  <p className="text-sm text-gray-500">
                    特定の期間や時間帯のみ稼働させることができます
                  </p>
                </div>
                <Switch checked={useSchedule} onCheckedChange={setUseSchedule} />
              </div>

              {useSchedule && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>開始日時</Label>
                      <Input
                        type="datetime-local"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>終了日時</Label>
                      <Input
                        type="datetime-local"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 紹介時アクションタブ */}
        <TabsContent value="referral" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>紹介機能</CardTitle>
              <CardDescription>友だち紹介機能を設定します</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>紹介機能を有効化</Label>
                  <p className="text-sm text-gray-500">
                    友だちが友だちを紹介できる機能です
                  </p>
                </div>
                <Switch checked={referralEnabled} onCheckedChange={setReferralEnabled} />
              </div>

              {referralEnabled && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <Label>紹介ページタイトル</Label>
                    <Input
                      value={referrerPageTitle}
                      onChange={(e) => setReferrerPageTitle(e.target.value)}
                      placeholder="例：友だちを紹介してください！"
                    />
                  </div>

                  <div>
                    <Label>紹介元へのメッセージ</Label>
                    <Textarea
                      value={referrerMessage}
                      onChange={(e) => setReferrerMessage(e.target.value)}
                      placeholder="紹介してくれた人に送るメッセージ"
                      rows={3}
                    />
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-900">紹介機能について</p>
                        <p className="text-sm text-blue-700 mt-1">
                          紹介機能を有効にすると、友だちが専用URLを共有して新しい友だちを招待できるようになります。
                          紹介数に応じた特典を設定することも可能です。
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* オプションタブ */}
        <TabsContent value="options" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>QRコードデザイン</CardTitle>
              <CardDescription>QRコードの見た目をカスタマイズします</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>ロゴを表示</Label>
                  <p className="text-sm text-gray-500">
                    QRコードの中央にロゴを配置します
                  </p>
                </div>
                <Switch checked={showLogo} onCheckedChange={setShowLogo} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>QRコードカラー</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={qrColor}
                      onChange={(e) => setQrColor(e.target.value)}
                      className="w-20 h-10"
                    />
                    <Input
                      value={qrColor}
                      onChange={(e) => setQrColor(e.target.value)}
                      placeholder="#000000"
                    />
                  </div>
                </div>

                <div>
                  <Label>背景色</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={qrBgColor}
                      onChange={(e) => setQrBgColor(e.target.value)}
                      className="w-20 h-10"
                    />
                    <Input
                      value={qrBgColor}
                      onChange={(e) => setQrBgColor(e.target.value)}
                      placeholder="#FFFFFF"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label>フレーム</Label>
                <Select value={qrFrame} onValueChange={setQrFrame}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">フレームなし</SelectItem>
                    <SelectItem value="simple">シンプル枠</SelectItem>
                    <SelectItem value="rounded">角丸枠</SelectItem>
                    <SelectItem value="scan_me">SCAN ME</SelectItem>
                    <SelectItem value="line_add">LINE友だち追加</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center">
                  <div className="w-48 h-48 bg-white rounded-lg shadow-sm flex items-center justify-center">
                    <QrCode className="w-32 h-32" style={{ color: qrColor }} />
                  </div>
                </div>
                <p className="text-sm text-gray-600 text-center mt-2">プレビュー</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 外部連携タブ */}
        <TabsContent value="integration" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>HTMLタグ挿入</CardTitle>
              <CardDescription>
                QRコード読み取り後のページにカスタムHTMLタグを挿入できます
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>HTMLタグ</Label>
                <Textarea
                  value={htmlTag}
                  onChange={(e) => setHtmlTag(e.target.value)}
                  placeholder="<script>...</script> や <style>...</style> などのタグを入力"
                  rows={6}
                  className="font-mono text-sm"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Google Analytics、Facebook Pixelなどのトラッキングタグを設置できます
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>LP連携</CardTitle>
              <CardDescription>
                ランディングページとの連携設定を行います
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>LP連携を有効化</Label>
                  <p className="text-sm text-gray-500">
                    外部ランディングページにパラメーターを渡します
                  </p>
                </div>
                <Switch checked={lpEnabled} onCheckedChange={setLpEnabled} />
              </div>

              {lpEnabled && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    LP連携を有効にすると、QRコード読み取り時に友だち情報やカスタムパラメーターを
                    ランディングページに渡すことができます。
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* フッター */}
      <div className="flex justify-between items-center mt-8 pt-6 border-t">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          一覧に戻る
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePreview}>
            <Eye className="w-4 h-4 mr-2" />
            プレビュー
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            保存
          </Button>
        </div>
      </div>
    </div>
  );
}
