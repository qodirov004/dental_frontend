import { useState, useEffect } from "react"
import { AlertTriangle, Clock, ShieldCheck, Heart, Info, ArrowRight, Table as TableIcon } from "lucide-react"
import { ClinicAPI } from "@/services/api"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function AlertsView({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    ClinicAPI.getStats()
      .then(res => setStats(res.data))
      .finally(() => setIsLoading(false))
  }, [])

  const alertGroups = [
    {
      id: "critical",
      title: "Kritik",
      icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
      items: [
        stats?.total_debt > 0 && {
          title: "To'lanmagan qarzlar",
          description: `Umumiy ${(stats?.total_debt / 1000).toFixed(0)}K so'm miqdorida muddati o'tgan to'lovlar mavjud.`,
          type: "error",
          action: "Invoicelarni ko'rish",
          color: "bg-red-500/10 border-red-500/20 text-red-700",
          onClick: () => onNavigate?.("debt")
        },
        stats?.overdue_followups > 0 && {
          title: "Muddati o'tgan nazorat",
          description: `${stats?.overdue_followups} ta bemor nazorat vaqtidan o'tib ketdi.`,
          type: "error",
          action: "Bog'lanish",
          color: "bg-orange-500/10 border-orange-500/20 text-orange-700",
          onClick: () => onNavigate?.("queue")
        }
      ].filter(Boolean)
    },
    {
      id: "upcoming",
      title: "Kutilayotgan",
      icon: <Clock className="w-5 h-5 text-blue-500" />,
      items: [
        stats?.upcoming_vaccinations > 0 && {
          title: "Yaqinlashayotgan vaksinalar",
          description: `Kelgusi 7 kun ichida ${stats?.upcoming_vaccinations} ta vaksina muddati keladi.`,
          type: "info",
          action: "Ro'yxatni ko'rish",
          color: "bg-blue-500/10 border-blue-500/20 text-blue-700",
          onClick: () => onNavigate?.("medical")
        }
      ].filter(Boolean)
    },
    {
      id: "system",
      title: "Tizim Xabarlari",
      icon: <ShieldCheck className="w-5 h-5 text-green-500" />,
      items: [
        {
          title: "Tizim Faol",
          description: "Barcha xizmatlar (Klinika, Do'kon, Bot) barqaror ishlamoqda.",
          type: "success",
          color: "bg-green-500/10 border-green-500/20 text-green-700"
        },
        {
          title: "Ma'lumotlar Xavfsizligi",
          description: "Oxirgi zaxira nusxasi (backup) muvaffaqiyatli saqlandi.",
          type: "info",
          color: "bg-slate-500/10 border-slate-500/20 text-slate-700"
        }
      ]
    }
  ]

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-10 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-2">
            <Info className="w-3 h-3" />
            Markaziy monitoring
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">Ogohlantirishlar</h1>
          <p className="text-muted-foreground text-lg">Klinika va shop tizimidagi muhim xabarlar</p>
        </div>
      </div>

      <div className="grid gap-12">
        {alertGroups.map((group) => group.items.length > 0 && (
          <section key={group.id} className="space-y-6">
            <div className="flex items-center gap-2 border-b pb-2">
              {group.icon}
              <h2 className="text-xl font-bold">{group.title}</h2>
              <span className="ml-auto text-xs text-muted-foreground font-medium">{group.items.length} ta xabar</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {group.items.map((item: any, idx) => (
                <Card key={idx} className={cn(
                  "border-l-4 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group",
                  item.color
                )}>
                  <CardContent className="p-6 h-full flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-lg">{item.title}</h3>
                        {item.type === 'error' && <AlertTriangle className="w-4 h-4" />}
                        {item.type === 'info' && <Info className="w-4 h-4" />}
                        {item.type === 'success' && <ShieldCheck className="w-4 h-4" />}
                      </div>
                      <p className="opacity-80 text-sm leading-relaxed">{item.description}</p>
                    </div>

                    {item.action && (
                      <div className="pt-4 mt-auto">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={item.onClick}
                          className="p-0 h-auto hover:bg-transparent group-hover:underline gap-1 text-inherit font-bold"
                        >
                          {item.action}
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ))}
      </div>

      {stats?.total_debt === 0 && stats?.overdue_followups === 0 && stats?.upcoming_vaccinations === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center">
            <ShieldCheck className="w-10 h-10 text-green-600" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Hozircha hammasi joyida!</h2>
            <p className="text-muted-foreground max-w-sm">Tizimda hech qanday muhim ogohlantirishlar yoki kechikkan vazifalar yo'q.</p>
          </div>
        </div>
      )}
    </div>
  )
}
