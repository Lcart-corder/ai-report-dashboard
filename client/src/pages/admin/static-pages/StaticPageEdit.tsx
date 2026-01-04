import React, { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { StaticPage } from "@/types/schema";
import { toast } from "sonner";
import { ArrowLeft, Calendar, Eye } from "lucide-react";
import { format } from "date-fns";

export default function StaticPageEditPage() {
  const [match, params] = useRoute("/admin/static-pages/:id");
  const [, setLocation] = useLocation();
  const isNew = params?.id === "new";
  
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  
  // Form State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [handle, setHandle] = useState("");
  const [status, setStatus] = useState<"draft" | "published" | "scheduled">("published");
  const [publishDate, setPublishDate] = useState("");
  const [publishTime, setPublishTime] = useState("");
  const [templateKey, setTemplateKey] = useState("default");

  useEffect(() => {
    if (!isNew && params?.id) {
      fetch(`/api/admin/static-pages/${params.id}`)
        .then(res => res.json())
        .then((data: StaticPage) => {
          setTitle(data.title);
          setContent(data.content);
          setSeoTitle(data.seo_title || "");
          setSeoDescription(data.seo_description || "");
          setHandle(data.handle);
          setStatus(data.status);
          setTemplateKey(data.template_key);
          
          if (data.publish_at) {
            const date = new Date(data.publish_at);
            setPublishDate(format(date, "yyyy-MM-dd"));
            setPublishTime(format(date, "HH:mm"));
          }
          
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          toast.error("ページ情報の取得に失敗しました");
          setLoading(false);
        });
    }
  }, [isNew, params?.id]);

  // Handle auto-generation from title
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (isNew && !handle) {
      // Simple slugify for preview (server handles actual uniqueness)
      const slug = newTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      setHandle(slug);
    }
  };

  const handleSave = async () => {
    if (!title) {
      toast.error("タイトルは必須です");
      return;
    }

    if (status === "scheduled" && (!publishDate || !publishTime)) {
      toast.error("予約公開の日時を指定してください");
      return;
    }

    setSaving(true);
    
    let publishAt = null;
    if (status === "scheduled") {
      publishAt = new Date(`${publishDate}T${publishTime}`).toISOString();
    } else if (status === "published") {
      publishAt = new Date().toISOString();
    }

    const pageData = {
      title,
      content,
      seo_title: seoTitle,
      seo_description: seoDescription,
      handle,
      status,
      publish_at: publishAt,
      template_key: templateKey
    };

    try {
      const url = isNew ? "/api/admin/static-pages" : `/api/admin/static-pages/${params?.id}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pageData)
      });

      if (res.ok) {
        toast.success(isNew ? "ページを作成しました" : "ページを更新しました");
        setLocation("/admin/static-pages");
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

  // SEO Preview Helpers
  const previewTitle = seoTitle || title;
  const previewDesc = seoDescription || content.replace(/<[^>]*>/g, "").slice(0, 160);
  const previewUrl = `https://your-shop.com/pages/${handle}`;

  if (loading) return <div className="p-8 text-center">読み込み中...</div>;

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-24">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/admin/static-pages")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">
              {isNew ? "ページを追加" : title}
            </h1>
          </div>
          <div className="flex gap-2">
            {!isNew && (
              <Button variant="outline" asChild>
                <a href={`/pages/${handle}`} target="_blank" rel="noopener noreferrer">
                  <Eye className="w-4 h-4 mr-2" />
                  ページを表示
                </a>
              </Button>
            )}
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "保存中..." : "保存"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label>タイトル</Label>
                  <Input value={title} onChange={handleTitleChange} placeholder="例: お問い合わせ" />
                </div>
                <div className="space-y-2">
                  <Label>コンテンツ</Label>
                  <div className="border rounded-md">
                    {/* Simple Toolbar Placeholder */}
                    <div className="bg-gray-50 border-b p-2 flex gap-2 text-sm text-gray-600">
                      <button className="p-1 hover:bg-gray-200 rounded font-bold">B</button>
                      <button className="p-1 hover:bg-gray-200 rounded italic">I</button>
                      <button className="p-1 hover:bg-gray-200 rounded underline">U</button>
                      <div className="w-px bg-gray-300 mx-1"></div>
                      <button className="p-1 hover:bg-gray-200 rounded">H2</button>
                      <button className="p-1 hover:bg-gray-200 rounded">Link</button>
                      <button className="p-1 hover:bg-gray-200 rounded">Image</button>
                    </div>
                    <Textarea 
                      value={content} 
                      onChange={e => setContent(e.target.value)} 
                      className="min-h-[300px] border-0 focus-visible:ring-0 rounded-none resize-y p-4"
                      placeholder="ここに内容を入力してください..."
                    />
                  </div>
                  <p className="text-xs text-gray-500 text-right">HTML形式で入力可能です</p>
                </div>
              </CardContent>
            </Card>

            {/* SEO Settings */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">検索エンジンでの表示プレビュー</CardTitle>
                  <Button variant="link" className="text-blue-600 h-auto p-0">
                    ウェブサイトのSEOを編集する
                  </Button>
                </div>
                <p className="text-sm text-gray-500">
                  検索結果に表示されるページのタイトルと説明を追加して、検索エンジンのランキングを改善しましょう。
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Preview Box */}
                <div className="bg-white p-0">
                  <div className="text-sm text-[#202124] mb-1">{title}</div>
                  <div className="text-xl text-[#1a0dab] hover:underline cursor-pointer mb-1 truncate">
                    {previewTitle}
                  </div>
                  <div className="text-sm text-[#006621] mb-1">{previewUrl}</div>
                  <div className="text-sm text-[#545454] line-clamp-2">
                    {previewDesc}
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <div className="space-y-2">
                    <Label>ページタイトル</Label>
                    <Input 
                      value={seoTitle} 
                      onChange={e => setSeoTitle(e.target.value)} 
                      placeholder={title}
                    />
                    <p className="text-xs text-gray-500">0 / 70文字</p>
                  </div>
                  <div className="space-y-2">
                    <Label>メタディスクリプション</Label>
                    <Textarea 
                      value={seoDescription} 
                      onChange={e => setSeoDescription(e.target.value)} 
                      rows={3}
                    />
                    <p className="text-xs text-gray-500">0 / 320文字</p>
                  </div>
                  <div className="space-y-2">
                    <Label>URLとハンドル</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500 whitespace-nowrap">/pages/</span>
                      <Input 
                        value={handle} 
                        onChange={e => setHandle(e.target.value)} 
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Settings */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">公開範囲</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input 
                      type="radio" 
                      id="vis-published" 
                      name="visibility" 
                      checked={status === "published"} 
                      onChange={() => setStatus("published")}
                      className="w-4 h-4 text-blue-600"
                    />
                    <Label htmlFor="vis-published" className="font-normal">公開</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="radio" 
                      id="vis-scheduled" 
                      name="visibility" 
                      checked={status === "scheduled"} 
                      onChange={() => setStatus("scheduled")}
                      className="w-4 h-4 text-blue-600"
                    />
                    <Label htmlFor="vis-scheduled" className="font-normal">公開日時を設定する</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="radio" 
                      id="vis-draft" 
                      name="visibility" 
                      checked={status === "draft"} 
                      onChange={() => setStatus("draft")}
                      className="w-4 h-4 text-blue-600"
                    />
                    <Label htmlFor="vis-draft" className="font-normal">非公開（下書き）</Label>
                  </div>
                </div>

                {status === "scheduled" && (
                  <div className="pt-4 border-t space-y-4 animate-in fade-in slide-in-from-top-2">
                    <div className="space-y-2">
                      <Label>公開日</Label>
                      <div className="relative">
                        <Input 
                          type="date" 
                          value={publishDate} 
                          onChange={e => setPublishDate(e.target.value)} 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>公開時間</Label>
                      <Input 
                        type="time" 
                        value={publishTime} 
                        onChange={e => setPublishTime(e.target.value)} 
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      指定した日時に自動的に公開されます。
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">オンラインストア</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>テーマテンプレート</Label>
                  <Select value={templateKey} onValueChange={setTemplateKey}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default page</SelectItem>
                      <SelectItem value="contact">contact</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    現在のテーマ: Dawn
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
