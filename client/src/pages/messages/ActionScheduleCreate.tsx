import React, { useState } from "react";
import { PageTemplate } from "@/components/page-template";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Save, Clock, Calendar, Zap } from "lucide-react";
import { Link } from "wouter";

export default function ActionScheduleCreatePage() {
  const [formData, setFormData] = useState({
    title: "",
    triggerType: "time", // time, event
    scheduleType: "one_time", // one_time, recurring
    target: "all",
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      toast.error("スケジュール名を入力してください");
      return;
    }
    toast.success("アクションスケジュールを保存しました");
  };

  return (
    <PageTemplate 
      title="アクションスケジュール作成" 
      description="指定した日時や条件で自動的にアクションを実行します。"
      breadcrumbs={[
        { label: "メッセージ", href: "/messages" },
        { label: "スケジュール", href: "/messages/schedule" },
        { label: "新規作成" }
      ]}
    >
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>基本設定</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="title">スケジュール名 <span className="text-red-500">*</span></Label>
                <Input 
                  id="title" 
                  placeholder="例: 毎月1日のタグ更新" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>実行タイミング</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="time" className="w-full" onValueChange={(val) => setFormData({...formData, triggerType: val})}>
                <TabsList className="mb-4">
                  <TabsTrigger value="time" className="flex gap-2"><Clock className="w-4 h-4" /> 日時指定</TabsTrigger>
                  <TabsTrigger value="event" className="flex gap-2"><Zap className="w-4 h-4" /> イベントトリガー</TabsTrigger>
                </TabsList>
                
                <TabsContent value="time" className="space-y-6">
                  <RadioGroup defaultValue="one_time" onValueChange={(val) => setFormData({...formData, scheduleType: val})}>
                    <div className="flex items-center space-x-2 border p-4 rounded-md">
                      <RadioGroupItem value="one_time" id="one_time" />
                      <Label htmlFor="one_time" className="flex-1 cursor-pointer">
                        <div className="font-medium">1回のみ実行</div>
                        <div className="text-xs text-gray-500">指定した日時に1回だけ実行します</div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 border p-4 rounded-md">
                      <RadioGroupItem value="recurring" id="recurring" />
                      <Label htmlFor="recurring" className="flex-1 cursor-pointer">
                        <div className="font-medium">繰り返し実行</div>
                        <div className="text-xs text-gray-500">毎日、毎週、毎月など定期的に実行します</div>
                      </Label>
                    </div>
                  </RadioGroup>

                  {formData.scheduleType === "one_time" ? (
                    <div className="grid gap-2">
                      <Label>実行日時</Label>
                      <Input type="datetime-local" />
                    </div>
                  ) : (
                    <div className="grid gap-2">
                      <Label>繰り返し設定</Label>
                      <div className="flex gap-2">
                        <Select defaultValue="daily">
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="頻度" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">毎日</SelectItem>
                            <SelectItem value="weekly">毎週</SelectItem>
                            <SelectItem value="monthly">毎月</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input type="time" className="w-[150px]" />
                      </div>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="event">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label>トリガー条件</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="条件を選択" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="friend_add">友だち追加時</SelectItem>
                          <SelectItem value="tag_add">タグが付与された時</SelectItem>
                          <SelectItem value="form_submit">フォーム回答時</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>実行アクション</CardTitle>
              <CardDescription>条件を満たした時に実行する処理を設定します。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border rounded-md p-4 bg-gray-50">
                <div className="text-center py-4 text-gray-500">
                  <p className="mb-2">アクションが設定されていません</p>
                  <Button variant="outline" size="sm">
                    + アクションを追加
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>対象ユーザー</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup defaultValue="all" onValueChange={(val) => setFormData({...formData, target: val})}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="target_all" />
                  <Label htmlFor="target_all">全員</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="filter" id="target_filter" />
                  <Label htmlFor="target_filter">絞り込み</Label>
                </div>
              </RadioGroup>
              
              {formData.target === "filter" && (
                <div className="pl-6 pt-2">
                  <Button variant="outline" size="sm" className="w-full">
                    絞り込み条件を設定
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex flex-col gap-3">
            <Button type="submit" className="w-full bg-[#06C755] hover:bg-[#05b34c] text-white">
              <Save className="w-4 h-4 mr-2" />
              保存する
            </Button>
            <Link href="/messages">
              <Button variant="outline" className="w-full">キャンセル</Button>
            </Link>
          </div>
        </div>
      </form>
    </PageTemplate>
  );
}
