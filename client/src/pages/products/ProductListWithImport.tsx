import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Plus,
  Upload,
  MoreVertical,
  Edit,
  Trash2,
  FileText,
  Filter,
  Download,
  Calendar,
  Package,
} from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

interface ImportFile {
  id: string;
  fileName: string;
  uploadDate: string;
  productCount: number;
  status: "success" | "partial" | "failed";
}

interface Product {
  id: string;
  productCode: string;
  productName: string;
  category: string;
  price: number;
  stock: number;
  importFileId?: string;
  status: "active" | "inactive";
}

export default function ProductListWithImportPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFile, setSelectedFile] = useState<string>("all");

  // Mock data
  const importFiles: ImportFile[] = [
    {
      id: "file1",
      fileName: "春の新商品_2024.csv",
      uploadDate: "2024-01-15",
      productCount: 45,
      status: "success",
    },
    {
      id: "file2",
      fileName: "冬物セール商品.csv",
      uploadDate: "2024-01-10",
      productCount: 32,
      status: "success",
    },
    {
      id: "file3",
      fileName: "定番商品リスト.csv",
      uploadDate: "2024-01-05",
      productCount: 28,
      status: "partial",
    },
  ];

  const products: Product[] = [
    {
      id: "1",
      productCode: "PROD001",
      productName: "春の新作Tシャツ",
      category: "アパレル",
      price: 2980,
      stock: 150,
      importFileId: "file1",
      status: "active",
    },
    {
      id: "2",
      productCode: "PROD002",
      productName: "冬物コート",
      category: "アパレル",
      price: 12800,
      stock: 45,
      importFileId: "file2",
      status: "active",
    },
    {
      id: "3",
      productCode: "PROD003",
      productName: "定番デニムパンツ",
      category: "アパレル",
      price: 5980,
      stock: 200,
      importFileId: "file3",
      status: "active",
    },
  ];

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.productCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFile =
      selectedFile === "all" || product.importFileId === selectedFile;
    return matchesSearch && matchesFile;
  });

  const handleDeleteFile = (fileId: string) => {
    toast.success("インポートファイルを削除しました");
  };

  const handleExportFile = (fileId: string) => {
    toast.success("CSVファイルをエクスポートしました");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">商品管理</h1>
            <p className="text-muted-foreground mt-1">
              商品の登録・編集・削除を行います
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/products/import">
              <Button variant="outline" className="gap-2">
                <Upload className="w-4 h-4" />
                CSVインポート
              </Button>
            </Link>
            <Link href="/products/register">
              <Button className="bg-[#06C755] hover:bg-[#05b34c] text-white gap-2">
                <Plus className="w-4 h-4" />
                商品登録
              </Button>
            </Link>
          </div>
        </div>

        {/* Import Files Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              インポートファイル履歴
            </CardTitle>
            <CardDescription>
              CSVファイルごとに商品をグループ化して管理できます
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {importFiles.map((file) => (
                <Card key={file.id} className="border-2">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Package className="w-4 h-4 text-gray-500" />
                          <span className="font-medium text-sm">{file.fileName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          {file.uploadDate}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>アクション</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setSelectedFile(file.id)}>
                            <Filter className="w-4 h-4 mr-2" />
                            このファイルでフィルター
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleExportFile(file.id)}>
                            <Download className="w-4 h-4 mr-2" />
                            CSVエクスポート
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteFile(file.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            削除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-[#06C755]">
                          {file.productCount}
                        </div>
                        <div className="text-xs text-gray-500">商品数</div>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          file.status === "success"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : file.status === "partial"
                            ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                            : "bg-red-50 text-red-700 border-red-200"
                        }
                      >
                        {file.status === "success"
                          ? "成功"
                          : file.status === "partial"
                          ? "一部エラー"
                          : "失敗"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>商品一覧</CardTitle>
              <div className="flex gap-2">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="商品名・商品コードで検索"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedFile} onValueChange={setSelectedFile}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="ファイルで絞り込み" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">すべてのファイル</SelectItem>
                    {importFiles.map((file) => (
                      <SelectItem key={file.id} value={file.id}>
                        {file.fileName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>商品コード</TableHead>
                    <TableHead>商品名</TableHead>
                    <TableHead>カテゴリー</TableHead>
                    <TableHead>価格</TableHead>
                    <TableHead>在庫</TableHead>
                    <TableHead>インポート元</TableHead>
                    <TableHead>状態</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => {
                    const importFile = importFiles.find(
                      (f) => f.id === product.importFileId
                    );
                    return (
                      <TableRow key={product.id}>
                        <TableCell className="font-mono text-sm">
                          {product.productCode}
                        </TableCell>
                        <TableCell className="font-medium">{product.productName}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>¥{product.price.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              product.stock > 50
                                ? "bg-green-50 text-green-700 border-green-200"
                                : product.stock > 10
                                ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                : "bg-red-50 text-red-700 border-red-200"
                            }
                          >
                            {product.stock}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {importFile ? (
                            <Badge variant="outline" className="text-xs">
                              {importFile.fileName}
                            </Badge>
                          ) : (
                            <span className="text-xs text-gray-400">手動登録</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              product.status === "active"
                                ? "bg-green-50 text-green-700 border-green-200"
                                : "bg-gray-50 text-gray-700 border-gray-200"
                            }
                          >
                            {product.status === "active" ? "販売中" : "非公開"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="w-4 h-4 mr-2" />
                                編集
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="w-4 h-4 mr-2" />
                                削除
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            {filteredProducts.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>商品が見つかりませんでした</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
