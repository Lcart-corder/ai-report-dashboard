import React, { useState } from "react";
import { PageTemplate } from "@/components/page-template";
import { Button } from "@/components/ui/button";
import { DataTable, StatusBadge } from "@/components/common/ui-kit";
import { Reservation } from "@/types/schema";
import { CheckCircle, XCircle, Calendar } from "lucide-react";
import { toast } from "sonner";

// Mock Data
const MOCK_RESERVATIONS: Reservation[] = [
  { id: "1", tenant_id: "t1", event_id: "e1", contact_id: "c1", status: "pending", created_at: "2024-02-10T10:00:00Z" },
  { id: "2", tenant_id: "t1", event_id: "e1", contact_id: "c2", status: "confirmed", created_at: "2024-02-10T11:30:00Z" },
  { id: "3", tenant_id: "t1", event_id: "e2", contact_id: "c3", status: "canceled", created_at: "2024-02-11T09:00:00Z" },
];

export default function ReservationListPage() {
  const [reservations, setReservations] = useState<Reservation[]>(MOCK_RESERVATIONS);

  const updateStatus = (id: string, status: 'confirmed' | 'canceled') => {
    setReservations(reservations.map(r => r.id === id ? { ...r, status } : r));
    toast.success(status === 'confirmed' ? "予約を確定しました" : "予約をキャンセルしました");
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
    >
      <DataTable 
        data={reservations} 
        columns={columns} 
        searchable 
        pagination={{ currentPage: 1, totalPages: 1, onPageChange: () => {} }}
      />
    </PageTemplate>
  );
}
