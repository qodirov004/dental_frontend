"use client"

import React from "react"

import {
  Calendar,
  Users,
  History,
  DollarSign,
  BarChart3,
  Menu,
  X,
  Stethoscope,
  AlertCircle,
  Layout,
  LogOut,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "./auth-context"

interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export function Sidebar({ activeTab, setActiveTab, sidebarOpen, setSidebarOpen }: SidebarProps) {
  const { user, logout } = useAuth()

  const menuItems = [
    { id: "dashboard", label: "Bosh sahifa", icon: Layout, roles: ["ADMIN", "RECEPTIONIST", "ASSISTANT"] },
    { id: "queue", label: "Navbat tizimi", icon: Calendar, roles: ["ADMIN", "DOCTOR", "RECEPTIONIST", "ASSISTANT"] },
    { id: "customers", label: "Bemorlar", icon: Users, roles: ["ADMIN", "RECEPTIONIST", "ASSISTANT"] },
    { id: "medical", label: "Tibbiy tarix", icon: History, roles: ["ADMIN", "DOCTOR"] },
    { id: "debt", label: "Qarzlar", icon: DollarSign, roles: ["ADMIN", "RECEPTIONIST"] },
    { id: "alerts", label: "Ogohlantirishlar", icon: AlertCircle, roles: ["ADMIN", "RECEPTIONIST"] },
    { id: "staff", label: "Xodimlar (Shifokorlar)", icon: Stethoscope, roles: ["ADMIN"] },
    { id: "unified-analytics", label: "Hisobotlar & Tahlil", icon: BarChart3, roles: ["ADMIN"] },
  ]

  const filteredItems = menuItems.filter(item => item.roles.includes(user?.role || ""))

  return (
    <>
      {/* Mobile toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-4 top-4 z-50 lg:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } fixed lg:static lg:translate-x-0 w-64 h-full bg-sidebar border-r border-sidebar-border transition-transform duration-300 z-40 overflow-y-auto`}
      >
        {/* Header */}
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sidebar-primary rounded-lg flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-sidebar-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-sidebar-foreground">
                Dental Clinic
              </h1>
              <p className="text-xs text-sidebar-accent-foreground">
                Pro Management
              </p>
            </div>
          </div>
        </div>

        {/* Menu items */}
        <nav className="p-4 space-y-2">
          {filteredItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id)
                  setSidebarOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === item.id
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
                  }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            )
          })}
        </nav>

        {/* User Info (Bottom) */}
        <div className="p-4 border-t border-sidebar-border mt-auto">
          <div className="flex items-center justify-between">
            <div className="text-sm text-sidebar-foreground">
              <p className="font-bold">{user?.first_name || user?.username}</p>
              <p className="text-xs text-muted-foreground">
                {user?.role === "ADMIN" ? "Admin" : 
                 user?.role === "DOCTOR" ? "Shifokor" : 
                 user?.role === "RECEPTIONIST" ? "Registrator" : "Yordamchi"}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => logout()} title="Chiqish">
              <LogOut className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {
        sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )
      }
    </>
  )
}
