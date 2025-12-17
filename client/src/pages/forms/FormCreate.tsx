import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, GripVertical, Plus, Save, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { PageTemplate } from "@/components/page-template";

export default function FormCreatePage() {
  const [questions, setQuestions] = useState([
    { id: 1, type: "text", label: "お名前", required: true },
    { id: 2, type: "email", label: "メールアドレス", required: true },
  ]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { id: Date.now(), type: "text", label: "新しい質問", required: false },
    ]);
  };

  const removeQuestion = (id: number) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  return (
    <PageTemplate title="回答フォーム作成" breadcrumbs={[{ label: "フォーム", href: "/forms" }, { label: "作成" }]}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form Editor */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>基本設定</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">フォーム名 <span className="text-red-500">*</span></Label>
                <Input id="title" placeholder="例：アンケートフォーム" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">説明文</Label>
                <Textarea id="description" placeholder="フォームの説明を入力してください" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>回答期限</Label>
                  <Input type="datetime-local" />
                </div>
                <div className="space-y-2">
                  <Label>回答回数制限</Label>
                  <Select defaultValue="once">
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

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>質問項目</CardTitle>
              <Button variant="outline" size="sm" onClick={addQuestion}>
                <Plus className="mr-2 h-4 w-4" /> 質問を追加
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {questions.map((q, index) => (
                <div key={q.id} className="border rounded-lg p-4 bg-card relative group">
                  <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" onClick={() => removeQuestion(q.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  
                  <div className="flex gap-4 items-start">
                    <div className="mt-2 cursor-move text-muted-foreground">
                      <GripVertical className="h-5 w-5" />
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>質問タイプ</Label>
                          <Select defaultValue={q.type}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text">テキスト入力</SelectItem>
                              <SelectItem value="textarea">長文テキスト</SelectItem>
                              <SelectItem value="radio">ラジオボタン</SelectItem>
                              <SelectItem value="checkbox">チェックボックス</SelectItem>
                              <SelectItem value="dropdown">ドロップダウン</SelectItem>
                              <SelectItem value="date">日付</SelectItem>
                              <SelectItem value="email">メールアドレス</SelectItem>
                              <SelectItem value="tel">電話番号</SelectItem>
                              <SelectItem value="image">画像アップロード</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>質問ラベル</Label>
                          <Input defaultValue={q.label} />
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox id={`required-${q.id}`} defaultChecked={q.required} />
                        <Label htmlFor={`required-${q.id}`}>必須項目にする</Label>
                      </div>

                      {(q.type === "radio" || q.type === "checkbox" || q.type === "dropdown") && (
                        <div className="space-y-2 pl-4 border-l-2">
                          <Label>選択肢</Label>
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <Input placeholder="選択肢 1" />
                              <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4" /></Button>
                            </div>
                            <div className="flex gap-2">
                              <Input placeholder="選択肢 2" />
                              <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4" /></Button>
                            </div>
                            <Button variant="link" size="sm" className="h-auto p-0 text-blue-600">
                              + 選択肢を追加
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>完了アクション</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>回答後のメッセージ</Label>
                <Textarea placeholder="回答ありがとうございました。" />
              </div>
              
              <div className="space-y-2">
                <Label>タグ付け</Label>
                <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[40px]">
                  <span className="text-xs text-muted-foreground p-1">タグを選択...</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="notify-admin" />
                <Label htmlFor="notify-admin">管理者に通知メールを送る</Label>
              </div>
            </CardContent>
          </Card>
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
                  <div className="bg-white p-4 rounded-lg shadow-sm space-y-2">
                    <h3 className="font-bold text-lg">アンケートフォーム</h3>
                    <p className="text-xs text-slate-500">フォームの説明を入力してください</p>
                  </div>

                  {questions.map((q) => (
                    <div key={q.id} className="bg-white p-3 rounded-lg shadow-sm space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">{q.label}</span>
                        {q.required && <span className="text-[10px] bg-red-100 text-red-600 px-1 rounded">必須</span>}
                      </div>
                      {q.type === "text" && <div className="h-8 border rounded bg-slate-50"></div>}
                      {q.type === "email" && <div className="h-8 border rounded bg-slate-50"></div>}
                      {q.type === "radio" && (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full border"></div><div className="h-2 w-16 bg-slate-100 rounded"></div></div>
                          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full border"></div><div className="h-2 w-16 bg-slate-100 rounded"></div></div>
                        </div>
                      )}
                    </div>
                  ))}

                  <div className="pt-4">
                    <div className="w-full h-10 bg-[#06C755] rounded-lg flex items-center justify-center text-white font-bold text-sm">
                      回答する
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end gap-4 mt-6">
        <Button variant="outline" asChild>
          <Link href="/forms">キャンセル</Link>
        </Button>
        <Button className="bg-[#06C755] hover:bg-[#05b34c] text-white">
          <Save className="mr-2 h-4 w-4" /> 保存する
        </Button>
      </div>
    </PageTemplate>
  );
}
