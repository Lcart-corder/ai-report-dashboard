import React, { useEffect, useState } from "react";
import { useRoute, Link } from "wouter";
import { ShopLayout } from "@/components/shop/ShopLayout";
import { Page, PageBlock, Product } from "@/types/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function PublicPageViewer() {
  const [match, params] = useRoute("/s/:slug");
  const [page, setPage] = useState<Page | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (params?.slug) {
      // Fetch Page Data
      fetch(`/api/s/${params.slug}`)
        .then(res => {
          if (!res.ok) throw new Error("Page not found");
          return res.json();
        })
        .then(data => {
          setPage(data);
          // If page has product list, fetch products
          if (data.blocks.some((b: PageBlock) => b.block_type === "PRODUCT_LIST")) {
            return fetch("/api/products").then(res => res.json());
          }
          return [];
        })
        .then(productsData => {
          setProducts(productsData);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setError("ページが見つかりません");
          setLoading(false);
        });
    }
  }, [params?.slug]);

  if (loading) return <div className="p-8 text-center">読み込み中...</div>;
  if (error || !page) return (
    <ShopLayout>
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">404 Not Found</h1>
        <p className="text-gray-500">{error}</p>
        <Button asChild className="mt-4">
          <Link href="/shop">トップへ戻る</Link>
        </Button>
      </div>
    </ShopLayout>
  );

  const renderBlock = (block: PageBlock) => {
    const config = block.config_json as any;

    switch (block.block_type) {
      case "HERO_IMAGE":
        return (
          <div key={block.id} className="relative w-full h-[400px] bg-gray-200 mb-8">
            {config.image_url && (
              <img src={config.image_url} alt="" className="w-full h-full object-cover" />
            )}
            <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-white p-4 text-center">
              <h2 className="text-4xl font-bold mb-2">{config.headline}</h2>
              <p className="text-xl">{config.subheadline}</p>
            </div>
          </div>
        );

      case "TEXT":
        return (
          <div key={block.id} className="max-w-3xl mx-auto px-4 mb-8">
            <p className="text-lg leading-relaxed whitespace-pre-wrap text-gray-700">
              {config.content}
            </p>
          </div>
        );

      case "PRODUCT_LIST":
        const displayProducts = products.slice(0, config.count || 4);
        return (
          <div key={block.id} className="max-w-6xl mx-auto px-4 mb-12">
            {config.title && (
              <h3 className="text-2xl font-bold mb-6 text-center">{config.title}</h3>
            )}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {displayProducts.map(product => (
                <Link key={product.id} href={`/shop/products/${product.id}`}>
                  <Card className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow h-full">
                    <div className="aspect-square bg-gray-100 relative">
                      <img 
                        src={product.images[0]?.image_url} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h4 className="font-medium text-sm line-clamp-2 mb-2">{product.name}</h4>
                      <p className="font-bold">¥{product.base_price.toLocaleString()}~</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <ShopLayout>
      <div className="pb-24">
        {page.blocks
          .sort((a, b) => a.sort_order - b.sort_order)
          .map(renderBlock)}
      </div>
    </ShopLayout>
  );
}
