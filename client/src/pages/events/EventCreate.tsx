import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Save, Image as ImageIcon, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { PageTemplate } from "@/components/page-template";
import { cn } from "@/lib/utils";

export default function EventCreatePage() {
  const [date, setDate] = useState<Date>();
  const [tickets, setTickets] = useState([
    { id: 1, name: "一般参加", price: 0, capacity: 10 },
  ]);

  const addTicket = () => {
    setTickets([
      ...tickets,
      { id: Date.now(), name: "", price: 0, capacity: 0 },
    ]);
  };

  const removeTicket = (id: number) => {
    setTickets(tickets.filter((t) => t.id !== id));
  };

  return (
    <PageTemplate title="イベントページ作成" breadcrumbs={[{ label: "イベント予約", href: "/events" }, { label: "作成" }]}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Event Editor */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>基本情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">イベント名 <span className="text-red-500">*</span></Label>
                <Input id="title" placeholder="例：新商品発表会" />
              </div>
              
              <div className="space-y-2">
                <Label>開催日時</Label>
                <div className="flex gap-4">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[240px] justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>日付を選択</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <Input type="time" className="w-[120px]" />
                  <span className="flex items-center">〜</span>
                  <Input type="time" className="w-[120px]" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">開催場所</Label>
                <Input id="location" placeholder="例：オンライン（Zoom）、東京本社など" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">イベント詳細</Label>
                <Textarea id="description" className="min-h-[150px]" placeholder="イベントの内容詳細を入力してください" />
              </div>

              <div className="space-y-2">
                <Label>メイン画像</Label>
                <div className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-slate-50 cursor-pointer transition-colors">
                  <ImageIcon className="h-10 w-10 mx-auto text-slate-400 mb-2" />
                  <p className="text-sm text-slate-500">クリックして画像をアップロード</p>
                  <p className="text-xs text-slate-400 mt-1">推奨サイズ: 1200 x 630px</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>チケット・定員設定</CardTitle>
              <Button variant="outline" size="sm" onClick={addTicket}>
                <Plus className="mr-2 h-4 w-4" /> チケットを追加
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="flex gap-4 items-end border p-4 rounded-lg bg-slate-50">
                  <div className="flex-1 space-y-2">
                    <Label>チケット名</Label>
                    <Input defaultValue={ticket.name} placeholder="例：一般参加" />
                  </div>
                  <div className="w-32 space-y-2">
                    <Label>価格 (円)</Label>
                    <Input type="number" defaultValue={ticket.price} />
                  </div>
                  <div className="w-32 space-y-2">
                    <Label>定員 (名)</Label>
                    <Input type="number" defaultValue={ticket.capacity} />
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeTicket(ticket.id)} className="mb-0.5">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>申し込みフォーム設定</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>利用する回答フォーム</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="フォームを選択してください" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">新規作成</SelectItem>
                    <SelectItem value="form1">アンケートフォーム</SelectItem>
                    <SelectItem value="form2">イベント申込フォーム</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Switch id="reminder" />
                <Label htmlFor="reminder">リマインダー配信を有効にする</Label>
              </div>
              <p className="text-xs text-muted-foreground pl-12">
                イベント開催日の前日や当日に、自動でリマインドメッセージを送信します。
              </p>
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
                  events.l-message.jp
                </div>

                {/* Event Content */}
                <div className="flex-1 overflow-y-auto bg-white">
                  <div className="h-40 bg-slate-200 flex items-center justify-center text-slate-400">
                    <ImageIcon className="h-8 w-8" />
                  </div>
                  
                  <div className="p-4 space-y-4">
                    <div>
                      <span className="text-xs font-bold text-[#06C755] border border-[#06C755] px-2 py-0.5 rounded-full">受付中</span>
                      <h3 className="font-bold text-lg mt-2 leading-tight">新商品発表会</h3>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex gap-2">
                        <CalendarIcon className="h-4 w-4 text-slate-400 shrink-0" />
                        <span>2025年12月25日(木) 14:00〜16:00</span>
                      </div>
                      <div className="flex gap-2">
                        <div className="h-4 w-4 rounded-full border border-slate-400 flex items-center justify-center shrink-0 text-[10px] text-slate-500">📍</div>
                        <span>オンライン（Zoom）</span>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-bold text-sm mb-2">イベント詳細</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        イベントの内容詳細を入力してください...
                      </p>
                    </div>

                    <div className="border-t pt-4 space-y-2">
                      <h4 className="font-bold text-sm mb-2">チケット選択</h4>
                      {tickets.map((ticket) => (
                        <div key={ticket.id} className="border rounded p-3 flex justify-between items-center">
                          <div>
                            <div className="font-bold text-sm">{ticket.name || "チケット名"}</div>
                            <div className="text-xs text-slate-500">残席: {ticket.capacity}</div>
                          </div>
                          <div className="font-bold text-sm">
                            {ticket.price > 0 ? `¥${ticket.price.toLocaleString()}` : "無料"}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4">
                      <div className="w-full h-10 bg-[#06C755] rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md">
                        申し込む
                      </div>
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
          <Link href="/events">キャンセル</Link>
        </Button>
        <Button className="bg-[#06C755] hover:bg-[#05b34c] text-white">
          <Save className="mr-2 h-4 w-4" /> 保存する
        </Button>
      </div>
    </PageTemplate>
  );
}
