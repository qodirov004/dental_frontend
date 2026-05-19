"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { QueueReception } from "@/components/queue/queue-reception"
import { QueueTVDisplay } from "@/components/queue/queue-tv-display"
import { ExternalLink } from "lucide-react"
import { useAuth } from "../auth-context"

export function QueueView() {
  const [activeTab, setActiveTab] = useState("reception")
  const { user } = useAuth()

  const canSeeTV = user?.role === "RECEPTIONIST" || user?.role === "ADMIN"

  return (
    <div className="w-full">
      <div className={`grid w-full mb-6 bg-muted p-1 rounded-lg ${canSeeTV ? "grid-cols-2" : "grid-cols-1"}`}>
        <Button 
          variant={activeTab === "reception" ? "default" : "ghost"} 
          onClick={() => setActiveTab("reception")}
          className="w-full"
        >
          Reception Panel
        </Button>
        {canSeeTV && (
          <a 
            href="/tv" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring h-9 px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            TV Display <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>

      {activeTab === "reception" && (
        <QueueReception />
      )}
    </div>
  )
}
