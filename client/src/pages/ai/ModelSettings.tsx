import React, { useState } from "react";
import { PageTemplate } from "@/components/page-template";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Settings,
  Key,
  Cpu,
  FileText,
  Save,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Edit,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

// Types
interface PromptTemplate {
  id: string;
  name: string;
  category: string;
  prompt: string;
  variables: string[];
}

export default function ModelSettingsPage() {
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKey, setApiKey] = useState("sk-proj-••••••••••••••••••••••••••••••••");
  const [selectedModel, setSelectedModel] = useState("gpt-4");
  const [temperature, setTemperature] = useState("0.7");
  const [maxTokens, setMaxTokens] = useState("2000");
  const [enableStreaming, setEnableStreaming] = useState(true);

  // Prompt templates
  const [templates, setTemplates] = useState<PromptTemplate[]>([
    {
      id: "1",
      name: "一斉配信メッセージ生成",
      category: "メッセージ配信",
      prompt: "以下の条件でLINEメッセージを作成してください:\n\n目的: {purpose}\n対象: {target}\nトーン: {tone}\n\n要件:\n- 親しみやすく、行動を促す内容にする\n- 絵文字を適度に使用する\n- 200文字以内に収める",
      variables: ["purpose", "target", "tone"]
    },
    {
      id: "2",
      name: "売上分析レポート生成",
      category: "分析レポート",
      prompt: "以下のデータに基づいて売上分析レポートを作成してください:\n\n期間: {period}\n売上: {revenue}\n注文数: {orders}\n新規顧客: {new_customers}\n\n以下の項目を含めてください:\n1. 主要指標のサマリー\n2. 前期比較と傾向分析\n3. 注目すべき洞察\n4. 具体的な改善提案",
      variables: ["period", "revenue", "orders", "new_customers"]
    },
    {
      id: "3",
      name: "EC KPI改善提案",
      category: "分析レポート",
      prompt: "以下のEC KPIデータを分析し、改善提案を作成してください:\n\nCVR: {cvr}%\nAOV: ¥{aov}\nCAC: ¥{cac}\nLTV: ¥{ltv}\nリピート率: {repeat_rate}%\n\n各指標について:\n1. 現状評価\n2. 業界平均との比較\n3. 具体的な改善アクション（優先度付き）",
      variables: ["cvr", "aov", "cac", "ltv", "repeat_rate"]
    }
  ]);

  const handleSaveSettings = () => {
    toast.success("設定を保存しました");
  };

  const handleTestConnection = async () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: "接続をテスト中...",
        success: "接続に成功しました",
        error: "接続に失敗しました"
      }
    );
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates(templates.filter(t => t.id !== id));
    toast.success("テンプレートを削除しました");
  };

  return (
    <PageTemplate
      title="AIモデル設定"
      description="使用するAIモデルやプロンプトのカスタマイズを行います。"
      breadcrumbs={[{ label: "AI" }, { label: "モデル設定" }]}
    >
      <Tabs defaultValue="api" className="space-y-6">
        <TabsList>
          <TabsTrigger value="api" className="gap-2">
            <Key className="w-4 h-4" />
            API設定
          </TabsTrigger>
          <TabsTrigger value="model" className="gap-2">
            <Cpu className="w-4 h-4" />
            モデル設定
          </TabsTrigger>
          <TabsTrigger value="prompts" className="gap-2">
            <FileText className="w-4 h-4" />
            プロンプトテンプレート
          </TabsTrigger>
        </TabsList>

        {/* API Settings */}
        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                OpenAI API設定
              </CardTitle>
              <CardDescription>
                OpenAI APIキーを設定して、AI機能を有効化します。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="apiKey">APIキー</Label>
                <div className="flex gap-2 mt-1">
                  <div className="relative flex-1">
                    <Input
                      id="apiKey"
                      type={showApiKey ? "text" : "password"}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="sk-proj-..."
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <Button variant="outline" onClick={handleTestConnection}>
                    接続テスト
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  OpenAIのダッシュボードから取得できます。
                  <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-[#06C755] hover:underline ml-1">
                    APIキーを取得 →
                  </a>
                </p>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-medium">接続ステータス</div>
                    <div className="text-sm text-gray-500">現在の接続状態</div>
                  </div>
                  <Badge className="bg-green-100 text-green-700 border-green-200">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    接続済み
                  </Badge>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button onClick={handleSaveSettings} className="gap-2">
                  <Save className="w-4 h-4" />
                  設定を保存
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>使用量</CardTitle>
              <CardDescription>
                今月のAPI使用量とコスト
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4">
                  <div className="text-sm text-gray-500 mb-1">総リクエスト数</div>
                  <div className="text-2xl font-bold">1,247回</div>
                </div>
                <div className="border rounded-lg p-4">
                  <div className="text-sm text-gray-500 mb-1">総トークン数</div>
                  <div className="text-2xl font-bold">342,156</div>
                </div>
                <div className="border rounded-lg p-4">
                  <div className="text-sm text-gray-500 mb-1">推定コスト</div>
                  <div className="text-2xl font-bold">¥4,280</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Model Settings */}
        <TabsContent value="model" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="w-5 h-5" />
                モデル設定
              </CardTitle>
              <CardDescription>
                使用するAIモデルとパラメータを設定します。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="model">使用モデル</Label>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger id="model">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4">GPT-4（推奨）</SelectItem>
                    <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                    <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  GPT-4は高品質な出力を生成しますが、コストが高くなります。
                </p>
              </div>

              <div>
                <Label htmlFor="temperature">Temperature（創造性）</Label>
                <div className="flex items-center gap-4 mt-1">
                  <Input
                    id="temperature"
                    type="number"
                    min="0"
                    max="2"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value)}
                    className="w-24"
                  />
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value)}
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  0に近いほど確定的、2に近いほど創造的な出力になります。
                </p>
              </div>

              <div>
                <Label htmlFor="maxTokens">最大トークン数</Label>
                <Input
                  id="maxTokens"
                  type="number"
                  min="100"
                  max="4000"
                  step="100"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(e.target.value)}
                  className="w-32"
                />
                <p className="text-xs text-gray-500 mt-1">
                  生成される応答の最大長を制限します。
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <div className="font-medium">ストリーミング出力</div>
                  <div className="text-sm text-gray-500">リアルタイムで応答を表示</div>
                </div>
                <Switch
                  checked={enableStreaming}
                  onCheckedChange={setEnableStreaming}
                />
              </div>

              <div className="pt-4 border-t">
                <Button onClick={handleSaveSettings} className="gap-2">
                  <Save className="w-4 h-4" />
                  設定を保存
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Prompt Templates */}
        <TabsContent value="prompts" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    プロンプトテンプレート
                  </CardTitle>
                  <CardDescription>
                    AI機能で使用するプロンプトテンプレートを管理します。
                  </CardDescription>
                </div>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  新規作成
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {templates.map(template => (
                  <Card key={template.id} className="border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{template.name}</h4>
                            <Badge variant="outline">{template.category}</Badge>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>変数: {template.variables.join(", ")}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDeleteTemplate(template.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded p-3 text-sm text-gray-700 font-mono whitespace-pre-wrap">
                        {template.prompt}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageTemplate>
  );
}
