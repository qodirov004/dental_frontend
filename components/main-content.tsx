"use client"

import { DashboardView } from "./views/dashboard-view"
import { QueueView } from "./views/queue-view"
import { CustomersView } from "./views/customers-view"
import { MedicalView } from "./views/medical-view"
import { DebtView } from "./views/debt-view"
import { AlertsView } from "./views/alerts-view"
import { FeedbackView } from "./views/feedback-view"
import { StaffView } from "./views/staff-view"
import { UnifiedAnalyticsView } from "./views/unified-analytics-view"
import { useAuth } from "./auth-context"
import { Button } from "@/components/ui/button"

export function MainContent({
  activeTab,
  onNavigate
}: {
  activeTab: string,
  onNavigate: (tab: string) => void
}) {
  const { user } = useAuth()
  const role = user?.role || ""

  const canAccess = (tab: string) => {
    switch (tab) {
      case "dashboard": return true
      case "queue": return true
      case "customers": return true
      case "medical": return ["ADMIN", "DOCTOR"].includes(role)
      case "debt": return ["ADMIN", "RECEPTIONIST"].includes(role)
      case "alerts": return ["ADMIN", "RECEPTIONIST"].includes(role)
      case "feedback": return ["ADMIN", "RECEPTIONIST"].includes(role)
      case "staff": return role === "ADMIN"
      case "unified-analytics": return ["ADMIN", "DOCTOR"].includes(role)
      default: return false
    }
  }

  if (!canAccess(activeTab)) {
    return (
      <div className="h-full flex items-center justify-center p-8 text-center">
        <div>
          <h2 className="text-2xl font-bold text-destructive mb-2">Kirish taqiqlangan</h2>
          <p className="text-muted-foreground">Sizda ushbu bo'limni ko'rish uchun ruxsat yo'q.</p>
          <Button className="mt-4" onClick={() => onNavigate("dashboard")}>Bosh sahifaga qaytish</Button>
        </div>
      </div>
    )
  }

  return (
    <main className="flex-1 overflow-auto">
      {/* Clinic Views */}
      {activeTab === "dashboard" && <DashboardView onNavigate={onNavigate} />}
      {activeTab === "queue" && <QueueView />}
      {activeTab === "customers" && <CustomersView />}
      {activeTab === "medical" && <MedicalView />}
      {activeTab === "debt" && <DebtView />}
      {activeTab === "alerts" && <AlertsView onNavigate={onNavigate} />}
      {activeTab === "feedback" && <FeedbackView />}
      {activeTab === "staff" && <StaffView />}
      {activeTab === "unified-analytics" && <UnifiedAnalyticsView />}
    </main>
  )
}
