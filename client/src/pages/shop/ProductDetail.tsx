import React, { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { ShopLayout } from "@/components/shop/ShopLayout";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Product, ProductVariant } from "@/types/schema";
import { toast } from "sonner";
import { Minus, Plus, ShoppingCart } from "lucide-react";

export default function ProductDetailPage() {
  const [match, params] = useRoute("/shop/products/:id");
  const [, setLocation] = useLocation();
  const [product, setProduct] = useState<Product & { variants: ProductVariant[] } | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params?.id) {
      fetch(`/api/products/${params.id}`)
        .then(res => res.json())
        .then(data => {
          setProduct(data);
          if (data.variants.length > 0) {
            setSelectedVariantId(data.variants[0].id);
          }
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [params?.id]);

  const handleAddToCart = async () => {
    if (!product || !selectedVariantId) return;

    try {
      const res = await fetch("/api/cart/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: product.id,
          variant_id: selectedVariantId,
          quantity
        })
      });

      if (res.ok) {
        toast.success("カートに追加しました");
        setLocation("/shop/cart");
      } else {
        toast.error("エラーが発生しました");
      }
    } catch (err) {
      toast.error("通信エラーが発生しました");
    }
  };

  if (loading || !product) {
    return (
      <ShopLayout>
        <div className="p-4 text-center text-gray-500">読み込み中...</div>
      </ShopLayout>
    );
  }

  const selectedVariant = product.variants.find(v => v.id === selectedVariantId);

  return (
    <ShopLayout>
      <div className="pb-24">
        {/* Image */}
        <div className="aspect-square bg-gray-100">
          <img 
            src={product.images[0]} 
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="p-4 space-y-6">
          {/* Title & Price */}
          <div>
            <h1 className="text-xl font-bold mb-2">{product.name}</h1>
            <p className="text-2xl font-bold text-blue-600">
              ¥{selectedVariant?.price.toLocaleString()}
              <span className="text-sm text-gray-500 font-normal ml-2">(税込)</span>
            </p>
          </div>

          {/* Variant Selection */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">バリエーション</label>
              {selectedVariant && (
                <span className={`text-sm font-medium ${selectedVariant.stock_quantity === 0 ? 'text-red-600' : 'text-gray-500'}`}>
                  {selectedVariant.stock_quantity === 0 ? '在庫切れ' : `残り ${selectedVariant.stock_quantity} 点`}
                </span>
              )}
            </div>
            <Select value={selectedVariantId} onValueChange={setSelectedVariantId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {product.variants.map(v => (
                  <SelectItem key={v.id} value={v.id} disabled={!v.is_active || v.stock_quantity === 0}>
                    {v.name} {v.stock_quantity === 0 ? '(在庫切れ)' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <label className="text-sm font-medium">数量</label>
            <div className="flex items-center gap-4 border rounded-md w-fit p-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="w-8 text-center font-medium">{quantity}</span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => setQuantity(Math.min(selectedVariant?.stock_quantity || 1, quantity + 1))}
                disabled={quantity >= (selectedVariant?.stock_quantity || 1)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2 pt-4 border-t">
            <h3 className="font-medium">商品説明</h3>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
              {product.description}
            </p>
          </div>
        </div>

        {/* Fixed Bottom Action */}
        <div className="fixed bottom-16 left-0 right-0 p-4 bg-white border-t max-w-md mx-auto">
          <Button 
            className={`w-full h-12 text-lg font-bold ${(!selectedVariant || selectedVariant.stock_quantity === 0) ? 'bg-gray-400 hover:bg-gray-400' : 'bg-[#06C755] hover:bg-[#05b34c]'}`}
            onClick={handleAddToCart}
            disabled={!selectedVariant || selectedVariant.stock_quantity === 0}
          >
            {(!selectedVariant || selectedVariant.stock_quantity === 0) ? (
              <>売り切れ</>
            ) : (
              <>
                <ShoppingCart className="mr-2 w-5 h-5" />
                カートに入れる
              </>
            )}
          </Button>
        </div>
      </div>
    </ShopLayout>
  );
}
