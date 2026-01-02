import React, { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { ShopLayout } from "@/components/shop/ShopLayout";
import { Button } from "@/components/ui/button";
import { Cart, Product, ProductVariant } from "@/types/schema";
import { Trash2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

interface CartItemDetail {
  id: string;
  product_id: string;
  variant_id: string;
  quantity: number;
  product: Product;
  variant: ProductVariant;
}

export default function CartPage() {
  const [, setLocation] = useLocation();
  const [cartItems, setCartItems] = useState<CartItemDetail[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    try {
      // 1. Get Cart
      const cartRes = await fetch("/api/cart");
      const cartData = await cartRes.json();

      if (!cartData.items || cartData.items.length === 0) {
        setCartItems([]);
        setLoading(false);
        return;
      }

      // 2. Get Products details (N+1 but okay for mock)
      const itemsWithDetails = await Promise.all(cartData.items.map(async (item: any) => {
        const productRes = await fetch(`/api/products/${item.product_id}`);
        const product = await productRes.json();
        const variant = product.variants.find((v: any) => v.id === item.variant_id);
        
        return {
          ...item,
          product,
          variant
        };
      }));

      setCartItems(itemsWithDetails);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleRemoveItem = async (id: string) => {
    try {
      await fetch(`/api/cart/items/${id}`, { method: "DELETE" });
      fetchCart(); // Reload
      toast.success("商品を削除しました");
    } catch (err) {
      toast.error("エラーが発生しました");
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.variant.price * item.quantity), 0);

  if (loading) {
    return (
      <ShopLayout>
        <div className="p-4 text-center text-gray-500">読み込み中...</div>
      </ShopLayout>
    );
  }

  return (
    <ShopLayout>
      <div className="p-4 pb-24">
        <h1 className="text-xl font-bold mb-6">ショッピングカート</h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">カートに商品が入っていません</p>
            <Button asChild variant="outline">
              <Link href="/shop">買い物を続ける</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-8">
              {cartItems.map(item => (
                <div key={item.id} className="flex gap-4 bg-white p-4 rounded-lg border shadow-sm">
                  <div className="w-20 h-20 bg-gray-100 rounded-md shrink-0 overflow-hidden">
                    <img 
                      src={item.product.images[0]} 
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm line-clamp-1">{item.product.name}</h3>
                    <p className="text-xs text-gray-500 mb-2">{item.variant.name}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-bold">¥{item.variant.price.toLocaleString()}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm">数量: {item.quantity}</span>
                        <button 
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="bg-white p-4 rounded-lg border shadow-sm space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">小計</span>
                <span>¥{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">送料</span>
                <span>{subtotal > 5000 ? "無料" : "¥500"}</span>
              </div>
              <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg">
                <span>合計</span>
                <span>¥{(subtotal + (subtotal > 5000 ? 0 : 500)).toLocaleString()}</span>
              </div>
            </div>

            <Button 
              className="w-full h-12 text-lg font-bold bg-[#06C755] hover:bg-[#05b34c]"
              onClick={() => setLocation("/shop/checkout")}
            >
              レジに進む
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </>
        )}
      </div>
    </ShopLayout>
  );
}
