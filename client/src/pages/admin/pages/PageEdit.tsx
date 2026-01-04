import React, { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Page, PageBlock, BlockType } from "@/types/schema";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2, ArrowUp, ArrowDown, Image as ImageIcon, Type, ShoppingBag, MousePointerClick } from "lucide-react";

export default function PageEditPage() {
  const [match, params] = useRoute("/admin/pages/:id");
  const [, setLocation] = useLocation();
  const isNew = params?.id === "new";
  
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  
  // Page State
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED" | "ARCHIVED">("DRAFT");
  const [templateKey, setTemplateKey] = useState("landing_page_v1");
  const [blocks, setBlocks] = useState<PageBlock[]>([]);

  useEffect(() => {
    if (!isNew && params?.id) {
      fetch(`/api/admin/pages/${params.id}`)
        .then(res => res.json())
        .then((data: Page) => {
          setTitle(data.title);
          setSlug(data.slug);
          setStatus(data.status);
          setTemplateKey(data.template_key);
          setBlocks(data.blocks || []);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          toast.error("ページ情報の取得に失敗しました");
          setLoading(false);
        });
    }
  }, [isNew, params?.id]);

  const handleSave = async () => {
    if (!title || !slug) {
      toast.error("タイトルとURLスラッグは必須です");
      return;
    }

    setSaving(true);
    
    const pageData = {
      title,
      slug,
      status,
      template_key: templateKey,
      blocks
    };

    try {
      const url = isNew ? "/api/admin/pages" : `/api/admin/pages/${params?.id}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pageData)
      });

      if (res.ok) {
        toast.success(isNew ? "ページを作成しました" : "ページを更新しました");
        setLocation("/admin/pages");
      } else {
        const err = await res.json();
        toast.error(err.error || "保存に失敗しました");
      }
    } catch (err) {
      console.error(err);
      toast.error("エラーが発生しました");
    } finally {
      setSaving(false);
    }
  };

  const handleAddBlock = (type: BlockType) => {
    const newBlock: PageBlock = {
      id: `blk_${Date.now()}`,
      page_id: params?.id || "",
      block_type: type,
      sort_order: blocks.length + 1,
      config_json: getDefaultConfig(type) as any,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setBlocks([...blocks, newBlock]);
  };

  const getDefaultConfig = (type: BlockType) => {
    switch (type) {
      case "HERO_IMAGE":
        return { image_url: "", headline: "キャッチコピー", subheadline: "サブタイトル" };
      case "TEXT":
        return { content: "テキストを入力してください" };
      case "PRODUCT_LIST":
        return { title: "おすすめ商品", count: 4 };
      case "CTA":
        return { label: "ボタンテキスト", url: "/shop", style: "primary" };
      default:
        return {};
    }
  };

  const handleUpdateBlockConfig = (index: number, key: string, value: any) => {
    const newBlocks = [...blocks];
    newBlocks[index].config_json = {
      ...(newBlocks[index].config_json as any),
      [key]: value
    };
    setBlocks(newBlocks);
  };

  const handleMoveBlock = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === blocks.length - 1) return;

    const newBlocks = [...blocks];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    
    [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
    
    // Update sort_order
    newBlocks.forEach((b, i) => b.sort_order = i + 1);
    
    setBlocks(newBlocks);
  };

  const handleRemoveBlock = (index: number) => {
    if (!confirm("このブロックを削除してもよろしいですか？")) return;
    const newBlocks = [...blocks];
    newBlocks.splice(index, 1);
    setBlocks(newBlocks);
  };

  if (loading) return <div className="p-8 text-center">読み込み中...</div>;

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-24">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/admin/pages")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {isNew ? "新規ページ作成" : "ページ編集"}
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Blocks Editor */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>コンテンツブロック</CardTitle>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleAddBlock("HERO_IMAGE")}>
                    <ImageIcon className="w-4 h-4 mr-1" /> 画像
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleAddBlock("TEXT")}>
                    <Type className="w-4 h-4 mr-1" /> テキスト
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleAddBlock("PRODUCT_LIST")}>
                    <ShoppingBag className="w-4 h-4 mr-1" /> 商品
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {blocks.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed rounded-lg bg-gray-50">
                    <p className="text-gray-500">ブロックを追加してページを作成してください</p>
                  </div>
                ) : (
                  blocks.map((block, idx) => (
                    <div key={block.id} className="border rounded-lg p-4 bg-white relative group">
                      <div className="absolute right-2 top-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleMoveBlock(idx, "up")} disabled={idx === 0}>
                          <ArrowUp className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleMoveBlock(idx, "down")} disabled={idx === blocks.length - 1}>
                          <ArrowDown className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleRemoveBlock(idx)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="mb-4">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider border px-2 py-1 rounded bg-gray-50">
                          {block.block_type}
                        </span>
                      </div>

                      {/* Block Config Forms */}
                      <div className="space-y-4">
                        {block.block_type === "HERO_IMAGE" && (
                          <>
                            <div className="space-y-2">
                              <Label>画像URL</Label>
                              <Input 
                                value={(block.config_json as any).image_url} 
                                onChange={e => handleUpdateBlockConfig(idx, "image_url", e.target.value)}
                                placeholder="https://..."
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>見出し</Label>
                              <Input 
                                value={(block.config_json as any).headline} 
                                onChange={e => handleUpdateBlockConfig(idx, "headline", e.target.value)}
                              />
                            </div>
                          </>
                        )}

                        {block.block_type === "TEXT" && (
                          <div className="space-y-2">
                            <Label>本文</Label>
                            <Textarea 
                              value={(block.config_json as any).content} 
                              onChange={e => handleUpdateBlockConfig(idx, "content", e.target.value)}
                              rows={4}
                            />
                          </div>
                        )}

                        {block.block_type === "PRODUCT_LIST" && (
                          <div className="space-y-2">
                            <Label>セクションタイトル</Label>
                            <Input 
                              value={(block.config_json as any).title} 
                              onChange={e => handleUpdateBlockConfig(idx, "title", e.target.value)}
                            />
                            <div className="flex items-center gap-2 mt-2">
                              <Label>表示数</Label>
                              <Input 
                                type="number"
                                className="w-24"
                                value={(block.config_json as any).count} 
                                onChange={e => handleUpdateBlockConfig(idx, "count", parseInt(e.target.value))}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Page Settings */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>ページ設定</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>ページタイトル <span className="text-red-500">*</span></Label>
                  <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="例: サマーセール" />
                </div>
                <div className="space-y-2">
                  <Label>URLスラッグ <span className="text-red-500">*</span></Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">/s/</span>
                    <Input value={slug} onChange={e => setSlug(e.target.value)} placeholder="summer-sale" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>ステータス</Label>
                  <Select value={status} onValueChange={(v: any) => setStatus(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">下書き</SelectItem>
                      <SelectItem value="PUBLISHED">公開中</SelectItem>
                      <SelectItem value="ARCHIVED">アーカイブ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Fixed Bottom Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-10">
          <div className="max-w-7xl mx-auto flex justify-end gap-4">
            <Button variant="outline" onClick={() => setLocation("/admin/pages")}>
              キャンセル
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "保存中..." : "保存する"}
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
