import { useLayout } from "@/contexts/layout-context"
import { X, FileText, Image, FileCode, Download, ExternalLink, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

export function FileDrawer() {
  const { fileDrawerOpen, setFileDrawerOpen } = useLayout()

  const recentFiles = [
    { id: 1, name: "2025-01_report.pdf", type: "pdf", size: "2.4 MB", date: "2025/01/01 09:35" },
    { id: 2, name: "campaign_assets.zip", type: "zip", size: "15.8 MB", date: "2025/01/01 09:32" },
    { id: 3, name: "user_segment_v2.csv", type: "csv", size: "450 KB", date: "2024/12/31 18:20" },
    { id: 4, name: "welcome_message_draft.txt", type: "txt", size: "12 KB", date: "2024/12/31 14:15" },
  ]

  const getFileIcon = (type: string) => {
    switch (type) {
      case "pdf": return <FileText className="w-5 h-5 text-red-500" />
      case "zip": return <FileCode className="w-5 h-5 text-yellow-500" />
      case "csv": return <FileText className="w-5 h-5 text-green-500" />
      case "txt": return <FileText className="w-5 h-5 text-gray-500" />
      default: return <FileText className="w-5 h-5 text-blue-500" />
    }
  }

  return (
    <>
      {/* Backdrop */}
      {fileDrawerOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setFileDrawerOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          "fixed right-0 top-0 h-screen w-80 bg-background border-l border-border shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col",
          fileDrawerOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            最近のファイル
          </h3>
          <button
            onClick={() => setFileDrawerOpen(false)}
            className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {recentFiles.map((file) => (
            <div key={file.id} className="group p-3 rounded-lg border border-border bg-card hover:border-primary/50 hover:shadow-sm transition-all">
              <div className="flex items-start gap-3">
                <div className="mt-1 p-2 bg-muted rounded-md">
                  {getFileIcon(file.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{file.size} • {file.date}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs font-medium text-primary bg-primary/10 rounded hover:bg-primary/20 transition-colors">
                  <Download className="w-3.5 h-3.5" />
                  ダウンロード
                </button>
                <button className="flex items-center justify-center p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors">
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
          
          <div className="pt-4 border-t border-border">
            <button className="w-full py-2 text-sm text-muted-foreground hover:text-primary transition-colors border border-dashed border-border rounded-md hover:border-primary hover:bg-primary/5">
              すべてのファイルを表示
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
