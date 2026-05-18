"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { QueueReception } from "@/components/queue/queue-reception"
import { QueueTVDisplay } from "@/components/queue/queue-tv-display"
import { ExternalLink } from "lucide-react"

export function QueueView() {
  const [activeTab, setActiveTab] = useState("reception")

  return (
    <div className="w-full">
      <div className="grid w-full grid-cols-2 mb-6 bg-muted p-1 rounded-lg">
        <Button 
          variant={activeTab === "reception" ? "default" : "ghost"} 
          onClick={() => setActiveTab("reception")}
          className="w-full"
        >
          Reception Panel
        </Button>
        <Button 
          variant="ghost" 
          onClick={() => window.open("/tv", "_blank")}
          className="w-full gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
        >
          TV Display <ExternalLink className="w-4 h-4" />
        </Button>
      </div>

      {activeTab === "reception" && (
        <QueueReception />
      )}
    </div>
  )
}
