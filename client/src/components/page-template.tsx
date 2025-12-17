import { useLayout } from "@/contexts/layout-context"
import { AppSidebar } from "@/components/app-sidebar"
import { cn } from "@/lib/utils"
import { ChevronRight } from "lucide-react"

interface PageTemplateProps {
  title: string
  description?: string
  breadcrumbs?: { label: string; href?: string }[]
  children: React.ReactNode
  actions?: React.ReactNode
}

export function PageTemplate({ 
  title, 
  description, 
  breadcrumbs = [], 
  children,
  actions
}: PageTemplateProps) {
  const { sidebarCollapsed } = useLayout()

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 overflow-hidden font-sans">
      <AppSidebar />

      <main 
        className={cn(
          "flex-1 overflow-y-auto transition-all duration-300 ease-in-out",
          sidebarCollapsed ? "ml-16" : "ml-64"
        )}
      >
        <div className="p-8 max-w-[1600px] mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                <span>ホーム</span>
                {breadcrumbs.map((crumb, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <ChevronRight className="w-4 h-4" />
                    <span className={cn(i === breadcrumbs.length - 1 ? "text-gray-900 font-medium" : "")}>
                      {crumb.label}
                    </span>
                  </div>
                ))}
              </div>
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
            </div>
            {actions && (
              <div className="flex items-center gap-2">
                {actions}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm min-h-[400px] p-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
