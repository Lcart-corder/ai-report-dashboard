import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Smartphone, MessageSquare, Monitor } from "lucide-react";
import { toast } from "sonner";

interface NotificationSetting {
  id: string;
  category: string;
  label: string;
  enabled: boolean;
  timing: string;
}

export default function NotificationSettings() {
  const [notificationMethod, setNotificationMethod] = useState("app");
  const [settings, setSettings] = useState<NotificationSetting[]>([
    { id: "friend_add", category: "friends", label: "友だち追加", enabled: true, timing: "realtime" },
    { id: "message_received", category: "chat", label: "メッセージ受信", enabled: true, timing: "realtime" },
    { id: "form_response", category: "forms", label: "フォーム回答", enabled: true, timing: "15min" },
    { id: "reservation", category: "events", label: "予約登録", enabled: true, timing: "realtime" },
    { id: "order", category: "orders", label: "商品注文", enabled: true, timing: "realtime" },
    { id: "order_cancel", category: "orders", label: "注文キャンセル", enabled: false, timing: "1hour" },
    { id: "payment_complete", category: "orders", label: "決済完了", enabled: true, timing: "realtime" },
    { id: "delivery_update", category: "orders", label: "配送状況更新", enabled: false, timing: "1hour" },
  ]);

  const handleToggle = (id: string) => {
    setSettings(
      settings.map((setting) =>
        setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
      )
    );
  };

  const handleTimingChange = (id: string, timing: string) => {
    setSettings(
      settings.map((setting) => (setting.id === id ? { ...setting, timing } : setting))
    );
  };

  const handleSave = () => {
    toast.success("通知設定を保存しました");
  };

  const friendSettings = settings.filter((s) => s.category === "friends");
  const chatSettings = settings.filter((s) => s.category === "chat");
  const formSettings = settings.filter((s) => s.category === "forms");
  const eventSettings = settings.filter((s) => s.category === "events");
  const orderSettings = settings.filter((s) => s.category === "orders");

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">通知設定</h1>
        <p className="text-gray-600">
          各種イベントの通知方法とタイミングを設定できます
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>通知方法</CardTitle>
          <CardDescription>通知を受け取る方法を選択してください</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                notificationMethod === "app"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setNotificationMethod("app")}
            >
              <div className="flex flex-col items-center text-center gap-2">
                <Smartphone className="w-8 h-8 text-blue-500" />
                <h3 className="font-semibold">スマートフォンアプリ</h3>
                <p className="text-sm text-gray-500">モバイルアプリでプッシュ通知を受け取る</p>
              </div>
            </div>

            <div
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                notificationMethod === "chatwork"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setNotificationMethod("chatwork")}
            >
              <div className="flex flex-col items-center text-center gap-2">
                <MessageSquare className="w-8 h-8 text-green-500" />
                <h3 className="font-semibold">ChatWork</h3>
                <p className="text-sm text-gray-500">ChatWorkで通知を受け取る</p>
              </div>
            </div>

            <div
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                notificationMethod === "desktop"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setNotificationMethod("desktop")}
            >
              <div className="flex flex-col items-center text-center gap-2">
                <Monitor className="w-8 h-8 text-purple-500" />
                <h3 className="font-semibold">PCデスクトップ</h3>
                <p className="text-sm text-gray-500">デスクトップ通知を受け取る</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>通知項目設定</CardTitle>
          <CardDescription>
            各イベントの通知ON/OFFと通知タイミングを設定できます
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="friends">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="friends">友だち</TabsTrigger>
              <TabsTrigger value="chat">チャット</TabsTrigger>
              <TabsTrigger value="forms">フォーム</TabsTrigger>
              <TabsTrigger value="events">予約</TabsTrigger>
              <TabsTrigger value="orders">注文</TabsTrigger>
            </TabsList>

            <TabsContent value="friends" className="space-y-4 mt-4">
              {friendSettings.map((setting) => (
                <div
                  key={setting.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <Switch
                      checked={setting.enabled}
                      onCheckedChange={() => handleToggle(setting.id)}
                    />
                    <Label className="font-medium">{setting.label}</Label>
                  </div>
                  {setting.enabled && (
                    <Select
                      value={setting.timing}
                      onValueChange={(value) => handleTimingChange(setting.id, value)}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="realtime">リアルタイム</SelectItem>
                        <SelectItem value="15min">15分ごと</SelectItem>
                        <SelectItem value="30min">30分ごと</SelectItem>
                        <SelectItem value="1hour">1時間ごと</SelectItem>
                        <SelectItem value="3hour">3時間ごと</SelectItem>
                        <SelectItem value="6hour">6時間ごと</SelectItem>
                        <SelectItem value="12hour">12時間ごと</SelectItem>
                        <SelectItem value="24hour">24時間ごと</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              ))}
            </TabsContent>

            <TabsContent value="chat" className="space-y-4 mt-4">
              {chatSettings.map((setting) => (
                <div
                  key={setting.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <Switch
                      checked={setting.enabled}
                      onCheckedChange={() => handleToggle(setting.id)}
                    />
                    <Label className="font-medium">{setting.label}</Label>
                  </div>
                  {setting.enabled && (
                    <Select
                      value={setting.timing}
                      onValueChange={(value) => handleTimingChange(setting.id, value)}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="realtime">リアルタイム</SelectItem>
                        <SelectItem value="15min">15分ごと</SelectItem>
                        <SelectItem value="30min">30分ごと</SelectItem>
                        <SelectItem value="1hour">1時間ごと</SelectItem>
                        <SelectItem value="3hour">3時間ごと</SelectItem>
                        <SelectItem value="6hour">6時間ごと</SelectItem>
                        <SelectItem value="12hour">12時間ごと</SelectItem>
                        <SelectItem value="24hour">24時間ごと</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              ))}
            </TabsContent>

            <TabsContent value="forms" className="space-y-4 mt-4">
              {formSettings.map((setting) => (
                <div
                  key={setting.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <Switch
                      checked={setting.enabled}
                      onCheckedChange={() => handleToggle(setting.id)}
                    />
                    <Label className="font-medium">{setting.label}</Label>
                  </div>
                  {setting.enabled && (
                    <Select
                      value={setting.timing}
                      onValueChange={(value) => handleTimingChange(setting.id, value)}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="realtime">リアルタイム</SelectItem>
                        <SelectItem value="15min">15分ごと</SelectItem>
                        <SelectItem value="30min">30分ごと</SelectItem>
                        <SelectItem value="1hour">1時間ごと</SelectItem>
                        <SelectItem value="3hour">3時間ごと</SelectItem>
                        <SelectItem value="6hour">6時間ごと</SelectItem>
                        <SelectItem value="12hour">12時間ごと</SelectItem>
                        <SelectItem value="24hour">24時間ごと</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              ))}
            </TabsContent>

            <TabsContent value="events" className="space-y-4 mt-4">
              {eventSettings.map((setting) => (
                <div
                  key={setting.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <Switch
                      checked={setting.enabled}
                      onCheckedChange={() => handleToggle(setting.id)}
                    />
                    <Label className="font-medium">{setting.label}</Label>
                  </div>
                  {setting.enabled && (
                    <Select
                      value={setting.timing}
                      onValueChange={(value) => handleTimingChange(setting.id, value)}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="realtime">リアルタイム</SelectItem>
                        <SelectItem value="15min">15分ごと</SelectItem>
                        <SelectItem value="30min">30分ごと</SelectItem>
                        <SelectItem value="1hour">1時間ごと</SelectItem>
                        <SelectItem value="3hour">3時間ごと</SelectItem>
                        <SelectItem value="6hour">6時間ごと</SelectItem>
                        <SelectItem value="12hour">12時間ごと</SelectItem>
                        <SelectItem value="24hour">24時間ごと</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              ))}
            </TabsContent>

            <TabsContent value="orders" className="space-y-4 mt-4">
              {orderSettings.map((setting) => (
                <div
                  key={setting.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <Switch
                      checked={setting.enabled}
                      onCheckedChange={() => handleToggle(setting.id)}
                    />
                    <Label className="font-medium">{setting.label}</Label>
                  </div>
                  {setting.enabled && (
                    <Select
                      value={setting.timing}
                      onValueChange={(value) => handleTimingChange(setting.id, value)}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="realtime">リアルタイム</SelectItem>
                        <SelectItem value="15min">15分ごと</SelectItem>
                        <SelectItem value="30min">30分ごと</SelectItem>
                        <SelectItem value="1hour">1時間ごと</SelectItem>
                        <SelectItem value="3hour">3時間ごと</SelectItem>
                        <SelectItem value="6hour">6時間ごと</SelectItem>
                        <SelectItem value="12hour">12時間ごと</SelectItem>
                        <SelectItem value="24hour">24時間ごと</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              ))}
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex justify-end">
            <Button onClick={handleSave} size="lg">
              <Bell className="w-4 h-4 mr-2" />
              設定を保存
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
