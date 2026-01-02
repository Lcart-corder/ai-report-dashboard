import React, { useEffect, useState } from "react";
import { Link } from "wouter";
import { ShopLayout } from "@/components/shop/ShopLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/types/schema";

export default function ProductListPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products")
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <ShopLayout>
        <div className="p-4 text-center text-gray-500">読み込み中...</div>
      </ShopLayout>
    );
  }

  return (
    <ShopLayout>
      <div className="p-4 grid grid-cols-2 gap-4">
        {products.map(product => (
          <Link key={product.id} href={`/shop/products/${product.id}`}>
            <Card className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow h-full">
              <div className="aspect-square bg-gray-100 relative">
                <img 
                  src={product.images[0]} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {!product.is_active && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold">
                    販売停止中
                  </div>
                )}
              </div>
              <CardContent className="p-3">
                <h3 className="font-medium text-sm line-clamp-2 mb-1">{product.name}</h3>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-lg">
                    ¥{(product as any).variants[0]?.price.toLocaleString()}~
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </ShopLayout>
  );
}
