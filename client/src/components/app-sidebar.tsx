import { useLayout } from "@/contexts/layout-context"
import { Link, useLocation } from "wouter"
import {
  LayoutDashboard,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Bot,
  BarChart2,
  Users,
  MessageSquare,
  ShoppingBag,
  Zap
} from "lucide-react"
import { cn } from "@/lib/utils"

interface AppSidebarProps {
  currentPath?: string
}

export function AppSidebar({ currentPath }: AppSidebarProps) {
  const { sidebarCollapsed, setSidebarCollapsed } = useLayout()
  const [location] = useLocation()
  
  // Use currentPath prop if provided, otherwise use location
  const activePath = currentPath || location

  const navItems = [
    { icon: LayoutDashboard, label: "ダッシュボード", href: "/" },
    { icon: Bot, label: "AI分析", href: "/ai", active: true }, // Parent of /ai/reports
    { icon: MessageSquare, label: "メッセージ配信", href: "/messages" },
    { icon: Zap, label: "自動化シナリオ", href: "/scenarios" },
    { icon: Users, label: "顧客管理", href: "/customers" },
    { icon: ShoppingBag, label: "商品管理", href: "/products" },
    { icon: BarChart2, label: "データ分析", href: "/analytics" },
    { icon: Settings, label: "設定", href: "/settings" },
  ]

  const subNavItems = [
    { label: "分析レポート", href: "/ai/reports", parent: "/ai" },
    { label: "生成履歴", href: "/ai/history", parent: "/ai" },
    { label: "モデル設定", href: "/ai/settings", parent: "/ai" },
  ]

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 ease-in-out flex flex-col",
        sidebarCollapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo Area */}
      <div className="h-16 flex items-center justify-center border-b border-sidebar-border relative">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
            <Bot className="w-5 h-5" />
          </div>
          {!sidebarCollapsed && <span className="text-sidebar-foreground">AI Insight</span>}
        </div>
        
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-background border border-border rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground shadow-sm z-50"
        >
          {sidebarCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
        <nav className="space-y-1 px-2">
          {navItems.map((item) => {
            const isActive = activePath === item.href || activePath.startsWith(item.href + "/")
            
            return (
              <div key={item.href}>
                <Link href={item.href}>
                  <div
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer group",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                    )}
                  >
                    <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-sidebar-foreground/60 group-hover:text-sidebar-foreground")} />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </div>
                </Link>
                
                {/* Submenu for AI section */}
                {!sidebarCollapsed && isActive && item.href === "/ai" && (
                  <div className="mt-1 ml-9 space-y-1 border-l border-sidebar-border/50 pl-2">
                    {subNavItems.map((subItem) => (
                      <Link key={subItem.href} href={subItem.href}>
                        <div
                          className={cn(
                            "block px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer",
                            activePath === subItem.href || activePath.startsWith(subItem.href)
                              ? "text-primary bg-primary/10"
                              : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/30"
                          )}
                        >
                          {subItem.label}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </nav>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-sidebar-border">
        <div className={cn("flex items-center gap-3", sidebarCollapsed ? "justify-center" : "")}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-white font-bold text-xs">
            AD
          </div>
          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">Admin User</p>
              <p className="text-xs text-sidebar-foreground/60 truncate">admin@example.com</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
