import React, { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Product, Sku, ProductImage } from "@/types/schema";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2, Upload, GripVertical } from "lucide-react";

export default function ProductEditPage() {
  const [match, params] = useRoute("/orders/products/:id");
  const [, setLocation] = useLocation();
  const isNew = params?.id === "new";
  
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  
  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"public" | "private" | "stopped">("private");
  const [basePrice, setBasePrice] = useState(0);
  const [stockControlFlg, setStockControlFlg] = useState(true);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [skus, setSkus] = useState<Sku[]>([]);

  // SKU Generation State
  const [optionName, setOptionName] = useState("サイズ");
  const [optionValues, setOptionValues] = useState(""); // Comma separated

  useEffect(() => {
    if (!isNew && params?.id) {
      fetch(`/api/products/${params.id}`)
        .then(res => res.json())
        .then((data: Product) => {
          setName(data.name);
          setDescription(data.description || "");
          setStatus(data.status);
          setBasePrice(data.base_price);
          setStockControlFlg(data.stock_control_flg);
          setImages(data.images || []);
          setSkus(data.variants || []);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          toast.error("商品情報の取得に失敗しました");
          setLoading(false);
        });
    }
  }, [isNew, params?.id]);

  const handleSave = async () => {
    if (!name) {
      toast.error("商品名は必須です");
      return;
    }

    setSaving(true);
    
    const productData = {
      name,
      description,
      status,
      base_price: basePrice,
      stock_control_flg: stockControlFlg,
      images,
      variants: skus
    };

    try {
      const url = isNew ? "/api/products" : `/api/products/${params?.id}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData)
      });

      if (res.ok) {
        toast.success(isNew ? "商品を作成しました" : "商品を更新しました");
        setLocation("/orders/products");
      } else {
        toast.error("保存に失敗しました");
      }
    } catch (err) {
      console.error(err);
      toast.error("エラーが発生しました");
    } finally {
      setSaving(false);
    }
  };

  const handleAddImage = () => {
    const url = prompt("画像のURLを入力してください");
    if (url) {
      setImages([...images, {
        id: `img_${Date.now()}`,
        product_id: params?.id || "",
        image_url: url,
        sort_order: images.length + 1,
        created_at: new Date().toISOString()
      }]);
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleGenerateSkus = () => {
    if (!optionValues) return;
    
    const values = optionValues.split(",").map(v => v.trim()).filter(v => v);
    const newSkus: Sku[] = values.map((val, idx) => ({
      id: `temp_${Date.now()}_${idx}`,
      product_id: params?.id || "",
      option_name: optionName,
      option_value: val,
      price: basePrice,
      stock: 0,
      jan_code: "",
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    setSkus([...skus, ...newSkus]);
    setOptionValues("");
    toast.success(`${newSkus.length}件のSKUを追加しました`);
  };

  const handleUpdateSku = (index: number, field: keyof Sku, value: any) => {
    const newSkus = [...skus];
    newSkus[index] = { ...newSkus[index], [field]: value };
    setSkus(newSkus);
  };

  const handleRemoveSku = (index: number) => {
    const newSkus = [...skus];
    newSkus.splice(index, 1);
    setSkus(newSkus);
  };

  if (loading) return <div className="p-8 text-center">読み込み中...</div>;

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-24">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/orders/products")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {isNew ? "商品登録" : "商品編集"}
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>基本情報</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>商品名 <span className="text-red-500">*</span></Label>
                  <Input value={name} onChange={e => setName(e.target.value)} placeholder="商品名を入力" />
                </div>
                <div className="space-y-2">
                  <Label>商品説明</Label>
                  <Textarea 
                    value={description} 
                    onChange={e => setDescription(e.target.value)} 
                    placeholder="商品の特徴や詳細を入力"
                    className="min-h-[120px]"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>バリエーション (SKU)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* SKU Generator */}
                <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                  <h4 className="font-medium text-sm">バリエーション一括追加</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>オプション名</Label>
                      <Input 
                        value={optionName} 
                        onChange={e => setOptionName(e.target.value)} 
                        placeholder="例: サイズ, カラー" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>値 (カンマ区切り)</Label>
                      <Input 
                        value={optionValues} 
                        onChange={e => setOptionValues(e.target.value)} 
                        placeholder="例: S, M, L" 
                      />
                    </div>
                  </div>
                  <Button onClick={handleGenerateSkus} variant="outline" size="sm" disabled={!optionValues}>
                    <Plus className="w-4 h-4 mr-2" />
                    追加する
                  </Button>
                </div>

                {/* SKU List */}
                {skus.length > 0 ? (
                  <div className="border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>オプション</TableHead>
                          <TableHead className="w-32">価格</TableHead>
                          <TableHead className="w-24">在庫</TableHead>
                          <TableHead className="w-32">JANコード</TableHead>
                          <TableHead className="w-12"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {skus.map((sku, idx) => (
                          <TableRow key={sku.id}>
                            <TableCell>
                              <div className="text-sm font-medium">{sku.option_name}</div>
                              <div className="text-sm text-gray-500">{sku.option_value}</div>
                            </TableCell>
                            <TableCell>
                              <Input 
                                type="number" 
                                value={sku.price} 
                                onChange={e => handleUpdateSku(idx, "price", parseInt(e.target.value))}
                              />
                            </TableCell>
                            <TableCell>
                              <Input 
                                type="number" 
                                value={sku.stock} 
                                onChange={e => handleUpdateSku(idx, "stock", parseInt(e.target.value))}
                              />
                            </TableCell>
                            <TableCell>
                              <Input 
                                value={sku.jan_code || ""} 
                                onChange={e => handleUpdateSku(idx, "jan_code", e.target.value)}
                                placeholder="JAN"
                              />
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="icon" onClick={() => handleRemoveSku(idx)}>
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
                    バリエーションが登録されていません
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Settings & Images */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>公開設定</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>ステータス</Label>
                  <Select value={status} onValueChange={(v: any) => setStatus(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">公開中</SelectItem>
                      <SelectItem value="private">非公開</SelectItem>
                      <SelectItem value="stopped">販売停止</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>基本価格 (税込)</Label>
                  <Input 
                    type="number" 
                    value={basePrice} 
                    onChange={e => setBasePrice(parseInt(e.target.value))} 
                  />
                  <p className="text-xs text-gray-500">
                    SKUごとの価格が設定されていない場合に適用されます
                  </p>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <Label>在庫管理を行う</Label>
                  <Switch checked={stockControlFlg} onCheckedChange={setStockControlFlg} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>商品画像</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  {images.map((img, idx) => (
                    <div key={img.id} className="relative aspect-square bg-gray-100 rounded-md overflow-hidden group">
                      <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                      <button 
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      {idx === 0 && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs text-center py-1">
                          メイン画像
                        </div>
                      )}
                    </div>
                  ))}
                  <button 
                    onClick={handleAddImage}
                    className="aspect-square border-2 border-dashed rounded-md flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors"
                  >
                    <Upload className="w-6 h-6 mb-1" />
                    <span className="text-xs">追加</span>
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Fixed Bottom Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-10">
          <div className="max-w-7xl mx-auto flex justify-end gap-4">
            <Button variant="outline" onClick={() => setLocation("/orders/products")}>
              キャンセル
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "保存中..." : "保存する"}
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
