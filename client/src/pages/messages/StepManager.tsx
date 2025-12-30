import { useState } from "react";
import { Link } from "wouter";
import { Plus, Search, MoreHorizontal, Copy, Trash2, PlayCircle, PauseCircle, GitBranch, Settings } from "lucide-react";
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
import { Folder, StepScenario } from "@/types/schema";

// Mock Data
const MOCK_FOLDERS: Folder[] = [
  { id: "1", tenant_id: "t1", name: "新規登録", scope: "step", sort_order: 1, created_at: new Date(), updated_at: new Date() },
  { id: "2", tenant_id: "t1", name: "購入者フォロー", scope: "step", sort_order: 2, created_at: new Date(), updated_at: new Date() },
  { id: "3", tenant_id: "t1", name: "休眠復帰", scope: "step", sort_order: 3, created_at: new Date(), updated_at: new Date() },
];

const MOCK_SCENARIOS: StepScenario[] = [
  {
    id: "s1",
    tenant_id: "t1",
    name: "新規友だち登録シナリオ",
    folder_id: "1",
    is_active: true,
    trigger_type: "friend_added",
    nodes_json: { steps: 5 },
    created_at: "2024-03-01T10:00:00Z",
  },
  {
    id: "s2",
    tenant_id: "t1",
    name: "初回購入サンクスシナリオ",
    folder_id: "2",
    is_active: true,
    trigger_type: "tag_added",
    trigger_value: "purchased",
    nodes_json: { steps: 3 },
    created_at: "2024-03-05T14:30:00Z",
  },
  {
    id: "s3",
    tenant_id: "t1",
    name: "30日間未購入フォロー",
    folder_id: "3",
    is_active: false,
    trigger_type: "tag_added",
    trigger_value: "inactive_30d",
    nodes_json: { steps: 2 },
    created_at: "2024-02-20T09:15:00Z",
  },
];

export default function StepManagerPage() {
  const [folders, setFolders] = useState<Folder[]>(MOCK_FOLDERS);
  const [scenarios, setScenarios] = useState<StepScenario[]>(MOCK_SCENARIOS);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Folder Operations
  const handleCreateFolder = (name: string) => {
    const newFolder: Folder = {
      id: Date.now().toString(),
      tenant_id: "t1",
      name,
      scope: "step",
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
    setScenarios(scenarios.map(s => s.folder_id === id ? { ...s, folder_id: undefined } : s));
  };

  // Scenario Operations
  const handleDeleteScenario = (id: string) => {
    if (confirm("本当に削除しますか？")) {
      setScenarios(scenarios.filter(s => s.id !== id));
    }
  };

  const handleDuplicateScenario = (scenario: StepScenario) => {
    const newScenario: StepScenario = {
      ...scenario,
      id: Date.now().toString(),
      name: `${scenario.name} (コピー)`,
      is_active: false,
      created_at: new Date().toISOString(),
    };
    setScenarios([...scenarios, newScenario]);
  };

  const handleToggleStatus = (id: string) => {
    setScenarios(scenarios.map(s => s.id === id ? { ...s, is_active: !s.is_active } : s));
  };

  // Filtering
  const filteredScenarios = scenarios.filter(scenario => {
    const matchesFolder = selectedFolderId ? scenario.folder_id === selectedFolderId : true;
    const matchesSearch = scenario.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFolder && matchesSearch;
  });

  return (
    <PageTemplate title="ステップ配信管理" breadcrumbs={[{ label: "メッセージ", href: "/messages/step" }, { label: "ステップ配信" }]}>
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

        {/* Right Pane: Scenario List */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Toolbar */}
          <div className="p-4 border-b flex items-center justify-between gap-4 bg-white">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="シナリオ名で検索..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button className="bg-[#06C755] hover:bg-[#05b34c] text-white" asChild>
              <Link href="/messages/step/create">
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
                  <TableHead>シナリオ名</TableHead>
                  <TableHead className="w-[150px]">開始条件</TableHead>
                  <TableHead className="w-[100px] text-center">ステップ数</TableHead>
                  <TableHead className="w-[120px] text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredScenarios.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-gray-500">
                      シナリオが見つかりません
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredScenarios.map((scenario) => (
                    <TableRow key={scenario.id} className="group">
                      <TableCell>
                        <div className="flex items-center justify-center">
                          <div 
                            className={`w-3 h-3 rounded-full cursor-pointer ${scenario.is_active ? 'bg-green-500' : 'bg-gray-300'}`}
                            title={scenario.is_active ? "稼働中" : "停止中"}
                            onClick={() => handleToggleStatus(scenario.id)}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-gray-900">{scenario.name}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(scenario.created_at).toLocaleDateString('ja-JP')} 作成
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {scenario.trigger_type === 'friend_added' && <Badge variant="outline">友だち追加時</Badge>}
                        {scenario.trigger_type === 'tag_added' && <Badge variant="outline">タグ付与時</Badge>}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="font-normal">
                          {(scenario.nodes_json as any).steps}通
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" asChild title="編集">
                            <Link href={`/messages/step/${scenario.id}/edit`}>
                              <GitBranch className="h-4 w-4 text-gray-500" />
                            </Link>
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4 text-gray-500" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem onClick={() => handleToggleStatus(scenario.id)}>
                                {scenario.is_active ? (
                                  <>
                                    <PauseCircle className="mr-2 h-4 w-4" />
                                    停止する
                                  </>
                                ) : (
                                  <>
                                    <PlayCircle className="mr-2 h-4 w-4" />
                                    開始する
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/messages/step/${scenario.id}/edit`}>
                                  <Settings className="mr-2 h-4 w-4" />
                                  設定・編集
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDuplicateScenario(scenario)}>
                                <Copy className="mr-2 h-4 w-4" />
                                複製
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600 focus:text-red-600"
                                onClick={() => handleDeleteScenario(scenario.id)}
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
