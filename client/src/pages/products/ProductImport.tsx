import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  Download,
  FileText,
  CheckCircle,
  AlertCircle,
  X,
  ArrowRight,
  FileSpreadsheet,
  Table,
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

export default function ProductImportPage() {
  const [, setLocation] = useLocation();
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [parsedData, setParsedData] = useState<ParsedProduct[]>([]);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [step, setStep] = useState<"upload" | "preview" | "complete">("upload");

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
    const headers = lines[0].split(",").map((h) => h.trim());

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
    setStep("preview");
  };

  const handleImport = async () => {
    setImporting(true);
    setImportProgress(0);

    const validProducts = parsedData.filter((p) => p.status === "valid");

    for (let i = 0; i < validProducts.length; i++) {
      // TODO: API call to import product
      await new Promise((resolve) => setTimeout(resolve, 100));
      setImportProgress(((i + 1) / validProducts.length) * 100);
    }

    setImporting(false);
    setStep("complete");
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

  const validCount = parsedData.filter((p) => p.status === "valid").length;
  const errorCount = parsedData.filter((p) => p.status === "error").length;

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">CSV一括インポート</h1>
            <p className="text-muted-foreground mt-1">
              CSVファイルから複数の商品を一括登録できます
            </p>
          </div>
          <Button variant="outline" onClick={() => setLocation("/products")}>
            商品一覧に戻る
          </Button>
        </div>

        {/* Progress Steps */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step === "upload" || step === "preview" || step === "complete"
                      ? "bg-[#06C755] text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  1
                </div>
                <span className="font-medium">ファイル選択</span>
              </div>
              <ArrowRight className="text-gray-400" />
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step === "preview" || step === "complete"
                      ? "bg-[#06C755] text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  2
                </div>
                <span className="font-medium">プレビュー</span>
              </div>
              <ArrowRight className="text-gray-400" />
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step === "complete"
                      ? "bg-[#06C755] text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  3
                </div>
                <span className="font-medium">完了</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 1: Upload */}
        {step === "upload" && (
          <div className="grid gap-6">
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

            <Card>
              <CardHeader>
                <CardTitle>CSVフォーマット</CardTitle>
                <CardDescription>以下の形式でCSVファイルを作成してください</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  <div className="text-gray-700">
                    商品管理番号,商品名,カテゴリー,販売価格,在庫数,商品説明
                  </div>
                  <div className="text-gray-500 mt-1">
                    PROD001,サンプル商品1,カテゴリーA,1000,50,これはサンプル商品です
                  </div>
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <p className="font-medium">必須項目:</p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>商品管理番号（重複不可）</li>
                    <li>商品名</li>
                    <li>販売価格（0より大きい値）</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 2: Preview */}
        {step === "preview" && (
          <div className="space-y-6">
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
                      setStep("upload");
                      setFile(null);
                      setFileName("");
                      setParsedData([]);
                    }}
                  >
                    <X className="w-4 h-4 mr-2" />
                    キャンセル
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
                    variant="outline"
                    onClick={() => {
                      setStep("upload");
                      setParsedData([]);
                    }}
                  >
                    戻る
                  </Button>
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
          </div>
        )}

        {/* Step 3: Complete */}
        {step === "complete" && (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">インポート完了</h2>
              <p className="text-gray-600 mb-6">
                {validCount}件の商品を正常にインポートしました
              </p>
              <div className="flex justify-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setStep("upload");
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
      </div>
    </DashboardLayout>
  );
}
