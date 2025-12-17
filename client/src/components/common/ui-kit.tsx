import React from 'react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  AlertCircle, 
  Search,
  History
} from "lucide-react";
import { AuditLog, DateTime } from "@/types/schema";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

// --- Status Badge ---
interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'neutral';
  label?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, variant = 'default', label }) => {
  const styles = {
    default: "bg-blue-100 text-blue-700",
    success: "bg-green-100 text-green-700",
    warning: "bg-yellow-100 text-yellow-700",
    error: "bg-red-100 text-red-700",
    neutral: "bg-gray-100 text-gray-700",
  };

  // Auto-detect variant if not provided
  let finalVariant = variant;
  if (variant === 'default') {
    if (['active', 'success', 'published', 'sent', 'confirmed'].includes(status)) finalVariant = 'success';
    else if (['pending', 'draft', 'queued', 'running'].includes(status)) finalVariant = 'warning';
    else if (['error', 'failed', 'blocked', 'canceled'].includes(status)) finalVariant = 'error';
    else if (['inactive', 'archived'].includes(status)) finalVariant = 'neutral';
  }

  return (
    <span className={cn("px-2 py-0.5 rounded text-xs font-medium", styles[finalVariant])}>
      {label || status}
    </span>
  );
};

// --- Data Table ---
interface DataTableProps<T> {
  data: T[];
  columns: {
    header: string;
    accessorKey?: keyof T;
    cell?: (item: T) => React.ReactNode;
    className?: string;
  }[];
  isLoading?: boolean;
  error?: string;
  onRetry?: () => void;
  searchable?: boolean;
  onSearch?: (query: string) => void;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
  emptyMessage?: string;
}

export function DataTable<T extends { id: string | number }>({
  data,
  columns,
  isLoading,
  error,
  onRetry,
  searchable,
  onSearch,
  pagination,
  emptyMessage = "データがありません"
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = React.useState("");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearch?.(e.target.value);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-red-500 bg-red-50 rounded-lg border border-red-100">
        <AlertCircle className="w-8 h-8 mb-2" />
        <p className="font-medium mb-2">{error}</p>
        {onRetry && (
          <Button variant="outline" onClick={onRetry} className="bg-white">
            再試行
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {searchable && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="検索..." 
            value={searchQuery}
            onChange={handleSearch}
            className="pl-9 bg-white"
          />
        </div>
      )}

      <div className="border rounded-lg overflow-hidden bg-white">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              {columns.map((col, i) => (
                <TableHead key={i} className={col.className}>{col.header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center">
                  <div className="flex justify-center items-center">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                  </div>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center text-gray-500">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow key={item.id} className="hover:bg-gray-50">
                  {columns.map((col, i) => (
                    <TableCell key={i} className={col.className}>
                      {col.cell ? col.cell(item) : (item[col.accessorKey!] as React.ReactNode)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            ページ {pagination.currentPage} / {pagination.totalPages}
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              disabled={pagination.currentPage <= 1}
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              disabled={pagination.currentPage >= pagination.totalPages}
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Audit Log Viewer ---
interface AuditLogViewerProps {
  logs: AuditLog[];
}

export const AuditLogViewer: React.FC<AuditLogViewerProps> = ({ logs }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
        <History className="w-4 h-4" />
        <span>変更履歴（直近20件）</span>
      </div>
      <div className="border rounded-lg divide-y bg-white">
        {logs.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-500">履歴はありません</div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="p-3 text-sm flex justify-between items-start hover:bg-gray-50">
              <div>
                <div className="font-medium text-gray-900">
                  {log.action === 'create' && '作成'}
                  {log.action === 'update' && '更新'}
                  {log.action === 'delete' && '削除'}
                  {log.action === 'execute' && '実行'}
                  {log.action === 'login' && 'ログイン'}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  User: {log.actor_user_id}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">
                  {format(new Date(log.created_at), 'yyyy/MM/dd HH:mm', { locale: ja })}
                </div>
                {log.diff_json && (
                  <div className="text-xs text-blue-600 mt-0.5 cursor-pointer hover:underline">
                    詳細を表示
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
