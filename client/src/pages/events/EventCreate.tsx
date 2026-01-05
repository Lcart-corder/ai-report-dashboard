import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, Save, Image as ImageIcon, Plus, Trash2, Settings, Users, Clock, Calendar as CalendarIconLucide } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { PageTemplate } from "@/components/page-template";
import { toast } from "sonner";

// Types
interface Course {
  id: string;
  name: string;
  duration: number; // minutes
  price: number;
  description: string;
}

interface Staff {
  id: string;
  name: string;
  role: string;
}

export default function EventCreatePage() {
  const [activeTab, setActiveTab] = useState("basic");
  
  // Basic Info State
  const [basicInfo, setBasicInfo] = useState({
    title: "",
    description: "",
    deadlineType: "1day_before", // 1日前まで
    deadlineTime: "23:59",
    isPublic: true,
  });

  // Courses State
  const [courses, setCourses] = useState<Course[]>([
    { id: "1", name: "初回カウンセリング", duration: 60, price: 5000, description: "初めての方はこちら" },
    { id: "2", name: "通常コース", duration: 90, price: 8000, description: "2回目以降の方" }
  ]);

  // Staff State
  const [staffs, setStaffs] = useState<Staff[]>([
    { id: "1", name: "担当者A", role: "店長" },
    { id: "2", name: "担当者B", role: "スタッフ" }
  ]);

  // Schedule State (Simplified)
  const [businessHours, setBusinessHours] = useState({
    start: "10:00",
    end: "19:00",
    holidays: ["sun", "sat"]
  });

  // Handlers
  const addCourse = () => {
    const newCourse: Course = {
      id: Date.now().toString(),
      name: "",
      duration: 60,
      price: 0,
      description: ""
    };
    setCourses([...courses, newCourse]);
  };

  const updateCourse = (id: string, field: keyof Course, value: any) => {
    setCourses(courses.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const removeCourse = (id: string) => {
    setCourses(courses.filter(c => c.id !== id));
  };

  const handleSave = () => {
    if (!basicInfo.title) {
      toast.error("カレンダー名を入力してください");
      return;
    }
    toast.success("予約カレンダーを保存しました");
  };

  return (
    <PageTemplate 
      title="予約カレンダー作成" 
      description="サロン予約やレッスン予約のためのカレンダーを作成します。"
      breadcrumbs={[{ label: "イベント予約", href: "/events" }, { label: "作成" }]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="basic">基本設定</TabsTrigger>
              <TabsTrigger value="courses">コース・メニュー</TabsTrigger>
              <TabsTrigger value="schedule">日程・シフト</TabsTrigger>
            </TabsList>

            {/* Basic Settings */}
            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>基本情報</CardTitle>
                  <CardDescription>予約カレンダーの基本的な設定を行います。</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">カレンダー名 <span className="text-red-500">*</span></Label>
                    <Input 
                      id="title" 
                      placeholder="例：本店予約カレンダー" 
                      value={basicInfo.title}
                      onChange={(e) => setBasicInfo({...basicInfo, title: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">説明文</Label>
                    <Textarea 
                      id="description" 
                      placeholder="予約に関する注意事項などを入力してください" 
                      className="min-h-[100px]"
                      value={basicInfo.description}
                      onChange={(e) => setBasicInfo({...basicInfo, description: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>受付締切</Label>
                    <div className="flex gap-4 items-center">
                      <Select 
                        value={basicInfo.deadlineType}
                        onValueChange={(val) => setBasicInfo({...basicInfo, deadlineType: val})}
                      >
                        <SelectTrigger className="w-[200px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="当天">当日</SelectItem>
                          <SelectItem value="1day_before">1日前</SelectItem>
                          <SelectItem value="2days_before">2日前</SelectItem>
                          <SelectItem value="3days_before">3日前</SelectItem>
                        </SelectContent>
                      </Select>
                      <span className="text-sm">の</span>
                      <Input 
                        type="time" 
                        className="w-[120px]" 
                        value={basicInfo.deadlineTime}
                        onChange={(e) => setBasicInfo({...basicInfo, deadlineTime: e.target.value})}
                      />
                      <span className="text-sm">まで受付</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border p-4 rounded-lg bg-slate-50">
                    <div className="space-y-0.5">
                      <Label className="text-base">公開設定</Label>
                      <p className="text-sm text-muted-foreground">
                        カレンダーを公開し、予約を受け付けます。
                      </p>
                    </div>
                    <Switch 
                      checked={basicInfo.isPublic}
                      onCheckedChange={(checked) => setBasicInfo({...basicInfo, isPublic: checked})}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Course Settings */}
            <TabsContent value="courses" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>コース・メニュー設定</CardTitle>
                    <CardDescription>予約可能なメニューを登録します。</CardDescription>
                  </div>
                  <Button size="sm" onClick={addCourse} className="bg-[#06C755] hover:bg-[#05b34c] text-white">
                    <Plus className="mr-2 h-4 w-4" /> コース追加
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  {courses.map((course, index) => (
                    <div key={course.id} className="border rounded-lg p-4 bg-slate-50 relative group">
                      <div className="absolute top-4 right-4">
                        <Button variant="ghost" size="icon" onClick={() => removeCourse(course.id)} className="text-gray-400 hover:text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid gap-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-10">
                          <div className="space-y-2">
                            <Label>コース名</Label>
                            <Input 
                              value={course.name} 
                              onChange={(e) => updateCourse(course.id, 'name', e.target.value)}
                              placeholder="例：60分コース"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>所要時間 (分)</Label>
                              <Input 
                                type="number" 
                                value={course.duration} 
                                onChange={(e) => updateCourse(course.id, 'duration', parseInt(e.target.value))}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>料金 (円)</Label>
                              <Input 
                                type="number" 
                                value={course.price} 
                                onChange={(e) => updateCourse(course.id, 'price', parseInt(e.target.value))}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>説明文</Label>
                          <Input 
                            value={course.description} 
                            onChange={(e) => updateCourse(course.id, 'description', e.target.value)}
                            placeholder="コースの説明を入力"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Schedule Settings */}
            <TabsContent value="schedule" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>営業時間・定休日</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>開始時間</Label>
                      <Input 
                        type="time" 
                        value={businessHours.start}
                        onChange={(e) => setBusinessHours({...businessHours, start: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>終了時間</Label>
                      <Input 
                        type="time" 
                        value={businessHours.end}
                        onChange={(e) => setBusinessHours({...businessHours, end: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>定休日</Label>
                    <div className="flex flex-wrap gap-4">
                      {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map((day) => (
                        <div key={day} className="flex items-center space-x-2">
                          <Checkbox id={`day-${day}`} />
                          <Label htmlFor={`day-${day}`} className="uppercase">{day}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>担当スタッフ</CardTitle>
                  <Button variant="outline" size="sm">
                    <Plus className="mr-2 h-4 w-4" /> スタッフ追加
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {staffs.map((staff) => (
                      <div key={staff.id} className="flex items-center justify-between p-3 border rounded bg-white">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <Users className="w-4 h-4 text-gray-500" />
                          </div>
                          <div>
                            <div className="font-medium">{staff.name}</div>
                            <div className="text-xs text-muted-foreground">{staff.role}</div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">シフト設定</Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column: Preview & Actions */}
        <div className="space-y-6">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>プレビュー</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
                <div className="bg-[#06C755] p-4 text-white text-center font-bold">
                  {basicInfo.title || "予約カレンダー"}
                </div>
                <div className="p-4 space-y-4">
                  <div className="text-sm text-gray-600">
                    {basicInfo.description || "ご希望のメニューを選択してください。"}
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-500">メニュー選択</Label>
                    {courses.map((course) => (
                      <div key={course.id} className="border rounded p-3 hover:bg-gray-50 cursor-pointer transition-colors">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-sm">{course.name || "コース名"}</span>
                          <span className="text-sm font-bold">¥{course.price.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-500 gap-2">
                          <Clock className="w-3 h-3" />
                          <span>{course.duration}分</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t">
                    <Button className="w-full bg-[#06C755] hover:bg-[#05b34c] text-white">
                      日時選択へ進む
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-3 sticky top-[500px]">
            <Button onClick={handleSave} className="w-full bg-[#06C755] hover:bg-[#05b34c] text-white shadow-lg">
              <Save className="w-4 h-4 mr-2" />
              保存して公開
            </Button>
            <Link href="/events">
              <Button variant="outline" className="w-full">キャンセル</Button>
            </Link>
          </div>
        </div>
      </div>
    </PageTemplate>
  );
}
