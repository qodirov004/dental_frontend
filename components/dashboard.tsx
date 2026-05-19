"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "./sidebar"
import { MainContent } from "./main-content"
import { AuthProvider, useAuth } from "./auth-context"
import { useRouter } from "next/navigation"

export function Dashboard() {
  return <DashboardGuard />
}

function DashboardGuard() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (isLoading) return <div className="h-screen flex items-center justify-center">Yuklanmoqda...</div>
  if (!user) return null

  return <DashboardContent />
}

function DashboardContent() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState(user?.role === "DOCTOR" ? "queue" : "dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(true)

  if (!activeTab) return null

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      <MainContent activeTab={activeTab} onNavigate={setActiveTab} />
    </div>
  )
}
