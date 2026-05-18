"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Eye, Filter, MapPin, MessageCircle, Download, ShoppingCart, Bot, Monitor, RefreshCw, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ShopAPI } from "@/services/api"
import { format } from "date-fns"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

export function ShopOrdersManagementView({ onNavigate }: { onNavigate?: (tab: string) => void }) {
    const [orders, setOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [sourceFilter, setSourceFilter] = useState("all") // all, POS, TELEGRAM_BOT

    useEffect(() => {
        fetchOrders()
    }, [])

    const fetchOrders = async () => {
        setLoading(true)
        try {
            const res = await ShopAPI.getOrders()
            // Sort by ID descending (newest first)
            const data = Array.isArray(res.data) ? res.data : []
            setOrders(data.sort((a: any, b: any) => b.id - a.id))
        } catch (e) {
            console.error(e)
            toast.error("Buyurtmalarni yuklashda xatolik!")
        } finally {
            setLoading(false)
        }
    }

    const handleNotifyAdmin = async (id: number) => {
        try {
            toast.promise(ShopAPI.notifyAdmin(id), {
                loading: 'Yuborilmoqda...',
                success: 'Xabarnoma adminga yuborildi!',
                error: 'Xatolik yuz berdi'
            })
        } catch (e) {
            console.error(e)
        }
    }

    const handleDownloadReceipt = async (id: any) => {
        try {
            const res = await ShopAPI.downloadReceipt(id)
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `order_${id}_receipt.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (e) {
            console.error(e)
            toast.error("Chekni yuklab olishda xatolik")
        }
    }

    const filteredOrders = orders.filter((order: any) => {
        const matchesSearch =
            order.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.id.toString().includes(searchTerm)

        const matchesSource = sourceFilter === "all" || order.source === sourceFilter

        return matchesSearch && matchesSource
    })

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'NEW': return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200">Yangi</Badge>
            case 'PREPARING': return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200">Tayyorlanmoqda</Badge>
            case 'ON_WAY': return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-purple-200">Yo'lda</Badge>
            case 'DELIVERED': return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">Yetkazildi</Badge>
            case 'CANCELLED': return <Badge variant="destructive">Bekor qilindi</Badge>
            default: return <Badge variant="outline">{status}</Badge>
        }
    }

    const getSourceIcon = (source: string) => {
        if (source === 'TELEGRAM_BOT') return <span title="Telegram Bot"><Bot className="h-4 w-4 text-blue-500" /></span>
        return <span title="Do'kon (POS)"><Monitor className="h-4 w-4 text-green-500" /></span>
    }

    return (
        <div className="p-6 space-y-6 bg-gray-50/30 min-h-full">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-blue-600 flex items-center gap-2">
                        <ShoppingCart className="h-8 w-8" /> Buyurtmalar & Savdo
                    </h2>
                    <p className="text-muted-foreground italic">Do'kon va Bot orqali barcha sotuvlar nazorati</p>
                </div>
                <Button variant="outline" onClick={fetchOrders} disabled={loading}>
                    <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Yangilash
                </Button>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="relative flex-1 w-full max-w-sm">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="ID yoki Mijoz ismi..."
                        className="pl-9 bg-white shadow-sm"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Manba:</span>
                    <Select value={sourceFilter} onValueChange={setSourceFilter}>
                        <SelectTrigger className="w-[180px] bg-white shadow-sm">
                            <SelectValue placeholder="Barchasi" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Barcha manbalar</SelectItem>
                            <SelectItem value="POS">Do'kon (POS)</SelectItem>
                            <SelectItem value="TELEGRAM_BOT">Telegram Bot</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="border rounded-xl bg-white shadow-sm w-full overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-gray-50/50">
                            <TableRow>
                                <TableHead className="w-[80px]">ID</TableHead>
                                <TableHead>Mijoz</TableHead>
                                <TableHead>Manba</TableHead>
                                <TableHead>Sana</TableHead>
                                <TableHead>Holat</TableHead>
                                <TableHead>Summa</TableHead>
                                <TableHead className="text-right">Amallar</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-12">
                                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                                            <p>Yuklanmoqda...</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filteredOrders.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                                        Buyurtmalar topilmadi
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredOrders.map((order: any) => (
                                    <TableRow key={order.id} className="hover:bg-blue-50/30 transition-colors">
                                        <TableCell className="font-bold text-blue-600">#{order.id}</TableCell>
                                        <TableCell>
                                            <div className="font-medium">{order.client_name || "Mijozsiz"}</div>
                                            {order.customer_phone && <div className="text-xs text-muted-foreground">{order.customer_phone}</div>}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                {getSourceIcon(order.source)}
                                                <span className="text-xs font-medium">
                                                    {order.source === 'TELEGRAM_BOT' ? 'Bot' : 'POS'}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {format(new Date(order.created_at), "dd.MM.yyyy HH:mm")}
                                        </TableCell>
                                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                                        <TableCell className="font-bold">{Number(order.total_price).toLocaleString()} UZS</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                {order.source === 'TELEGRAM_BOT' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-blue-600"
                                                        onClick={() => handleNotifyAdmin(order.id)}
                                                        title="Adminga qayta yuborish"
                                                    >
                                                        <MessageCircle className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="max-w-2xl">
                                                        <DialogHeader>
                                                            <DialogTitle className="flex items-center gap-2">
                                                                {getSourceIcon(order.source)}
                                                                Buyurtma #{order.id} tafsilotlari
                                                            </DialogTitle>
                                                            <DialogDescription>
                                                                {order.source === 'TELEGRAM_BOT' ? "Telegram bot orqali qabul qilingan" : "Do'kon (POS) orqali kiritilgan"}
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <div className="space-y-6 py-4">
                                                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border">
                                                                <div>
                                                                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">Holat</Label>
                                                                    <div className="mt-1">{getStatusBadge(order.status)}</div>
                                                                </div>
                                                                <div className="w-48">
                                                                    <Select
                                                                        defaultValue={order.status}
                                                                        onValueChange={async (v) => {
                                                                            try {
                                                                                await ShopAPI.updateOrder(order.id, { status: v })
                                                                                toast.success("Holat yangilandi")
                                                                                fetchOrders()
                                                                            } catch (e) {
                                                                                toast.error("Xatolik yuz berdi")
                                                                            }
                                                                        }}
                                                                    >
                                                                        <SelectTrigger className="bg-white">
                                                                            <SelectValue />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            <SelectItem value="NEW">Yangi</SelectItem>
                                                                            <SelectItem value="PREPARING">Tayyorlanmoqda</SelectItem>
                                                                            <SelectItem value="ON_WAY">Yo'lda</SelectItem>
                                                                            <SelectItem value="DELIVERED">Yetkazildi</SelectItem>
                                                                            <SelectItem value="CANCELLED">Bekor qilindi</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-6">
                                                                <div className="space-y-4">
                                                                    <div>
                                                                        <Label className="text-xs text-muted-foreground uppercase tracking-wider">Mijoz</Label>
                                                                        <p className="font-bold text-lg">{order.client_name || "Mijozsiz"}</p>
                                                                        {order.customer_phone && (
                                                                            <p className="text-sm text-blue-600 font-medium">{order.customer_phone}</p>
                                                                        )}
                                                                    </div>
                                                                    <div>
                                                                        <Label className="text-xs text-muted-foreground uppercase tracking-wider">To'lov</Label>
                                                                        <div className="mt-1">
                                                                            <Badge variant="outline" className={order.payment_method === 'CARD' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-green-50 text-green-700 border-green-100'}>
                                                                                {order.payment_method === 'CARD' ? '💳 Karta' : '💵 Naqd'}
                                                                            </Badge>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="space-y-4 text-right">
                                                                    <div>
                                                                        <Label className="text-xs text-muted-foreground uppercase tracking-wider">Vaqt</Label>
                                                                        <p className="font-medium text-sm">
                                                                            {format(new Date(order.created_at), "dd MMMM yyyy, HH:mm")}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {order.source === 'TELEGRAM_BOT' && order.latitude && (
                                                                <div className="bg-blue-600 text-white p-4 rounded-xl shadow-lg flex items-center justify-between">
                                                                    <div className="flex items-center gap-3">
                                                                        <MapPin className="h-5 w-5" />
                                                                        <div>
                                                                            <p className="font-bold">Yetkazib berish manzili</p>
                                                                            <p className="text-blue-100 text-xs">Mijoz lokatsiyani yuborgan</p>
                                                                        </div>
                                                                    </div>
                                                                    <Button
                                                                        variant="secondary"
                                                                        size="sm"
                                                                        onClick={() => window.open(`https://www.google.com/maps?q=${order.latitude},${order.longitude}`, '_blank')}
                                                                    >
                                                                        Xaritada ochish ↗
                                                                    </Button>
                                                                </div>
                                                            )}

                                                            {order.payment_proof && (
                                                                <div className="space-y-2">
                                                                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">To'lov skrinshoti</Label>
                                                                    <div className="border rounded-xl p-2 bg-gray-50 flex justify-center">
                                                                        <img
                                                                            src={order.payment_proof}
                                                                            alt="Payment Proof"
                                                                            className="max-h-48 rounded shadow-sm cursor-zoom-in"
                                                                            onClick={() => window.open(order.payment_proof, '_blank')}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            )}

                                                            <div className="border rounded-xl overflow-hidden text-sm">
                                                                <div className="bg-gray-50 px-4 py-2 border-b font-bold text-xs uppercase text-muted-foreground">Mahsulotlar</div>
                                                                <div className="divide-y overflow-y-auto max-h-40">
                                                                    {order.items?.map((item: any, i: number) => (
                                                                        <div key={i} className="flex justify-between p-3">
                                                                            <div>{item.product_name} ({item.quantity} ta)</div>
                                                                            <div className="font-bold">{(item.price * item.quantity).toLocaleString()} UZS</div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                <div className="bg-blue-50 p-4 flex justify-between items-center font-bold">
                                                                    <span>Jami:</span>
                                                                    <span className="text-xl text-blue-900">{Number(order.total_price).toLocaleString()} UZS</span>
                                                                </div>
                                                            </div>

                                                            <div className="flex justify-between gap-2 pt-4 border-t">
                                                                <Button onClick={() => handleDownloadReceipt(order.id)} variant="outline" className="flex-1 gap-2">
                                                                    <Download className="h-4 w-4" /> Chek
                                                                </Button>
                                                                {order.source === 'TELEGRAM_BOT' && (
                                                                    <Button onClick={() => handleNotifyAdmin(order.id)} variant="secondary" className="flex-1 gap-2">
                                                                        <MessageCircle className="h-4 w-4" /> Adminga yuborish
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    )
}
