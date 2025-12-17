import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
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
  Filter,
  ChevronRight,
  X
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
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface ActionBuilderProps {
  // Modal mode props
  isOpen?: boolean;
  onClose?: () => void;
  onSave?: (steps: ActionSetStep[]) => void;
  initialSteps?: ActionSetStep[];
  triggerName?: string;
  
  // Inline mode props
  mode?: 'modal' | 'inline';
  actions?: ActionSetStep[];
  onChange?: (steps: ActionSetStep[]) => void;
}

const ACTION_TYPES: { type: ActionType; label: string; icon: React.ElementType; description: string }[] = [
  { type: 'step_scenario', label: 'ステップ', icon: Activity, description: 'ステップ配信の開始・停止・再開' },
  { type: 'template_message', label: 'テンプレート', icon: Layout, description: '作成済みテンプレートを送信' },
  { type: 'text_message', label: 'テキスト', icon: MessageSquare, description: 'テキストメッセージを送信' },
  { type: 'reminder', label: 'リマインド', icon: Clock, description: 'リマインドの開始・停止' },
  { type: 'tag', label: 'タグ', icon: Tag, description: 'タグの付与・解除' },
  { type: 'rich_menu', label: 'リッチメニュー', icon: Layout, description: 'リッチメニューの表示・非表示' },
  { type: 'bookmark', label: 'ブックマーク', icon: Bookmark, description: 'ブックマークの付与・解除' },
  { type: 'friend_info', label: '友だち情報', icon: User, description: '友だち情報の更新' },
  { type: 'status', label: '対応ステータス', icon: FileText, description: '対応ステータスの変更' },
  { type: 'block', label: 'ブロック', icon: Ban, description: 'ブロック・ブロック解除' },
];

// Mock Filter Dialog Component
const FilterSettingsDialog = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialConditions 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSave: (conditions: any) => void;
  initialConditions: any;
}) => {
  const [conditions, setConditions] = useState<any>(initialConditions || {});

  // Mock implementation for filter settings
  // In a real implementation, this would be a complex form with tag selectors, etc.
  const toggleTagCondition = () => {
    setConditions({
      ...conditions,
      has_tags: conditions.has_tags ? undefined : ['tag_1'] // Mock tag ID
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>絞り込み条件設定</DialogTitle>
          <DialogDescription>
            このアクションを実行する条件を設定します。
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="filter_tags" 
              checked={!!conditions.has_tags}
              onCheckedChange={toggleTagCondition}
            />
            <Label htmlFor="filter_tags">特定のタグが付いている場合のみ実行</Label>
          </div>
          {/* Add more filter options here */}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>キャンセル</Button>
          <Button onClick={() => onSave(conditions)}>保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export function ActionBuilder({ 
  isOpen, 
  onClose, 
  onSave, 
  initialSteps = [], 
  triggerName,
  mode = 'modal',
  actions,
  onChange
}: ActionBuilderProps) {
  const [internalSteps, setInternalSteps] = useState<ActionSetStep[]>(initialSteps);
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [filterStepId, setFilterStepId] = useState<string | null>(null);

  // Sync with external state if provided
  useEffect(() => {
    if (actions) {
      setInternalSteps(actions);
    }
  }, [actions]);

  const updateSteps = (newSteps: ActionSetStep[]) => {
    setInternalSteps(newSteps);
    if (onChange) {
      onChange(newSteps);
    }
  };

  const handleAddAction = (type: ActionType) => {
    const newStep: ActionSetStep = {
      id: Math.random().toString(36).substr(2, 9),
      tenant_id: "current_tenant",
      action_set_id: "temp_set",
      order: internalSteps.length + 1,
      action_type: type,
      action_payload_json: {},
      created_at: new Date().toISOString(),
    };
    
    updateSteps([...internalSteps, newStep]);
    setEditingStepId(newStep.id);
  };

  const handleRemoveStep = (index: number) => {
    const newSteps = [...internalSteps];
    newSteps.splice(index, 1);
    // Reorder
    newSteps.forEach((step, i) => step.order = i + 1);
    updateSteps(newSteps);
    if (editingStepId === internalSteps[index].id) {
      setEditingStepId(null);
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave(internalSteps);
    }
    if (onClose) {
      onClose();
    }
  };

  const handleSaveFilter = (conditions: any) => {
    if (!filterStepId) return;
    
    const newSteps = internalSteps.map(step => {
      if (step.id === filterStepId) {
        return { ...step, conditions_json: conditions };
      }
      return step;
    });
    
    updateSteps(newSteps);
    setFilterStepId(null);
  };

  const getActionSummary = (step: ActionSetStep) => {
    const payload = step.action_payload_json as any;
    if (!payload) return '未設定';
    
    switch (step.action_type) {
      case 'tag':
        return payload.operation === 'add' 
          ? `【既存追加】${payload.tags?.length || 0}個のタグをつける` 
          : `【解除】${payload.tags?.length || 0}個のタグを外す`;
      case 'text_message':
        return `【送信】${payload.text?.substring(0, 20) || ''}...`;
      case 'template_message':
        return `【送信】テンプレートID: ${payload.template_id || '未設定'}`;
      case 'step_scenario':
        return `【${payload.operation === 'start' ? '開始' : '停止'}】シナリオID: ${payload.scenario_id || '未設定'}`;
      default:
        return '設定済';
    }
  };

  const Content = (
    <div className="flex h-[600px] bg-gray-50 rounded-lg overflow-hidden border">
      {/* Left: Action Type Selector */}
      <div className="w-[240px] bg-white border-r flex flex-col">
        <div className="p-4 border-b bg-gray-50/50">
          <h3 className="font-medium text-sm text-gray-700">アクションを追加</h3>
        </div>
        <ScrollArea className="flex-1 p-2">
          <div className="space-y-1">
            {ACTION_TYPES.map((type) => (
              <button
                key={type.type}
                onClick={() => handleAddAction(type.type)}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md transition-colors group border border-transparent hover:border-gray-200"
              >
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-white group-hover:text-[#06C755] group-hover:shadow-sm transition-all">
                  <Plus className="w-4 h-4" />
                </div>
                <span className="font-medium">{type.label}</span>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Right: Action List */}
      <div className="flex-1 flex flex-col bg-gray-50/50">
        <div className="p-4 border-b bg-white flex justify-between items-center">
          <h3 className="font-medium text-sm text-gray-700">設定済みアクション ({internalSteps.length})</h3>
          <span className="text-xs text-gray-500">上から順に実行されます</span>
        </div>
        
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-2 max-w-3xl mx-auto">
            {internalSteps.map((step, index) => {
              const actionDef = ACTION_TYPES.find(t => t.type === step.action_type);
              const isEditing = editingStepId === step.id;
              const hasConditions = step.conditions_json && Object.keys(step.conditions_json as object).length > 0;

              return (
                <div key={step.id} className="bg-white rounded-lg border shadow-sm transition-all hover:shadow-md">
                  {/* Action Header / Summary Row */}
                  <div className="flex items-center p-3 gap-4">
                    <div className="flex items-center gap-3 min-w-[140px]">
                      <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-mono text-gray-500">
                        {index + 1}
                      </div>
                      <span className="font-bold text-sm text-gray-700">{actionDef?.label}</span>
                    </div>

                    <div className="flex-1 text-sm font-medium text-gray-600 truncate">
                      {getActionSummary(step)}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant={hasConditions ? "default" : "outline"}
                        size="sm"
                        className={cn(
                          "h-8 text-xs",
                          hasConditions 
                            ? "bg-blue-500 hover:bg-blue-600 text-white border-transparent" 
                            : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                        )}
                        onClick={() => setFilterStepId(step.id)}
                      >
                        <Filter className="w-3 h-3 mr-1" />
                        {hasConditions ? "絞込 設定済" : "絞込"}
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "h-8 text-xs",
                          isEditing ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:text-gray-900"
                        )}
                        onClick={() => setEditingStepId(isEditing ? null : step.id)}
                      >
                        {isEditing ? "閉じる" : "編集"}
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50"
                        onClick={() => handleRemoveStep(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Action Detail Form (Expandable) */}
                  {isEditing && (
                    <div className="border-t bg-gray-50/50 p-4 animate-in slide-in-from-top-2 duration-200">
                      <div className="bg-white rounded border p-4">
                        {step.action_type === 'step_scenario' && (
                          <StepScenarioActionForm 
                            value={step.action_payload_json} 
                            onChange={(val) => {
                              const newSteps = [...internalSteps];
                              newSteps[index].action_payload_json = val;
                              updateSteps(newSteps);
                            }} 
                          />
                        )}
                        {step.action_type === 'template_message' && (
                          <TemplateMessageActionForm 
                            value={step.action_payload_json} 
                            onChange={(val) => {
                              const newSteps = [...internalSteps];
                              newSteps[index].action_payload_json = val;
                              updateSteps(newSteps);
                            }} 
                          />
                        )}
                        {step.action_type === 'text_message' && (
                          <TextMessageActionForm 
                            value={step.action_payload_json} 
                            onChange={(val) => {
                              const newSteps = [...internalSteps];
                              newSteps[index].action_payload_json = val;
                              updateSteps(newSteps);
                            }} 
                          />
                        )}
                        {step.action_type === 'reminder' && (
                          <ReminderActionForm 
                            value={step.action_payload_json} 
                            onChange={(val) => {
                              const newSteps = [...internalSteps];
                              newSteps[index].action_payload_json = val;
                              updateSteps(newSteps);
                            }} 
                          />
                        )}
                        {step.action_type === 'tag' && (
                          <TagActionForm 
                            value={step.action_payload_json} 
                            onChange={(val) => {
                              const newSteps = [...internalSteps];
                              newSteps[index].action_payload_json = val;
                              updateSteps(newSteps);
                            }} 
                          />
                        )}
                        {step.action_type === 'rich_menu' && (
                          <RichMenuActionForm 
                            value={step.action_payload_json} 
                            onChange={(val) => {
                              const newSteps = [...internalSteps];
                              newSteps[index].action_payload_json = val;
                              updateSteps(newSteps);
                            }} 
                          />
                        )}
                        {step.action_type === 'bookmark' && (
                          <BookmarkActionForm 
                            value={step.action_payload_json} 
                            onChange={(val) => {
                              const newSteps = [...internalSteps];
                              newSteps[index].action_payload_json = val;
                              updateSteps(newSteps);
                            }} 
                          />
                        )}
                        {step.action_type === 'friend_info' && (
                          <FriendInfoActionForm 
                            value={step.action_payload_json} 
                            onChange={(val) => {
                              const newSteps = [...internalSteps];
                              newSteps[index].action_payload_json = val;
                              updateSteps(newSteps);
                            }} 
                          />
                        )}
                        {step.action_type === 'status' && (
                          <StatusActionForm 
                            value={step.action_payload_json} 
                            onChange={(val) => {
                              const newSteps = [...internalSteps];
                              newSteps[index].action_payload_json = val;
                              updateSteps(newSteps);
                            }} 
                          />
                        )}
                        {step.action_type === 'block' && (
                          <BlockActionForm 
                            value={step.action_payload_json} 
                            onChange={(val) => {
                              const newSteps = [...internalSteps];
                              newSteps[index].action_payload_json = val;
                              updateSteps(newSteps);
                            }} 
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {internalSteps.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400 border-2 border-dashed rounded-lg bg-white/50">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <Plus className="w-6 h-6 text-gray-300" />
                </div>
                <p className="text-sm font-medium">左側のメニューからアクションを追加してください</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Filter Settings Dialog */}
      {filterStepId && (
        <FilterSettingsDialog
          isOpen={!!filterStepId}
          onClose={() => setFilterStepId(null)}
          onSave={handleSaveFilter}
          initialConditions={internalSteps.find(s => s.id === filterStepId)?.conditions_json}
        />
      )}
    </div>
  );

  if (mode === 'inline') {
    return Content;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose && onClose()}>
      <DialogContent className="max-w-5xl p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-4 border-b bg-white">
          <DialogTitle>アクション設定</DialogTitle>
          {triggerName && (
            <DialogDescription>
              {triggerName} の実行時に行うアクションを設定します
            </DialogDescription>
          )}
        </DialogHeader>
        
        {Content}

        <DialogFooter className="p-4 border-t bg-white">
          <Button variant="outline" onClick={onClose}>キャンセル</Button>
          <Button onClick={handleSave} className="bg-[#06C755] hover:bg-[#05b34c] text-white">
            設定を保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
