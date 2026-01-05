import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, GripVertical, Plus, Save, Trash2, Settings, Image as ImageIcon, Calendar as CalendarIcon, Type, List, CheckSquare, ChevronDown, Upload } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { PageTemplate } from "@/components/page-template";
import { ActionBuilder } from "@/components/actions/ActionBuilder";
import { ActionSetStep } from "@/types/schema";
import { toast } from "sonner";

// Types
interface Question {
  id: number;
  type: 'text' | 'textarea' | 'radio' | 'checkbox' | 'dropdown' | 'date' | 'image';
  label: string;
  required: boolean;
  options?: string[]; // For radio, checkbox, dropdown
  placeholder?: string;
}

interface FormSettings {
  title: string;
  description: string;
  headerImage?: string;
  themeColor: string;
  submitButtonText: string;
  deadline?: string;
  limit: 'once' | 'unlimited';
}

export default function FormCreatePage() {
  const [activeTab, setActiveTab] = useState("editor");
  
  const [settings, setSettings] = useState<FormSettings>({
    title: "",
    description: "",
    themeColor: "#06C755",
    submitButtonText: "回答する",
    limit: "once"
  });

  const [questions, setQuestions] = useState<Question[]>([
    { id: 1, type: "text", label: "お名前", required: true, placeholder: "山田 太郎" },
    { id: 2, type: "radio", label: "性別", required: true, options: ["男性", "女性", "その他"] },
  ]);

  const [actions, setActions] = useState<ActionSetStep[]>([]);
  const [isActionBuilderOpen, setIsActionBuilderOpen] = useState(false);

  // Handlers
  const addQuestion = (type: Question['type']) => {
    const newQuestion: Question = {
      id: Date.now(),
      type,
      label: "新しい質問",
      required: false,
      options: (type === 'radio' || type === 'checkbox' || type === 'dropdown') ? ["選択肢1", "選択肢2"] : undefined
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (id: number, field: keyof Question, value: any) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const removeQuestion = (id: number) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const addOption = (qId: number) => {
    setQuestions(questions.map(q => {
      if (q.id === qId && q.options) {
        return { ...q, options: [...q.options, `選択肢${q.options.length + 1}`] };
      }
      return q;
    }));
  };

  const updateOption = (qId: number, index: number, value: string) => {
    setQuestions(questions.map(q => {
      if (q.id === qId && q.options) {
        const newOptions = [...q.options];
        newOptions[index] = value;
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const removeOption = (qId: number, index: number) => {
    setQuestions(questions.map(q => {
      if (q.id === qId && q.options) {
        return { ...q, options: q.options.filter((_, i) => i !== index) };
      }
      return q;
    }));
  };

  const handleSave = () => {
    if (!settings.title) {
      toast.error("フォーム名を入力してください");
      return;
    }
    toast.success("回答フォームを保存しました");
  };

  return (
    <PageTemplate 
      title="回答フォーム作成" 
      description="アンケートや申し込みフォームを作成します。"
      breadcrumbs={[{ label: "フォーム", href: "/forms" }, { label: "作成" }]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Editor */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="editor">質問項目</TabsTrigger>
              <TabsTrigger value="design">デザイン・設定</TabsTrigger>
              <TabsTrigger value="actions">アクション</TabsTrigger>
            </TabsList>

            {/* Questions Editor */}
            <TabsContent value="editor" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>質問を追加</CardTitle>
                  <CardDescription>追加したい質問タイプを選択してください。</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-2">
                    <Button variant="outline" className="flex flex-col h-auto py-3 gap-1" onClick={() => addQuestion('text')}>
                      <Type className="h-5 w-5" />
                      <span className="text-xs">短文</span>
                    </Button>
                    <Button variant="outline" className="flex flex-col h-auto py-3 gap-1" onClick={() => addQuestion('textarea')}>
                      <List className="h-5 w-5" />
                      <span className="text-xs">長文</span>
                    </Button>
                    <Button variant="outline" className="flex flex-col h-auto py-3 gap-1" onClick={() => addQuestion('radio')}>
                      <CheckSquare className="h-5 w-5" />
                      <span className="text-xs">単一選択</span>
                    </Button>
                    <Button variant="outline" className="flex flex-col h-auto py-3 gap-1" onClick={() => addQuestion('checkbox')}>
                      <CheckSquare className="h-5 w-5" />
                      <span className="text-xs">複数選択</span>
                    </Button>
                    <Button variant="outline" className="flex flex-col h-auto py-3 gap-1" onClick={() => addQuestion('dropdown')}>
                      <ChevronDown className="h-5 w-5" />
                      <span className="text-xs">プルダウン</span>
                    </Button>
                    <Button variant="outline" className="flex flex-col h-auto py-3 gap-1" onClick={() => addQuestion('date')}>
                      <CalendarIcon className="h-5 w-5" />
                      <span className="text-xs">日程</span>
                    </Button>
                    <Button variant="outline" className="flex flex-col h-auto py-3 gap-1" onClick={() => addQuestion('image')}>
                      <ImageIcon className="h-5 w-5" />
                      <span className="text-xs">画像</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                {questions.map((q, index) => (
                  <Card key={q.id} className="relative group border-l-4 border-l-[#06C755]">
                    <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => removeQuestion(q.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardContent className="pt-6 space-y-4">
                      <div className="flex gap-4 items-start">
                        <div className="mt-2 cursor-move text-muted-foreground">
                          <GripVertical className="h-5 w-5" />
                        </div>
                        <div className="flex-1 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>質問ラベル</Label>
                              <Input 
                                value={q.label} 
                                onChange={(e) => updateQuestion(q.id, 'label', e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>プレースホルダー / 説明</Label>
                              <Input 
                                value={q.placeholder || ''} 
                                onChange={(e) => updateQuestion(q.id, 'placeholder', e.target.value)}
                                placeholder="入力例などを記述"
                              />
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id={`required-${q.id}`} 
                              checked={q.required}
                              onCheckedChange={(checked) => updateQuestion(q.id, 'required', checked)}
                            />
                            <Label htmlFor={`required-${q.id}`}>必須項目にする</Label>
                          </div>

                          {(q.type === 'radio' || q.type === 'checkbox' || q.type === 'dropdown') && (
                            <div className="space-y-2 pl-4 border-l-2 bg-slate-50 p-3 rounded">
                              <Label>選択肢設定</Label>
                              <div className="space-y-2">
                                {q.options?.map((opt, idx) => (
                                  <div key={idx} className="flex gap-2">
                                    <Input 
                                      value={opt} 
                                      onChange={(e) => updateOption(q.id, idx, e.target.value)}
                                    />
                                    <Button variant="ghost" size="icon" onClick={() => removeOption(q.id, idx)}>
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ))}
                                <Button variant="link" size="sm" onClick={() => addOption(q.id)} className="h-auto p-0 text-blue-600">
                                  + 選択肢を追加
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Design & Settings */}
            <TabsContent value="design" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>基本情報・デザイン</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">フォーム名 <span className="text-red-500">*</span></Label>
                    <Input 
                      id="title" 
                      value={settings.title}
                      onChange={(e) => setSettings({...settings, title: e.target.value})}
                      placeholder="例：お客様アンケート" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">説明文</Label>
                    <Textarea 
                      id="description" 
                      value={settings.description}
                      onChange={(e) => setSettings({...settings, description: e.target.value})}
                      placeholder="フォームの説明を入力してください" 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>ヘッダー画像</Label>
                    <div className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-slate-50 cursor-pointer transition-colors">
                      <ImageIcon className="h-10 w-10 mx-auto text-slate-400 mb-2" />
                      <p className="text-sm text-slate-500">クリックして画像をアップロード</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>テーマカラー</Label>
                      <div className="flex gap-2">
                        <Input 
                          type="color" 
                          value={settings.themeColor}
                          onChange={(e) => setSettings({...settings, themeColor: e.target.value})}
                          className="w-12 h-10 p-1"
                        />
                        <Input 
                          value={settings.themeColor}
                          onChange={(e) => setSettings({...settings, themeColor: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>送信ボタンのテキスト</Label>
                      <Input 
                        value={settings.submitButtonText}
                        onChange={(e) => setSettings({...settings, submitButtonText: e.target.value})}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>制限設定</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>回答期限</Label>
                      <Input type="datetime-local" />
                    </div>
                    <div className="space-y-2">
                      <Label>回答回数制限</Label>
                      <Select 
                        value={settings.limit}
                        onValueChange={(val: any) => setSettings({...settings, limit: val})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="once">1回のみ</SelectItem>
                          <SelectItem value="unlimited">無制限</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Actions */}
            <TabsContent value="actions" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>回答完了時のアクション</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => setIsActionBuilderOpen(true)}>
                    <Settings className="mr-2 h-4 w-4" /> アクション設定
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-slate-50 p-4 rounded-lg border">
                    {actions.length === 0 ? (
                      <div className="text-sm text-slate-500 text-center py-4">
                        アクションは設定されていません
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {actions.map((action, index) => (
                          <div key={index} className="text-sm bg-white p-2 rounded border flex items-center gap-2">
                            <span className="bg-slate-100 text-xs px-2 py-1 rounded text-slate-600">
                              {index + 1}
                            </span>
                            <span>
                              {action.action_type === 'tag' && '【タグ操作】'}
                              {action.action_type === 'text_message' && '【メッセージ送信】'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2 pt-4 border-t">
                    <Label>回答後の表示メッセージ</Label>
                    <Textarea placeholder="回答ありがとうございました。" className="min-h-[100px]" />
                  </div>

                  <div className="flex items-center space-x-2 pt-2">
                    <Switch id="notify-admin" />
                    <Label htmlFor="notify-admin">管理者に通知メールを送る</Label>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column: Preview */}
        <div className="lg:col-span-1">
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
                
                {/* Browser Bar */}
                <div className="bg-slate-100 border-b p-2 text-center text-xs text-slate-500 shrink-0">
                  forms.l-message.jp
                </div>

                {/* Form Content */}
                <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4">
                  <div className="bg-white p-4 rounded-lg shadow-sm space-y-2 border-t-4" style={{ borderColor: settings.themeColor }}>
                    <h3 className="font-bold text-lg">{settings.title || "フォーム名"}</h3>
                    <p className="text-xs text-slate-500 whitespace-pre-wrap">{settings.description || "説明文がここに入ります"}</p>
                  </div>

                  {questions.map((q) => (
                    <div key={q.id} className="bg-white p-3 rounded-lg shadow-sm space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">{q.label}</span>
                        {q.required && <span className="text-[10px] bg-red-100 text-red-600 px-1 rounded">必須</span>}
                      </div>
                      
                      {q.type === "text" && <div className="h-8 border rounded bg-slate-50 px-2 text-xs flex items-center text-gray-400">{q.placeholder}</div>}
                      {q.type === "textarea" && <div className="h-16 border rounded bg-slate-50 px-2 py-1 text-xs text-gray-400">{q.placeholder}</div>}
                      
                      {(q.type === "radio" || q.type === "checkbox") && (
                        <div className="space-y-1">
                          {q.options?.map((opt, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <div className={`w-3 h-3 border ${q.type === 'radio' ? 'rounded-full' : 'rounded'}`}></div>
                              <span className="text-xs">{opt}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {q.type === "dropdown" && (
                        <div className="h-8 border rounded bg-slate-50 px-2 text-xs flex items-center justify-between text-gray-400">
                          <span>選択してください</span>
                          <ChevronDown className="w-3 h-3" />
                        </div>
                      )}

                      {q.type === "date" && (
                        <div className="h-8 border rounded bg-slate-50 px-2 text-xs flex items-center justify-between text-gray-400">
                          <span>年/月/日</span>
                          <CalendarIcon className="w-3 h-3" />
                        </div>
                      )}

                      {q.type === "image" && (
                        <div className="h-20 border-2 border-dashed rounded bg-slate-50 flex flex-col items-center justify-center text-gray-400 gap-1">
                          <Upload className="w-4 h-4" />
                          <span className="text-[10px]">画像を選択</span>
                        </div>
                      )}
                    </div>
                  ))}

                  <div className="pt-4 pb-8">
                    <div 
                      className="w-full h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md"
                      style={{ backgroundColor: settings.themeColor }}
                    >
                      {settings.submitButtonText}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-3 sticky top-[600px]">
            <Button onClick={handleSave} className="w-full bg-[#06C755] hover:bg-[#05b34c] text-white shadow-lg">
              <Save className="w-4 h-4 mr-2" />
              保存して公開
            </Button>
            <Link href="/forms">
              <Button variant="outline" className="w-full">キャンセル</Button>
            </Link>
          </div>
        </div>
      </div>

      <ActionBuilder
        isOpen={isActionBuilderOpen}
        onClose={() => setIsActionBuilderOpen(false)}
        onSave={(newActions) => {
          setActions(newActions);
          setIsActionBuilderOpen(false);
        }}
        initialSteps={actions}
        triggerName="フォーム回答"
      />
    </PageTemplate>
  );
}
