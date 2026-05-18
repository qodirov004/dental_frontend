import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, AreaChart, Area, CartesianGrid } from "recharts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DollarSign, ShoppingCart, Users, TrendingUp } from "lucide-react"
import { ShopAPI } from "@/services/api"
import { toast } from "sonner"

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/90 backdrop-blur-sm border border-border/50 p-3 rounded-xl shadow-xl z-50">
                <p className="font-bold text-sm mb-1 text-foreground">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                        <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: entry.color || entry.fill }}
                        />
                        <span className="text-muted-foreground font-medium">{entry.name}:</span>
                        <span className="font-bold text-foreground">{Number(entry.value).toLocaleString()} UZS</span>
                    </div>
                ))}
            </div>
        )
    }
    return null
}

export function ShopReportsView() {
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchStats()
    }, [])

    const fetchStats = async () => {
        try {
            const res = await ShopAPI.getStats()
            setStats(res.data)
        } catch (e) {
            toast.error("Hisobotlarni yuklashda xatolik")
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div className="p-6">Yuklanmoqda...</div>
    if (!stats) return <div className="p-6">Ma'lumot yo'q</div>

    const getUzbekDay = (dateStr: string) => {
        const days = ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Juma', 'Shan'];
        return days[new Date(dateStr).getDay()];
    }

    const chartData = stats.recent_orders.map((o: any) => ({
        name: getUzbekDay(o.created_at),
        total: Number(o.total_price)
    })).reverse()

    // Format category data properly
    const categoryData = stats.category_stats.map((s: any) => ({
        name: s.product__category || "Boshqa",
        value: Number(s.total_value)
    }))

    return (
        <div className="p-6 space-y-8">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                    Do'kon Hisobotlari
                </h1>
                <p className="text-muted-foreground">Do'kon faoliyatini tahlil qilish (Haqiqiy ma'lumotlar)</p>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white overflow-hidden relative group">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                        <CardTitle className="text-sm font-medium text-blue-100">Jami Savdo</CardTitle>
                        <div className="p-2 bg-white/20 rounded-lg">
                            <DollarSign className="h-4 w-4 text-white" />
                        </div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-2xl font-bold">{Number(stats.total_sales).toLocaleString()} UZS</div>
                        <p className="text-xs text-blue-100 mt-1">Jami tushum</p>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-indigo-600 text-white overflow-hidden relative group">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                        <CardTitle className="text-sm font-medium text-indigo-100">Buyurtmalar</CardTitle>
                        <div className="p-2 bg-white/20 rounded-lg">
                            <ShoppingCart className="h-4 w-4 text-white" />
                        </div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-2xl font-bold">+{stats.order_count}</div>
                        <p className="text-xs text-indigo-100 mt-1">Jami buyurtmalar soni</p>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-400 to-orange-500 text-white overflow-hidden relative group">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                        <CardTitle className="text-sm font-medium text-orange-100">Kategoriyalar</CardTitle>
                        <div className="p-2 bg-white/20 rounded-lg">
                            <TrendingUp className="h-4 w-4 text-white" />
                        </div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-2xl font-bold">{stats.total_categories || stats.category_stats.length}</div>
                        <p className="text-xs text-orange-100 mt-1">Faol kategoriyalar</p>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-green-600 text-white overflow-hidden relative group">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                        <CardTitle className="text-sm font-medium text-green-100">O'rtacha Chek</CardTitle>
                        <div className="p-2 bg-white/20 rounded-lg">
                            <TrendingUp className="h-4 w-4 text-white" />
                        </div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-2xl font-bold">
                            {stats.order_count > 0
                                ? Math.round(stats.total_sales / stats.order_count).toLocaleString()
                                : 0} UZS
                        </div>
                        <p className="text-xs text-green-100 mt-1">Har bir buyurtmaga to'g'ri keladi</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="bg-muted/20 p-1 rounded-xl">
                    <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Savdo Dinamikasi</TabsTrigger>
                    <TabsTrigger value="analytics" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Kategoriyalar</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="space-y-4">
                    <Card className="shadow-lg border-muted/20">
                        <CardHeader>
                            <CardTitle>Oxirgi 7 ta buyurtma dinamikasi</CardTitle>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <div className="h-[350px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                        <XAxis
                                            dataKey="name"
                                            stroke="#888888"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            dy={10}
                                        />
                                        <YAxis
                                            stroke="#888888"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                                        />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Area
                                            type="monotone"
                                            dataKey="total"
                                            stroke="#3b82f6"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorSales)"
                                            name="Savdo"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="analytics" className="space-y-4">
                    <Card className="shadow-lg border-muted/20">
                        <CardHeader>
                            <CardTitle>Kategoriyalar Bo'yicha Sotuv</CardTitle>
                            <CardDescription>Qaysi turdagi mahsulotlar ko'p daromad keltirmoqda</CardDescription>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <div className="h-[350px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={categoryData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={120}
                                            fill="#8884d8"
                                            dataKey="value"
                                            nameKey="name"
                                        >
                                            {categoryData.map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
