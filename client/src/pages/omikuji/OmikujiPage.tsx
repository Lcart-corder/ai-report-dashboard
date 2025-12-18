import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, Gift, BarChart2, Settings, MoreVertical, Play, Trash2, Copy } from "lucide-react";
import { Link } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { OmikujiConfig } from "@/types/schema";

// Mock Data
const mockOmikujis: OmikujiConfig[] = [
  {
    id: "omikuji_1",
    tenant_id: "tenant1",
    name: "毎日運試し！ログインおみくじ",
    status: "published",
    timezone: "Asia/Tokyo",
    daily_limit: 1,
    reset_time: "00:00",
    points_attribute_key: "omikuji_points",
    created_by: "user1",
    updated_by: "user1",
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "omikuji_2",
    tenant_id: "tenant1",
    name: "新春キャンペーンおみくじ",
    status: "draft",
    timezone: "Asia/Tokyo",
    daily_limit: 1,
    reset_time: "00:00",
    points_attribute_key: "campaign_points",
    created_by: "user1",
    updated_by: "user1",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

export default function OmikujiPage() {
  const [omikujis, setOmikujis] = useState<OmikujiConfig[]>(mockOmikujis);

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">おみくじ管理</h1>
          <p className="text-muted-foreground mt-2">
            1日1回引けるおみくじを作成し、リッチメニューに設置できます。
          </p>
        </div>
        <Button asChild className="bg-[#06C755] hover:bg-[#05b34c]">
          <Link href="/omikuji/new">
            <Plus className="mr-2 h-4 w-4" />
            新規作成
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {omikujis.map((omikuji) => (
          <Card key={omikuji.id} className="group relative overflow-hidden transition-all hover:shadow-md">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg font-bold line-clamp-1">
                    {omikuji.name}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Badge variant={omikuji.status === 'published' ? 'default' : 'secondary'}>
                      {omikuji.status === 'published' ? '公開中' : '下書き'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      更新: {new Date(omikuji.updated_at).toLocaleDateString()}
                    </span>
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="-mr-2 h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      設定を編集
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Copy className="mr-2 h-4 w-4" />
                      複製して作成
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" />
                      削除
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex flex-col gap-1 p-3 bg-slate-50 rounded-lg">
                  <span className="text-muted-foreground text-xs flex items-center gap-1">
                    <Gift className="w-3 h-3" />
                    参加者数
                  </span>
                  <span className="font-bold text-lg">1,234</span>
                </div>
                <div className="flex flex-col gap-1 p-3 bg-slate-50 rounded-lg">
                  <span className="text-muted-foreground text-xs flex items-center gap-1">
                    <BarChart2 className="w-3 h-3" />
                    本日の参加
                  </span>
                  <span className="font-bold text-lg">42</span>
                </div>
              </div>
              
              <div className="mt-4 flex gap-2">
                <Button variant="outline" className="w-full" size="sm">
                  <BarChart2 className="mr-2 h-4 w-4" />
                  分析
                </Button>
                <Button variant="outline" className="w-full" size="sm">
                  <Play className="mr-2 h-4 w-4" />
                  テスト実行
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Empty State Card for creating new */}
        <Button 
          variant="outline" 
          className="h-full min-h-[200px] flex flex-col gap-4 border-dashed hover:border-[#06C755] hover:bg-green-50/50 hover:text-[#06C755]"
          asChild
        >
          <Link href="/omikuji/new">
            <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
              <Plus className="h-6 w-6" />
            </div>
            <span className="font-medium">新しいおみくじを作成</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
