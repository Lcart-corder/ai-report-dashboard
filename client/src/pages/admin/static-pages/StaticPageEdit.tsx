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
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

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
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/admin/static-pages")} className="-ml-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">
              {isNew ? "ページを追加" : title}
            </h1>
          </div>
          <div className="flex gap-3">
            {!isNew && (
              <Button variant="outline" asChild className="bg-white">
                <a href={`/pages/${handle}`} target="_blank" rel="noopener noreferrer">
                  <Eye className="w-4 h-4 mr-2" />
                  ページを表示
                </a>
              </Button>
            )}
            <Button onClick={handleSave} disabled={saving} className="bg-[#008060] hover:bg-[#006e52] text-white shadow-sm">
              {saving ? "保存中..." : "保存"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Left Column: Main Content */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="shadow-sm border-gray-200">
              <CardContent className="p-5 space-y-4">
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">タイトル</Label>
                  <Input value={title} onChange={handleTitleChange} placeholder="例: お問い合わせ" className="h-9" />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">コンテンツ</Label>
                  <div className="prose-editor">
                    <ReactQuill 
                      theme="snow"
                      value={content}
                      onChange={setContent}
                      modules={{
                        toolbar: [
                          [{ 'header': [1, 2, 3, false] }],
                          ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                          [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
                          ['link', 'image'],
                          ['clean']
                        ],
                      }}
                      className="h-[300px] mb-12"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SEO Settings */}
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold text-gray-900">検索エンジンでの表示プレビュー</CardTitle>
                  <Button variant="link" className="text-[#008060] h-auto p-0 font-normal">
                    ウェブサイトのSEOを編集する
                  </Button>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  検索結果に表示されるページのタイトルと説明を追加して、検索エンジンのランキングを改善しましょう。
                </p>
              </CardHeader>
              <CardContent className="space-y-6 pt-2">
                {/* Preview Box */}
                <div className="bg-white p-0">
                  <div className="text-sm text-[#202124] mb-1">{title}</div>
                  <div className="text-xl text-[#1a0dab] hover:underline cursor-pointer mb-1 truncate font-medium">
                    {previewTitle}
                  </div>
                  <div className="text-sm text-[#006621] mb-1">{previewUrl}</div>
                  <div className="text-sm text-[#545454] line-clamp-2">
                    {previewDesc}
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <div className="space-y-2">
                    <Label className="text-gray-700">ページタイトル</Label>
                    <Input 
                      value={seoTitle} 
                      onChange={e => setSeoTitle(e.target.value)} 
                      placeholder={title}
                      className="h-9"
                    />
                    <p className="text-xs text-gray-500">0 / 70文字</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-700">メタディスクリプション</Label>
                    <Textarea 
                      value={seoDescription} 
                      onChange={e => setSeoDescription(e.target.value)} 
                      rows={3}
                      className="resize-y"
                    />
                    <p className="text-xs text-gray-500">0 / 320文字</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-700">URLとハンドル</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500 whitespace-nowrap">/pages/</span>
                      <Input 
                        value={handle} 
                        onChange={e => setHandle(e.target.value)} 
                        className="h-9"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Settings */}
          <div className="space-y-4">
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-gray-900">公開範囲</CardTitle>
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

            <Card className="shadow-sm border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-gray-900">オンラインストア</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-gray-700">テーマテンプレート</Label>
                  <Select value={templateKey} onValueChange={setTemplateKey}>
                    <SelectTrigger className="h-9">
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
