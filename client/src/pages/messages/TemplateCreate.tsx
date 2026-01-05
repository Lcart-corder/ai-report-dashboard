import React, { useState } from "react";
import { PageTemplate } from "@/components/page-template";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Save, Image as ImageIcon, Smile, Paperclip, Plus, Trash2, GripVertical, ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { Link } from "wouter";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

// Types for Carousel
type ActionType = 'uri' | 'message' | 'postback';

interface CarouselAction {
  type: ActionType;
  label: string;
  uri?: string;
  text?: string;
  data?: string;
}

interface CarouselPanel {
  id: string;
  imageUrl: string;
  title: string;
  text: string;
  actions: CarouselAction[];
}

export default function TemplateCreatePage() {
  const [activeTab, setActiveTab] = useState("text");
  const [formData, setFormData] = useState({
    folder: "default",
    title: "",
    content: "",
  });

  // Carousel State
  const [panels, setPanels] = useState<CarouselPanel[]>([
    {
      id: '1',
      imageUrl: '',
      title: '',
      text: '',
      actions: [{ type: 'uri', label: '詳細を見る', uri: '' }]
    }
  ]);
  const [activePanelIndex, setActivePanelIndex] = useState(0);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      toast.error("テンプレート名を入力してください");
      return;
    }
    toast.success("テンプレートを保存しました");
  };

  // Carousel Handlers
  const addPanel = () => {
    if (panels.length >= 10) {
      toast.error("パネルは最大10枚までです");
      return;
    }
    const newPanel: CarouselPanel = {
      id: Date.now().toString(),
      imageUrl: '',
      title: '',
      text: '',
      actions: [{ type: 'uri', label: 'ボタン1', uri: '' }]
    };
    setPanels([...panels, newPanel]);
    setActivePanelIndex(panels.length);
  };

  const removePanel = (index: number) => {
    if (panels.length <= 1) {
      toast.error("最低1枚のパネルが必要です");
      return;
    }
    const newPanels = panels.filter((_, i) => i !== index);
    setPanels(newPanels);
    setActivePanelIndex(Math.max(0, index - 1));
  };

  const updatePanel = (index: number, field: keyof CarouselPanel, value: any) => {
    const newPanels = [...panels];
    newPanels[index] = { ...newPanels[index], [field]: value };
    setPanels(newPanels);
  };

  const addAction = (panelIndex: number) => {
    const panel = panels[panelIndex];
    if (panel.actions.length >= 4) { // LINE spec allows up to 4 actions usually, L Message might vary but 3-4 is standard
      toast.error("ボタンは最大4つまでです");
      return;
    }
    const newAction: CarouselAction = { type: 'uri', label: `ボタン${panel.actions.length + 1}`, uri: '' };
    const newPanels = [...panels];
    newPanels[panelIndex].actions = [...panel.actions, newAction];
    setPanels(newPanels);
  };

  const removeAction = (panelIndex: number, actionIndex: number) => {
    const newPanels = [...panels];
    newPanels[panelIndex].actions = newPanels[panelIndex].actions.filter((_, i) => i !== actionIndex);
    setPanels(newPanels);
  };

  const updateAction = (panelIndex: number, actionIndex: number, field: keyof CarouselAction, value: any) => {
    const newPanels = [...panels];
    newPanels[panelIndex].actions[actionIndex] = { ...newPanels[panelIndex].actions[actionIndex], [field]: value };
    setPanels(newPanels);
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
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="text">テキスト</TabsTrigger>
                  <TabsTrigger value="image">画像</TabsTrigger>
                  <TabsTrigger value="carousel">カルーセル (パネル)</TabsTrigger>
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
                  <div className="border-2 border-dashed rounded-lg p-8 text-center text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer">
                    <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>画像をドラッグ＆ドロップ、またはクリックしてアップロード</p>
                    <p className="text-xs text-muted-foreground mt-2">推奨サイズ: 1040px × 1040px (10MB以下)</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="carousel">
                  <div className="space-y-6">
                    {/* Panel Selector */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2">
                      {panels.map((panel, index) => (
                        <div 
                          key={panel.id}
                          onClick={() => setActivePanelIndex(index)}
                          className={`
                            relative flex-shrink-0 w-24 h-24 border-2 rounded-lg cursor-pointer overflow-hidden bg-gray-50
                            ${activePanelIndex === index ? 'border-[#06C755] ring-2 ring-[#06C755]/20' : 'border-gray-200 hover:border-gray-300'}
                          `}
                        >
                          <div className="absolute top-1 left-1 bg-black/50 text-white text-[10px] px-1.5 rounded-full">
                            #{index + 1}
                          </div>
                          {panel.imageUrl ? (
                            <img src={panel.imageUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <ImageIcon className="w-8 h-8" />
                            </div>
                          )}
                          {panels.length > 1 && (
                            <button 
                              type="button"
                              onClick={(e) => { e.stopPropagation(); removePanel(index); }}
                              className="absolute top-1 right-1 bg-white/80 hover:bg-red-100 text-gray-500 hover:text-red-500 rounded-full p-0.5"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ))}
                      {panels.length < 10 && (
                        <button
                          type="button"
                          onClick={addPanel}
                          className="flex-shrink-0 w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-[#06C755] hover:text-[#06C755] transition-colors"
                        >
                          <Plus className="w-6 h-6 mb-1" />
                          <span className="text-xs font-medium">追加</span>
                        </button>
                      )}
                    </div>

                    {/* Active Panel Editor */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-sm text-gray-700">パネル #{activePanelIndex + 1} の編集</h3>
                      </div>

                      <div className="grid gap-4">
                        {/* Image */}
                        <div className="grid gap-2">
                          <Label>画像</Label>
                          <div className="flex gap-4 items-start">
                            <div className="w-24 h-24 bg-white border rounded-md flex items-center justify-center overflow-hidden shrink-0">
                              {panels[activePanelIndex].imageUrl ? (
                                <img src={panels[activePanelIndex].imageUrl} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <ImageIcon className="w-8 h-8 text-gray-300" />
                              )}
                            </div>
                            <div className="flex-1 space-y-2">
                              <Input 
                                placeholder="画像URLを入力 (https://...)" 
                                value={panels[activePanelIndex].imageUrl}
                                onChange={(e) => updatePanel(activePanelIndex, 'imageUrl', e.target.value)}
                              />
                              <p className="text-xs text-muted-foreground">
                                ※ アスペクト比 1:1.51 の画像を推奨します
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Title */}
                        <div className="grid gap-2">
                          <Label>タイトル (任意)</Label>
                          <Input 
                            placeholder="タイトルを入力 (最大40文字)" 
                            maxLength={40}
                            value={panels[activePanelIndex].title}
                            onChange={(e) => updatePanel(activePanelIndex, 'title', e.target.value)}
                          />
                        </div>

                        {/* Text */}
                        <div className="grid gap-2">
                          <Label>本文 <span className="text-red-500">*</span></Label>
                          <Textarea 
                            placeholder="本文を入力 (最大60文字)" 
                            maxLength={60}
                            className="h-20 resize-none"
                            value={panels[activePanelIndex].text}
                            onChange={(e) => updatePanel(activePanelIndex, 'text', e.target.value)}
                          />
                          <div className="text-right text-xs text-muted-foreground">
                            {panels[activePanelIndex].text.length} / 60
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label>アクションボタン (最大4つ)</Label>
                            {panels[activePanelIndex].actions.length < 4 && (
                              <Button type="button" variant="outline" size="sm" onClick={() => addAction(activePanelIndex)}>
                                <Plus className="w-3 h-3 mr-1" /> 追加
                              </Button>
                            )}
                          </div>
                          
                          <div className="space-y-3">
                            {panels[activePanelIndex].actions.map((action, idx) => (
                              <div key={idx} className="bg-white p-3 rounded border border-gray-200 space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-gray-500">ボタン {idx + 1}</span>
                                  {panels[activePanelIndex].actions.length > 1 && (
                                    <button 
                                      type="button" 
                                      onClick={() => removeAction(activePanelIndex, idx)}
                                      className="text-gray-400 hover:text-red-500"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="space-y-1">
                                    <Label className="text-xs">タイプ</Label>
                                    <Select 
                                      value={action.type} 
                                      onValueChange={(val) => updateAction(activePanelIndex, idx, 'type', val)}
                                    >
                                      <SelectTrigger className="h-8 text-xs">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="uri">WEBページを開く</SelectItem>
                                        <SelectItem value="message">メッセージ送信</SelectItem>
                                        <SelectItem value="postback">ポストバック</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-xs">ラベル</Label>
                                    <Input 
                                      className="h-8 text-xs" 
                                      placeholder="ボタン名" 
                                      maxLength={20}
                                      value={action.label}
                                      onChange={(e) => updateAction(activePanelIndex, idx, 'label', e.target.value)}
                                    />
                                  </div>
                                </div>
                                {action.type === 'uri' && (
                                  <Input 
                                    className="h-8 text-xs" 
                                    placeholder="https://..." 
                                    value={action.uri}
                                    onChange={(e) => updateAction(activePanelIndex, idx, 'uri', e.target.value)}
                                  />
                                )}
                                {action.type === 'message' && (
                                  <Input 
                                    className="h-8 text-xs" 
                                    placeholder="送信されるメッセージ" 
                                    value={action.text}
                                    onChange={(e) => updateAction(activePanelIndex, idx, 'text', e.target.value)}
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>プレビュー</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-[#849ebf] p-4 rounded-lg min-h-[500px] relative flex flex-col items-center">
                {/* LINE Talk Screen Mockup */}
                {activeTab === 'text' && (
                  <div className="bg-white rounded-lg p-3 max-w-[85%] shadow-sm relative mt-4 self-start ml-2">
                    <div className="absolute top-2 -left-2 w-3 h-3 bg-white transform rotate-45"></div>
                    <p className="text-sm whitespace-pre-wrap break-words text-gray-800">
                      {formData.content || "メッセージを入力するとここにプレビューが表示されます。"}
                    </p>
                  </div>
                )}

                {activeTab === 'image' && (
                  <div className="mt-4 max-w-[70%] rounded-lg overflow-hidden shadow-sm self-start ml-2">
                    <div className="bg-gray-200 w-48 h-48 flex items-center justify-center text-gray-400">
                      <ImageIcon className="w-12 h-12" />
                    </div>
                  </div>
                )}

                {activeTab === 'carousel' && (
                  <div className="w-full overflow-x-auto pb-4 mt-4">
                    <div className="flex gap-3 px-2 min-w-max">
                      {panels.map((panel, idx) => (
                        <div key={idx} className="w-[240px] bg-white rounded-xl overflow-hidden shadow-sm flex-shrink-0">
                          {/* Image Area */}
                          <div className="w-full h-[160px] bg-gray-200 relative">
                            {panel.imageUrl ? (
                              <img src={panel.imageUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                                <ImageIcon className="w-8 h-8" />
                              </div>
                            )}
                            {/* Title Overlay if needed, but usually below */}
                          </div>
                          
                          {/* Content Area */}
                          <div className="p-3">
                            {panel.title && (
                              <h4 className="font-bold text-sm mb-1 text-gray-900 line-clamp-1">{panel.title}</h4>
                            )}
                            <p className="text-xs text-gray-600 line-clamp-3 min-h-[3em]">
                              {panel.text || "本文がここに入ります"}
                            </p>
                          </div>

                          {/* Buttons */}
                          <div className="border-t border-gray-100">
                            {panel.actions.map((action, actionIdx) => (
                              <div 
                                key={actionIdx} 
                                className="h-10 flex items-center justify-center text-[#06C755] text-sm font-medium border-b border-gray-100 last:border-0 hover:bg-gray-50 cursor-pointer"
                              >
                                {action.label || "ボタン"}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-3 sticky top-[600px]">
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
