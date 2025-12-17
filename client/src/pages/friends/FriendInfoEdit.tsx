import React, { useState } from "react";
import { PageTemplate } from "@/components/page-template";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Save, User, Plus, Trash2 } from "lucide-react";
import { Link } from "wouter";

export default function FriendInfoEditPage() {
  const [formData, setFormData] = useState({
    fieldName: "",
    fieldType: "text", // text, number, date, select, checkbox
    folder: "default",
    isRequired: false,
    options: [""]
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fieldName) {
      toast.error("管理名を入力してください");
      return;
    }
    toast.success("友だち情報を保存しました");
  };

  const addOption = () => {
    setFormData({...formData, options: [...formData.options, ""]});
  };

  const removeOption = (index: number) => {
    const newOptions = [...formData.options];
    newOptions.splice(index, 1);
    setFormData({...formData, options: newOptions});
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({...formData, options: newOptions});
  };

  return (
    <PageTemplate 
      title="友だち情報登録" 
      description="友だちごとに保存するカスタム情報の項目を作成します。"
      breadcrumbs={[
        { label: "友だち管理", href: "/friends" },
        { label: "友だち情報管理", href: "/friends/info" },
        { label: "新規作成" }
      ]}
    >
      <form onSubmit={handleSave} className="max-w-3xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>基本設定</CardTitle>
            <CardDescription>項目の種類や名称を設定します。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="fieldName">管理名 <span className="text-red-500">*</span></Label>
              <Input 
                id="fieldName" 
                placeholder="例: 顧客ランク、生年月日" 
                value={formData.fieldName}
                onChange={(e) => setFormData({...formData, fieldName: e.target.value})}
              />
              <p className="text-xs text-gray-500">管理画面で表示される名称です。</p>
            </div>

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
                  <SelectItem value="basic">基本情報</SelectItem>
                  <SelectItem value="survey">アンケート回答</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="fieldType">入力タイプ</Label>
              <Select 
                value={formData.fieldType} 
                onValueChange={(val) => setFormData({...formData, fieldType: val})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="タイプを選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">テキスト（1行）</SelectItem>
                  <SelectItem value="textarea">テキスト（複数行）</SelectItem>
                  <SelectItem value="number">数値</SelectItem>
                  <SelectItem value="date">日付</SelectItem>
                  <SelectItem value="select">選択リスト（プルダウン）</SelectItem>
                  <SelectItem value="checkbox">チェックボックス</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(formData.fieldType === "select" || formData.fieldType === "checkbox") && (
              <div className="border rounded-md p-4 bg-gray-50">
                <Label className="mb-2 block">選択肢設定</Label>
                <div className="space-y-2">
                  {formData.options.map((opt, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input 
                        value={opt} 
                        onChange={(e) => updateOption(idx, e.target.value)}
                        placeholder={`選択肢 ${idx + 1}`}
                      />
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => removeOption(idx)}
                        disabled={formData.options.length <= 1}
                      >
                        <Trash2 className="w-4 h-4 text-gray-500" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={addOption} className="mt-2">
                    <Plus className="w-4 h-4 mr-2" /> 選択肢を追加
                  </Button>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-2 pt-2">
              <Checkbox 
                id="isRequired" 
                checked={formData.isRequired}
                onCheckedChange={(checked) => setFormData({...formData, isRequired: checked as boolean})}
              />
              <Label htmlFor="isRequired" className="font-normal cursor-pointer">
                フォーム等での入力を必須にする
              </Label>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4 justify-end">
          <Link href="/friends">
            <Button variant="outline">キャンセル</Button>
          </Link>
          <Button type="submit" className="bg-[#06C755] hover:bg-[#05b34c] text-white min-w-[120px]">
            <Save className="w-4 h-4 mr-2" />
            保存する
          </Button>
        </div>
      </form>
    </PageTemplate>
  );
}
