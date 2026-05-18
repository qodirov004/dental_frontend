import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Users, ExternalLink, RefreshCw, Trophy, ShoppingBag, Gift } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ClinicAPI, api } from "@/services/api"
import { toast } from "sonner"
import { format } from "date-fns"

interface BotUser {
    id: number;
    name: string;
    phone: string;
    telegram_id: string | null;
    created_at: string;
    referral_code: string;
    referred_by: number | null;
    referred_by_name: string | null;
    referral_count: number;
}

export function BotUsersView() {
    const [users, setUsers] = useState<BotUser[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [selectedUser, setSelectedUser] = useState<BotUser | null>(null)
    const [userDetails, setUserDetails] = useState<{ orders: any[], prizes: any[] } | null>(null)
    const [detailsLoading, setDetailsLoading] = useState(false)

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        setLoading(true)
        try {
            // For now we fetch all customers and filter. ideally backend has ?is_bot=true
            const res = await ClinicAPI.getCustomers()
            const allCustomers = Array.isArray(res.data) ? res.data : []
            // Filter only telegram users
            const botUsers = allCustomers.filter((c: any) => c.telegram_id)
            setUsers(botUsers)
        } catch (error) {
            console.error(error)
            toast.error("Bot foydalanuvchilarini yuklashda xatolik")
        } finally {
            setLoading(false)
        }
    }

    const fetchUserDetails = async (userId: number) => {
        setDetailsLoading(true)
        try {
            // Parallel fetch
            const [ordersRes, prizesRes] = await Promise.all([
                api.get(`/shop/orders/?customer=${userId}`),
                api.get(`/games/sessions/?customer=${userId}`)
            ])
            setUserDetails({
                orders: ordersRes.data,
                prizes: prizesRes.data
            })
        } catch (error) {
            console.error(error)
            toast.error("Batafsil ma'lumot yuklashda xatolik")
            setUserDetails(null)
        } finally {
            setDetailsLoading(false)
        }
    }

    const handleOpenDetails = (user: BotUser) => {
        setSelectedUser(user)
        fetchUserDetails(user.id)
    }

    const filtered = users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.phone.includes(search) ||
        (u.telegram_id && u.telegram_id.includes(search))
    )

    return (
        <div className="p-4 lg:p-8 space-y-6 h-full flex flex-col">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Bot Obunachilari</h1>
                    <p className="text-muted-foreground">{users.length} ta faol foydalanuvchi</p>
                </div>
                <Button variant="outline" onClick={fetchUsers}><RefreshCw className="mr-2 w-4 h-4" /> Yangilash</Button>
            </div>

            <div className="relative max-w-md">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                    placeholder="Ism, telefon yoki ID orqali qidirish..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                />
            </div>

            <div className="border rounded-xl bg-white overflow-hidden shadow-sm flex-1 flex flex-col">
                <div className="overflow-auto flex-1">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b sticky top-0 bg-gray-50 z-10">
                            <tr>
                                <th className="p-4">Foydalanuvchi</th>
                                <th className="p-4">Telegram ID</th>
                                <th className="p-4">Referal</th>
                                <th className="p-4">Qo'shilgan sana</th>
                                <th className="p-4 text-center">Amallar</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filtered.map(user => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="p-4">
                                        <div className="font-medium text-gray-900">{user.name}</div>
                                        <div className="text-gray-500 text-xs">{user.phone}</div>
                                    </td>
                                    <td className="p-4 font-mono text-xs">{user.telegram_id}</td>
                                    <td className="p-4">
                                        {user.referred_by_name ? (
                                            <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
                                                <Users className="w-3 h-3 mr-1" /> {user.referred_by_name}
                                            </Badge>
                                        ) : (
                                            <span className="text-gray-400 text-xs">-</span>
                                        )}
                                        {user.referral_count > 0 && (
                                            <div className="mt-1 text-xs text-green-600 font-medium">
                                                +{user.referral_count} ta taklif qilgan
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-4 text-gray-500">
                                        {format(new Date(user.created_at), 'dd.MM.yyyy HH:mm')}
                                    </td>
                                    <td className="p-4 text-center">
                                        <Button size="sm" variant="ghost" onClick={() => handleOpenDetails(user)}>
                                            <ExternalLink className="w-4 h-4 mr-2" /> Batafsil
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && !loading && (
                                <tr><td colSpan={5} className="p-8 text-center text-gray-500">Foydalanuvchilar topilmadi</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="text-xl flex items-center gap-2">
                            {selectedUser?.name}
                            {selectedUser?.referral_code && <Badge variant="outline" className="ml-2 font-mono">{selectedUser.referral_code}</Badge>}
                        </DialogTitle>
                        <DialogDescription>
                            Telegram ID: {selectedUser?.telegram_id} | Tel: {selectedUser?.phone}
                        </DialogDescription>
                    </DialogHeader>

                    {detailsLoading ? (
                        <div className="p-8 text-center">Yuklanmoqda...</div>
                    ) : (
                        <Tabs defaultValue="info" className="flex-1 overflow-hidden flex flex-col">
                            <TabsList className="w-full justify-start border-b rounded-none px-4 bg-transparent h-12">
                                <TabsTrigger value="info" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">Umumiy</TabsTrigger>
                                <TabsTrigger value="orders" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">Buyurtmalar ({userDetails?.orders?.length || 0})</TabsTrigger>
                                <TabsTrigger value="prizes" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">Yutuqlar ({userDetails?.prizes?.length || 0})</TabsTrigger>
                            </TabsList>

                            <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
                                <TabsContent value="info" className="mt-0 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <Card>
                                            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Kim taklif qilgan</CardTitle></CardHeader>
                                            <CardContent>
                                                {selectedUser?.referred_by_name ? (
                                                    <div className="flex items-center gap-2 font-medium text-lg">
                                                        <Users className="w-5 h-5 text-blue-500" /> {selectedUser.referred_by_name}
                                                    </div>
                                                ) : <div className="text-gray-400">Hech kim (Organik)</div>}
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">O'zi taklif qilganlar</CardTitle></CardHeader>
                                            <CardContent>
                                                <div className="flex items-center gap-2 font-medium text-lg">
                                                    <Users className="w-5 h-5 text-green-500" /> {selectedUser?.referral_count} kishi
                                                </div>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Umumiy Buyurtmalar</CardTitle></CardHeader>
                                            <CardContent>
                                                <div className="flex items-center gap-2 font-medium text-lg">
                                                    <ShoppingBag className="w-5 h-5 text-orange-500" /> {userDetails?.orders?.length || 0} ta
                                                </div>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Yutuqlar (Spin)</CardTitle></CardHeader>
                                            <CardContent>
                                                <div className="flex items-center gap-2 font-medium text-lg">
                                                    <Gift className="w-5 h-5 text-purple-500" /> {userDetails?.prizes?.length || 0} ta
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </TabsContent>

                                <TabsContent value="orders" className="mt-0 space-y-3">
                                    {userDetails?.orders?.length === 0 ? <p className="text-center text-gray-500 py-4">Buyurtmalar yo'q</p> :
                                        userDetails?.orders.map(order => (
                                            <div key={order.id} className="bg-white p-3 rounded-lg border shadow-sm flex justifying-between items-center">
                                                <div>
                                                    <div className="font-medium">Buyurtma #{order.id}</div>
                                                    <div className="text-xs text-gray-500">{format(new Date(order.created_at), "dd.MM.yyyy HH:mm")}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-bold">{Number(order.total_price).toLocaleString()} UZS</div>
                                                    <Badge variant="outline" className="text-xs">{order.status}</Badge>
                                                </div>
                                            </div>
                                        ))
                                    }
                                </TabsContent>

                                <TabsContent value="prizes" className="mt-0 space-y-3">
                                    {userDetails?.prizes?.length === 0 ? <p className="text-center text-gray-500 py-4">Yutuqlar yo'q</p> :
                                        userDetails?.prizes.map(session => (
                                            <div key={session.id} className="bg-white p-3 rounded-lg border shadow-sm flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                                                        <Trophy className="w-5 h-5 text-purple-600" />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-purple-900">{session.prize_name}</div>
                                                        <div className="text-xs text-gray-500">{format(new Date(session.played_at), "dd.MM.yyyy HH:mm")}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    }
                                </TabsContent>
                            </div>
                        </Tabs>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
