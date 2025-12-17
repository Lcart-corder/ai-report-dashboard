import React, { useState } from "react";
import { PageTemplate } from "@/components/page-template";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable, StatusBadge } from "@/components/common/ui-kit";
import { Reservation } from "@/types/schema";
import { CheckCircle, XCircle, Calendar, Plus } from "lucide-react";
import { toast } from "sonner";

// Mock Data
const MOCK_RESERVATIONS: Reservation[] = [
  { id: "1", tenant_id: "t1", event_id: "e1", contact_id: "c1", status: "pending", created_at: "2024-02-10T10:00:00Z" },
  { id: "2", tenant_id: "t1", event_id: "e1", contact_id: "c2", status: "confirmed", created_at: "2024-02-10T11:30:00Z" },
  { id: "3", tenant_id: "t1", event_id: "e2", contact_id: "c3", status: "canceled", created_at: "2024-02-11T09:00:00Z" },
];

export default function ReservationListPage() {
  const [reservations, setReservations] = useState<Reservation[]>(MOCK_RESERVATIONS);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", date: "" });

  const updateStatus = (id: string, status: 'confirmed' | 'canceled') => {
    setReservations(reservations.map(r => r.id === id ? { ...r, status } : r));
    toast.success(status === 'confirmed' ? "予約を確定しました" : "予約をキャンセルしました");
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("予約を作成しました");
    setIsDialogOpen(false);
  };

  const columns = [
    {
      header: "予約ID",
      accessorKey: "id" as keyof Reservation,
      className: "font-mono text-xs",
    },
    {
      header: "予約日時",
      cell: (item: Reservation) => new Date(item.created_at).toLocaleString(),
    },
    {
      header: "顧客ID",
      accessorKey: "contact_id" as keyof Reservation,
    },
    {
      header: "ステータス",
      cell: (item: Reservation) => <StatusBadge status={item.status} />,
    },
    {
      header: "操作",
      className: "text-right",
      cell: (item: Reservation) => (
        <div className="flex justify-end gap-2">
          {item.status === 'pending' && (
            <>
              <Button variant="ghost" size="sm" onClick={() => updateStatus(item.id, 'confirmed')} className="text-green-600 hover:text-green-700 hover:bg-green-50">
                <CheckCircle className="w-4 h-4 mr-1" />
                確定
              </Button>
              <Button variant="ghost" size="sm" onClick={() => updateStatus(item.id, 'canceled')} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                <XCircle className="w-4 h-4 mr-1" />
                却下
              </Button>
            </>
          )}
          {item.status === 'confirmed' && (
            <Button variant="ghost" size="sm" onClick={() => updateStatus(item.id, 'canceled')} className="text-red-600 hover:text-red-700 hover:bg-red-50">
              キャンセル
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <PageTemplate 
      title="予約リスト" 
      description="全ての予約申し込みを一覧で確認・管理します。"
      breadcrumbs={[{ label: "予約・イベント" }, { label: "予約リスト" }]}
      actions={
        <Button onClick={() => setIsDialogOpen(true)} className="bg-[#06C755] hover:bg-[#05b34c] text-white gap-2">
          <Plus className="w-4 h-4" />
          新規予約作成
        </Button>
      }
    >
      <DataTable 
        data={reservations} 
        columns={columns} 
        searchable 
        pagination={{ currentPage: 1, totalPages: 1, onPageChange: () => {} }}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新規予約作成</DialogTitle>
            <DialogDescription>
              顧客情報と予約日時を入力してください。
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate}>
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">基本設定</TabsTrigger>
                <TabsTrigger value="advanced">詳細設定</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">顧客名</Label>
                  <Input 
                    id="name" 
                    placeholder="例: 山田 太郎" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="date">日時</Label>
                  <Input 
                    id="date" 
                    type="datetime-local"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                  />
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4 py-4">
                <div className="space-y-4">
                  <div className="border rounded-md p-4">
                    <h4 className="font-medium mb-2 text-sm">予約枠設定</h4>
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="capacity">定員数</Label>
                        <Input id="capacity" type="number" placeholder="無制限の場合は空欄" />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="auto_confirm" defaultChecked />
                        <Label htmlFor="auto_confirm" className="text-sm font-normal">予約を自動で確定する</Label>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-md p-4">
                    <h4 className="font-medium mb-2 text-sm">リマインダー配信</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-normal">前日リマインド</Label>
                        <Select defaultValue="18:00">
                          <SelectTrigger className="w-[100px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="12:00">12:00</SelectItem>
                            <SelectItem value="18:00">18:00</SelectItem>
                            <SelectItem value="20:00">20:00</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-normal">当日リマインド</Label>
                        <Select defaultValue="off">
                          <SelectTrigger className="w-[100px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="off">なし</SelectItem>
                            <SelectItem value="1:00">1時間前</SelectItem>
                            <SelectItem value="2:00">2時間前</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>キャンセル</Button>
              <Button type="submit" className="bg-[#06C755] hover:bg-[#05b34c] text-white">
                作成する
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageTemplate>
  );
}
