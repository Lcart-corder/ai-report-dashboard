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
  X,
  HelpCircle,
  AlertCircle,
  ArrowLeft
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
  BlockActionForm,
  OmikujiActionForm
} from "./forms/ActionForms";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

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
  { type: 'omikuji', label: 'おみくじ', icon: Activity, description: 'おみくじを実行' },
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

  const handleRemoveStep = (index: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
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

  const renderActionForm = (step: ActionSetStep, index: number) => {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-4 border-b">
          <div>
            <h4 className="font-medium text-base">アクション設定</h4>
            <p className="text-sm text-gray-500 mt-1">
              {ACTION_TYPES.find(t => t.type === step.action_type)?.description}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={() => handleRemoveStep(index)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            削除
          </Button>
        </div>

        <div className="py-2">
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
          {step.action_type === 'omikuji' && (
            <OmikujiActionForm 
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
    );
  };

  const Content = (
    <div className="flex flex-col md:flex-row h-[80vh] max-h-[800px] bg-gray-50 rounded-lg overflow-hidden border relative">
      {/* Left Column: Action Type Selector */}
      <div className={cn(
        "bg-white border-r flex shrink-0 z-10 transition-all duration-300",
        // Mobile: Horizontal scrollable strip
        "w-full h-auto border-b md:border-b-0 flex-row overflow-x-auto",
        // Desktop: Vertical fixed width
        "md:flex-col md:w-[240px] md:h-full md:overflow-y-auto",
        // Hide on mobile when editing
        editingStepId ? "hidden md:flex" : "flex"
      )}>
        <div className="p-3 border-b bg-gray-50/50 shrink-0 hidden md:block">
          <h3 className="font-medium text-sm text-gray-700">アクションを追加</h3>
        </div>
        <div className="p-2 flex md:flex-col gap-1 min-w-max md:min-w-0">
          {ACTION_TYPES.map((type) => (
            <button
              key={type.type}
              onClick={() => handleAddAction(type.type)}
              className={cn(
                "flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md transition-colors group border border-transparent hover:border-gray-200 text-left",
                "flex-col md:flex-row items-center md:items-center justify-center md:justify-start w-[70px] md:w-full"
              )}
            >
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-white group-hover:text-[#06C755] group-hover:shadow-sm transition-all shrink-0">
                <type.icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0 text-center md:text-left">
                <span className="font-medium block truncate text-xs md:text-sm">{type.label}</span>
                <span className="text-xs text-gray-400 hidden md:block truncate">{type.description}</span>
              </div>
              <Plus className="w-4 h-4 text-gray-300 group-hover:text-[#06C755] opacity-0 group-hover:opacity-100 transition-opacity hidden md:block" />
            </button>
          ))}
        </div>
      </div>

      {/* Middle Column: Action List */}
      <div className={cn(
        "flex flex-col bg-gray-50/50 border-r shrink-0 transition-all duration-300",
        // Mobile: Full width
        "w-full flex-1",
        // Desktop: Fixed width
        "md:w-[280px]",
        // Hide on mobile when editing
        editingStepId ? "hidden md:flex" : "flex"
      )}>
        <div className="p-4 border-b bg-white flex justify-between items-center h-[57px] shrink-0">
          <h3 className="font-medium text-sm text-gray-700">設定済みアクション ({internalSteps.length})</h3>
        </div>
        
        <ScrollArea className="flex-1 p-3">
          <div className="space-y-2">
            {internalSteps.map((step, index) => {
              const actionDef = ACTION_TYPES.find(t => t.type === step.action_type);
              const isEditing = editingStepId === step.id;
              const hasConditions = step.conditions_json && Object.keys(step.conditions_json as object).length > 0;

              return (
                <div 
                  key={step.id} 
                  className={cn(
                    "bg-white rounded-lg border transition-all cursor-pointer relative group",
                    isEditing ? "border-[#06C755] ring-1 ring-[#06C755] shadow-sm" : "hover:border-gray-300 hover:shadow-sm"
                  )}
                  onClick={() => setEditingStepId(step.id)}
                >
                  <div className="p-3">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono shrink-0",
                        isEditing ? "bg-[#06C755] text-white" : "bg-gray-100 text-gray-500"
                      )}>
                        {index + 1}
                      </div>
                      <span className="font-bold text-sm text-gray-700 truncate flex-1">{actionDef?.label}</span>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => handleRemoveStep(index, e)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>

                    <div className="text-xs text-gray-600 line-clamp-2 pl-9 mb-2 min-h-[1.5em]">
                      {getActionSummary(step)}
                    </div>

                    <div className="pl-9 flex gap-2">
                      <Button
                        variant={hasConditions ? "default" : "outline"}
                        size="sm"
                        className={cn(
                          "h-6 text-[10px] px-2",
                          hasConditions 
                            ? "bg-blue-500 hover:bg-blue-600 text-white border-transparent" 
                            : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          setFilterStepId(step.id);
                        }}
                      >
                        <Filter className="w-3 h-3 mr-1" />
                        {hasConditions ? "絞込あり" : "絞込"}
                      </Button>
                    </div>
                  </div>
                  
                  {isEditing && (
                    <div className="absolute right-[-1px] top-1/2 -translate-y-1/2 w-3 h-6 bg-white border-l border-t border-b border-[#06C755] rounded-l-full z-20 hidden md:block"></div>
                  )}
                </div>
              );
            })}

            {internalSteps.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400 border-2 border-dashed rounded-lg bg-white/50 mx-1">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <Plus className="w-5 h-5 text-gray-300" />
                </div>
                <p className="text-xs font-medium text-center px-4">左側のメニューから<br/>アクションを追加</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Right Column: Action Detail Form (Flexible) */}
      <div className={cn(
        "bg-white flex flex-col min-w-0 transition-all duration-300",
        // Mobile: Full width overlay
        "w-full h-full absolute inset-0 z-20 md:static md:h-auto md:z-auto",
        // Desktop: Flexible width
        "md:flex-1",
        // Visibility
        editingStepId ? "flex" : "hidden md:flex"
      )}>
        {editingStepId ? (
          <div className="flex flex-col h-full md:flex-row">
            {/* Mobile Header with Back Button */}
            <div className="md:hidden p-4 border-b flex items-center gap-2 bg-white shrink-0">
              <Button variant="ghost" size="icon" onClick={() => setEditingStepId(null)}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <span className="font-bold">アクション設定</span>
            </div>

            {/* Form Area */}
            <div className="flex-1 flex flex-col min-w-0">
              <ScrollArea className="flex-1">
                <div className="p-4 md:p-6 max-w-3xl mx-auto w-full">
                  {internalSteps.map((step, index) => {
                    if (step.id !== editingStepId) return null;
                    return (
                      <div key={step.id} className="animate-in fade-in duration-200">
                        {renderActionForm(step, index)}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
            
            {/* Help/Preview Area (Far Right) */}
            <div className="w-[280px] border-l bg-gray-50/30 hidden xl:flex flex-col shrink-0">
              <div className="p-4 border-b bg-gray-50/50">
                <h3 className="font-medium text-sm text-gray-700 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" />
                  ヘルプ・仕様
                </h3>
              </div>
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4 text-sm text-gray-600">
                  <div className="bg-blue-50 border border-blue-100 rounded-md p-3">
                    <h4 className="font-medium text-blue-800 mb-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      設定のヒント
                    </h4>
                    <p className="text-xs text-blue-700 leading-relaxed">
                      アクションは上から順に実行されます。順序を変更するには、リスト内の項目をドラッグ＆ドロップしてください（実装予定）。
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">このアクションについて</h4>
                    <p className="text-xs leading-relaxed text-gray-500">
                      {internalSteps.find(s => s.id === editingStepId) 
                        ? ACTION_TYPES.find(t => t.type === internalSteps.find(s => s.id === editingStepId)?.action_type)?.description
                        : 'アクションを選択してください'}
                    </p>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">よくある質問</h4>
                    <ul className="space-y-2 text-xs text-gray-500 list-disc pl-4">
                      <li>複数のアクションを組み合わせることで、複雑な自動化が可能です。</li>
                      <li>「絞り込み」を設定すると、特定の条件を満たす友だちにのみアクションを実行できます。</li>
                    </ul>
                  </div>
                </div>
              </ScrollArea>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50/30 hidden md:flex">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Layout className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="font-medium text-gray-900 mb-1">アクションを選択してください</h3>
            <p className="text-sm text-gray-500">
              リストからアクションを選択して編集するか、<br/>
              左側のメニューから新しいアクションを追加してください。
            </p>
          </div>
        )}
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
      <DialogContent className="max-w-[1440px] w-[95vw] h-[90vh] max-h-[900px] p-0 gap-0 overflow-hidden flex flex-col">
        <DialogHeader className="p-4 border-b bg-white shrink-0">
          <DialogTitle>アクション設定</DialogTitle>
          {triggerName && (
            <DialogDescription>
              {triggerName} の実行時に行うアクションを設定します
            </DialogDescription>
          )}
        </DialogHeader>
        
        <div className="flex-1 min-h-0 overflow-hidden">
          {Content}
        </div>

        <DialogFooter className="p-4 border-t bg-white shrink-0">
          <Button variant="outline" onClick={onClose}>キャンセル</Button>
          <Button onClick={handleSave} className="bg-[#06C755] hover:bg-[#05b34c] text-white">
            設定を保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
