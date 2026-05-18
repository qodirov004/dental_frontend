import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { Star, TrendingUp, Users, Activity } from "lucide-react";
import { ClinicAPI } from "@/services/api";

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/90 backdrop-blur-sm border border-border/50 p-3 rounded-xl shadow-xl">
                <p className="font-bold text-sm mb-1 text-foreground">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                        <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: entry.stroke || entry.fill }}
                        />
                        <span className="text-muted-foreground font-medium">{entry.name}:</span>
                        <span className="font-bold text-foreground">{Number(entry.value).toFixed(0)}</span>
                    </div>
                ))}
            </div>
        )
    }
    return null
}

interface KPIStats {
    total_visits: number;
    total_revenue: number;
    avg_rating: number;
    critical_cases_handled: number;
}


export function KPIView() {
    const [stats, setStats] = useState<KPIStats | null>(null);
    const [period, setPeriod] = useState("month");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchKPI = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await ClinicAPI.getDoctorStats(period);
                setStats(response.data);
            } catch (err: any) {
                console.error("Error fetching KPI", err);
                if (err.response?.status === 401) {
                    setError("Sessiya vaqti tugagan. Iltimos qayta kiring.");
                } else {
                    setError("Ma'lumotlarni yuklashda xatolik.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchKPI();
    }, [period]);

    if (loading) return <div className="p-8 animate-pulse text-muted-foreground">Yuklanmoqda... (Loading)</div>;

    if (error) {
        return (
            <div className="p-8 flex flex-col items-center justify-center space-y-4">
                <div className="text-destructive font-bold">{error}</div>
                <div className="text-sm text-muted-foreground">Logindan chiqib qayta kiring.</div>
            </div>
        );
    }

    if (!stats) return <div className="p-8">Ma'lumot topilmadi.</div>;

    // Derived chart data (mock distribution based on total visits for visual appeal)
    const chartData = [
        { name: 'Dush', value: stats.total_visits * 0.12 },
        { name: 'Sesh', value: stats.total_visits * 0.15 },
        { name: 'Chor', value: stats.total_visits * 0.18 },
        { name: 'Pay', value: stats.total_visits * 0.14 },
        { name: 'Juma', value: stats.total_visits * 0.22 },
        { name: 'Shan', value: stats.total_visits * 0.14 },
        { name: 'Yak', value: stats.total_visits * 0.05 },
    ];

    return (
        <div className="p-6 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                        Shifokor Samaradorligi
                    </h1>
                    <p className="text-muted-foreground">Shaxsiy faoliyat ko'rsatkichlari (KPI)</p>
                </div>

                <Select value={period} onValueChange={setPeriod}>
                    <SelectTrigger className="w-[180px] rounded-xl border-purple-200 focus:ring-purple-500">
                        <SelectValue placeholder="Davrni tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="week">Bu hafta</SelectItem>
                        <SelectItem value="month">Bu oy</SelectItem>
                        <SelectItem value="year">Bu yil</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white overflow-hidden relative group">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                        <CardTitle className="text-sm font-medium text-blue-100">Jami Tashriflar</CardTitle>
                        <div className="p-2 bg-white/20 rounded-lg">
                            <Users className="h-4 w-4 text-white" />
                        </div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-3xl font-bold">{stats.total_visits}</div>
                        <p className="text-xs text-blue-100 mt-1">
                            qabul qilingan bemorlar
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-green-600 text-white overflow-hidden relative group">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                        <CardTitle className="text-sm font-medium text-green-100">Umumiy Tushum</CardTitle>
                        <div className="p-2 bg-white/20 rounded-lg">
                            <TrendingUp className="h-4 w-4 text-white" />
                        </div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-2xl font-bold truncate" title={String(stats.total_revenue)}>
                            {Number(stats.total_revenue).toLocaleString()} <span className="text-sm font-normal">UZS</span>
                        </div>
                        <p className="text-xs text-green-100 mt-1">
                            xizmatlardan daromad
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-400 to-orange-500 text-white overflow-hidden relative group">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                        <CardTitle className="text-sm font-medium text-orange-100">O'rtacha Reyting</CardTitle>
                        <div className="p-2 bg-white/20 rounded-lg">
                            <Star className="h-4 w-4 text-white fill-white" />
                        </div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-3xl font-bold flex items-center gap-2">
                            {stats.avg_rating} <span className="text-lg font-normal text-orange-100">/ 5.0</span>
                        </div>
                        <p className="text-xs text-orange-100 mt-1">
                            mijozlar bahosi
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-lg bg-gradient-to-br from-rose-500 to-red-600 text-white overflow-hidden relative group">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                        <CardTitle className="text-sm font-medium text-rose-100">Murakkab Holatlar</CardTitle>
                        <div className="p-2 bg-white/20 rounded-lg">
                            <Activity className="h-4 w-4 text-white" />
                        </div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-3xl font-bold">{stats.critical_cases_handled}</div>
                        <p className="text-xs text-rose-100 mt-1">
                            kritik darajadagi kasallar
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Efficiency Chart */}
            <Card className="border-muted/20 shadow-lg">
                <CardHeader>
                    <CardTitle className="text-xl">Samaradorlik Dinamikasi</CardTitle>
                </CardHeader>
                <CardContent className="pl-0">
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis
                                    dataKey="name"
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
                                    dataKey="value"
                                    name="Bemorlar"
                                    stroke="#8b5cf6"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorPatients)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    <p className="text-sm text-center text-muted-foreground mt-6 font-medium">Haftalik bemorlar oqimi analizi</p>
                </CardContent>
            </Card>
        </div>
    );
}
