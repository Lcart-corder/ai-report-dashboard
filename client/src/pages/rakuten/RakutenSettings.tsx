import React, { useState } from "react";
import { PageTemplate } from "@/components/page-template";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, RefreshCw, CheckCircle2, AlertCircle, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export default function RakutenSettingsPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    shopUrl: "",
    licenseKey: "",
    serviceSecret: ""
  });

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsConnected(true);
      toast.success("楽天店舗と連携しました");
    }, 1500);
  };

  const handleDisconnect = () => {
    if (confirm("連携を解除してもよろしいですか？\n連携済みのデータは保持されますが、新規注文の同期は停止します。")) {
      setIsConnected(false);
      setFormData({ shopUrl: "", licenseKey: "", serviceSecret: "" });
      toast.success("連携を解除しました");
    }
  };

  return (
    <PageTemplate 
      title="楽天連携設定" 
      description="楽天市場の店舗と連携し、注文情報の同期や購入者へのメッセージ配信を自動化します。"
      breadcrumbs={[{ label: "楽天連携" }, { label: "連携設定" }]}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              連携ステータス
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border">
              <div className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500" : "bg-gray-300"}`} />
                <div>
                  <div className="font-bold text-lg">
                    {isConnected ? "連携中" : "未連携"}
                  </div>
                  {isConnected && (
                    <div className="text-sm text-gray-500">
                      最終同期: {new Date().toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
              {isConnected && (
                <Button variant="outline" size="sm" className="gap-2">
                  <RefreshCw className="w-4 h-4" />
                  手動同期
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Connection Form */}
        <Card>
          <CardHeader>
            <CardTitle>接続設定</CardTitle>
            <CardDescription>
              RMS（楽天マーチャントサーバー）のAPI情報を入力してください。
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isConnected ? (
              <form onSubmit={handleConnect} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="shopUrl">店舗URL</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">https://www.rakuten.co.jp/</span>
                    <Input 
                      id="shopUrl" 
                      placeholder="shop-id" 
                      value={formData.shopUrl}
                      onChange={(e) => setFormData({...formData, shopUrl: e.target.value})}
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500">店舗トップページのURL末尾のIDを入力してください。</p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="licenseKey">ライセンスキー (License Key)</Label>
                  <Input 
                    id="licenseKey" 
                    type="password"
                    value={formData.licenseKey}
                    onChange={(e) => setFormData({...formData, licenseKey: e.target.value})}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="serviceSecret">サービスシークレット (Service Secret)</Label>
                  <Input 
                    id="serviceSecret" 
                    type="password"
                    value={formData.serviceSecret}
                    onChange={(e) => setFormData({...formData, serviceSecret: e.target.value})}
                    required
                  />
                </div>

                <Alert className="bg-blue-50 border-blue-200 text-blue-800">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>APIキーの取得方法</AlertTitle>
                  <AlertDescription className="text-xs mt-1">
                    RMSにログインし、「拡張サービス一覧」→「WEB APIサービス」から新しいキーを発行してください。
                    <a href="#" className="underline ml-1 inline-flex items-center gap-1">
                      マニュアルを見る <ExternalLink className="w-3 h-3" />
                    </a>
                  </AlertDescription>
                </Alert>

                <div className="flex justify-end pt-4">
                  <Button type="submit" className="bg-[#BF0000] hover:bg-[#990000] text-white w-full sm:w-auto" disabled={isLoading}>
                    {isLoading ? "接続確認中..." : "楽天店舗と連携する"}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <Label className="text-gray-500 text-xs">店舗URL</Label>
                    <div className="font-medium mt-1">https://www.rakuten.co.jp/{formData.shopUrl}</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <Label className="text-gray-500 text-xs">ライセンスキー</Label>
                    <div className="font-medium mt-1">••••••••••••••••</div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-bold mb-4">自動同期設定</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">注文情報の同期</div>
                        <div className="text-sm text-gray-500">新規注文を自動的に取り込みます（15分間隔）</div>
                      </div>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">有効</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">発送ステータスの同期</div>
                        <div className="text-sm text-gray-500">発送完了メールをLINEで送信するために必要です</div>
                      </div>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">有効</Badge>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleDisconnect}>
                    連携を解除する
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageTemplate>
  );
}
