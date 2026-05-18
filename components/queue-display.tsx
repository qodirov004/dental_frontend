import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { ClinicAPI } from "@/services/api"

export function QueueDisplay() {
  const [visits, setVisits] = useState<any[]>([])

  useEffect(() => {
    fetchVisits()
    const timer = setInterval(fetchVisits, 10000) // Refresh every 10s
    return () => clearInterval(timer)
  }, [])

  const fetchVisits = async () => {
    try {
      const res = await ClinicAPI.getVisits()
      // Filter only active visits
      const data = Array.isArray(res.data) ? res.data : []
      setVisits(data.filter((v: any) => ["WAITING", "CALLED", "IN_PROGRESS"].includes(v.status)).slice(0, 5))
    } catch (e) {
      console.error(e)
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "WAITING": return "Kutilmoqda"
      case "CALLED": return "Chaqirilmoqda"
      case "IN_PROGRESS": return "Qabulda"
      default: return status
    }
  }

  return (
    <div className="space-y-3">
      {visits.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Hozircha navbat yo'q</p>}
      {visits.map((queue) => (
        <div
          key={queue.id}
          className="flex items-center justify-between p-3 bg-card border border-border rounded-lg hover:bg-muted transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="text-lg font-bold text-primary">{queue.queue_number}</div>
            <div>
              <p className="text-sm font-medium">{queue.pet_name}</p>
              <p className="text-xs text-muted-foreground">{queue.veterinarian_name || "-"}</p>
            </div>
          </div>
          <Badge
            variant={
              queue.status === "IN_PROGRESS" ? "default" : queue.status === "CALLED" ? "secondary" : "outline"
            }
          >
            {getStatusText(queue.status)}
          </Badge>
        </div>
      ))}
    </div>
  )
}
