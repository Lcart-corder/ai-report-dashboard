import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Copy, CheckCircle2, AlertCircle, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { IntegrationLineOfficial } from '@/types/schema';

export default function LineOfficialIntegrationPage() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState<Partial<IntegrationLineOfficial>>({
    channel_id: '',
    channel_secret: '',
    webhook_url: 'https://api.l-cart.com/webhook/line/callback', // ダミーURL
    status: 'inactive'
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/admin/integrations/line-official');
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
      }
    } catch (error) {
      console.error('Failed to fetch LINE config:', error);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/integrations/line-official', {
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

  const copyWebhookUrl = () => {
    if (config.webhook_url) {
      navigator.clipboard.writeText(config.webhook_url);
      toast.success('Webhook URLをコピーしました');
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
            <MessageCircle className="h-6 w-6 text-[#06C755]" />
            LINE公式アカウント連携
          </h1>
          <p className="text-muted-foreground">
            Messaging APIを使用して、LカートとLINE公式アカウントを接続します。
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>チャネル設定</CardTitle>
            <CardDescription>
              LINE DevelopersコンソールからChannel IDとChannel Secretを取得して入力してください。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="channel_id">Channel ID</Label>
              <Input
                id="channel_id"
                placeholder="1234567890"
                value={config.channel_id}
                onChange={e => setConfig({ ...config, channel_id: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="channel_secret">Channel Secret</Label>
              <Input
                id="channel_secret"
                type="password"
                placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                value={config.channel_secret}
                onChange={e => setConfig({ ...config, channel_secret: e.target.value })}
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

        <Card>
          <CardHeader>
            <CardTitle>Webhook設定</CardTitle>
            <CardDescription>
              以下のURLをLINE DevelopersコンソールのWebhook URLに設定してください。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Input readOnly value={config.webhook_url} className="bg-slate-50 font-mono text-sm" />
              <Button variant="outline" size="icon" onClick={copyWebhookUrl}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              ※ Webhookの利用を有効にすることを忘れないでください。
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
