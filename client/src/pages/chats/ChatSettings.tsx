import React, { useState } from "react";
import { PageTemplate } from "@/components/page-template";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { MessageSquare, Link as LinkIcon, Keyboard } from "lucide-react";

export default function ChatSettingsPage() {
  const [settings, setSettings] = useState({
    useShortUrl: true,
    shortUrlDomain: "lme.jp",
    sendShortcut: "enter", // enter or cmd_enter
    showReadStatus: true,
  });

  const handleSave = () => {
    toast.success("設定を保存しました");
  };

  return (
    <PageTemplate 
      title="チャット設定" 
      description="1:1チャットの動作や表示に関する設定を行います。"
      breadcrumbs={[{ label: "1:1チャット" }, { label: "設定" }]}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Short URL Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="w-5 h-5" />
              短縮URL設定
            </CardTitle>
            <CardDescription>
              チャット内で送信するURLを自動的に短縮URLに変換するか設定します。
              短縮URLを使用すると、クリック数の計測が可能になります。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">短縮URLを使用する</Label>
                <p className="text-sm text-gray-500">
                  URLを自動的に短縮し、クリック分析を有効にします
                </p>
              </div>
              <Switch 
                checked={settings.useShortUrl}
                onCheckedChange={(c) => setSettings({...settings, useShortUrl: c})}
              />
            </div>

            {settings.useShortUrl && (
              <div className="grid gap-2 pl-6 border-l-2 border-gray-100">
                <Label>使用ドメイン</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    value={settings.shortUrlDomain} 
                    onChange={(e) => setSettings({...settings, shortUrlDomain: e.target.value})}
                    className="max-w-xs"
                  />
                  <span className="text-sm text-gray-500">/xxxxxx</span>
                </div>
                <p className="text-xs text-gray-500">
                  ※独自ドメインを使用する場合は、ドメイン設定画面での設定が必要です。
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Operation Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Keyboard className="w-5 h-5" />
              操作設定
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label className="text-base">メッセージ送信ショートカット</Label>
              <RadioGroup 
                value={settings.sendShortcut} 
                onValueChange={(v) => setSettings({...settings, sendShortcut: v})}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="enter" id="r1" />
                  <Label htmlFor="r1">Enterキーで送信 (Shift+Enterで改行)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cmd_enter" id="r2" />
                  <Label htmlFor="r2">Command(Ctrl) + Enterキーで送信 (Enterで改行)</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="space-y-0.5">
                <Label className="text-base">既読状態の表示</Label>
                <p className="text-sm text-gray-500">
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

        <div className="flex justify-end">
          <Button onClick={handleSave} className="bg-[#06C755] hover:bg-[#05b34c] text-white w-full sm:w-auto">
            設定を保存する
          </Button>
        </div>
      </div>
    </PageTemplate>
  );
}
