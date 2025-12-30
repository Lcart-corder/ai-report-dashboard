import { useState } from "react";
import { Link } from "wouter";
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2, 
  Clock, 
  MessageSquare, 
  GitBranch, 
  GripVertical,
  Settings,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { PageTemplate } from "@/components/page-template";
import { ActionBuilder } from "@/components/actions/ActionBuilder";
import { ActionSetStep } from "@/types/schema";

interface StepNode {
  id: string;
  type: 'message' | 'condition' | 'delay';
  title: string;
  content?: any;
  actions?: ActionSetStep[];
  conditions?: any;
  delay?: {
    value: number;
    unit: 'minutes' | 'hours' | 'days';
  };
}

export default function ScenarioEditorPage() {
  const [scenarioName, setScenarioName] = useState("新規シナリオ");
  const [triggerType, setTriggerType] = useState("friend_added");
  const [steps, setSteps] = useState<StepNode[]>([
    {
      id: "1",
      type: "message",
      title: "1通目：あいさつメッセージ",
      actions: [],
      delay: { value: 0, unit: 'minutes' } // 即時
    }
  ]);
  
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [isActionBuilderOpen, setIsActionBuilderOpen] = useState(false);

  const handleAddStep = (type: 'message' | 'condition' | 'delay') => {
    const newStep: StepNode = {
      id: Date.now().toString(),
      type,
      title: type === 'message' ? `${steps.length + 1}通目：メッセージ` : 
             type === 'condition' ? '条件分岐' : '待機時間',
      actions: [],
      delay: { value: 1, unit: 'days' }
    };
    setSteps([...steps, newStep]);
  };

  const handleRemoveStep = (id: string) => {
    if (confirm("このステップを削除してもよろしいですか？")) {
      setSteps(steps.filter(s => s.id !== id));
    }
  };

  const handleEditActions = (stepId: string) => {
    setEditingStepId(stepId);
    setIsActionBuilderOpen(true);
  };

  const handleSaveActions = (newActions: ActionSetStep[]) => {
    if (editingStepId) {
      setSteps(steps.map(s => s.id === editingStepId ? { ...s, actions: newActions } : s));
      setEditingStepId(null);
      setIsActionBuilderOpen(false);
    }
  };

  return (
    <PageTemplate 
      title="シナリオ編集" 
      breadcrumbs={[
        { label: "メッセージ", href: "/messages/step" }, 
        { label: "ステップ配信", href: "/messages/step" },
        { label: "編集" }
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Scenario Settings & Flow */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Settings */}
          <Card>
            <CardHeader>
              <CardTitle>基本設定</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>シナリオ名 <span className="text-red-500">*</span></Label>
                <Input value={scenarioName} onChange={(e) => setScenarioName(e.target.value)} />
              </div>
              
              <div className="space-y-2">
                <Label>開始トリガー</Label>
                <Select value={triggerType} onValueChange={setTriggerType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="friend_added">友だち追加時</SelectItem>
                    <SelectItem value="tag_added">タグが付与された時</SelectItem>
                    <SelectItem value="manual">手動実行のみ</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {triggerType === 'tag_added' && (
                <div className="space-y-2 pl-4 border-l-2 border-blue-100">
                  <Label>トリガーとなるタグ</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="タグを選択..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tag1">購入者</SelectItem>
                      <SelectItem value="tag2">VIP会員</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Step Flow Editor */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-800">配信フロー</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleAddStep('condition')}>
                  <GitBranch className="mr-2 h-4 w-4" /> 分岐を追加
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleAddStep('message')}>
                  <Plus className="mr-2 h-4 w-4" /> メッセージを追加
                </Button>
              </div>
            </div>

            <div className="space-y-4 relative pb-20">
              {/* Vertical Line */}
              <div className="absolute left-8 top-4 bottom-0 w-0.5 bg-slate-200 -z-10"></div>

              {steps.map((step, index) => (
                <div key={step.id} className="relative pl-16 group">
                  {/* Step Number/Icon */}
                  <div className="absolute left-4 top-6 -translate-x-1/2 w-8 h-8 rounded-full bg-white border-2 border-slate-300 flex items-center justify-center z-10 text-xs font-bold text-slate-500">
                    {index + 1}
                  </div>

                  <Card className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-2">
                            {step.type === 'message' && <MessageSquare className="h-4 w-4 text-blue-500" />}
                            {step.type === 'condition' && <GitBranch className="h-4 w-4 text-orange-500" />}
                            {step.type === 'delay' && <Clock className="h-4 w-4 text-slate-500" />}
                            <Input 
                              value={step.title} 
                              onChange={(e) => setSteps(steps.map(s => s.id === step.id ? { ...s, title: e.target.value } : s))}
                              className="h-8 font-medium border-transparent hover:border-input focus:border-input transition-colors"
                            />
                          </div>

                          {/* Step Content based on Type */}
                          {step.type === 'message' && (
                            <div className="space-y-3 pl-6">
                              <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Clock className="h-4 w-4" />
                                <span>待機時間: </span>
                                <Input 
                                  type="number" 
                                  className="w-16 h-8" 
                                  value={step.delay?.value}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    setSteps(steps.map(s => s.id === step.id ? { ...s, delay: { ...s.delay!, value: val } } : s));
                                  }}
                                />
                                <Select 
                                  value={step.delay?.unit}
                                  onValueChange={(v: any) => setSteps(steps.map(s => s.id === step.id ? { ...s, delay: { ...s.delay!, unit: v } } : s))}
                                >
                                  <SelectTrigger className="w-24 h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="minutes">分後</SelectItem>
                                    <SelectItem value="hours">時間後</SelectItem>
                                    <SelectItem value="days">日後</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="bg-slate-50 p-3 rounded border">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium">配信内容</span>
                                  <Button variant="ghost" size="sm" className="h-6 text-blue-600" onClick={() => handleEditActions(step.id)}>
                                    <Settings className="mr-1 h-3 w-3" /> 編集
                                  </Button>
                                </div>
                                {step.actions && step.actions.length > 0 ? (
                                  <div className="flex flex-wrap gap-2">
                                    {step.actions.map((action, i) => (
                                      <Badge key={i} variant="secondary" className="bg-white border">
                                        {action.action_type === 'text_message' ? 'テキスト' : 
                                         action.action_type === 'template_message' ? 'テンプレート' : 'アクション'}
                                      </Badge>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-sm text-slate-400 flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" /> メッセージが設定されていません
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {step.type === 'condition' && (
                            <div className="pl-6 space-y-3">
                              <div className="bg-orange-50 p-3 rounded border border-orange-100">
                                <div className="space-y-2">
                                  <Label className="text-xs text-orange-800 font-bold">条件設定</Label>
                                  <div className="flex items-center gap-2">
                                    <Select defaultValue="tag">
                                      <SelectTrigger className="h-8 bg-white">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="tag">タグ</SelectItem>
                                        <SelectItem value="friend_info">友だち情報</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <span className="text-sm">が</span>
                                    <Select defaultValue="exists">
                                      <SelectTrigger className="h-8 bg-white">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="exists">付いている</SelectItem>
                                        <SelectItem value="not_exists">付いていない</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <span className="text-sm">場合</span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-xs text-slate-500">
                                ※ 条件に合致する場合は次のステップへ進み、合致しない場合はシナリオを終了または別のシナリオへ移動します。
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 cursor-move">
                            <GripVertical className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50" onClick={() => handleRemoveStep(step.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}

              {/* Add Button at Bottom */}
              <div className="pl-16 pt-4">
                <Button variant="outline" className="w-full border-dashed text-slate-500 hover:text-slate-700 hover:bg-slate-50" onClick={() => handleAddStep('message')}>
                  <Plus className="mr-2 h-4 w-4" /> ステップを追加
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Preview & Status */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>公開設定</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>シナリオの稼働</Label>
                <Switch />
              </div>
              <div className="text-xs text-slate-500">
                稼働中にすると、条件を満たした友だちに対して自動的に配信が開始されます。
              </div>
              <Button className="w-full bg-[#06C755] hover:bg-[#05b34c] text-white">
                <Save className="mr-2 h-4 w-4" /> 保存して公開
              </Button>
            </CardContent>
          </Card>

          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>プレビュー</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-3xl overflow-hidden bg-white shadow-xl max-w-[300px] mx-auto aspect-[9/19] relative flex flex-col">
                {/* Mock Phone Header */}
                <div className="bg-slate-800 text-white p-3 text-xs flex justify-between items-center shrink-0">
                  <span>9:41</span>
                  <div className="flex gap-1">
                    <div className="w-3 h-3 bg-white rounded-full opacity-20"></div>
                    <div className="w-3 h-3 bg-white rounded-full opacity-20"></div>
                  </div>
                </div>
                
                {/* Chat Content */}
                <div className="flex-1 overflow-y-auto bg-[#8cabd9] p-2 space-y-4">
                  {steps.filter(s => s.type === 'message').map((step, i) => (
                    <div key={step.id} className="space-y-1">
                      {i > 0 && (
                        <div className="text-[10px] text-center text-white/80 my-2">
                          {step.delay?.value}{step.delay?.unit === 'days' ? '日後' : step.delay?.unit === 'hours' ? '時間後' : '分後'}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <div className="w-8 h-8 rounded-full bg-white shrink-0"></div>
                        <div className="bg-white p-2 rounded-lg rounded-tl-none text-xs max-w-[80%] shadow-sm">
                          {step.actions && step.actions.length > 0 
                            ? (step.actions[0].action_payload_json as any).text || '（メッセージ内容）'
                            : '（メッセージ未設定）'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ActionBuilder
        isOpen={isActionBuilderOpen}
        onClose={() => setIsActionBuilderOpen(false)}
        onSave={handleSaveActions}
        initialSteps={editingStepId ? steps.find(s => s.id === editingStepId)?.actions : []}
        triggerName="ステップ配信メッセージ"
      />
    </PageTemplate>
  );
}
