import React, { useEffect, useState } from "react";
import { useRoute, Link } from "wouter";
import { ShopLayout } from "@/components/shop/ShopLayout";
import { StaticPage } from "@/types/schema";
import { Button } from "@/components/ui/button";

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

  return (
    <ShopLayout>
      <MetaTags title={seoTitle} description={seoDesc} />
      
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8 text-center">{page.title}</h1>
        
        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </div>
    </ShopLayout>
  );
}
