import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Upload,
  Download,
  FileText,
  CheckCircle,
  AlertCircle,
  FolderPlus,
  Folder,
  Package,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

interface ParsedProduct {
  productCode: string;
  productName: string;
  category: string;
  price: number;
  stock: number;
  description: string;
  status: "valid" | "error";
  errorMessage?: string;
}

interface ProductFolder {
  id: string;
  name: string;
  productCount: number;
  createdAt: string;
}

export default function ProductRegistrationNew() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("manual");
  
  // Manual registration state
  const [productCode, setProductCode] = useState("");
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string>("default");
  
  // CSV import state
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [parsedData, setParsedData] = useState<ParsedProduct[]>([]);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [csvStep, setCsvStep] = useState<"upload" | "preview" | "complete">("upload");
  
  // Folder management state
  const [folders, setFolders] = useState<ProductFolder[]>([
    { id: "default", name: "未分類", productCount: 0, createdAt: "2024-01-01" },
    { id: "folder1", name: "春の新商品", productCount: 45, createdAt: "2024-01-15" },
    { id: "folder2", name: "冬物セール", productCount: 32, createdAt: "2024-01-10" },
  ]);
  const [newFolderName, setNewFolderName] = useState("");
  const [showFolderDialog, setShowFolderDialog] = useState(false);

  // Manual registration handlers
  const handleManualSubmit = () => {
    if (!productCode || !productName || !price) {
      toast.error("必須項目を入力してください");
      return;
    }
    
    toast.success("商品を登録しました");
    // Reset form
    setProductCode("");
    setProductName("");
    setCategory("");
    setPrice("");
    setStock("");
    setDescription("");
  };

  // CSV import handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith(".csv")) {
        toast.error("CSVファイルを選択してください");
        return;
      }
      setFile(selectedFile);
      setFileName(selectedFile.name);
      parseCSV(selectedFile);
    }
  };

  const parseCSV = async (file: File) => {
    const text = await file.text();
    const lines = text.split("\n");
    const products: ParsedProduct[] = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;

      const values = lines[i].split(",").map((v) => v.trim());
      const product: ParsedProduct = {
        productCode: values[0] || "",
        productName: values[1] || "",
        category: values[2] || "",
        price: parseFloat(values[3]) || 0,
        stock: parseInt(values[4]) || 0,
        description: values[5] || "",
        status: "valid",
      };

      // Validation
      if (!product.productCode) {
        product.status = "error";
        product.errorMessage = "商品管理番号が必須です";
      } else if (!product.productName) {
        product.status = "error";
        product.errorMessage = "商品名が必須です";
      } else if (product.price <= 0) {
        product.status = "error";
        product.errorMessage = "価格は0より大きい値を入力してください";
      }

      products.push(product);
    }

    setParsedData(products);
    setCsvStep("preview");
  };

  const handleImport = async () => {
    setImporting(true);
    setImportProgress(0);

    const validProducts = parsedData.filter((p) => p.status === "valid");

    for (let i = 0; i < validProducts.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      setImportProgress(((i + 1) / validProducts.length) * 100);
    }

    setImporting(false);
    setCsvStep("complete");
    toast.success(`${validProducts.length}件の商品をインポートしました`);
  };

  const downloadTemplate = () => {
    const template = `商品管理番号,商品名,カテゴリー,販売価格,在庫数,商品説明
PROD001,サンプル商品1,カテゴリーA,1000,50,これはサンプル商品です
PROD002,サンプル商品2,カテゴリーB,2000,30,これはサンプル商品です`;

    const blob = new Blob([template], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "商品インポートテンプレート.csv";
    link.click();
  };

  // Folder management handlers
  const handleCreateFolder = () => {
    if (!newFolderName.trim()) {
      toast.error("フォルダ名を入力してください");
      return;
    }

    const newFolder: ProductFolder = {
      id: `folder${folders.length}`,
      name: newFolderName,
      productCount: 0,
      createdAt: new Date().toISOString().split("T")[0],
    };

    setFolders([...folders, newFolder]);
    setNewFolderName("");
    setShowFolderDialog(false);
    toast.success("フォルダを作成しました");
  };

  const validCount = parsedData.filter((p) => p.status === "valid").length;
  const errorCount = parsedData.filter((p) => p.status === "error").length;

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">商品登録</h1>
            <p className="text-muted-foreground mt-1">
              手動登録またはCSVファイルから一括登録できます
            </p>
          </div>
          <Button variant="outline" onClick={() => setLocation("/products")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            商品一覧に戻る
          </Button>
        </div>

        {/* Folder Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Folder className="w-5 h-5" />
                  フォルダ管理
                </CardTitle>
                <CardDescription>商品をフォルダで整理できます</CardDescription>
              </div>
              <Dialog open={showFolderDialog} onOpenChange={setShowFolderDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <FolderPlus className="w-4 h-4" />
                    新規フォルダ
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>新規フォルダ作成</DialogTitle>
                    <DialogDescription>
                      商品を整理するためのフォルダを作成します
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="folder-name">フォルダ名</Label>
                      <Input
                        id="folder-name"
                        placeholder="例: 春の新商品"
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowFolderDialog(false)}>
                        キャンセル
                      </Button>
                      <Button onClick={handleCreateFolder} className="bg-[#06C755] hover:bg-[#05b34c] text-white">
                        作成
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {folders.map((folder) => (
                <Card
                  key={folder.id}
                  className={`cursor-pointer transition-all ${
                    selectedFolder === folder.id
                      ? "border-[#06C755] border-2 bg-green-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedFolder(folder.id)}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Folder
                        className={`w-5 h-5 ${
                          selectedFolder === folder.id ? "text-[#06C755]" : "text-gray-400"
                        }`}
                      />
                      <span className="font-medium text-sm">{folder.name}</span>
                    </div>
                    <div className="text-xs text-gray-500">{folder.productCount}件の商品</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Registration Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">手動登録</TabsTrigger>
            <TabsTrigger value="csv">CSV一括インポート</TabsTrigger>
          </TabsList>

          {/* Manual Registration Tab */}
          <TabsContent value="manual" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>商品情報入力</CardTitle>
                <CardDescription>商品の基本情報を入力してください</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="product-code">
                      商品管理番号 <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="product-code"
                      placeholder="PROD001"
                      value={productCode}
                      onChange={(e) => setProductCode(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="product-name">
                      商品名 <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="product-name"
                      placeholder="商品名を入力"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">カテゴリー</Label>
                    <Input
                      id="category"
                      placeholder="カテゴリーを入力"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="price">
                      販売価格 <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="1000"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="stock">在庫数</Label>
                  <Input
                    id="stock"
                    type="number"
                    placeholder="100"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="description">商品説明</Label>
                  <Textarea
                    id="description"
                    placeholder="商品の詳細説明を入力"
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setLocation("/products")}>
                    キャンセル
                  </Button>
                  <Button
                    onClick={handleManualSubmit}
                    className="bg-[#06C755] hover:bg-[#05b34c] text-white"
                  >
                    登録
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CSV Import Tab */}
          <TabsContent value="csv" className="space-y-6">
            {csvStep === "upload" && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>CSVテンプレートをダウンロード</CardTitle>
                    <CardDescription>
                      まずはテンプレートをダウンロードして、商品情報を入力してください
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={downloadTemplate} variant="outline" className="gap-2">
                      <Download className="w-4 h-4" />
                      テンプレートをダウンロード
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>CSVファイルをアップロード</CardTitle>
                    <CardDescription>
                      商品情報を記入したCSVファイルを選択してください
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-[#06C755] transition-colors">
                      <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <Label htmlFor="csv-upload" className="cursor-pointer">
                        <span className="text-lg font-medium text-[#06C755]">
                          ファイルを選択
                        </span>
                        <span className="text-gray-500 ml-2">またはドラッグ&ドロップ</span>
                      </Label>
                      <Input
                        id="csv-upload"
                        type="file"
                        accept=".csv"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                      <p className="text-sm text-gray-500 mt-2">CSV形式のファイルのみ対応</p>
                    </div>

                    {fileName && (
                      <Alert>
                        <FileText className="h-4 w-4" />
                        <AlertDescription>
                          選択されたファイル: <strong>{fileName}</strong>
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </>
            )}

            {csvStep === "preview" && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>インポートプレビュー</CardTitle>
                      <CardDescription>
                        {fileName} - {parsedData.length}件の商品
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCsvStep("upload");
                        setFile(null);
                        setFileName("");
                        setParsedData([]);
                      }}
                    >
                      戻る
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="font-medium">{validCount}件 有効</span>
                    </div>
                    {errorCount > 0 && (
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                        <span className="font-medium text-red-600">{errorCount}件 エラー</span>
                      </div>
                    )}
                  </div>

                  {errorCount > 0 && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        エラーのある商品は除外されます。修正してから再度アップロードしてください。
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto max-h-96">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b sticky top-0">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              状態
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              商品管理番号
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              商品名
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              カテゴリー
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              価格
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              在庫
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {parsedData.map((product, index) => (
                            <tr
                              key={index}
                              className={product.status === "error" ? "bg-red-50" : ""}
                            >
                              <td className="px-4 py-3">
                                {product.status === "valid" ? (
                                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    有効
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                    エラー
                                  </Badge>
                                )}
                              </td>
                              <td className="px-4 py-3 text-sm">{product.productCode}</td>
                              <td className="px-4 py-3 text-sm font-medium">
                                {product.productName}
                              </td>
                              <td className="px-4 py-3 text-sm">{product.category}</td>
                              <td className="px-4 py-3 text-sm">¥{product.price.toLocaleString()}</td>
                              <td className="px-4 py-3 text-sm">{product.stock}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      onClick={handleImport}
                      disabled={validCount === 0 || importing}
                      className="bg-[#06C755] hover:bg-[#05b34c] text-white"
                    >
                      {importing ? "インポート中..." : `${validCount}件をインポート`}
                    </Button>
                  </div>

                  {importing && (
                    <div className="space-y-2">
                      <Progress value={importProgress} />
                      <p className="text-sm text-center text-gray-500">
                        {Math.round(importProgress)}% 完了
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {csvStep === "complete" && (
              <Card>
                <CardContent className="pt-12 pb-12 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">インポート完了</h2>
                  <p className="text-gray-600 mb-6">
                    {validCount}件の商品を「{folders.find(f => f.id === selectedFolder)?.name}」フォルダにインポートしました
                  </p>
                  <div className="flex justify-center gap-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setCsvStep("upload");
                        setFile(null);
                        setFileName("");
                        setParsedData([]);
                      }}
                    >
                      続けてインポート
                    </Button>
                    <Button
                      onClick={() => setLocation("/products")}
                      className="bg-[#06C755] hover:bg-[#05b34c] text-white"
                    >
                      商品一覧を見る
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
