import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Save, Eye, QrCode, Download } from "lucide-react";
import { toast } from "sonner";

export default function QRCodeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // 基本設定
  const [actionFrequency, setActionFrequency] = useState("unlimited");
  const [message, setMessage] = useState("");
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
  const [offlineMessage, setOfflineMessage] = useState("");
  const [offlineUrl, setOfflineUrl] = useState("");
  const [useSchedule, setUseSchedule] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [hasEndDate, setHasEndDate] = useState(false);

  // 紹介時アクション
  const [referralEnabled, setReferralEnabled] = useState(false);
  const [referrerPageTitle, setReferrerPageTitle] = useState("");
  const [referrerMessage, setReferrerMessage] = useState("");
  const [referrerRewardMessage, setReferrerRewardMessage] = useState("");

  // オプション設定
  const [showLogo, setShowLogo] = useState(true);
  const [customLogo, setCustomLogo] = useState("");
  const [qrColor, setQrColor] = useState("#000000");
  const [browserDesign, setBrowserDesign] = useState("default");
  const [browserText, setBrowserText] = useState("");

  // 外部連携
  const [htmlTag, setHtmlTag] = useState("");
  const [lpEnabled, setLpEnabled] = useState(false);

  const handleSave = () => {
    toast.success("設定を保存しました");
  };

  const handlePreview = () => {
    toast.info("プレビューを表示します");
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/marketing/qr-code")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">QRコードアクション詳細設定</h1>
            <p className="text-sm text-gray-500">ID: {id}</p>
          </div>
        </div>
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

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic">基本設定</TabsTrigger>
          <TabsTrigger value="status">稼働設定</TabsTrigger>
          <TabsTrigger value="referral">紹介時アクション</TabsTrigger>
          <TabsTrigger value="options">オプション</TabsTrigger>
          <TabsTrigger value="external">外部連携</TabsTrigger>
        </TabsList>

        {/* 基本設定 */}
        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>読み込み時アクション</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* アクション稼働回数 */}
              <div className="space-y-3">
                <Label>アクション稼働回数</Label>
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
                <Label>送信するメッセージを登録</Label>
                <Textarea
                  placeholder="QRコードを読み取った際に送信するメッセージを入力してください"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-[120px]"
                />
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    LINE名を挿入
                  </Button>
                  <Button variant="outline" size="sm">
                    友だち情報を挿入
                  </Button>
                </div>
              </div>

              {/* アクション追加・編集 */}
              <div className="space-y-3">
                <Label>エルメアクション</Label>
                <Button variant="outline" className="w-full">
                  + アクション追加・編集
                </Button>
                <p className="text-sm text-gray-500">
                  テンプレートやタグ設定などのエルメアクションを複数設定できます
                </p>
              </div>

              {/* あいさつメッセージの併用 */}
              <div className="space-y-3">
                <Label>あいさつメッセージの併用</Label>
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
                <Label>連続アクション制限</Label>
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

        {/* 稼働設定 */}
        <TabsContent value="status" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>稼働ON・OFFの設定</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 稼働状態 */}
              <div className="flex items-center justify-between">
                <Label>稼働状態</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm">{isActive ? "稼働ON" : "稼働OFF"}</span>
                  <Switch checked={isActive} onCheckedChange={setIsActive} />
                </div>
              </div>

              {/* 稼働OFF時の動作 */}
              <div className="space-y-3">
                <Label>稼働OFF時の動作</Label>
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
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>スケジュール設定</Label>
                  <Switch checked={useSchedule} onCheckedChange={setUseSchedule} />
                </div>

                {useSchedule && (
                  <div className="space-y-4 ml-6">
                    <div className="space-y-2">
                      <Label>開始日時</Label>
                      <Input
                        type="datetime-local"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="has-end-date"
                        checked={hasEndDate}
                        onCheckedChange={(checked) => setHasEndDate(checked as boolean)}
                      />
                      <Label htmlFor="has-end-date">終了日時を設定</Label>
                    </div>

                    {hasEndDate && (
                      <div className="space-y-2">
                        <Label>終了日時</Label>
                        <Input
                          type="datetime-local"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 紹介時アクション */}
        <TabsContent value="referral" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>紹介時アクション</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <Label>紹介時アクションを利用</Label>
                <Switch checked={referralEnabled} onCheckedChange={setReferralEnabled} />
              </div>

              {referralEnabled && (
                <>
                  <div className="space-y-3">
                    <Label>紹介元：案内ページの設定</Label>
                    <Input
                      placeholder="ページタイトル"
                      value={referrerPageTitle}
                      onChange={(e) => setReferrerPageTitle(e.target.value)}
                    />
                    <Textarea
                      placeholder="案内文を入力してください"
                      value={referrerMessage}
                      onChange={(e) => setReferrerMessage(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>紹介元：紹介時に送信するメッセージ</Label>
                    <Textarea
                      placeholder="紹介先が友だち追加した時に紹介元が受け取るメッセージ"
                      value={referrerRewardMessage}
                      onChange={(e) => setReferrerRewardMessage(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <Button variant="outline" className="w-full">
                      + アクション追加・編集
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* オプション設定 */}
        <TabsContent value="options" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>オプション設定</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* ロゴ画像 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>ロゴ画像を表示</Label>
                  <Switch checked={showLogo} onCheckedChange={setShowLogo} />
                </div>
                {showLogo && (
                  <div className="space-y-2">
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
                    <p className="text-sm text-gray-500">
                      自社のロゴを設定すると、友だち追加画面に表示されます
                    </p>
                  </div>
                )}
              </div>

              {/* QRコードカラー */}
              <div className="space-y-3">
                <Label>QRコードカラー</Label>
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
              </div>

              {/* ブラウザページデザイン */}
              <div className="space-y-3">
                <Label>ブラウザページデザイン</Label>
                <Select value={browserDesign} onValueChange={setBrowserDesign}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">デフォルト</SelectItem>
                    <SelectItem value="text">テキストあり</SelectItem>
                    <SelectItem value="image">画像あり</SelectItem>
                  </SelectContent>
                </Select>

                {browserDesign === "text" && (
                  <Textarea
                    placeholder="QRコードを読み取る際に表示したいメッセージ"
                    value={browserText}
                    onChange={(e) => setBrowserText(e.target.value)}
                    className="min-h-[100px]"
                  />
                )}
              </div>

              {/* QRコードプレビュー */}
              <div className="space-y-3">
                <Label>QRコードプレビュー</Label>
                <div className="flex items-center justify-center p-6 border-2 border-dashed rounded-lg">
                  <div className="text-center">
                    <QrCode className="w-32 h-32 mx-auto mb-3" style={{ color: qrColor }} />
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      QRコードをダウンロード
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 外部連携 */}
        <TabsContent value="external" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>外部連携</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* HTMLタグ挿入 */}
              <div className="space-y-3">
                <Label>HTMLタグ挿入</Label>
                <Textarea
                  placeholder="外部サービスの計測タグを入力してください"
                  value={htmlTag}
                  onChange={(e) => setHtmlTag(e.target.value)}
                  className="min-h-[100px] font-mono text-sm"
                />
                <p className="text-sm text-gray-500">
                  友だち追加後のLINE画面上にHTMLタグを挿入できます
                </p>
              </div>

              {/* パラメーターインポート */}
              <div className="space-y-3">
                <Label>パラメーターインポート</Label>
                <Button variant="outline" className="w-full">
                  パラメーターインポート設定
                </Button>
                <p className="text-sm text-gray-500">
                  他社システムの顧客情報をエルメに取り込むことができます
                </p>
              </div>

              {/* パラメーターエクスポート */}
              <div className="space-y-3">
                <Label>パラメーターエクスポート</Label>
                <Button variant="outline" className="w-full">
                  パラメーターエクスポート設定
                </Button>
                <p className="text-sm text-gray-500">
                  友だち追加時に外部システムへ顧客情報を自動送信できます
                </p>
              </div>

              {/* LP連携 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>LP連携</Label>
                  <Switch checked={lpEnabled} onCheckedChange={setLpEnabled} />
                </div>
                {lpEnabled && (
                  <Button variant="outline" className="w-full">
                    LP連携設定
                  </Button>
                )}
                <p className="text-sm text-gray-500">
                  複数の広告を出稿している場合、1つのQRコードで流入経路を記録できます
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
