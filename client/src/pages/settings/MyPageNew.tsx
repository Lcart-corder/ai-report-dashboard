import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { User, Lock, Bell, Shield, CreditCard, FileText, Download } from "lucide-react";

export default function MyPageNew() {
  const [name, setName] = useState("山田太郎");
  const [email, setEmail] = useState("yamada@example.com");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // 通知設定
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  
  // 請求書データ（モック）
  const invoices = [
    { id: "INV-2026-001", date: "2026-01-01", amount: 50000, status: "paid", downloadUrl: "#" },
    { id: "INV-2025-012", date: "2025-12-01", amount: 50000, status: "paid", downloadUrl: "#" },
    { id: "INV-2025-011", date: "2025-11-01", amount: 50000, status: "paid", downloadUrl: "#" },
    { id: "INV-2025-010", date: "2025-10-01", amount: 50000, status: "paid", downloadUrl: "#" },
  ];

  const handleSaveProfile = () => {
    alert("プロフィールを更新しました");
  };

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      alert("新しいパスワードが一致しません");
      return;
    }
    alert("パスワードを変更しました");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    alert(`請求書 ${invoiceId} をダウンロードします`);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">マイページ</h1>
        <p className="text-muted-foreground">アカウント情報と設定を管理します</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">
            <User className="w-4 h-4 mr-2" />
            プロフィール
          </TabsTrigger>
          <TabsTrigger value="password">
            <Lock className="w-4 h-4 mr-2" />
            パスワード
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" />
            通知設定
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="w-4 h-4 mr-2" />
            セキュリティ
          </TabsTrigger>
          <TabsTrigger value="billing">
            <CreditCard className="w-4 h-4 mr-2" />
            支払い情報
          </TabsTrigger>
          <TabsTrigger value="invoices">
            <FileText className="w-4 h-4 mr-2" />
            請求書
          </TabsTrigger>
        </TabsList>

        {/* プロフィール */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>プロフィール情報</CardTitle>
              <CardDescription>登録情報の確認・編集ができます</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">管理者名</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">メールアドレス</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <Button onClick={handleSaveProfile}>設定を更新する</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* パスワード変更 */}
        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>パスワードの変更</CardTitle>
              <CardDescription>セキュリティを強化するために定期的にパスワードを変更してください</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">現在のパスワード</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">新しいパスワード</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">新しいパスワード（確認）</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <Button onClick={handleChangePassword}>パスワードを変更</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 通知設定 */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>通知設定</CardTitle>
              <CardDescription>受け取る通知の種類を設定します</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>メール通知</Label>
                  <p className="text-sm text-muted-foreground">重要な通知をメールで受け取ります</p>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>プッシュ通知</Label>
                  <p className="text-sm text-muted-foreground">ブラウザでプッシュ通知を受け取ります</p>
                </div>
                <Switch
                  checked={pushNotifications}
                  onCheckedChange={setPushNotifications}
                />
              </div>
              <Button>設定を保存</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* セキュリティ */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>セキュリティ設定</CardTitle>
              <CardDescription>アカウントのセキュリティを管理します</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">二段階認証</h3>
                <p className="text-sm text-muted-foreground">
                  二段階認証を有効にすると、ログイン時に追加の認証が必要になります
                </p>
                <Button variant="outline">二段階認証を設定</Button>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">ログイン履歴</h3>
                <p className="text-sm text-muted-foreground">最近のログイン履歴を確認できます</p>
                <Button variant="outline">履歴を表示</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 支払い情報 */}
        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>プラン・支払い情報</CardTitle>
              <CardDescription>現在のプランと支払い履歴を確認します</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">現在のプラン</h3>
                <div className="flex items-center gap-2">
                  <Badge>プロプラン</Badge>
                  <span className="text-sm text-muted-foreground">¥50,000 / 月</span>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">支払い方法</h3>
                <p className="text-sm text-muted-foreground">クレジットカード（**** **** **** 1234）</p>
                <Button variant="outline">支払い方法を変更</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 請求書 */}
        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle>請求書発行</CardTitle>
              <CardDescription>過去の請求書を確認・ダウンロードできます</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>請求書番号</TableHead>
                    <TableHead>発行日</TableHead>
                    <TableHead>金額</TableHead>
                    <TableHead>ステータス</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.id}</TableCell>
                      <TableCell>{invoice.date}</TableCell>
                      <TableCell>¥{invoice.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={invoice.status === "paid" ? "default" : "secondary"}>
                          {invoice.status === "paid" ? "支払済" : "未払"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadInvoice(invoice.id)}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          ダウンロード
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
