import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DollarSign, Package, ShoppingCart, AlertTriangle, TrendingUp, Users, ArrowRight } from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

const salesData = [
    { name: "Du", total: 1500000 },
    { name: "Se", total: 2300000 },
    { name: "Ch", total: 1800000 },
    { name: "Pa", total: 3200000 },
    { name: "Ju", total: 2900000 },
    { name: "Sh", total: 4100000 },
    { name: "Ya", total: 3800000 },
]

export function ShopDashboardView({ onNavigate }: { onNavigate: (tab: string) => void }) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [stats, setStats] = useState<any>(null)

    useEffect(() => {
        import("@/services/api").then(({ api }) => {
            api.get("/shop/orders/stats/").then(res => setStats(res.data)).catch(console.error)
        })
    }, [])

    const salesData = stats?.recent_orders ? stats.recent_orders.slice(0, 7).map((o: any) => ({
        name: new Date(o.created_at).toLocaleDateString('uz-UZ', { weekday: 'short' }),
        total: parseFloat(o.total_price)
    })).reverse() : []

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Pet Shop Dashboard</h2>
                    <p className="text-muted-foreground">Do'kon faoliyati bo'yicha umumiy ma'lumot</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => onNavigate("shop-pos")}>
                        <ShoppingCart className="mr-2 h-4 w-4" /> Yangi Savdo (POS)
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Jami Savdo</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.total_sales?.toLocaleString() || 0} UZS</div>
                        <p className="text-xs text-muted-foreground flex items-center mt-1">
                            <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                            Umumiy tushum
                        </p>
                    </CardContent>
                </Card>
                <Card className="cursor-pointer hover:bg-blue-50 transition-colors" onClick={() => onNavigate("shop-orders-management")}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Jami Buyurtmalar</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.order_count || 0}</div>
                        <p className="text-xs text-muted-foreground text-green-600 font-medium">
                            Bot orqali kelgan
                        </p>
                    </CardContent>
                </Card>
                <Card className="cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => onNavigate("shop-inventory")}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Kategoriyalar</CardTitle>
                        <Package className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.total_categories || 0}</div>
                        <p className="text-xs text-muted-foreground">Mavjud bo'limlar</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Sales Chart */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Savdo Statistikasi (Oxirgi 7)</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={salesData}>
                                    <XAxis
                                        dataKey="name"
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `${value / 1000}k`}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Orders / Alerts */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>So'nggi Buyurtmalar</CardTitle>
                        <CardDescription>Bot orqali kelgan buyurtmalar</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stats?.recent_orders?.slice(0, 5).map((order: any, i: number) => (
                                <div key={i} className="flex items-center justify-between pb-4 border-b last:border-0 last:pb-0">
                                    <div className="flex items-center gap-4">
                                        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                                            {order.customer_name?.[0] || "?"}
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">{order.customer_name || "Noma'lum"}</p>
                                            <p className="text-xs text-muted-foreground">Order #{order.id}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-sm">{parseFloat(order.total_price).toLocaleString()}</div>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${order.status === "NEW" ? "bg-green-100 text-green-700" :
                                            order.status === "ON_WAY" ? "bg-blue-100 text-blue-700" :
                                                "bg-gray-100 text-gray-700"
                                            }`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {(!stats?.recent_orders || stats.recent_orders.length === 0) && (
                                <p className="text-center text-muted-foreground py-4">Hozircha buyurtmalar yo'q</p>
                            )}
                        </div>
                        <Button variant="outline" className="w-full mt-4 text-xs h-8" onClick={() => onNavigate("shop-orders-management")}>
                            Barchasini ko'rish <ArrowRight className="ml-2 w-3 h-3" />
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
