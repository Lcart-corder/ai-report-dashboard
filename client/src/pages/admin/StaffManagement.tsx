import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Edit, Trash2, Copy, Check } from "lucide-react";
import { toast } from "sonner";

// 権限カテゴリーの定義
const permissionCategories = [
  { id: "friends", label: "友だち管理", permissions: ["友だちリスト", "タグ管理", "友だち情報管理", "ブロックリスト"] },
  { id: "messages", label: "メッセージ", permissions: ["一斉配信", "ステップ配信", "自動応答", "挨拶メッセージ", "テンプレート", "リッチメニュー"] },
  { id: "forms", label: "フォーム・予約", permissions: ["フォーム管理", "フォーム回答", "予約管理", "予約カレンダー"] },
  { id: "shop", label: "商品・注文", permissions: ["商品管理", "在庫管理", "注文管理", "配送管理", "ショップページ"] },
  { id: "analysis", label: "分析", permissions: ["友だち分析", "メッセージ分析", "流入経路分析", "サイト分析", "AI分析"] },
  { id: "marketing", label: "マーケティング", permissions: ["流入経路管理", "コンバージョン設定", "アクションスケジュール"] },
  { id: "chat", label: "チャット", permissions: ["1:1チャット", "チャット設定"] },
  { id: "integrations", label: "連携", permissions: ["LINE公式", "Shopify", "楽天", "LINE広告", "ChatGPT"] },
  { id: "system", label: "システム設定", permissions: ["スタッフ管理", "プラン設定", "アカウント設定"] },
];

// ロールの定義
const roles = [
  { id: "sub_admin", label: "副管理人", color: "bg-purple-100 text-purple-800" },
  { id: "operator", label: "運用者", color: "bg-blue-100 text-blue-800" },
  { id: "support", label: "サポート", color: "bg-green-100 text-green-800" },
];

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: Record<string, string[]>;
  createdAt: string;
  status: "active" | "pending";
}

export default function StaffManagement() {
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([
    {
      id: "1",
      name: "山田太郎",
      email: "yamada@example.com",
      role: "sub_admin",
      permissions: {},
      createdAt: "2026-01-01",
      status: "active",
    },
    {
      id: "2",
      name: "佐藤花子",
      email: "sato@example.com",
      role: "operator",
      permissions: {},
      createdAt: "2026-01-05",
      status: "active",
    },
  ]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPermissionDialogOpen, setIsPermissionDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [newStaffName, setNewStaffName] = useState("");
  const [newStaffRole, setNewStaffRole] = useState("operator");
  const [invitationUrl, setInvitationUrl] = useState("");
  const [copied, setCopied] = useState(false);

  // 権限マトリックスの状態
  const [permissionMatrix, setPermissionMatrix] = useState<Record<string, Record<string, boolean>>>({});

  const handleGenerateInvitation = () => {
    const url = `https://lme.jp/invite/${Math.random().toString(36).substring(7)}`;
    setInvitationUrl(url);
    toast.success("招待URLを発行しました（24時間有効）");
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(invitationUrl);
    setCopied(true);
    toast.success("URLをコピーしました");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddStaff = () => {
    if (!newStaffName) {
      toast.error("スタッフ名を入力してください");
      return;
    }
    
    const newStaff: StaffMember = {
      id: Date.now().toString(),
      name: newStaffName,
      email: `${newStaffName.toLowerCase()}@example.com`,
      role: newStaffRole,
      permissions: {},
      createdAt: new Date().toISOString().split("T")[0],
      status: "pending",
    };

    setStaffMembers([...staffMembers, newStaff]);
    setIsAddDialogOpen(false);
    setNewStaffName("");
    setNewStaffRole("operator");
    setInvitationUrl("");
    toast.success("スタッフを追加しました");
  };

  const handleEditStaff = () => {
    if (!selectedStaff) return;

    setStaffMembers(
      staffMembers.map((staff) =>
        staff.id === selectedStaff.id ? selectedStaff : staff
      )
    );
    setIsEditDialogOpen(false);
    setSelectedStaff(null);
    toast.success("スタッフ情報を更新しました");
  };

  const handleDeleteStaff = (id: string) => {
    if (confirm("このスタッフを削除してもよろしいですか？")) {
      setStaffMembers(staffMembers.filter((staff) => staff.id !== id));
      toast.success("スタッフを削除しました");
    }
  };

  const handleOpenPermissionDialog = () => {
    // 権限マトリックスの初期化
    const matrix: Record<string, Record<string, boolean>> = {};
    roles.forEach((role) => {
      matrix[role.id] = {};
      permissionCategories.forEach((category) => {
        category.permissions.forEach((permission) => {
          matrix[role.id][`${category.id}_${permission}`] = false;
        });
      });
    });
    setPermissionMatrix(matrix);
    setIsPermissionDialogOpen(true);
  };

  const handleTogglePermission = (roleId: string, permissionKey: string) => {
    setPermissionMatrix((prev) => ({
      ...prev,
      [roleId]: {
        ...prev[roleId],
        [permissionKey]: !prev[roleId][permissionKey],
      },
    }));
  };

  const handleSavePermissions = () => {
    setIsPermissionDialogOpen(false);
    toast.success("操作権限を保存しました");
  };

  const getRoleLabel = (roleId: string) => {
    return roles.find((r) => r.id === roleId)?.label || roleId;
  };

  const getRoleColor = (roleId: string) => {
    return roles.find((r) => r.id === roleId)?.color || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">スタッフ管理</h1>
          <p className="text-muted-foreground">アカウントを複数人で運用できます</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleOpenPermissionDialog}>
            操作権限を変更する
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                スタッフを追加する
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>スタッフを追加</DialogTitle>
                <DialogDescription>
                  新しいスタッフを招待します。招待URLは24時間有効です。
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="staff-name">スタッフ名</Label>
                  <Input
                    id="staff-name"
                    placeholder="山田太郎"
                    value={newStaffName}
                    onChange={(e) => setNewStaffName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="staff-role">ロール</Label>
                  <Select value={newStaffRole} onValueChange={setNewStaffRole}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {!invitationUrl ? (
                  <Button onClick={handleGenerateInvitation} className="w-full">
                    招待用URLを発行
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <Label>招待URL（24時間有効）</Label>
                    <div className="flex gap-2">
                      <Input value={invitationUrl} readOnly />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleCopyUrl}
                      >
                        {copied ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      このURLをメール等でスタッフに共有してください
                    </p>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  キャンセル
                </Button>
                <Button onClick={handleAddStaff} disabled={!invitationUrl}>
                  追加
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>スタッフ一覧</CardTitle>
          <CardDescription>現在登録されているスタッフの情報</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>スタッフ名</TableHead>
                <TableHead>メールアドレス</TableHead>
                <TableHead>ロール</TableHead>
                <TableHead>ステータス</TableHead>
                <TableHead>登録日</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staffMembers.map((staff) => (
                <TableRow key={staff.id}>
                  <TableCell className="font-medium">{staff.name}</TableCell>
                  <TableCell>{staff.email}</TableCell>
                  <TableCell>
                    <Badge className={getRoleColor(staff.role)}>
                      {getRoleLabel(staff.role)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={staff.status === "active" ? "default" : "secondary"}>
                      {staff.status === "active" ? "有効" : "招待中"}
                    </Badge>
                  </TableCell>
                  <TableCell>{staff.createdAt}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedStaff(staff);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteStaff(staff.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 編集ダイアログ */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>スタッフ編集</DialogTitle>
            <DialogDescription>スタッフ情報を編集します</DialogDescription>
          </DialogHeader>
          {selectedStaff && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-staff-name">スタッフ名</Label>
                <Input
                  id="edit-staff-name"
                  value={selectedStaff.name}
                  onChange={(e) =>
                    setSelectedStaff({ ...selectedStaff, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-staff-role">ロール</Label>
                <Select
                  value={selectedStaff.role}
                  onValueChange={(value) =>
                    setSelectedStaff({ ...selectedStaff, role: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={handleEditStaff}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 権限マトリックスダイアログ */}
      <Dialog open={isPermissionDialogOpen} onOpenChange={setIsPermissionDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>操作権限の変更</DialogTitle>
            <DialogDescription>
              各ロールに対して機能ごとの権限を設定できます
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {permissionCategories.map((category) => (
              <div key={category.id} className="space-y-3">
                <h3 className="font-semibold text-lg">{category.label}</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">機能</TableHead>
                      {roles.map((role) => (
                        <TableHead key={role.id} className="text-center">
                          {role.label}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {category.permissions.map((permission) => (
                      <TableRow key={permission}>
                        <TableCell className="font-medium">{permission}</TableCell>
                        {roles.map((role) => (
                          <TableCell key={role.id} className="text-center">
                            <Checkbox
                              checked={
                                permissionMatrix[role.id]?.[
                                  `${category.id}_${permission}`
                                ] || false
                              }
                              onCheckedChange={() =>
                                handleTogglePermission(
                                  role.id,
                                  `${category.id}_${permission}`
                                )
                              }
                            />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPermissionDialogOpen(false)}
            >
              キャンセル
            </Button>
            <Button onClick={handleSavePermissions}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
