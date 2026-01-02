import React from "react";
import { Link, useLocation } from "wouter";
import { ShoppingCart, User, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function ShopLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/shop">
            <span className="font-bold text-lg cursor-pointer">L-Cart Store</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/shop/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="w-5 h-5" />
                {/* <Badge className="absolute -top-1 -right-1 w-4 h-4 p-0 flex items-center justify-center text-[10px]">2</Badge> */}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto">
        {children}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t z-10">
        <div className="max-w-md mx-auto flex justify-around items-center h-16">
          <Link href="/shop">
            <div className={`flex flex-col items-center gap-1 cursor-pointer ${location === '/shop' ? 'text-blue-600' : 'text-gray-400'}`}>
              <Home className="w-6 h-6" />
              <span className="text-[10px]">ホーム</span>
            </div>
          </Link>
          <Link href="/shop/cart">
            <div className={`flex flex-col items-center gap-1 cursor-pointer ${location === '/shop/cart' ? 'text-blue-600' : 'text-gray-400'}`}>
              <ShoppingCart className="w-6 h-6" />
              <span className="text-[10px]">カート</span>
            </div>
          </Link>
          <Link href="/shop/mypage">
            <div className={`flex flex-col items-center gap-1 cursor-pointer ${location === '/shop/mypage' ? 'text-blue-600' : 'text-gray-400'}`}>
              <User className="w-6 h-6" />
              <span className="text-[10px]">マイページ</span>
            </div>
          </Link>
        </div>
      </nav>
    </div>
  );
}
