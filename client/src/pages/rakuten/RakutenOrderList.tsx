import React, { useState } from "react";
import { PageTemplate } from "@/components/page-template";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable, StatusBadge } from "@/components/common/ui-kit";
import { RakutenOrder } from "@/types/schema";
import { Search, Filter, Link as LinkIcon, Unlink, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

// Mock Data
const MOCK_ORDERS: RakutenOrder[] = [
  {
    id: "o1",
    tenant_id: "t1",
    contact_id: "c1",
    order_number: "20240215-00001",
    order_date: "2024-02-15T10:30:00Z",
    total_price: 5980,
    status: "発送済み",
    items: [
      { id: "i1", order_id: "o1", item_id: "p1", item_name: "プレミアム化粧水", quantity: 1, price: 5980 }
    ],
    created_at: "2024-02-15T10:30:00Z",
    updated_at: "2024-02-16T15:00:00Z"
  },
  {
    id: "o2",
    tenant_id: "t1",
    contact_id: undefined,
    order_number: "20240216-00023",
    order_date: "2024-02-16T14:15:00Z",
    total_price: 12800,
    status: "注文確認待ち",
    items: [
      { id: "i2", order_id: "o2", item_id: "p2", item_name: "美容液セット", quantity: 1, price: 12800 }
    ],
    created_at: "2024-02-16T14:15:00Z",
    updated_at: "2024-02-16T14:15:00Z"
  },
  {
    id: "o3",
    tenant_id: "t1",
    contact_id: "c3",
    order_number: "20240214-00156",
    order_date: "2024-02-14T09:00:00Z",
    total_price: 3500,
    status: "発送済み",
    items: [
      { id: "i3", order_id: "o3", item_id: "p3", item_name: "洗顔フォーム", quantity: 2, price: 1750 }
    ],
    created_at: "2024-02-14T09:00:00Z",
    updated_at: "2024-02-15T11:00:00Z"
  }
];

export default function RakutenOrderListPage() {
  const [orders, setOrders] = useState<RakutenOrder[]>(MOCK_ORDERS);
  const [searchQuery, setSearchQuery] = useState("");

  const handleLink = (orderId: string) => {
    // Mock linking process
    toast.success("LINEユーザーと紐付けました");
    setOrders(orders.map(o => o.id === orderId ? { ...o, contact_id: "new_linked_id" } : o));
  };

  const columns = [
    {
      header: "注文番号",
      accessorKey: "order_number" as keyof RakutenOrder,
      cell: (order: RakutenOrder) => (
        <div className="font-mono font-medium">{order.order_number}</div>
      ),
    },
    {
      header: "注文日時",
      accessorKey: "order_date" as keyof RakutenOrder,
      cell: (order: RakutenOrder) => new Date(order.order_date).toLocaleString(),
    },
    {
      header: "商品",
      cell: (order: RakutenOrder) => (
        <div className="max-w-[300px]">
          <div className="font-medium truncate">{order.items[0].item_name}</div>
          {order.items.length > 1 && (
            <div className="text-xs text-gray-500">他 {order.items.length - 1} 点</div>
          )}
        </div>
      ),
    },
    {
      header: "金額",
      accessorKey: "total_price" as keyof RakutenOrder,
      cell: (order: RakutenOrder) => (
        <div className="font-medium">¥{order.total_price.toLocaleString()}</div>
      ),
    },
    {
      header: "ステータス",
      accessorKey: "status" as keyof RakutenOrder,
      cell: (order: RakutenOrder) => (
        <StatusBadge 
          status={order.status === "発送済み" ? "active" : "warning"} 
          label={order.status} 
        />
      ),
    },
    {
      header: "LINE連携",
      cell: (order: RakutenOrder) => (
        order.contact_id ? (
          <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
            <LinkIcon className="w-3 h-3" />
            連携済み
          </div>
        ) : (
          <div className="flex items-center gap-1 text-gray-400 text-sm">
            <Unlink className="w-3 h-3" />
            未連携
          </div>
        )
      ),
    },
    {
      header: "操作",
      className: "text-right",
      cell: (order: RakutenOrder) => (
        <div className="flex justify-end">
          {!order.contact_id && (
            <Button variant="outline" size="sm" onClick={() => handleLink(order.id)}>
              手動紐付け
            </Button>
          )}
        </div>
      ),
    },
  ];

  const filteredOrders = orders.filter(o => 
    o.order_number.includes(searchQuery) || 
    o.items.some(i => i.item_name.includes(searchQuery))
  );

  return (
    <PageTemplate 
      title="楽天注文履歴" 
      description="連携された楽天店舗の注文履歴を確認・管理します。"
      breadcrumbs={[{ label: "楽天連携" }, { label: "注文履歴" }]}
      actions={
        <div className="flex gap-2">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="注文番号、商品名で検索" 
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            絞り込み
          </Button>
        </div>
      }
    >
      <div className="bg-white border rounded-lg p-4">
        <DataTable 
          data={filteredOrders} 
          columns={columns} 
          pagination={{ currentPage: 1, totalPages: 1, onPageChange: () => {} }}
        />
      </div>
    </PageTemplate>
  );
}
