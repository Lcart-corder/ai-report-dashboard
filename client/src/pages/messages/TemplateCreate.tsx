import React, { useState } from "react";
import { PageTemplate } from "@/components/page-template";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Save, Image as ImageIcon, Smile, Paperclip } from "lucide-react";
import { Link } from "wouter";

export default function TemplateCreatePage() {
  const [formData, setFormData] = useState({
    folder: "default",
    title: "",
    content: "",
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      toast.error("テンプレート名を入力してください");
      return;
    }
    toast.success("テンプレートを保存しました");
  };

  return (
    <PageTemplate 
      title="テンプレート作成" 
      description="再利用可能なメッセージテンプレートを作成します。"
      breadcrumbs={[
        { label: "メッセージ", href: "/messages" },
        { label: "テンプレート", href: "/messages/templates" },
        { label: "新規作成" }
      ]}
    >
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>基本情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="folder">フォルダ</Label>
                <Select 
                  value={formData.folder} 
                  onValueChange={(val) => setFormData({...formData, folder: val})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="フォルダを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">未分類</SelectItem>
                    <SelectItem value="campaign">キャンペーン用</SelectItem>
                    <SelectItem value="welcome">あいさつ用</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="title">テンプレート名 <span className="text-red-500">*</span></Label>
                <Input 
                  id="title" 
                  placeholder="管理用の名前を入力" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>メッセージ内容</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="text" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="text">テキスト</TabsTrigger>
                  <TabsTrigger value="image">画像</TabsTrigger>
                  <TabsTrigger value="card">カードタイプ</TabsTrigger>
                </TabsList>
                
                <TabsContent value="text" className="space-y-4">
                  <div className="border rounded-md p-2 bg-gray-50">
                    <div className="flex gap-2 mb-2">
                      <Button type="button" variant="ghost" size="sm" title="絵文字">
                        <Smile className="w-4 h-4" />
                      </Button>
                      <Button type="button" variant="ghost" size="sm" title="画像挿入">
                        <ImageIcon className="w-4 h-4" />
                      </Button>
                      <Button type="button" variant="ghost" size="sm" title="ファイル添付">
                        <Paperclip className="w-4 h-4" />
                      </Button>
                      <div className="flex-1" />
                      <span className="text-xs text-gray-500 self-center">
                        {formData.content.length} / 2000文字
                      </span>
                    </div>
                    <Textarea 
                      className="min-h-[200px] border-0 bg-transparent focus-visible:ring-0 resize-none"
                      placeholder="メッセージを入力してください..."
                      value={formData.content}
                      onChange={(e) => setFormData({...formData, content: e.target.value})}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm">友だち名挿入</Button>
                    <Button type="button" variant="outline" size="sm">URL挿入</Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="image">
                  <div className="border-2 border-dashed rounded-lg p-8 text-center text-gray-500">
                    <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>画像をドラッグ＆ドロップ、またはクリックしてアップロード</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="card">
                  <div className="text-center py-8 text-gray-500">
                    カードタイプメッセージエディタ（準備中）
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>プレビュー</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-[#849ebf] p-4 rounded-lg min-h-[400px] relative">
                {/* LINE Talk Screen Mockup */}
                <div className="bg-white rounded-lg p-3 max-w-[85%] shadow-sm relative ml-2 mt-4">
                  <div className="absolute top-2 -left-2 w-3 h-3 bg-white transform rotate-45"></div>
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {formData.content || "メッセージを入力するとここにプレビューが表示されます。"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-3">
            <Button type="submit" className="w-full bg-[#06C755] hover:bg-[#05b34c] text-white">
              <Save className="w-4 h-4 mr-2" />
              保存する
            </Button>
            <Link href="/messages/templates">
              <Button variant="outline" className="w-full">キャンセル</Button>
            </Link>
          </div>
        </div>
      </form>
    </PageTemplate>
  );
}
