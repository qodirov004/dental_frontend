"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ClinicAPI } from "@/services/api"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie, AreaChart, Area } from 'recharts'
import { DollarSign, Users, Calendar, Activity, TrendingUp } from "lucide-react"

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

export function AnalyticsView() {
    const [summary, setSummary] = useState<any>(null)
    const [charts, setCharts] = useState<any>(null)
    const [staffStats, setStaffStats] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [summaryRes, chartsRes, staffRes] = await Promise.all([
                    ClinicAPI.getAnalyticsSummary(),
                    ClinicAPI.getAnalyticsCharts(30),
                    ClinicAPI.getStaffPerformance()
                ])
                setSummary(summaryRes.data || null)
                setCharts(chartsRes.data || null)
                setStaffStats(Array.isArray(staffRes.data) ? staffRes.data : [])
            } catch (error) {
                console.error("Error fetching analytics:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    if (loading) return <div className="p-8 text-center animate-pulse text-muted-foreground">Analitika yuklanmoqda...</div>

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

    return (
        <div className="p-6 space-y-8">
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-primary bg-clip-text text-transparent">
                Klinika Analitikasi
            </h1>

            {/* Top Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100 shadow-md hover:shadow-lg transition-all">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-blue-900">Umumiy Daromad</CardTitle>
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <DollarSign className="w-5 h-5 text-blue-700" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-700">{Number(summary?.summary?.total_revenue).toLocaleString()} UZS</div>
                        <p className="text-xs text-blue-600/80 font-medium mt-1">O'tgan 30 kunda: {Number(summary?.summary?.revenue_last_30).toLocaleString()} UZS</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-50 to-white border-green-100 shadow-md hover:shadow-lg transition-all">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-green-900">Barcha Tashriflar</CardTitle>
                        <div className="p-2 bg-green-100 rounded-lg">
                            <Calendar className="w-5 h-5 text-green-700" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-700">{summary?.summary?.total_visits || 0}</div>
                        <p className="text-xs text-green-600/80 font-medium mt-1">O'tgan 30 kunda: {summary?.summary?.visits_last_30 || 0}</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-100 shadow-md hover:shadow-lg transition-all">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-purple-900">Mijozlar Soni</CardTitle>
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Users className="w-5 h-5 text-purple-700" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-700">{summary?.summary?.total_customers || 0}</div>
                        <p className="text-xs text-purple-600/80 font-medium mt-1">{summary?.summary?.growth_percent || 0}% o'sish (oxirgi 30 kun)</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-orange-50 to-white border-orange-100 shadow-md hover:shadow-lg transition-all">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-orange-900">O'rtacha Chek</CardTitle>
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <Activity className="w-5 h-5 text-orange-700" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-700">{Number(summary?.summary?.average_bill || 0).toLocaleString()} UZS</div>
                        <p className="text-xs text-orange-600/80 font-medium mt-1">O'rtacha chek miqdori</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Revenue Trend - Area Chart */}
                <Card className="shadow-lg border-muted/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <TrendingUp className="w-5 h-5 text-blue-600" />
                            Daromad Dinamikasi (Oxirgi 30 kun)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={charts?.revenue} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(dateStr) => {
                                        const d = new Date(dateStr);
                                        return ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Juma', 'Shan'][d.getDay()];
                                    }}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6B7280', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6B7280', fontSize: 12 }}
                                    tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="amount"
                                    stroke="#2563eb"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                    name="Summa"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Visit Status Distribution */}
                <Card className="shadow-lg border-muted/20">
                    <CardHeader>
                        <CardTitle className="text-xl">Tashriflar Holati (Status)</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[350px] flex justify-center items-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={summary?.status_distribution} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="status"
                                    type="category"
                                    axisLine={false}
                                    tickLine={false}
                                    width={100}
                                    tick={{ fill: '#374151', fontWeight: 600 }}
                                />
                                <Tooltip cursor={{ fill: 'transparent' }} content={<CustomTooltip />} />
                                <Bar dataKey="count" name="Soni" radius={[0, 4, 4, 0]} barSize={32}>
                                    {(summary?.status_distribution || []).map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Staff Performance */}
            <Card className="shadow-lg border-muted/20">
                <CardHeader>
                    <CardTitle className="text-xl">Hodimlar Muvaffaqiyati (Qabullar va Daromad)</CardTitle>
                </CardHeader>
                <CardContent className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={staffStats} margin={{ top: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#374151', fontWeight: 600 }}
                                dy={10}
                            />
                            <YAxis hide />
                            <Tooltip cursor={{ fill: '#f3f4f6' }} content={<CustomTooltip />} />
                            <Bar dataKey="total_visits" fill="#8b5cf6" name="Qabullar soni" radius={[8, 8, 0, 0]} />
                            <Bar dataKey="total_revenue" fill="#10b981" name="Keltirgan daromad" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    )
}
