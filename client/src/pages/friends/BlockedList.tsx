import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Ban, Search, UserX, CheckCircle, AlertCircle } from "lucide-react";

interface BlockedFriend {
  id: string;
  name: string;
  lineId: string;
  blockedAt: string;
  reason: string;
  blockedBy: string;
}

export default function BlockedListPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFriend, setSelectedFriend] = useState<BlockedFriend | null>(null);
  const [showUnblockDialog, setShowUnblockDialog] = useState(false);

  // Mock data
  const [blockedFriends, setBlockedFriends] = useState<BlockedFriend[]>([
    {
      id: "1",
      name: "山田太郎",
      lineId: "U1234567890abcdef",
      blockedAt: "2024-01-15 14:30",
      reason: "スパム行為",
      blockedBy: "管理者",
    },
    {
      id: "2",
      name: "佐藤花子",
      lineId: "U2345678901bcdefg",
      blockedAt: "2024-01-10 09:15",
      reason: "不適切な発言",
      blockedBy: "サポート担当",
    },
    {
      id: "3",
      name: "鈴木一郎",
      lineId: "U3456789012cdefgh",
      blockedAt: "2024-01-05 16:45",
      reason: "規約違反",
      blockedBy: "管理者",
    },
  ]);

  const filteredFriends = blockedFriends.filter(
    (friend) =>
      friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.lineId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.reason.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUnblock = (friend: BlockedFriend) => {
    setSelectedFriend(friend);
    setShowUnblockDialog(true);
  };

  const confirmUnblock = () => {
    if (selectedFriend) {
      setBlockedFriends((prev) => prev.filter((f) => f.id !== selectedFriend.id));
      setShowUnblockDialog(false);
      setSelectedFriend(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Ban className="w-8 h-8 text-red-500" />
              ブロックリスト
            </h1>
            <p className="text-gray-600 mt-1">
              ブロックされた友だちの一覧を管理します
            </p>
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2">
            {blockedFriends.length}人
          </Badge>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                総ブロック数
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {blockedFriends.length}
              </div>
              <p className="text-xs text-gray-500 mt-1">累計ブロック人数</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                今月のブロック
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">3</div>
              <p className="text-xs text-gray-500 mt-1">今月追加されたブロック</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                主な理由
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold text-gray-900">
                スパム行為
              </div>
              <p className="text-xs text-gray-500 mt-1">最も多いブロック理由</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>ブロック済み友だち一覧</CardTitle>
                <CardDescription>
                  ブロックを解除すると、再度メッセージの送受信が可能になります
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="名前、LINE ID、理由で検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Table */}
            {filteredFriends.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>友だち情報</TableHead>
                      <TableHead>LINE ID</TableHead>
                      <TableHead>ブロック日時</TableHead>
                      <TableHead>理由</TableHead>
                      <TableHead>ブロック実行者</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFriends.map((friend) => (
                      <TableRow key={friend.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                              <UserX className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {friend.name}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {friend.lineId}
                          </code>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {friend.blockedAt}
                        </TableCell>
                        <TableCell>
                          <Badge variant="destructive">{friend.reason}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {friend.blockedBy}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUnblock(friend)}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            ブロック解除
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Ban className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">
                  {searchQuery
                    ? "検索条件に一致する友だちが見つかりません"
                    : "ブロックされた友だちはいません"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              ブロック機能について
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-800 space-y-2">
            <p>
              • ブロックされた友だちには、メッセージの送信ができなくなります
            </p>
            <p>
              • ブロックを解除すると、通常通りメッセージの送受信が可能になります
            </p>
            <p>
              • ブロック履歴は管理画面に記録され、いつでも確認できます
            </p>
            <p>
              • スパムや不適切な行為を行う友だちをブロックすることで、健全な運営を維持できます
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Unblock Confirmation Dialog */}
      <Dialog open={showUnblockDialog} onOpenChange={setShowUnblockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ブロック解除の確認</DialogTitle>
            <DialogDescription>
              この友だちのブロックを解除してもよろしいですか？
            </DialogDescription>
          </DialogHeader>
          {selectedFriend && (
            <div className="py-4">
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">名前:</span>
                  <span className="font-medium">{selectedFriend.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">LINE ID:</span>
                  <code className="text-xs bg-white px-2 py-1 rounded">
                    {selectedFriend.lineId}
                  </code>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">ブロック理由:</span>
                  <Badge variant="destructive">{selectedFriend.reason}</Badge>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-4">
                ブロックを解除すると、この友だちと再度メッセージのやり取りができるようになります。
              </p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowUnblockDialog(false)}
            >
              キャンセル
            </Button>
            <Button
              onClick={confirmUnblock}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              ブロック解除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
