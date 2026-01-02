import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Order } from "@/types/schema";
import { Search, Truck, Send } from "lucide-react";
import { toast } from "sonner";

export default function ShippingManagementPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = () => {
    fetch("/api/orders")
      .then(res => res.json())
      .then(data => {
        // Filter orders that need shipping or are shipped
        const shippingOrders = data.filter((o: Order) => 
          o.status === 'paid' || o.status === 'fulfilled'
        );
        setOrders(shippingOrders);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleUpdateStatus = async (orderId: string, status: string, trackingNumber?: string) => {
    try {
      // In a real app, this would call an API to update shipment status
      // For now, we'll just update the local state to simulate it
      const updatedOrders = orders.map(o => {
        if (o.id === orderId) {
          return { ...o, status: status === 'shipped' ? 'fulfilled' : o.status };
        }
        return o;
      });
      setOrders(updatedOrders);
      
      if (status === 'shipped') {
        toast.success("発送処理を完了し、通知を送信しました");
      } else {
        toast.success("ステータスを更新しました");
      }
    } catch (err) {
      console.error(err);
      toast.error("エラーが発生しました");
    }
  };

  const filteredOrders = orders.filter(order => 
    order.order_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.shipping_info_json.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">配送管理</h1>
            <p className="text-muted-foreground">
              注文の配送状況の管理と発送通知を行います。
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>配送待ち・発送済み一覧</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="注文番号または氏名で検索" 
                  className="pl-8"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>注文番号</TableHead>
                  <TableHead>注文日時</TableHead>
                  <TableHead>配送先</TableHead>
                  <TableHead>配送状況</TableHead>
                  <TableHead>追跡番号</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">読み込み中...</TableCell>
                  </TableRow>
                ) : filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">データがありません</TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.order_no}</TableCell>
                      <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{order.shipping_info_json.name}</div>
                          <div className="text-gray-500">{order.shipping_info_json.address}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {order.status === 'fulfilled' ? (
                          <Badge className="bg-green-500">発送済み</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">未発送</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Input 
                          placeholder="追跡番号を入力" 
                          className="w-40 h-8"
                          disabled={order.status === 'fulfilled'}
                        />
                      </TableCell>
                      <TableCell>
                        {order.status !== 'fulfilled' && (
                          <Button 
                            size="sm" 
                            onClick={() => handleUpdateStatus(order.id, 'shipped')}
                          >
                            <Truck className="mr-2 h-4 w-4" />
                            発送通知を送る
                          </Button>
                        )}
                        {order.status === 'fulfilled' && (
                          <Button variant="ghost" size="sm" disabled>
                            <Send className="mr-2 h-4 w-4" />
                            通知済み
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
