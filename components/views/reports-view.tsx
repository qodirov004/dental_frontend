import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ClinicAPI } from "@/services/api"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from "recharts"

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-sm border border-border/50 p-3 rounded-xl shadow-xl">
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

export function ReportsView() {
  const [stats, setStats] = useState<any>(null)
  const [charts, setCharts] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const [resStats, resCharts] = await Promise.all([
        ClinicAPI.getStats(),
        ClinicAPI.getAnalyticsCharts(7)
      ])
      setStats(resStats.data)
      setCharts(resCharts.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  // Helper for consistent date labels (e.g., 'Dush', 'Sesh')
  const formatXAxis = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Juma', 'Shan'][d.getDay()];
  }

  if (loading) return <div className="p-8 text-center animate-pulse text-muted-foreground">Yuklanmoqda...</div>

  return (
    <div className="p-4 lg:p-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Hisobotlar
          </h1>
          <p className="text-muted-foreground">Klinika statistikasi va chuqur tahlili</p>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white overflow-hidden relative group">
          <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
          <CardContent className="pt-8 relative z-10">
            <p className="text-blue-100 font-medium mb-1">Bugungi qabullar</p>
            <p className="text-4xl font-bold">{stats?.todays_visits || 0}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white overflow-hidden relative group">
          <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
          <CardContent className="pt-8 relative z-10">
            <p className="text-green-100 font-medium mb-1">Jami Mijozlar</p>
            <p className="text-4xl font-bold">{stats?.total_customers || 0}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-400 to-red-500 text-white overflow-hidden relative group">
          <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
          <CardContent className="pt-8 relative z-10">
            <p className="text-orange-100 font-medium mb-1">Jami Bemorlar</p>
            <p className="text-4xl font-bold">{stats?.total_pets || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Card className="shadow-lg border-muted/20">
        <CardHeader>
          <CardTitle className="text-xl">Haftalik Dinamika</CardTitle>
          <CardDescription>Bemorlar oqimi va faollik darajasi</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts?.revenue || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatXAxis}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="visit_count"
                  name="Qabullar"
                  stroke="#3b82f6"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorVisits)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
