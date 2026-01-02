import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { ShopLayout } from "@/components/shop/ShopLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Product, ProductVariant } from "@/types/schema";
import { toast } from "sonner";
import { CreditCard } from "lucide-react";

interface CartItemDetail {
  id: string;
  product_id: string;
  variant_id: string;
  quantity: number;
  product: Product;
  variant: ProductVariant;
}

export default function CheckoutConfirmPage() {
  const [, setLocation] = useLocation();
  const [cartItems, setCartItems] = useState<CartItemDetail[]>([]);
  const [shippingInfo, setShippingInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    // Load shipping info
    const storedInfo = sessionStorage.getItem("checkout_data");
    if (!storedInfo) {
      setLocation("/shop/checkout");
      return;
    }
    setShippingInfo(JSON.parse(storedInfo));

    // Load cart
    const fetchCart = async () => {
      try {
        const cartRes = await fetch("/api/cart");
        const cartData = await cartRes.json();

        if (!cartData.items || cartData.items.length === 0) {
          setLocation("/shop/cart");
          return;
        }

        const itemsWithDetails = await Promise.all(cartData.items.map(async (item: any) => {
          const productRes = await fetch(`/api/products/${item.product_id}`);
          const product = await productRes.json();
          const variant = product.variants.find((v: any) => v.id === item.variant_id);
          return { ...item, product, variant };
        }));

        setCartItems(itemsWithDetails);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  const handleCreateOrder = async () => {
    setProcessing(true);
    try {
      // 1. Create Order
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shipping_info: shippingInfo,
          note: shippingInfo.note
        })
      });

      if (!orderRes.ok) throw new Error("Order creation failed");
      const order = await orderRes.json();

      // 2. Create Payment
      const paymentRes = await fetch(`/api/orders/${order.id}/payments`, {
        method: "POST"
      });

      if (!paymentRes.ok) throw new Error("Payment creation failed");
      const payment = await paymentRes.json();

      // 3. Redirect to Payment (Mock)
      // In real world, redirect to payment.pay_url
      // Here we simulate payment page
      sessionStorage.setItem("current_payment", JSON.stringify({
        order_id: order.id,
        payment_id: payment.payment_id,
        amount: order.grand_total
      }));
      
      setLocation("/shop/checkout/payment");

    } catch (err) {
      console.error(err);
      toast.error("注文処理中にエラーが発生しました");
      setProcessing(false);
    }
  };

  if (loading) return <div className="p-4 text-center">読み込み中...</div>;

  const subtotal = cartItems.reduce((sum, item) => sum + (item.variant.price * item.quantity), 0);
  const shipping_fee = subtotal > 5000 ? 0 : 500;
  const tax_total = Math.floor(subtotal * 0.1);
  const grand_total = subtotal + tax_total + shipping_fee;

  return (
    <ShopLayout>
      <div className="p-4 pb-24">
        <h1 className="text-xl font-bold mb-6">注文内容の確認</h1>

        <div className="space-y-6">
          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">注文商品</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cartItems.map(item => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded shrink-0">
                    <img src={item.product.images[0]} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 text-sm">
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-gray-500">{item.variant.name}</p>
                    <div className="flex justify-between mt-1">
                      <span>¥{item.variant.price.toLocaleString()}</span>
                      <span>x{item.quantity}</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Shipping */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">配送先</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              <p className="font-bold">{shippingInfo.name} 様</p>
              <p>〒{shippingInfo.postal_code}</p>
              <p>{shippingInfo.address}</p>
              <p>{shippingInfo.phone}</p>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">お支払い金額</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">小計</span>
                <span>¥{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">消費税</span>
                <span>¥{tax_total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">送料</span>
                <span>¥{shipping_fee.toLocaleString()}</span>
              </div>
              <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg text-blue-600">
                <span>合計</span>
                <span>¥{grand_total.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          <Button 
            className="w-full h-12 text-lg font-bold bg-[#06C755] hover:bg-[#05b34c]"
            onClick={handleCreateOrder}
            disabled={processing}
          >
            {processing ? "処理中..." : "注文を確定して支払う"}
            {!processing && <CreditCard className="ml-2 w-5 h-5" />}
          </Button>
        </div>
      </div>
    </ShopLayout>
  );
}
