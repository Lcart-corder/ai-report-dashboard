import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";

// Common Props
interface ActionFormProps {
  value: any;
  onChange: (value: any) => void;
}

// 1. Tag Action
export function TagActionForm({ value, onChange }: ActionFormProps) {
  const operation = value?.operation || 'add';
  const tags = value?.tags || [];

  return (
    <div className="space-y-4 p-4">
      <div className="space-y-2">
        <Label>操作タイプ</Label>
        <RadioGroup 
          value={operation} 
          onValueChange={(v) => onChange({ ...value, operation: v })}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="add" id="tag-add" />
            <Label htmlFor="tag-add">タグを付与</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="remove" id="tag-remove" />
            <Label htmlFor="tag-remove">タグを解除</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label>対象タグ</Label>
        <Select 
          onValueChange={(v) => {
            if (!tags.includes(v)) {
              onChange({ ...value, tags: [...tags, v] });
            }
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="タグを選択..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tag1">購入者</SelectItem>
            <SelectItem value="tag2">VIP会員</SelectItem>
            <SelectItem value="tag3">問い合わせ中</SelectItem>
            <SelectItem value="new_tag">+ 新しいタグを作成</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex flex-wrap gap-2 mt-2">
          {tags.map((tag: string) => (
            <div key={tag} className="bg-slate-100 px-2 py-1 rounded text-sm flex items-center gap-1">
              <span>{tag === 'tag1' ? '購入者' : tag === 'tag2' ? 'VIP会員' : tag}</span>
              <button 
                onClick={() => onChange({ ...value, tags: tags.filter((t: string) => t !== tag) })}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 2. Text Message Action
export function TextMessageActionForm({ value, onChange }: ActionFormProps) {
  return (
    <div className="space-y-4 p-4">
      <div className="space-y-2">
        <Label>メッセージ内容</Label>
        <Textarea 
          placeholder="メッセージを入力してください...&#13;&#10;{name}などの変数が使用できます"
          className="min-h-[200px]"
          value={value?.text || ''}
          onChange={(e) => onChange({ ...value, text: e.target.value })}
        />
        <div className="text-xs text-slate-500">
          利用可能な変数: {'{name}'} (友だち名), {'{line_id}'} (LINE ID)
        </div>
      </div>
    </div>
  );
}

// 3. Template Message Action
export function TemplateMessageActionForm({ value, onChange }: ActionFormProps) {
  return (
    <div className="space-y-4 p-4">
      <div className="space-y-2">
        <Label>送信するテンプレート</Label>
        <Select 
          value={value?.template_id} 
          onValueChange={(v) => onChange({ ...value, template_id: v })}
        >
          <SelectTrigger>
            <SelectValue placeholder="テンプレートを選択..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tmpl1">会員登録完了</SelectItem>
            <SelectItem value="tmpl2">商品発送通知</SelectItem>
            <SelectItem value="tmpl3">アンケートのお願い</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

// 4. Step Scenario Action
export function StepScenarioActionForm({ value, onChange }: ActionFormProps) {
  const operation = value?.operation || 'start';

  return (
    <div className="space-y-4 p-4">
      <div className="space-y-2">
        <Label>操作タイプ</Label>
        <Select 
          value={operation} 
          onValueChange={(v) => onChange({ ...value, operation: v })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="start">開始</SelectItem>
            <SelectItem value="stop">停止</SelectItem>
            <SelectItem value="resume">再開</SelectItem>
            <SelectItem value="start_from">途中から開始</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {(operation === 'start' || operation === 'start_from') && (
        <div className="space-y-2">
          <Label>対象シナリオ</Label>
          <Select 
            value={value?.scenario_id} 
            onValueChange={(v) => onChange({ ...value, scenario_id: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="シナリオを選択..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sc1">新規友だち登録シナリオ</SelectItem>
              <SelectItem value="sc2">購入後フォローアップ</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {operation === 'start_from' && (
        <div className="space-y-2">
          <Label>開始ステップ番号</Label>
          <Input 
            type="number" 
            min={1}
            value={value?.step_number || 1}
            onChange={(e) => onChange({ ...value, step_number: parseInt(e.target.value) })}
          />
        </div>
      )}

      <div className="bg-yellow-50 p-3 rounded text-sm text-yellow-800">
        ※ ステップ配信は同時に1つしか実行できません。新しいシナリオを開始すると、実行中の他のシナリオは自動的に停止します。
      </div>
    </div>
  );
}

// 5. Rich Menu Action
export function RichMenuActionForm({ value, onChange }: ActionFormProps) {
  const operation = value?.operation || 'show';

  return (
    <div className="space-y-4 p-4">
      <div className="space-y-2">
        <Label>操作タイプ</Label>
        <RadioGroup 
          value={operation} 
          onValueChange={(v) => onChange({ ...value, operation: v })}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="show" id="rm-show" />
            <Label htmlFor="rm-show">表示</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="hide" id="rm-hide" />
            <Label htmlFor="rm-hide">表示停止（解除）</Label>
          </div>
        </RadioGroup>
      </div>

      {operation === 'show' && (
        <div className="space-y-2">
          <Label>表示するリッチメニュー</Label>
          <Select 
            value={value?.menu_id} 
            onValueChange={(v) => onChange({ ...value, menu_id: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="リッチメニューを選択..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rm1">メインメニュー（会員用）</SelectItem>
              <SelectItem value="rm2">メインメニュー（ゲスト用）</SelectItem>
              <SelectItem value="rm3">キャンペーン用メニュー</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}

// 6. Reminder Action
export function ReminderActionForm({ value, onChange }: ActionFormProps) {
  const operation = value?.operation || 'start';

  return (
    <div className="space-y-4 p-4">
      <div className="space-y-2">
        <Label>操作タイプ</Label>
        <RadioGroup 
          value={operation} 
          onValueChange={(v) => onChange({ ...value, operation: v })}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="start" id="rem-start" />
            <Label htmlFor="rem-start">リマインド開始</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="stop" id="rem-stop" />
            <Label htmlFor="rem-stop">リマインド停止</Label>
          </div>
        </RadioGroup>
      </div>

      {operation === 'start' && (
        <>
          <div className="space-y-2">
            <Label>リマインド内容</Label>
            <Select 
              value={value?.reminder_id} 
              onValueChange={(v) => onChange({ ...value, reminder_id: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="リマインダーを選択..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rem1">来店予約リマインド</SelectItem>
                <SelectItem value="rem2">クーポン期限通知</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>基準日時</Label>
            <Input 
              type="datetime-local" 
              value={value?.base_datetime || ''}
              onChange={(e) => onChange({ ...value, base_datetime: e.target.value })}
            />
            <div className="text-xs text-slate-500">
              ※ この日時を基準に「1日前」「1時間前」などが計算されます
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// 7. Bookmark Action
export function BookmarkActionForm({ value, onChange }: ActionFormProps) {
  const operation = value?.operation || 'add';

  return (
    <div className="space-y-4 p-4">
      <div className="space-y-2">
        <Label>操作タイプ</Label>
        <RadioGroup 
          value={operation} 
          onValueChange={(v) => onChange({ ...value, operation: v })}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="add" id="bm-add" />
            <Label htmlFor="bm-add">重要（ブックマーク）にする</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="remove" id="bm-remove" />
            <Label htmlFor="bm-remove">重要（ブックマーク）を解除</Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
}

// 8. Friend Info Action
export function FriendInfoActionForm({ value, onChange }: ActionFormProps) {
  const operation = value?.operation || 'update';

  return (
    <div className="space-y-4 p-4">
      <div className="space-y-2">
        <Label>操作タイプ</Label>
        <Select 
          value={operation} 
          onValueChange={(v) => onChange({ ...value, operation: v })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="update">情報を登録・更新</SelectItem>
            <SelectItem value="delete">情報を削除</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>対象項目</Label>
        <Select 
          value={value?.field_id} 
          onValueChange={(v) => onChange({ ...value, field_id: v })}
        >
          <SelectTrigger>
            <SelectValue placeholder="友だち情報項目を選択..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="field1">氏名</SelectItem>
            <SelectItem value="field2">電話番号</SelectItem>
            <SelectItem value="field3">生年月日</SelectItem>
            <SelectItem value="field4">会員ランク</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {operation === 'update' && (
        <div className="space-y-2">
          <Label>設定する値</Label>
          <Input 
            placeholder="値を入力..." 
            value={value?.value || ''}
            onChange={(e) => onChange({ ...value, value: e.target.value })}
          />
          <div className="text-xs text-slate-500">
            ※ 選択肢タイプの場合は、選択肢の値を入力してください
          </div>
        </div>
      )}
    </div>
  );
}

// 9. Status Action
export function StatusActionForm({ value, onChange }: ActionFormProps) {
  return (
    <div className="space-y-4 p-4">
      <div className="space-y-2">
        <Label>変更後のステータス</Label>
        <Select 
          value={value?.status} 
          onValueChange={(v) => onChange({ ...value, status: v })}
        >
          <SelectTrigger>
            <SelectValue placeholder="ステータスを選択..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unhandled">未対応</SelectItem>
            <SelectItem value="handling">対応中</SelectItem>
            <SelectItem value="pending">保留</SelectItem>
            <SelectItem value="resolved">対応完了</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

// 10. Block Action
export function BlockActionForm({ value, onChange }: ActionFormProps) {
  const operation = value?.operation || 'block';

  return (
    <div className="space-y-4 p-4">
      <div className="space-y-2">
        <Label>操作タイプ</Label>
        <Select 
          value={operation} 
          onValueChange={(v) => onChange({ ...value, operation: v })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="block">ブロックする</SelectItem>
            <SelectItem value="unblock">ブロック解除</SelectItem>
            <SelectItem value="hide">非表示にする</SelectItem>
            <SelectItem value="unhide">非表示解除</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="bg-red-50 p-3 rounded text-sm text-red-800">
        ※ ブロックすると、友だちからのメッセージを受信できなくなります。
      </div>
    </div>
  );
}
