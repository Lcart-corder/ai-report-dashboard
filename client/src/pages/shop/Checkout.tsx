import React, { useState } from "react";
import { useLocation } from "wouter";
import { ShopLayout } from "@/components/shop/ShopLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

export default function CheckoutPage() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    name: "山田 太郎",
    postal_code: "100-0001",
    address: "東京都千代田区千代田1-1",
    phone: "090-1234-5678",
    note: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Save to session storage for next step
    sessionStorage.setItem("checkout_data", JSON.stringify(formData));
    setLocation("/shop/checkout/confirm");
  };

  return (
    <ShopLayout>
      <div className="p-4 pb-24">
        <h1 className="text-xl font-bold mb-6">お届け先の入力</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">配送先情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">お名前 <span className="text-red-500">*</span></Label>
                <Input 
                  id="name" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="postal_code">郵便番号 <span className="text-red-500">*</span></Label>
                <Input 
                  id="postal_code" 
                  value={formData.postal_code} 
                  onChange={e => setFormData({...formData, postal_code: e.target.value})}
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">住所 <span className="text-red-500">*</span></Label>
                <Textarea 
                  id="address" 
                  value={formData.address} 
                  onChange={e => setFormData({...formData, address: e.target.value})}
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">電話番号 <span className="text-red-500">*</span></Label>
                <Input 
                  id="phone" 
                  type="tel"
                  value={formData.phone} 
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  required 
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">備考</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="note">配送に関するご要望など</Label>
                <Textarea 
                  id="note" 
                  value={formData.note} 
                  onChange={e => setFormData({...formData, note: e.target.value})}
                  placeholder="例: 宅配ボックスへの配達を希望します"
                />
              </div>
            </CardContent>
          </Card>

          <Button 
            type="submit"
            className="w-full h-12 text-lg font-bold bg-[#06C755] hover:bg-[#05b34c]"
          >
            確認画面へ
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </form>
      </div>
    </ShopLayout>
  );
}
