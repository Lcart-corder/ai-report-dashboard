import React, { useEffect, useState } from "react";
import { useRoute, Link } from "wouter";
import { ShopLayout } from "@/components/shop/ShopLayout";
import { StaticPage } from "@/types/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

// Mock Helmet if not available
const MetaTags = ({ title, description }: { title: string, description: string }) => {
  useEffect(() => {
    document.title = title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", description);
    } else {
      const meta = document.createElement('meta');
      meta.name = "description";
      meta.content = description;
      document.head.appendChild(meta);
    }
  }, [title, description]);
  return null;
};

export default function StaticPageViewer() {
  const [match, params] = useRoute("/pages/:handle");
  const [page, setPage] = useState<StaticPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (params?.handle) {
      fetch(`/api/pages/${params.handle}`)
        .then(res => {
          if (!res.ok) throw new Error("Page not found");
          return res.json();
        })
        .then(data => {
          setPage(data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setError("ページが見つかりません");
          setLoading(false);
        });
    }
  }, [params?.handle]);

  if (loading) return <div className="p-8 text-center">読み込み中...</div>;
  
  if (error || !page) return (
    <ShopLayout>
      <div className="p-8 text-center py-24">
        <h1 className="text-2xl font-bold mb-4">404 Not Found</h1>
        <p className="text-gray-500 mb-8">{error}</p>
        <Button asChild>
          <Link href="/shop">トップへ戻る</Link>
        </Button>
      </div>
    </ShopLayout>
  );

  // SEO Logic
  const seoTitle = page.seo_title || `${page.title} - L-Cart Shop`;
  const seoDesc = page.seo_description || page.content.replace(/<[^>]*>/g, "").slice(0, 160);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("お問い合わせを受け付けました。");
    // In real app, send to API
  };

  return (
    <ShopLayout>
      <MetaTags title={seoTitle} description={seoDesc} />
      
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8 text-center">{page.title}</h1>
        
        <div 
          className="prose prose-lg max-w-none mb-12"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />

        {page.template_key === "contact" && (
          <div className="max-w-xl mx-auto bg-gray-50 p-8 rounded-lg border">
            <h2 className="text-xl font-semibold mb-6">お問い合わせ</h2>
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">お名前</Label>
                  <Input id="name" required placeholder="山田 太郎" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">メールアドレス</Label>
                  <Input id="email" type="email" required placeholder="example@email.com" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">電話番号</Label>
                <Input id="phone" type="tel" placeholder="090-1234-5678" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">お問い合わせ内容</Label>
                <Textarea id="message" required rows={5} placeholder="ご質問内容をご記入ください" />
              </div>
              <Button type="submit" className="w-full">送信する</Button>
            </form>
          </div>
        )}
      </div>
    </ShopLayout>
  );
}
