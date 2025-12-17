import { useState } from "react";
import { Folder, Plus, MoreHorizontal, Edit2, Trash2, ChevronRight, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Folder as FolderType } from "@/types/schema";

interface FolderManagerProps {
  folders: FolderType[];
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
  onCreateFolder: (name: string) => void;
  onUpdateFolder: (id: string, name: string) => void;
  onDeleteFolder: (id: string) => void;
  className?: string;
}

export function FolderManager({
  folders,
  selectedFolderId,
  onSelectFolder,
  onCreateFolder,
  onUpdateFolder,
  onDeleteFolder,
  className,
}: FolderManagerProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [targetFolder, setTargetFolder] = useState<FolderType | null>(null);

  const handleCreate = () => {
    if (folderName.trim()) {
      onCreateFolder(folderName);
      setFolderName("");
      setIsCreateOpen(false);
    }
  };

  const handleUpdate = () => {
    if (targetFolder && folderName.trim()) {
      onUpdateFolder(targetFolder.id, folderName);
      setFolderName("");
      setTargetFolder(null);
      setIsEditOpen(false);
    }
  };

  const handleDelete = () => {
    if (targetFolder) {
      onDeleteFolder(targetFolder.id);
      setTargetFolder(null);
      setIsDeleteOpen(false);
      if (selectedFolderId === targetFolder.id) {
        onSelectFolder(null);
      }
    }
  };

  const openEdit = (folder: FolderType) => {
    setTargetFolder(folder);
    setFolderName(folder.name);
    setIsEditOpen(true);
  };

  const openDelete = (folder: FolderType) => {
    setTargetFolder(folder);
    setIsDeleteOpen(true);
  };

  return (
    <div className={cn("w-64 border-r border-gray-200 bg-gray-50/50 flex flex-col h-full", className)}>
      <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
        <span className="font-medium text-sm text-gray-700">フォルダ</span>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        <button
          onClick={() => onSelectFolder(null)}
          className={cn(
            "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
            selectedFolderId === null
              ? "bg-blue-50 text-blue-700 font-medium"
              : "text-gray-600 hover:bg-gray-100"
          )}
        >
          <FolderOpen className="h-4 w-4" />
          <span>すべての項目</span>
        </button>

        {folders.map((folder) => (
          <div
            key={folder.id}
            className={cn(
              "group flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors cursor-pointer",
              selectedFolderId === folder.id
                ? "bg-blue-50 text-blue-700 font-medium"
                : "text-gray-600 hover:bg-gray-100"
            )}
            onClick={() => onSelectFolder(folder.id)}
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <Folder className={cn("h-4 w-4 flex-shrink-0", selectedFolderId === folder.id ? "fill-blue-200" : "")} />
              <span className="truncate">{folder.name}</span>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => openEdit(folder)}>
                  <Edit2 className="mr-2 h-3 w-3" />
                  名前を変更
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => openDelete(folder)} className="text-red-600">
                  <Trash2 className="mr-2 h-3 w-3" />
                  削除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新しいフォルダを作成</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="フォルダ名"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>キャンセル</Button>
            <Button onClick={handleCreate}>作成</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>フォルダ名を変更</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="フォルダ名"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>キャンセル</Button>
            <Button onClick={handleUpdate}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>フォルダを削除</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-sm text-gray-500">
            フォルダ「{targetFolder?.name}」を削除してもよろしいですか？<br />
            中のアイテムは「すべての項目」に移動します。
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>キャンセル</Button>
            <Button variant="destructive" onClick={handleDelete}>削除</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
