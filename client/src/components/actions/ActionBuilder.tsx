import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActionSetStep, ActionType } from "@/types/schema";
import { 
  MessageSquare, 
  FileText, 
  Clock, 
  Tag, 
  Layout, 
  Bookmark, 
  User, 
  Activity, 
  Ban, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown,
  Settings
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  StepScenarioActionForm,
  TemplateMessageActionForm,
  TextMessageActionForm,
  ReminderActionForm,
  TagActionForm,
  RichMenuActionForm,
  BookmarkActionForm,
  FriendInfoActionForm,
  StatusActionForm,
  BlockActionForm
} from "./forms/ActionForms";

interface ActionBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (steps: ActionSetStep[]) => void;
  initialSteps?: ActionSetStep[];
  triggerName?: string;
}

const ACTION_TYPES: { type: ActionType; label: string; icon: React.ElementType; description: string }[] = [
  { type: 'step_scenario', label: 'ステップ配信', icon: Activity, description: 'ステップ配信の開始・停止・再開' },
  { type: 'template_message', label: 'テンプレート送信', icon: Layout, description: '作成済みテンプレートを送信' },
  { type: 'text_message', label: 'テキスト送信', icon: MessageSquare, description: 'テキストメッセージを送信' },
  { type: 'reminder', label: 'リマインド', icon: Clock, description: 'リマインドの開始・停止' },
  { type: 'tag', label: 'タグ操作', icon: Tag, description: 'タグの付与・解除' },
  { type: 'rich_menu', label: 'リッチメニュー', icon: Layout, description: 'リッチメニューの表示・非表示' },
  { type: 'bookmark', label: 'ブックマーク', icon: Bookmark, description: 'ブックマークの付与・解除' },
  { type: 'friend_info', label: '友だち情報', icon: User, description: '友だち情報の更新' },
  { type: 'status', label: '対応ステータス', icon: FileText, description: '対応ステータスの変更' },
  { type: 'block', label: 'ブロック操作', icon: Ban, description: 'ブロック・ブロック解除' },
];

export function ActionBuilder({ isOpen, onClose, onSave, initialSteps = [], triggerName }: ActionBuilderProps) {
  const [steps, setSteps] = useState<ActionSetStep[]>(initialSteps);
  const [selectedActionType, setSelectedActionType] = useState<ActionType | "">("");

  const handleAddAction = () => {
    if (!selectedActionType) return;
    
    const newStep: ActionSetStep = {
      id: Math.random().toString(36).substr(2, 9),
      tenant_id: "current_tenant",
      action_set_id: "temp_set",
      order: steps.length + 1,
      action_type: selectedActionType,
      action_payload_json: {},
      created_at: new Date().toISOString(),
    };
    
    setSteps([...steps, newStep]);
    setSelectedActionType("");
  };

  const handleRemoveStep = (index: number) => {
    const newSteps = [...steps];
    newSteps.splice(index, 1);
    // Reorder
    newSteps.forEach((step, i) => step.order = i + 1);
    setSteps(newSteps);
  };

  const handleMoveStep = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === steps.length - 1) return;

    const newSteps = [...steps];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
    
    // Reorder
    newSteps.forEach((step, i) => step.order = i + 1);
    setSteps(newSteps);
  };

  const handleSave = () => {
    onSave(steps);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>アクション設定</DialogTitle>
          <DialogDescription>
            {triggerName ? `${triggerName}時の` : ""}アクションを設定します。複数のアクションを順序通りに実行します。
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex gap-4 overflow-hidden">
          {/* Left: Action List */}
          <div className="w-1/3 border-r pr-4 flex flex-col">
            <h3 className="font-medium mb-2">アクション一覧</h3>
            <ScrollArea className="flex-1">
              <div className="space-y-2">
                {steps.map((step, index) => {
                  const actionDef = ACTION_TYPES.find(t => t.type === step.action_type);
                  return (
                    <Card key={step.id} className="p-3 relative group">
                      <div className="flex items-center gap-2">
                        <div className="bg-slate-100 p-2 rounded text-slate-500 font-mono text-xs w-6 h-6 flex items-center justify-center">
                          {index + 1}
                        </div>
                        {actionDef?.icon && <actionDef.icon className="w-4 h-4 text-slate-500" />}
                        <span className="font-medium text-sm">{actionDef?.label}</span>
                      </div>
                      
                      <div className="absolute right-2 top-2 hidden group-hover:flex gap-1">
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleMoveStep(index, 'up')} disabled={index === 0}>
                          <ArrowUp className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleMoveStep(index, 'down')} disabled={index === steps.length - 1}>
                          <ArrowDown className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:text-red-600" onClick={() => handleRemoveStep(index)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </Card>
                  );
                })}
                
                {steps.length === 0 && (
                  <div className="text-center py-8 text-slate-400 text-sm border-2 border-dashed rounded-lg">
                    アクションが設定されていません
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="mt-4 pt-4 border-t">
              <div className="flex gap-2">
                <Select value={selectedActionType} onValueChange={(v) => setSelectedActionType(v as ActionType)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="アクションを追加..." />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTION_TYPES.map(type => (
                      <SelectItem key={type.type} value={type.type}>
                        <div className="flex items-center gap-2">
                          <type.icon className="w-4 h-4" />
                          <span>{type.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleAddAction} disabled={!selectedActionType}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Right: Action Details */}
          <div className="flex-1 pl-4 flex flex-col">
            <h3 className="font-medium mb-2">詳細設定</h3>
            <div className="flex-1 border rounded-lg bg-white overflow-y-auto">
              {steps.length > 0 ? (
                <div className="divide-y">
                  {steps.map((step, index) => {
                    const actionDef = ACTION_TYPES.find(t => t.type === step.action_type);
                    return (
                      <div key={step.id} className="p-4">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="bg-slate-100 p-1 rounded text-slate-500 font-mono text-xs w-5 h-5 flex items-center justify-center">
                            {index + 1}
                          </div>
                          <h4 className="font-bold text-sm">{actionDef?.label}</h4>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="ml-auto h-6 text-red-500"
                            onClick={() => handleRemoveStep(index)}
                          >
                            削除
                          </Button>
                        </div>
                        
                        <div className="pl-7">
                          {step.action_type === 'step_scenario' && (
                            <StepScenarioActionForm 
                              value={step.action_payload_json} 
                              onChange={(val) => {
                                const newSteps = [...steps];
                                newSteps[index].action_payload_json = val;
                                setSteps(newSteps);
                              }} 
                            />
                          )}
                          {step.action_type === 'template_message' && (
                            <TemplateMessageActionForm 
                              value={step.action_payload_json} 
                              onChange={(val) => {
                                const newSteps = [...steps];
                                newSteps[index].action_payload_json = val;
                                setSteps(newSteps);
                              }} 
                            />
                          )}
                          {step.action_type === 'text_message' && (
                            <TextMessageActionForm 
                              value={step.action_payload_json} 
                              onChange={(val) => {
                                const newSteps = [...steps];
                                newSteps[index].action_payload_json = val;
                                setSteps(newSteps);
                              }} 
                            />
                          )}
                          {step.action_type === 'reminder' && (
                            <ReminderActionForm 
                              value={step.action_payload_json} 
                              onChange={(val) => {
                                const newSteps = [...steps];
                                newSteps[index].action_payload_json = val;
                                setSteps(newSteps);
                              }} 
                            />
                          )}
                          {step.action_type === 'tag' && (
                            <TagActionForm 
                              value={step.action_payload_json} 
                              onChange={(val) => {
                                const newSteps = [...steps];
                                newSteps[index].action_payload_json = val;
                                setSteps(newSteps);
                              }} 
                            />
                          )}
                          {step.action_type === 'rich_menu' && (
                            <RichMenuActionForm 
                              value={step.action_payload_json} 
                              onChange={(val) => {
                                const newSteps = [...steps];
                                newSteps[index].action_payload_json = val;
                                setSteps(newSteps);
                              }} 
                            />
                          )}
                          {step.action_type === 'bookmark' && (
                            <BookmarkActionForm 
                              value={step.action_payload_json} 
                              onChange={(val) => {
                                const newSteps = [...steps];
                                newSteps[index].action_payload_json = val;
                                setSteps(newSteps);
                              }} 
                            />
                          )}
                          {step.action_type === 'friend_info' && (
                            <FriendInfoActionForm 
                              value={step.action_payload_json} 
                              onChange={(val) => {
                                const newSteps = [...steps];
                                newSteps[index].action_payload_json = val;
                                setSteps(newSteps);
                              }} 
                            />
                          )}
                          {step.action_type === 'status' && (
                            <StatusActionForm 
                              value={step.action_payload_json} 
                              onChange={(val) => {
                                const newSteps = [...steps];
                                newSteps[index].action_payload_json = val;
                                setSteps(newSteps);
                              }} 
                            />
                          )}
                          {step.action_type === 'block' && (
                            <BlockActionForm 
                              value={step.action_payload_json} 
                              onChange={(val) => {
                                const newSteps = [...steps];
                                newSteps[index].action_payload_json = val;
                                setSteps(newSteps);
                              }} 
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400">
                  <div className="text-center">
                    <Settings className="w-12 h-12 mx-auto mb-2 opacity-20" />
                    <p>左側でアクションを追加してください</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>キャンセル</Button>
          <Button onClick={handleSave}>設定を保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
