import { useState } from "react";
import { Link } from "wouter";
import { Plus, Search, MoreHorizontal, Copy, Trash2, ExternalLink, FileText, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FolderManager } from "@/components/common/folder-manager";
import { PageTemplate } from "@/components/page-template";
import { Folder, Form } from "@/types/schema";

// Mock Data
const MOCK_FOLDERS: Folder[] = [
  { id: "1", tenant_id: "t1", name: "アンケート", scope: "form", sort_order: 1, created_at: new Date(), updated_at: new Date() },
  { id: "2", tenant_id: "t1", name: "キャンペーン応募", scope: "form", sort_order: 2, created_at: new Date(), updated_at: new Date() },
  { id: "3", tenant_id: "t1", name: "お問い合わせ", scope: "form", sort_order: 3, created_at: new Date(), updated_at: new Date() },
];

const MOCK_FORMS: Form[] = [
  {
    id: "f1",
    tenant_id: "t1",
    title: "サービス満足度調査",
    folder_id: "1",
    description: "サービスご利用後のアンケートです",
    fields_json: [],
    is_active: true,
    response_count: 124,
    created_at: "2024-03-10T10:00:00Z",
  },
  {
    id: "f2",
    tenant_id: "t1",
    title: "春のプレゼントキャンペーン",
    folder_id: "2",
    description: "抽選で豪華賞品が当たります",
    fields_json: [],
    is_active: true,
    response_count: 856,
    created_at: "2024-03-15T14:30:00Z",
  },
  {
    id: "f3",
    tenant_id: "t1",
    title: "商品に関するお問い合わせ",
    folder_id: "3",
    description: "24時間受付中",
    fields_json: [],
    is_active: false,
    response_count: 42,
    created_at: "2024-02-20T09:15:00Z",
  },
];

export default function FormManagerPage() {
  const [folders, setFolders] = useState<Folder[]>(MOCK_FOLDERS);
  const [forms, setForms] = useState<Form[]>(MOCK_FORMS);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Folder Operations
  const handleCreateFolder = (name: string) => {
    const newFolder: Folder = {
      id: Date.now().toString(),
      tenant_id: "t1",
      name,
      scope: "form",
      sort_order: folders.length + 1,
      created_at: new Date(),
      updated_at: new Date(),
    };
    setFolders([...folders, newFolder]);
  };

  const handleUpdateFolder = (id: string, name: string) => {
    setFolders(folders.map(f => f.id === id ? { ...f, name } : f));
  };

  const handleDeleteFolder = (id: string) => {
    setFolders(folders.filter(f => f.id !== id));
    // Move items to root (null folder)
    setForms(forms.map(f => f.folder_id === id ? { ...f, folder_id: undefined } : f));
  };

  // Form Operations
  const handleDeleteForm = (id: string) => {
    if (confirm("本当に削除しますか？")) {
      setForms(forms.filter(f => f.id !== id));
    }
  };

  const handleDuplicateForm = (form: Form) => {
    const newForm: Form = {
      ...form,
      id: Date.now().toString(),
      title: `${form.title} (コピー)`,
      response_count: 0,
      created_at: new Date().toISOString(),
    };
    setForms([...forms, newForm]);
  };

  const handleToggleStatus = (id: string) => {
    setForms(forms.map(f => f.id === id ? { ...f, is_active: !f.is_active } : f));
  };

  // Filtering
  const filteredForms = forms.filter(form => {
    const matchesFolder = selectedFolderId ? form.folder_id === selectedFolderId : true;
    const matchesSearch = form.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFolder && matchesSearch;
  });

  return (
    <PageTemplate title="回答フォーム管理" breadcrumbs={[{ label: "フォーム", href: "/forms" }]}>
      <div className="flex h-[calc(100vh-12rem)] border rounded-lg bg-white overflow-hidden shadow-sm">
        {/* Left Pane: Folder Manager */}
        <FolderManager
          folders={folders}
          selectedFolderId={selectedFolderId}
          onSelectFolder={setSelectedFolderId}
          onCreateFolder={handleCreateFolder}
          onUpdateFolder={handleUpdateFolder}
          onDeleteFolder={handleDeleteFolder}
          className="w-64 flex-shrink-0"
        />

        {/* Right Pane: Form List */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Toolbar */}
          <div className="p-4 border-b flex items-center justify-between gap-4 bg-white">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="フォーム名で検索..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button className="bg-[#06C755] hover:bg-[#05b34c] text-white" asChild>
              <Link href="/forms/create">
                <Plus className="mr-2 h-4 w-4" /> 新規作成
              </Link>
            </Button>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">状態</TableHead>
                  <TableHead>管理名</TableHead>
                  <TableHead className="w-[100px] text-center">回答数</TableHead>
                  <TableHead className="w-[180px]">作成日時</TableHead>
                  <TableHead className="w-[120px] text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredForms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-gray-500">
                      フォームが見つかりません
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredForms.map((form) => (
                    <TableRow key={form.id} className="group">
                      <TableCell>
                        <div className="flex items-center justify-center">
                          <div 
                            className={`w-3 h-3 rounded-full cursor-pointer ${form.is_active ? 'bg-green-500' : 'bg-gray-300'}`}
                            title={form.is_active ? "稼働中" : "停止中"}
                            onClick={() => handleToggleStatus(form.id)}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-gray-900">{form.title}</div>
                        <div className="text-xs text-gray-500 truncate max-w-[300px]">{form.description}</div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="font-normal">
                          {form.response_count}件
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {new Date(form.created_at).toLocaleString('ja-JP', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" asChild title="回答一覧">
                            <Link href={`/forms/${form.id}/responses`}>
                              <FileText className="h-4 w-4 text-gray-500" />
                            </Link>
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4 text-gray-500" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem asChild>
                                <Link href={`/forms/${form.id}/edit`}>
                                  <Settings className="mr-2 h-4 w-4" />
                                  設定・編集
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDuplicateForm(form)}>
                                <Copy className="mr-2 h-4 w-4" />
                                複製
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <a href={`https://forms.l-message.jp/${form.id}`} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="mr-2 h-4 w-4" />
                                  回答ページを開く
                                </a>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600 focus:text-red-600"
                                onClick={() => handleDeleteForm(form.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                削除
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </PageTemplate>
  );
}
