import React, { useState } from "react";
import { PageTemplate } from "@/components/page-template";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Save, QrCode, Tag, PlayCircle, Copy } from "lucide-react";
import { Link } from "wouter";

export default function TrafficSourceCreatePage() {
  const [formData, setFormData] = useState({
    title: "",
    folder: "default",
    code: Math.random().toString(36).substr(2, 8).toUpperCase(),
    actions: {
      addTags: [] as string[],
      startScenario: "",
      sendTemplate: "",
    }
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      toast.error("管理名を入力してください");
      return;
    }
    toast.success("QRコードアクションを保存しました");
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`https://line.me/R/ti/p/@example?ref=${formData.code}`);
    toast.success("リンクをコピーしました");
  };

  return (
    <PageTemplate 
      title="QRコードアクション作成" 
      description="流入経路を計測するためのQRコードやリンクを作成します。"
      breadcrumbs={[
        { label: "分析", href: "/analysis" },
        { label: "流入経路分析", href: "/analysis/traffic" },
        { label: "新規作成" }
      ]}
    >
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>基本設定</CardTitle>
              <CardDescription>管理用の名前とフォルダを設定します。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="title">管理名 <span className="text-red-500">*</span></Label>
                <Input 
                  id="title" 
                  placeholder="例: Instagramキャンペーン用" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="folder">フォルダ</Label>
                <Input 
                  id="folder" 
                  placeholder="フォルダ名を入力（既存フォルダから選択も可能）" 
                  value={formData.folder}
                  onChange={(e) => setFormData({...formData, folder: e.target.value})}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>アクション設定</CardTitle>
              <CardDescription>このリンクから友だち追加・アクセスした際のアクションを設定します。</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="tags" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="tags">タグ操作</TabsTrigger>
                  <TabsTrigger value="scenario">シナリオ操作</TabsTrigger>
                  <TabsTrigger value="message">メッセージ送信</TabsTrigger>
                </TabsList>
                
                <TabsContent value="tags" className="space-y-4">
                  <div className="border rounded-md p-4">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Tag className="w-4 h-4" /> タグ追加
                    </h4>
                    <p className="text-sm text-gray-500 mb-4">
                      アクセスしたユーザーに自動的にタグを付与します。
                    </p>
                    <Input placeholder="追加するタグ名を入力..." />
                  </div>
                </TabsContent>
                
                <TabsContent value="scenario" className="space-y-4">
                  <div className="border rounded-md p-4">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <PlayCircle className="w-4 h-4" /> シナリオ開始
                    </h4>
                    <p className="text-sm text-gray-500 mb-4">
                      アクセスしたユーザーに対してステップ配信を開始します。
                    </p>
                    <Input placeholder="開始するシナリオを選択..." />
                  </div>
                </TabsContent>
                
                <TabsContent value="message" className="space-y-4">
                  <div className="border rounded-md p-4">
                    <h4 className="font-medium mb-2">テンプレート送信</h4>
                    <p className="text-sm text-gray-500 mb-4">
                      アクセス時に特定のメッセージを送信します。
                    </p>
                    <Input placeholder="送信するテンプレートを選択..." />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>発行リンク・QRコード</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                <div className="border-4 border-white shadow-lg p-2 bg-white inline-block">
                  <QrCode className="w-32 h-32 text-gray-800" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>パラメータ付きリンク</Label>
                <div className="flex gap-2">
                  <Input 
                    readOnly 
                    value={`https://line.me/R/ti/p/@example?ref=${formData.code}`} 
                    className="bg-gray-50 font-mono text-xs"
                  />
                  <Button type="button" variant="outline" size="icon" onClick={copyLink}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  このリンクをSNSやWebサイトに貼り付けて使用します。
                </p>
              </div>

              <div className="pt-4 border-t">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold">0</div>
                    <div className="text-xs text-gray-500">クリック数</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">0</div>
                    <div className="text-xs text-gray-500">友だち追加</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-3">
            <Button type="submit" className="w-full bg-[#06C755] hover:bg-[#05b34c] text-white">
              <Save className="w-4 h-4 mr-2" />
              保存する
            </Button>
            <Link href="/analysis/traffic">
              <Button variant="outline" className="w-full">キャンセル</Button>
            </Link>
          </div>
        </div>
      </form>
    </PageTemplate>
  );
}
