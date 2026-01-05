import React, { useState } from 'react';
import { PageTemplate } from '@/components/page-template';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Bot, Save, ExternalLink, RefreshCw } from 'lucide-react';

export default function ChatGPTSettingsPage() {
  const [settings, setSettings] = useState({
    enabled: false,
    apiKey: '',
    model: 'gpt-4o',
    systemPrompt: 'あなたは親切なカスタマーサポートのアシスタントです。お客様からの問い合わせに対して、丁寧かつ簡潔に回答してください。',
    maxTokens: 500,
    temperature: 0.7
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('ChatGPT連携設定を保存しました');
  };

  return (
    <PageTemplate
      title="ChatGPT連携設定"
      description="OpenAIのAPIを使用して、AIによる自動応答機能を有効にします。"
      breadcrumbs={[
        { label: "連携設定", href: "/admin/integrations" },
        { label: "ChatGPT連携" }
      ]}
    >
      <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#10A37F]/10 rounded-lg">
                  <Bot className="h-6 w-6 text-[#10A37F]" />
                </div>
                <div>
                  <CardTitle>基本設定</CardTitle>
                  <CardDescription>ChatGPT連携の有効化とAPIキーの設定を行います。</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="enabled" className="cursor-pointer">連携を有効にする</Label>
                <Switch 
                  id="enabled" 
                  checked={settings.enabled}
                  onCheckedChange={(checked) => setSettings({...settings, enabled: checked})}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="apiKey">OpenAI API Key</Label>
              <div className="flex gap-2">
                <Input 
                  id="apiKey" 
                  type="password" 
                  placeholder="sk-..." 
                  value={settings.apiKey}
                  onChange={(e) => setSettings({...settings, apiKey: e.target.value})}
                />
                <Button type="button" variant="outline" onClick={() => toast.info('接続テストを実行しました（成功）')}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  接続テスト
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                APIキーは <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline inline-flex items-center">OpenAI Platform <ExternalLink className="w-3 h-3 ml-0.5" /></a> から取得できます。
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="model">使用モデル</Label>
              <Select 
                value={settings.model} 
                onValueChange={(val) => setSettings({...settings, model: val})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="モデルを選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4o">GPT-4o (推奨)</SelectItem>
                  <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                  <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>プロンプト設定</CardTitle>
            <CardDescription>AIの振る舞いや応答のトーンを設定します。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="systemPrompt">システムプロンプト</Label>
              <Textarea 
                id="systemPrompt" 
                className="min-h-[150px]"
                placeholder="AIへの指示を入力してください..."
                value={settings.systemPrompt}
                onChange={(e) => setSettings({...settings, systemPrompt: e.target.value})}
              />
              <p className="text-xs text-muted-foreground">
                AIの役割、口調、禁止事項などを具体的に指示することで、より適切な応答が可能になります。
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="maxTokens">最大トークン数</Label>
                <Input 
                  id="maxTokens" 
                  type="number" 
                  value={settings.maxTokens}
                  onChange={(e) => setSettings({...settings, maxTokens: parseInt(e.target.value)})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="temperature">Temperature (創造性: 0.0 - 1.0)</Label>
                <Input 
                  id="temperature" 
                  type="number" 
                  step="0.1" 
                  min="0" 
                  max="1"
                  value={settings.temperature}
                  onChange={(e) => setSettings({...settings, temperature: parseFloat(e.target.value)})}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" className="bg-[#06C755] hover:bg-[#05b34c] text-white">
            <Save className="w-4 h-4 mr-2" />
            設定を保存
          </Button>
        </div>
      </form>
    </PageTemplate>
  );
}
