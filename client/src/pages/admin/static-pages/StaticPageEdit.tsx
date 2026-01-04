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
import { ArrowLeft, Eye } from "lucide-react";
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
        <div className="flex items-center justify-between max-w-5xl mx-auto pt-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/admin/static-pages")} className="-ml-2 text-gray-500 hover:bg-gray-100">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">
              {isNew ? "ページを追加" : title || "無題のページ"}
            </h1>
          </div>
          <div className="flex gap-3">
            {!isNew && (
              <Button variant="outline" asChild className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm h-9">
                <a href={`/pages/${handle}`} target="_blank" rel="noopener noreferrer">
                  <Eye className="w-4 h-4 mr-2" />
                  ページを表示
                </a>
              </Button>
            )}
            <Button onClick={handleSave} disabled={saving} className="bg-[#008060] hover:bg-[#006e52] text-white shadow-sm h-9 px-4 font-medium">
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
                  <Label className="text-gray-700 font-medium text-sm">タイトル</Label>
                  <Input 
                    value={title} 
                    onChange={handleTitleChange} 
                    placeholder="例: お問い合わせ" 
                    className="h-9 border-gray-300 focus:border-[#008060] focus:ring-[#008060]" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">コンテンツ</Label>
                  <div className="border rounded-md shadow-sm">
                    <div className="bg-gray-50 border-b p-2 flex gap-2 text-sm text-gray-600">
                      <button className="p-1 hover:bg-gray-200 rounded font-bold">B</button>
                      <button className="p-1 hover:bg-gray-200 rounded italic">I</button>
                      <button className="p-1 hover:bg-gray-200 rounded underline">U</button>
                    </div>
                    <Textarea 
                      value={content} 
                      onChange={e => setContent(e.target.value)} 
                      className="min-h-[300px] border-0 focus-visible:ring-0 rounded-none resize-y p-4"
                      placeholder="ここに内容を入力してください..."
                    />
                  </div>
                  <p className="text-xs text-gray-500 text-right mt-1">HTML形式で入力可能です</p>
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
              <CardHeader className="pb-3 border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm font-semibold text-gray-900">公開範囲</CardTitle>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {status === 'published' ? '公開中' : status === 'draft' ? '非公開' : '予約済み'}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-3">
                  <Label className="text-gray-700 text-sm">公開ステータス</Label>
                  <Select 
                    value={status === "scheduled" ? "scheduled" : (status === "published" ? "published" : "draft")} 
                    onValueChange={(v) => {
                      if (v === "scheduled") {
                        setStatus("scheduled");
                        if (!publishDate) setPublishDate(format(new Date(), "yyyy-MM-dd"));
                        if (!publishTime) setPublishTime(format(new Date(), "HH:mm"));
                      } else {
                        setStatus(v as any);
                        setPublishDate("");
                        setPublishTime("");
                      }
                    }}
                  >
                    <SelectTrigger className="h-9 border-gray-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="published">公開</SelectItem>
                      <SelectItem value="draft">非公開（下書き）</SelectItem>
                      <SelectItem value="scheduled">予約公開設定...</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {status === "scheduled" && (
                    <div className="pt-2 space-y-2 animate-in fade-in slide-in-from-top-2 bg-gray-50 p-3 rounded border border-gray-200">
                      <Label className="text-xs text-gray-600 font-medium">公開日時を指定</Label>
                      <div className="flex gap-2">
                        <Input 
                          type="date" 
                          value={publishDate}
                          onChange={(e) => setPublishDate(e.target.value)}
                          className="bg-white h-8 text-sm w-full"
                        />
                        <Input 
                          type="time" 
                          value={publishTime}
                          onChange={(e) => setPublishTime(e.target.value)}
                          className="bg-white h-8 text-sm w-24"
                        />
                      </div>
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {status === "published" ? "オンラインストアですぐに公開されます。" : 
                     status === "draft" ? "オンラインストアでは非表示になります。" : 
                     `指定した日時（${publishDate} ${publishTime}）に自動的に公開されます。`}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-gray-200">
              <CardHeader className="pb-3 border-b border-gray-100">
                <CardTitle className="text-sm font-semibold text-gray-900">オンラインストア</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label className="text-gray-700 text-sm">テーマテンプレート</Label>
                  <Select value={templateKey} onValueChange={setTemplateKey}>
                    <SelectTrigger className="h-9 border-gray-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">デフォルトページ</SelectItem>
                      <SelectItem value="contact">お問い合わせ (contact)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    現在のテーマでページを表示するテンプレートを割り当てます。
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
