import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Product, ProductVariant } from "@/types/schema";
import { Search, Save, Package } from "lucide-react";
import { toast } from "sonner";

export default function ProductManagementPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingVariants, setEditingVariants] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = () => {
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
  };

  const handleStockChange = (variantId: string, value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setEditingVariants(prev => ({
        ...prev,
        [variantId]: numValue
      }));
    }
  };

  const handleSave = async (product: Product) => {
    const updatedVariants = product.variants.map(v => {
      if (editingVariants[v.id] !== undefined) {
        return { ...v, stock_quantity: editingVariants[v.id] };
      }
      return v;
    });

    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variants: updatedVariants })
      });

      if (res.ok) {
        toast.success("在庫数を更新しました");
        setEditingVariants({});
        fetchProducts();
      } else {
        toast.error("更新に失敗しました");
      }
    } catch (err) {
      console.error(err);
      toast.error("エラーが発生しました");
    }
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">商品管理</h1>
            <p className="text-muted-foreground">
              商品の在庫数や価格を管理します。
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>商品一覧</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="商品名で検索" 
                  className="pl-8"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {loading ? (
                <div className="text-center py-8">読み込み中...</div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-8">商品が見つかりません</div>
              ) : (
                filteredProducts.map((product) => (
                  <div key={product.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden">
                          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{product.name}</h3>
                          <p className="text-sm text-gray-500">{product.description}</p>
                        </div>
                      </div>
                      <Button 
                        onClick={() => handleSave(product)}
                        disabled={!product.variants.some(v => editingVariants[v.id] !== undefined)}
                      >
                        <Save className="mr-2 h-4 w-4" />
                        変更を保存
                      </Button>
                    </div>

                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>バリエーション (SKU)</TableHead>
                          <TableHead>価格</TableHead>
                          <TableHead>在庫数</TableHead>
                          <TableHead>状態</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {product.variants.map((variant) => (
                          <TableRow key={variant.id}>
                            <TableCell>
                              <div className="font-medium">{variant.name}</div>
                              <div className="text-xs text-gray-500">{variant.sku}</div>
                            </TableCell>
                            <TableCell>¥{variant.price.toLocaleString()}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Input 
                                  type="number" 
                                  className="w-24 text-right"
                                  value={editingVariants[variant.id] !== undefined ? editingVariants[variant.id] : variant.stock_quantity}
                                  onChange={(e) => handleStockChange(variant.id, e.target.value)}
                                />
                                <span className="text-sm text-gray-500">個</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {(editingVariants[variant.id] !== undefined ? editingVariants[variant.id] : variant.stock_quantity) === 0 ? (
                                <span className="text-red-600 font-bold flex items-center gap-1">
                                  <Package className="w-4 h-4" /> 売り切れ
                                </span>
                              ) : (
                                <span className="text-green-600">販売中</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
