import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, CheckCircle2, AlertCircle, RefreshCw, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { IntegrationShopify } from '@/types/schema';

export default function ShopifyIntegrationPage() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [config, setConfig] = useState<Partial<IntegrationShopify>>({
    shop_url: '',
    access_token: '',
    sync_products: false,
    sync_orders: false,
    last_synced_at: undefined,
    status: 'inactive'
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/admin/integrations/shopify');
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
      }
    } catch (error) {
      console.error('Failed to fetch Shopify config:', error);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/integrations/shopify', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });

      if (res.ok) {
        const updatedConfig = await res.json();
        setConfig(updatedConfig);
        toast.success('設定を保存しました');
      } else {
        toast.error('保存に失敗しました');
      }
    } catch (error) {
      toast.error('エラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/admin/integrations/shopify/sync', {
        method: 'POST'
      });

      if (res.ok) {
        const data = await res.json();
        setConfig(prev => ({ ...prev, last_synced_at: new Date().toISOString() }));
        toast.success(`同期が完了しました: 商品 ${data.synced_products}件, 注文 ${data.synced_orders}件`);
      } else {
        toast.error('同期に失敗しました');
      }
    } catch (error) {
      toast.error('同期中にエラーが発生しました');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => setLocation('/admin/integrations')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-[#95BF47]" />
            Shopify連携設定
          </h1>
          <p className="text-muted-foreground">
            Shopifyストアと接続し、商品や注文データを同期します。
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Connection Settings */}
        <Card>
          <CardHeader>
            <CardTitle>接続設定</CardTitle>
            <CardDescription>
              ShopifyストアのURLとAdmin APIアクセストークンを入力してください。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="shop_url">ストアURL (myshopify.com)</Label>
              <Input
                id="shop_url"
                placeholder="example.myshopify.com"
                value={config.shop_url}
                onChange={e => setConfig({ ...config, shop_url: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="access_token">Admin API アクセストークン</Label>
              <Input
                id="access_token"
                type="password"
                placeholder="shpat_xxxxxxxxxxxxxxxx"
                value={config.access_token}
                onChange={e => setConfig({ ...config, access_token: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Shopify管理画面の「アプリと販売チャネル」からカスタムアプリを作成し、トークンを取得してください。
              </p>
            </div>

            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-2">
                Status: 
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  config.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {config.status === 'active' ? (
                    <><CheckCircle2 className="w-3 h-3" /> 接続済み</>
                  ) : (
                    <><AlertCircle className="w-3 h-3" /> 未接続</>
                  )}
                </span>
              </div>
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? '保存中...' : '保存して接続テスト'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sync Settings */}
        <Card>
          <CardHeader>
            <CardTitle>同期設定</CardTitle>
            <CardDescription>
              自動同期するデータを選択してください。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">商品データの同期</Label>
                <p className="text-sm text-muted-foreground">
                  Shopifyの商品情報をLカートの商品マスタとして取り込みます。
                </p>
              </div>
              <Switch
                checked={config.sync_products}
                onCheckedChange={checked => setConfig({ ...config, sync_products: checked })}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">注文データの同期</Label>
                <p className="text-sm text-muted-foreground">
                  Shopifyで発生した注文をLカートに取り込みます。
                </p>
              </div>
              <Switch
                checked={config.sync_orders}
                onCheckedChange={checked => setConfig({ ...config, sync_orders: checked })}
              />
            </div>

            <div className="bg-slate-50 p-4 rounded-lg flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                最終同期: {config.last_synced_at ? new Date(config.last_synced_at).toLocaleString() : '未実行'}
              </div>
              <Button variant="outline" size="sm" onClick={handleSync} disabled={isSyncing || config.status !== 'active'}>
                {isSyncing ? (
                  <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> 同期中...</>
                ) : (
                  <><RefreshCw className="mr-2 h-4 w-4" /> 今すぐ同期</>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
