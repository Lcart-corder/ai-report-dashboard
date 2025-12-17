import { useState } from "react";
import { PageTemplate } from "@/components/page-template";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Save, Bell, Keyboard, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";

export default function ChatSettingsPage() {
  const [settings, setSettings] = useState({
    sendShortcut: "enter", // enter | ctrl_enter
    enableUrlShortener: true,
    shortUrlDomain: "lme.jp",
    enableDesktopNotification: true,
    enableEmailNotification: false,
    notificationEmail: "admin@example.com",
    showReadStatus: true,
  });

  const handleSave = () => {
    // API call would go here
    toast.success("設定を保存しました");
  };

  return (
    <PageTemplate 
      title="チャット設定" 
      description="1:1チャットの動作や表示に関する設定を行います。"
      breadcrumbs={[{ label: "1:1チャット", href: "/chats" }, { label: "設定" }]}
    >
      <div className="space-y-6 max-w-3xl mx-auto">
        {/* 送信設定 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Keyboard className="h-5 w-5 text-muted-foreground" />
              <CardTitle>操作設定</CardTitle>
            </div>
            <CardDescription>メッセージの送信方法や表示設定を行います</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label className="text-base">メッセージ送信ショートカット</Label>
              <RadioGroup 
                value={settings.sendShortcut} 
                onValueChange={(val) => setSettings({...settings, sendShortcut: val})}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="enter" id="r1" />
                  <Label htmlFor="r1" className="cursor-pointer">Enterキーで送信 (Shift+Enterで改行)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ctrl_enter" id="r2" />
                  <Label htmlFor="r2" className="cursor-pointer">Ctrl(Command) + Enterキーで送信 (Enterで改行)</Label>
                </div>
              </RadioGroup>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">既読状態の表示</Label>
                <p className="text-sm text-muted-foreground">
                  ユーザーがメッセージを読んだかどうかを表示します
                </p>
              </div>
              <Switch 
                checked={settings.showReadStatus}
                onCheckedChange={(c) => setSettings({...settings, showReadStatus: c})}
              />
            </div>
          </CardContent>
        </Card>

        {/* URL短縮設定 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5 text-muted-foreground" />
              <CardTitle>URL短縮設定</CardTitle>
            </div>
            <CardDescription>メッセージ内のURLを自動的に短縮し、クリック数を計測します</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">URL短縮機能を有効にする</Label>
                <p className="text-sm text-muted-foreground">
                  有効にすると、メッセージ入力欄の「短縮URL」ボタンが使用可能になります
                </p>
              </div>
              <Switch 
                checked={settings.enableUrlShortener}
                onCheckedChange={(checked) => setSettings({...settings, enableUrlShortener: checked})}
              />
            </div>

            {settings.enableUrlShortener && (
              <div className="grid gap-2 pl-6 border-l-2 border-muted">
                <Label>使用ドメイン</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    value={settings.shortUrlDomain} 
                    onChange={(e) => setSettings({...settings, shortUrlDomain: e.target.value})}
                    className="max-w-xs"
                  />
                  <span className="text-sm text-muted-foreground">/xxxxxx</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  ※独自ドメインを使用する場合は、ドメイン設定画面での設定が必要です。
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 通知設定 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <CardTitle>通知設定</CardTitle>
            </div>
            <CardDescription>新着メッセージの通知方法を設定します</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">デスクトップ通知</Label>
                <p className="text-sm text-muted-foreground">
                  ブラウザの通知機能を使用して新着メッセージをお知らせします
                </p>
              </div>
              <Switch 
                checked={settings.enableDesktopNotification}
                onCheckedChange={(checked) => setSettings({...settings, enableDesktopNotification: checked})}
              />
            </div>
            
            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">メール通知</Label>
                  <p className="text-sm text-muted-foreground">
                    指定したメールアドレスに新着メッセージをお知らせします
                  </p>
                </div>
                <Switch 
                  checked={settings.enableEmailNotification}
                  onCheckedChange={(checked) => setSettings({...settings, enableEmailNotification: checked})}
                />
              </div>
              
              {settings.enableEmailNotification && (
                <div className="ml-6 pl-4 border-l-2 border-muted">
                  <Label htmlFor="email">通知先メールアドレス</Label>
                  <Input 
                    id="email" 
                    value={settings.notificationEmail}
                    onChange={(e) => setSettings({...settings, notificationEmail: e.target.value})}
                    className="mt-1.5 max-w-md"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} className="w-32 bg-[#06C755] hover:bg-[#05b34c] text-white">
            <Save className="mr-2 h-4 w-4" />
            保存
          </Button>
        </div>
      </div>
    </PageTemplate>
  );
}
