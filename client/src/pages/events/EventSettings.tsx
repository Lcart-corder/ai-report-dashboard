import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Save, 
  Clock, 
  Mail, 
  Settings, 
  Calendar,
  AlertCircle
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function EventSettingsPage() {
  return (
    <div className="h-full flex flex-col">
      <div className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">予約設定</h1>
            <p className="text-sm text-gray-500 mt-1">
              予約システム全体の共通設定を管理します
            </p>
          </div>
          <Button className="bg-[#06C755] hover:bg-[#05b34c] text-white gap-2">
            <Save className="w-4 h-4" />
            設定を保存
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="mb-6 w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
              <TabsTrigger 
                value="general" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#06C755] data-[state=active]:bg-transparent px-6 py-3"
              >
                <Settings className="w-4 h-4 mr-2" />
                基本設定
              </TabsTrigger>
              <TabsTrigger 
                value="schedule" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#06C755] data-[state=active]:bg-transparent px-6 py-3"
              >
                <Clock className="w-4 h-4 mr-2" />
                受付時間
              </TabsTrigger>
              <TabsTrigger 
                value="mail" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#06C755] data-[state=active]:bg-transparent px-6 py-3"
              >
                <Mail className="w-4 h-4 mr-2" />
                通知・メール
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>予約受付設定</CardTitle>
                  <CardDescription>予約の受付に関する基本的なルールを設定します</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-2">
                    <Label>予約受付の締め切り</Label>
                    <div className="flex items-center gap-4">
                      <Select defaultValue="1">
                        <SelectTrigger className="w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">当日まで可能</SelectItem>
                          <SelectItem value="1">前日まで</SelectItem>
                          <SelectItem value="2">2日前まで</SelectItem>
                          <SelectItem value="3">3日前まで</SelectItem>
                          <SelectItem value="7">1週間前まで</SelectItem>
                        </SelectContent>
                      </Select>
                      <span className="text-sm text-gray-500">
                        ※設定した期間を過ぎると予約できなくなります
                      </span>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label>キャンセル受付</Label>
                    <div className="flex items-center gap-4">
                      <Select defaultValue="1">
                        <SelectTrigger className="w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">当日まで可能</SelectItem>
                          <SelectItem value="1">前日まで</SelectItem>
                          <SelectItem value="2">2日前まで</SelectItem>
                          <SelectItem value="none">キャンセル不可</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label>同時予約可能数</Label>
                    <div className="flex items-center gap-4">
                      <Input type="number" className="w-[100px]" defaultValue="1" />
                      <span className="text-sm text-gray-500">件まで</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      ※1人のユーザーが同時に保持できる予約数の上限です
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>表示設定</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>残席数の表示</Label>
                      <p className="text-sm text-gray-500">
                        予約カレンダーに残席数を表示します
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>カレンダーの開始曜日</Label>
                      <p className="text-sm text-gray-500">
                        カレンダーの左端を日曜始まりにするか月曜始まりにするか設定します
                      </p>
                    </div>
                    <Select defaultValue="sun">
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sun">日曜始まり</SelectItem>
                        <SelectItem value="mon">月曜始まり</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="schedule" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>デフォルト受付時間</CardTitle>
                  <CardDescription>
                    新規イベント作成時のデフォルトとなる受付時間を設定します
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {['月', '火', '水', '木', '金', '土', '日'].map((day) => (
                      <div key={day} className="flex items-center gap-4 p-3 border rounded-lg bg-white">
                        <div className="w-10 font-bold text-center">{day}</div>
                        <Switch defaultChecked={day !== '土' && day !== '日'} />
                        <div className="flex items-center gap-2 flex-1">
                          <Input type="time" defaultValue="10:00" className="w-[120px]" />
                          <span>〜</span>
                          <Input type="time" defaultValue="18:00" className="w-[120px]" />
                        </div>
                        <Button variant="ghost" size="sm" className="text-gray-400">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="mail" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>自動返信メール</CardTitle>
                  <CardDescription>
                    予約完了時やキャンセル時に送信されるメールの内容を設定します
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                          <Mail className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-medium">予約完了メール</div>
                          <div className="text-sm text-gray-500">予約確定時に送信されます</div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">編集</Button>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                          <AlertCircle className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-medium">リマインドメール</div>
                          <div className="text-sm text-gray-500">予約日の前日に送信されます</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch defaultChecked />
                        <Button variant="outline" size="sm">編集</Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 text-gray-600 rounded-lg">
                          <Settings className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-medium">キャンセル完了メール</div>
                          <div className="text-sm text-gray-500">予約キャンセル時に送信されます</div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">編集</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
