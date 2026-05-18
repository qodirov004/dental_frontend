"use client"

import { useState, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart, ComposedChart } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, Mic2, Users, Clock, AlertTriangle } from "lucide-react"
import { QueueDisplay } from "../queue-display"
import { ExpiryAlertWidget } from "./dashboard/expiry-alert-widget"
import { ClinicAPI } from "@/services/api"
import { CustomerDialog } from "../customers/customer-dialog"
import { useAuth } from "../auth-context"


const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-sm border border-border/50 p-3 rounded-xl shadow-xl z-50">
        <p className="font-bold text-sm mb-1 text-foreground">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground font-medium">{entry.name}:</span>
            <span className="font-bold text-foreground">{Number(entry.value).toLocaleString()}</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export function DashboardView({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const [stats, setStats] = useState<any>(null)
  const [charts, setCharts] = useState<any>(null)
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false)
  const { user } = useAuth()
  const role = user?.role || ""

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [resStats, resCharts] = await Promise.all([
        ClinicAPI.getStats(),
        ClinicAPI.getAnalyticsCharts(7)
      ])
      setStats(resStats.data)
      setCharts(resCharts.data)
    } catch (e) {
      console.error(e)
    }
  }

  const formatXAxis = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Juma', 'Shan'][d.getDay()];
  }

  const showRevenue = ["ADMIN", "RECEPTIONIST"].includes(role)
  const showStats = ["ADMIN", "DOCTOR", "RECEPTIONIST"].includes(role)

  return (
    <div className="p-4 lg:p-8 space-y-8">
      {/* Header with quick actions */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Klinika Boshqaruvi
          </h1>
          <p className="text-muted-foreground">Xush kelibsiz, {user?.first_name || user?.username}!</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          {["ADMIN", "RECEPTIONIST"].includes(role) && (
            <button
              onClick={() => setIsCustomerDialogOpen(true)}
              className="inline-flex items-center justify-center rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-gradient-to-r from-blue-600 to-primary text-white shadow-lg hover:shadow-xl hover:scale-105 h-10 px-6 py-2 gap-2"
            >
              <PlusCircle className="w-5 h-5" />
              Yangi mijoz
            </button>
          )}
          <Button
            variant="outline"
            onClick={() => onNavigate?.("queue")}
            className="gap-2 bg-white/50 backdrop-blur border-primary/20 hover:bg-primary/5 rounded-xl h-10 px-6"
          >
            <Mic2 className="w-4 h-4 text-primary" />
            Chaqirish
          </Button>
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white overflow-hidden relative group transition-all hover:scale-[1.02]">
          <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
          <CardContent className="pt-8 relative z-10 flex justify-between items-center">
            <div>
              <p className="text-blue-100 font-medium mb-1 text-sm">Bugungi qabullar</p>
              <p className="text-4xl font-bold">{stats?.todays_visits || 0}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
              <Clock className="w-8 h-8 text-white" />
            </div>
          </CardContent>
        </Card>

        {showStats && (
          <>
            <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-green-600 text-white overflow-hidden relative group transition-all hover:scale-[1.02]">
              <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
              <CardContent className="pt-8 relative z-10 flex justify-between items-center">
                <div>
                  <p className="text-green-100 font-medium mb-1 text-sm">Jami Mijozlar</p>
                  <p className="text-4xl font-bold">{stats?.total_customers || 0}</p>
                </div>
                <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                  <Users className="w-8 h-8 text-white" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white overflow-hidden relative group transition-all hover:scale-[1.02]">
              <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
              <CardContent className="pt-8 relative z-10 flex justify-between items-center">
                <div>
                  <p className="text-purple-100 font-medium mb-1 text-sm">Barcha Bemorlar</p>
                  <p className="text-4xl font-bold">{stats?.total_pets || 0}</p>
                </div>
                <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                  <Users className="w-8 h-8 text-white" />
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {showRevenue && (
          <Card className="border-0 shadow-lg bg-gradient-to-br from-rose-500 to-red-600 text-white overflow-hidden relative group transition-all hover:scale-[1.02]">
            <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
            <CardContent className="pt-8 relative z-10 flex justify-between items-center">
              <div>
                <p className="text-rose-100 font-medium mb-1 text-sm">Umumiy Qarz</p>
                <p className="text-2xl font-bold truncate max-w-[140px]" title={stats?.total_debt}>
                  {Number(stats?.total_debt || 0).toLocaleString()} <span className="text-xs font-normal">so'm</span>
                </p>
              </div>
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Queue display */}
        <div className="lg:col-span-1 space-y-6">
          {["ADMIN", "RECEPTIONIST"].includes(role) && <ExpiryAlertWidget />}

          <Card className="shadow-lg border-muted/20 overflow-hidden">
            <CardHeader className="bg-muted/30 pb-4">
              <CardTitle className="flex items-center gap-2">
                <Mic2 className="w-5 h-5 text-primary" />
                Jonli Navbat
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <QueueDisplay />
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="lg:col-span-2">
          {["ADMIN", "DOCTOR"].includes(role) && (
            <Card className="shadow-lg border-muted/20 h-full">
              <CardHeader>
                <CardTitle>Haftalik Faoliyat</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <ResponsiveContainer width="100%" height={350}>
                  <ComposedChart data={charts?.revenue || []} margin={{ top: 20 }}>
                    <defs>
                      <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                      {showRevenue && (
                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      )}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={formatXAxis}
                      axisLine={false}
                      tickLine={false}
                      dy={10}
                      tick={{ fill: '#666', fontSize: 12 }}
                    />
                    <YAxis
                      yAxisId="left"
                      orientation="left"
                      stroke="#8b5cf6"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#8b5cf6', fontSize: 12 }}
                    />
                    {showRevenue && (
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="#10b981"
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                        tick={{ fill: '#10b981', fontSize: 12 }}
                      />
                    )}
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="visit_count"
                      name="Bemorlar Soni"
                      fill="url(#colorCount)"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                    />
                    {showRevenue && (
                      <Bar
                        yAxisId="right"
                        dataKey="amount"
                        name="Tushum (UZS)"
                        fill="url(#colorAmount)"
                        radius={[8, 8, 0, 0]}
                        barSize={32}
                      />
                    )}
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <CustomerDialog
        open={isCustomerDialogOpen}
        onOpenChange={setIsCustomerDialogOpen}
        onSuccess={fetchStats}
      />
    </div>
  )
}
