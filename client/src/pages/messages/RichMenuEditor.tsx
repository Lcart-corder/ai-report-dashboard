import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { 
  ArrowLeft, 
  Save, 
  Image as ImageIcon, 
  LayoutGrid, 
  MousePointer2, 
  Settings, 
  Trash2,
  Plus,
  Move
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { PageTemplate } from "@/components/page-template";
import { ActionBuilder } from "@/components/actions/ActionBuilder";
import { ActionSetStep } from "@/types/schema";

// Types
interface TapArea {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  action?: ActionSetStep[];
}

interface Template {
  id: string;
  name: string;
  type: 'large' | 'small'; // large: 2500x1686, small: 2500x843
  areas: Omit<TapArea, 'id' | 'action'>[];
}

// Predefined Templates (L-Message style)
const TEMPLATES: Template[] = [
  {
    id: "large_6",
    name: "大：6分割",
    type: "large",
    areas: [
      { x: 0, y: 0, width: 833, height: 843 },
      { x: 833, y: 0, width: 834, height: 843 },
      { x: 1667, y: 0, width: 833, height: 843 },
      { x: 0, y: 843, width: 833, height: 843 },
      { x: 833, y: 843, width: 834, height: 843 },
      { x: 1667, y: 843, width: 833, height: 843 },
    ]
  },
  {
    id: "large_4",
    name: "大：4分割",
    type: "large",
    areas: [
      { x: 0, y: 0, width: 1250, height: 843 },
      { x: 1250, y: 0, width: 1250, height: 843 },
      { x: 0, y: 843, width: 1250, height: 843 },
      { x: 1250, y: 843, width: 1250, height: 843 },
    ]
  },
  {
    id: "large_3",
    name: "大：3分割（上1下2）",
    type: "large",
    areas: [
      { x: 0, y: 0, width: 2500, height: 843 },
      { x: 0, y: 843, width: 1250, height: 843 },
      { x: 1250, y: 843, width: 1250, height: 843 },
    ]
  },
  {
    id: "small_3",
    name: "小：3分割",
    type: "small",
    areas: [
      { x: 0, y: 0, width: 833, height: 843 },
      { x: 833, y: 0, width: 834, height: 843 },
      { x: 1667, y: 0, width: 833, height: 843 },
    ]
  },
  {
    id: "small_2",
    name: "小：2分割",
    type: "small",
    areas: [
      { x: 0, y: 0, width: 1250, height: 843 },
      { x: 1250, y: 0, width: 1250, height: 843 },
    ]
  },
];

export default function RichMenuEditorPage() {
  const [menuName, setMenuName] = useState("新規リッチメニュー");
  const [chatBarText, setChatBarText] = useState("メニューを開く");
  const [selectedTemplateId, setSelectedTemplateId] = useState("large_6");
  const [tapAreas, setTapAreas] = useState<TapArea[]>([]);
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
  const [isActionBuilderOpen, setIsActionBuilderOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Canvas scaling
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  // Initialize areas when template changes
  useEffect(() => {
    const template = TEMPLATES.find(t => t.id === selectedTemplateId);
    if (template) {
      setTapAreas(template.areas.map((area, i) => ({
        ...area,
        id: `area_${Date.now()}_${i}`,
        action: []
      })));
    }
  }, [selectedTemplateId]);

  // Update scale on resize
  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        // Base width is 2500px (LINE Rich Menu standard)
        setScale(containerWidth / 2500);
      }
    };
    
    window.addEventListener('resize', updateScale);
    updateScale();
    
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  const handleAreaClick = (id: string) => {
    setSelectedAreaId(id);
  };

  const handleEditAction = (id: string) => {
    setSelectedAreaId(id);
    setIsActionBuilderOpen(true);
  };

  const handleSaveAction = (actions: ActionSetStep[]) => {
    if (selectedAreaId) {
      setTapAreas(tapAreas.map(area => 
        area.id === selectedAreaId ? { ...area, action: actions } : area
      ));
      setIsActionBuilderOpen(false);
    }
  };

  const currentTemplate = TEMPLATES.find(t => t.id === selectedTemplateId);
  const height = currentTemplate?.type === 'large' ? 1686 : 843;

  return (
    <PageTemplate 
      title="リッチメニュー作成" 
      breadcrumbs={[
        { label: "メッセージ", href: "/messages" }, 
        { label: "リッチメニュー", href: "/messages/rich-menus" },
        { label: "作成" }
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Settings & Editor */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>基本設定</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>メニュー名 <span className="text-red-500">*</span></Label>
                <Input value={menuName} onChange={(e) => setMenuName(e.target.value)} placeholder="管理用の名前を入力" />
              </div>
              
              <div className="space-y-2">
                <Label>トークルームメニューバーのテキスト</Label>
                <Input value={chatBarText} onChange={(e) => setChatBarText(e.target.value)} placeholder="メニューを開く / Close" />
              </div>

              <div className="space-y-2">
                <Label>テンプレート選択</Label>
                <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="large_6">大：6分割</SelectItem>
                    <SelectItem value="large_4">大：4分割</SelectItem>
                    <SelectItem value="large_3">大：3分割（上1下2）</SelectItem>
                    <SelectItem value="small_3">小：3分割</SelectItem>
                    <SelectItem value="small_2">小：2分割</SelectItem>
                    <SelectItem value="custom">カスタム（自由配置）</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>メニュー画像・アクション設定</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <ImageIcon className="mr-2 h-4 w-4" /> 画像をアップロード
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-slate-100 rounded-lg p-4 overflow-hidden" ref={containerRef}>
                  <div 
                    className="relative bg-white shadow-sm mx-auto"
                    style={{ 
                      width: '100%', 
                      height: containerRef.current ? containerRef.current.clientWidth * (height / 2500) : 300,
                      backgroundImage: imagePreview ? `url(${imagePreview})` : 'none',
                      backgroundSize: 'cover'
                    }}
                  >
                    {!imagePreview && (
                      <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                        <div className="text-center">
                          <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">背景画像が設定されていません</p>
                          <p className="text-xs mt-1">推奨サイズ: 2500 x {height}px</p>
                        </div>
                      </div>
                    )}

                    {/* Tap Areas Overlay */}
                    {tapAreas.map((area, index) => (
                      <div
                        key={area.id}
                        onClick={() => handleAreaClick(area.id)}
                        className={`absolute border-2 flex items-center justify-center cursor-pointer transition-colors group
                          ${selectedAreaId === area.id 
                            ? 'border-blue-500 bg-blue-500/20 z-10' 
                            : 'border-slate-300/50 bg-white/10 hover:bg-white/30'
                          }`}
                        style={{
                          left: `${(area.x / 2500) * 100}%`,
                          top: `${(area.y / height) * 100}%`,
                          width: `${(area.width / 2500) * 100}%`,
                          height: `${(area.height / height) * 100}%`,
                        }}
                      >
                        <div className="relative">
                          <span className={`text-xs font-bold px-2 py-1 rounded-full 
                            ${selectedAreaId === area.id ? 'bg-blue-600 text-white' : 'bg-slate-800/50 text-white'}`}>
                            {String.fromCharCode(65 + index)}
                          </span>
                          
                          {/* Action Indicator */}
                          {area.action && area.action.length > 0 && (
                            <div className="absolute -top-2 -right-2 w-3 h-3 bg-green-500 rounded-full border border-white" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Area Settings List */}
                <div className="space-y-2">
                  <Label>アクション設定</Label>
                  <div className="grid gap-2">
                    {tapAreas.map((area, index) => (
                      <div 
                        key={area.id} 
                        className={`flex items-center justify-between p-3 rounded border cursor-pointer transition-colors
                          ${selectedAreaId === area.id ? 'bg-blue-50 border-blue-200' : 'bg-white hover:bg-slate-50'}`}
                        onClick={() => handleAreaClick(area.id)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold">
                            {String.fromCharCode(65 + index)}
                          </div>
                          <div className="text-sm">
                            {area.action && area.action.length > 0 ? (
                              <div className="flex gap-2">
                                {area.action.map((act, i) => (
                                  <Badge key={i} variant="secondary" className="bg-white border">
                                    {act.action_type === 'text_message' ? 'メッセージ' : 
                                     act.action_type === 'template_message' ? 'テンプレート' : 
                                     act.action_type === 'tag' ? 'タグ操作' : 'アクション'}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <span className="text-slate-400">アクション未設定</span>
                            )}
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleEditAction(area.id); }}>
                          <Settings className="h-4 w-4 text-slate-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Preview */}
        <div className="lg:col-span-1 space-y-6">
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
                <div className="flex-1 bg-[#8cabd9] relative">
                  {/* Rich Menu at Bottom */}
                  <div className="absolute bottom-0 left-0 right-0 bg-white border-t">
                    <div className="bg-slate-100 py-2 text-center text-xs text-slate-500 border-b cursor-pointer hover:bg-slate-200">
                      {chatBarText} ▼
                    </div>
                    <div className="aspect-[2500/1686] w-full bg-slate-50 relative">
                      {/* Preview Areas */}
                      {tapAreas.map((area, index) => (
                        <div
                          key={area.id}
                          className="absolute border border-slate-300/30 flex items-center justify-center text-[10px] text-slate-400 bg-slate-100/50"
                          style={{
                            left: `${(area.x / 2500) * 100}%`,
                            top: `${(area.y / height) * 100}%`,
                            width: `${(area.width / 2500) * 100}%`,
                            height: `${(area.height / height) * 100}%`,
                          }}
                        >
                          {String.fromCharCode(65 + index)}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-2">
            <Button className="w-full bg-[#06C755] hover:bg-[#05b34c] text-white">
              <Save className="mr-2 h-4 w-4" /> 保存する
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/messages/rich-menus">キャンセル</Link>
            </Button>
          </div>
        </div>
      </div>

      <ActionBuilder
        isOpen={isActionBuilderOpen}
        onClose={() => setIsActionBuilderOpen(false)}
        onSave={handleSaveAction}
        initialSteps={selectedAreaId ? tapAreas.find(a => a.id === selectedAreaId)?.action || [] : []}
        triggerName={`エリア ${selectedAreaId ? String.fromCharCode(65 + tapAreas.findIndex(a => a.id === selectedAreaId)) : ''} タップ`}
      />
    </PageTemplate>
  );
}
