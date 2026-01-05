import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, CheckCircle2, AlertCircle, BarChart } from 'lucide-react';
import { toast } from 'sonner';
import { IntegrationLineAds } from '@/types/schema';

export default function LineAdsIntegrationPage() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState<Partial<IntegrationLineAds>>({
    line_tag_id: '',
    enable_conversion_tracking: false,
    status: 'inactive'
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/admin/integrations/line-ads');
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
      }
    } catch (error) {
      console.error('Failed to fetch LINE Ads config:', error);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/integrations/line-ads', {
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

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => setLocation('/admin/integrations')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BarChart className="h-6 w-6 text-[#06C755]" />
            LINE広告連携
          </h1>
          <p className="text-muted-foreground">
            LINE Tagを設置し、コンバージョン計測やオーディエンス連携を行います。
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>タグ設定</CardTitle>
            <CardDescription>
              LINE広告マネージャーから取得したタグIDを入力してください。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="tag_id">LINE Tag ID</Label>
              <Input
                id="tag_id"
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                value={config.line_tag_id}
                onChange={e => setConfig({ ...config, line_tag_id: e.target.value })}
              />
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
                    <><CheckCircle2 className="w-3 h-3" /> 有効</>
                  ) : (
                    <><AlertCircle className="w-3 h-3" /> 無効</>
                  )}
                </span>
              </div>
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? '保存中...' : '保存'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>計測設定</CardTitle>
            <CardDescription>
              自動計測するイベントを選択してください。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">コンバージョン自動計測</Label>
                <p className="text-sm text-muted-foreground">
                  購入完了ページ（サンクスページ）で自動的にConversionイベントを送信します。
                </p>
              </div>
              <Switch
                checked={config.enable_conversion_tracking}
                onCheckedChange={checked => setConfig({ ...config, enable_conversion_tracking: checked })}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
