import { useLayout } from "@/contexts/layout-context"
import { Link, useLocation } from "wouter"
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Calendar,
  FileText,
  BarChart2,
  Bot,
  Link as LinkIcon,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LogOut
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface AppSidebarProps {
  currentPath?: string
}

export function AppSidebar({ currentPath }: AppSidebarProps) {
  const { sidebarCollapsed, setSidebarCollapsed } = useLayout()
  const [location] = useLocation()
  const activePath = currentPath || location
  
  // State for collapsible submenus
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    "/analysis": true,
    "/ai": true
  })

  const toggleMenu = (href: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [href]: !prev[href]
    }))
  }

  const navItems = [
    { 
      icon: LayoutDashboard, 
      label: "概要", 
      href: "/",
      subItems: []
    },
    { 
      icon: Users, 
      label: "友だち管理", 
      href: "/friends",
      subItems: [
        { label: "友だちリスト", href: "/friends/list" },
        { label: "タグ管理", href: "/friends/tags" },
        { label: "ブロックリスト", href: "/friends/blocked" }
      ]
    },
    { 
      icon: MessageSquare, 
      label: "メッセージ", 
      href: "/messages",
      subItems: [
        { label: "一斉配信", href: "/messages/broadcast" },
        { label: "ステップ配信", href: "/messages/step" },
        { label: "自動応答", href: "/messages/auto-reply" },
        { label: "テンプレート", href: "/messages/templates" }
      ]
    },
    { 
      icon: Calendar, 
      label: "予約・イベント", 
      href: "/events",
      subItems: [
        { label: "予約カレンダー", href: "/events/calendar" },
        { label: "イベント一覧", href: "/events/list" },
        { label: "参加者管理", href: "/events/participants" }
      ]
    },
    { 
      icon: FileText, 
      label: "フォーム", 
      href: "/forms",
      subItems: [
        { label: "回答一覧", href: "/forms/responses" },
        { label: "フォーム作成", href: "/forms/create" }
      ]
    },
    { 
      icon: BarChart2, 
      label: "分析", 
      href: "/analysis",
      subItems: [
        { label: "ダッシュボード", href: "/analysis/dashboard" },
        { label: "友だち分析", href: "/analysis/friends" },
        { label: "メッセージ分析", href: "/analysis/messages" }
      ]
    },
    { 
      icon: Bot, 
      label: "AI", 
      href: "/ai",
      subItems: [
        { label: "分析レポート", href: "/ai/reports" },
        { label: "生成履歴", href: "/ai/history" },
        { label: "モデル設定", href: "/ai/settings" }
      ]
    },
    { 
      icon: LinkIcon, 
      label: "連携", 
      href: "/integrations",
      subItems: [
        { label: "Shopify連携", href: "/integrations/shopify" },
        { label: "LINE公式アカウント", href: "/integrations/line" }
      ]
    },
    { 
      icon: Settings, 
      label: "管理", 
      href: "/admin",
      subItems: [
        { label: "アカウント設定", href: "/admin/account" },
        { label: "メンバー管理", href: "/admin/members" },
        { label: "プラン・支払い", href: "/admin/billing" }
      ]
    },
  ]

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col shadow-sm",
        sidebarCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo Area */}
      <div className="h-16 flex items-center px-4 border-b border-gray-100 relative">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-gray-900">
          <div className="w-8 h-8 bg-[#06C755] rounded-lg flex items-center justify-center text-white">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
          </div>
          {!sidebarCollapsed && (
            <div className="flex flex-col leading-none">
              <span className="text-lg font-bold">Lカート</span>
              <span className="text-[10px] text-gray-500 font-medium">LINE拡張ツール</span>
            </div>
          )}
        </div>
        
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-900 shadow-sm z-50 hover:bg-gray-50"
        >
          {sidebarCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
        <nav className="space-y-1 px-3">
          {navItems.map((item) => {
            const isActive = activePath === item.href || activePath.startsWith(item.href + "/")
            const hasSubItems = item.subItems.length > 0
            const isExpanded = expandedMenus[item.href]

            return (
              <div key={item.href} className="mb-1">
                {hasSubItems && !sidebarCollapsed ? (
                  <button
                    onClick={() => toggleMenu(item.href)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer group",
                      isActive
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={cn("w-5 h-5", isActive ? "text-[#06C755]" : "text-gray-500 group-hover:text-gray-700")} />
                      <span>{item.label}</span>
                    </div>
                    <ChevronDown className={cn("w-4 h-4 text-gray-400 transition-transform duration-200", isExpanded ? "transform rotate-180" : "")} />
                  </button>
                ) : (
                  <Link href={item.href}>
                    <div
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer group",
                        isActive
                          ? "bg-gray-100 text-gray-900"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                        sidebarCollapsed ? "justify-center" : ""
                      )}
                      title={sidebarCollapsed ? item.label : undefined}
                    >
                      <item.icon className={cn("w-5 h-5", isActive ? "text-[#06C755]" : "text-gray-500 group-hover:text-gray-700")} />
                      {!sidebarCollapsed && <span>{item.label}</span>}
                    </div>
                  </Link>
                )}
                
                {/* Submenu */}
                {!sidebarCollapsed && hasSubItems && isExpanded && (
                  <div className="mt-1 ml-4 space-y-0.5 border-l border-gray-200 pl-3 py-1">
                    {item.subItems.map((subItem) => (
                      <Link key={subItem.href} href={subItem.href}>
                        <div
                          className={cn(
                            "block px-3 py-2 text-sm rounded-md transition-colors cursor-pointer",
                            activePath === subItem.href || activePath.startsWith(subItem.href)
                              ? "text-[#06C755] bg-[#06C755]/5 font-medium"
                              : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
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

      {/* Footer Actions */}
      <div className="p-3 border-t border-gray-200 space-y-1">
        <button className={cn(
          "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors",
          sidebarCollapsed ? "justify-center" : ""
        )}>
          <Settings className="w-5 h-5 text-gray-500" />
          {!sidebarCollapsed && <span>設定</span>}
        </button>
        <button className={cn(
          "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors",
          sidebarCollapsed ? "justify-center" : ""
        )}>
          <HelpCircle className="w-5 h-5 text-gray-500" />
          {!sidebarCollapsed && <span>ヘルプ</span>}
        </button>
      </div>
    </aside>
  )
}
