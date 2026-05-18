"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Eye, Filter, MapPin, MessageCircle } from "lucide-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ShopAPI } from "@/services/api"
import { format } from "date-fns"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"

export function ShopBotOrdersView() {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        fetchOrders()
    }, [])

    const fetchOrders = async () => {
        try {
            // Ideally backend supports filtering, but we can filter client side for now or use ?source=TELEGRAM_BOT if supported
            const res = await ShopAPI.getOrders()
            const botOrders = res.data.filter((o: any) => o.source === 'TELEGRAM_BOT')
            setOrders(botOrders.sort((a: any, b: any) => b.id - a.id))
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const filteredOrders = orders.filter((order: any) =>
        order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toString().includes(searchTerm)
    )

    const handleNotify = async (id: number) => {
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

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-blue-600">Bot Buyurtmalari</h2>
                    <p className="text-muted-foreground">Telegram bot orqali kelgan buyurtmalar va yetkazib berish</p>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search orders..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Mijoz</TableHead>
                            <TableHead>Lokatsiya</TableHead>
                            <TableHead>Holat</TableHead>
                            <TableHead>Summa</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredOrders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    Bot orqali buyurtmalar yo'q
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredOrders.map((order: any) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium">#{order.id}</TableCell>
                                    <TableCell>{order.client_name}</TableCell>
                                    <TableCell>
                                        {order.latitude ? (
                                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                <MapPin className="h-3 w-3 mr-1" /> Bor
                                            </Badge>
                                        ) : (
                                            <span className="text-muted-foreground text-xs">Yo'q</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            order.status === 'NEW' ? 'default' :
                                                order.status === 'DELIVERED' ? 'secondary' : 'outline'
                                        }>
                                            {order.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{Number(order.total_price).toLocaleString()} UZS</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                            onClick={() => handleNotify(order.id)}
                                            title="Adminga qayta yuborish"
                                        >
                                            <MessageCircle className="h-4 w-4" />
                                        </Button>
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                                                    <Eye className="h-4 w-4 mr-2" /> Ko'rish
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-2xl">
                                                <DialogHeader>
                                                    <DialogTitle>Buyurtma #{order.id} (Telegram)</DialogTitle>
                                                    <DialogDescription>Buyurtma tafsilotlari va mahsulotlar ro'yxati</DialogDescription>
                                                </DialogHeader>
                                                <div className="space-y-4">
                                                    {/* Location Priority View */}
                                                    {order.latitude && (
                                                        <div className="bg-blue-600 text-white p-4 rounded-xl shadow-lg flex items-center justify-between">
                                                            <div>
                                                                <p className="font-bold text-lg flex items-center gap-2">
                                                                    <MapPin className="h-5 w-5" /> Yetkazib berish manzili
                                                                </p>
                                                                <p className="text-blue-100 text-sm">Mijoz lokatsiyani yuborgan</p>
                                                            </div>
                                                            <Button
                                                                variant="secondary"
                                                                onClick={() => window.open(`https://www.google.com/maps?q=${order.latitude},${order.longitude}`, '_blank')}
                                                            >
                                                                Xaritada ochish ↗
                                                            </Button>
                                                        </div>
                                                    )}

                                                    <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                                                        <div>
                                                            <span className="text-muted-foreground">Mijoz:</span>
                                                            <p className="font-bold text-lg">{order.client_name}</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-muted-foreground">Sana:</span>
                                                            <p className="font-bold">{format(new Date(order.created_at), "dd MMM HH:mm")}</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-muted-foreground">To'lov turi:</span>
                                                            <p>
                                                                <Badge variant="outline" className={order.payment_method === 'CARD' ? 'bg-purple-50 text-purple-700' : 'bg-green-50 text-green-700'}>
                                                                    {order.payment_method === 'CARD' ? '💳 Karta' : '💵 Naqd'}
                                                                </Badge>
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <span className="text-muted-foreground">Holatni o'zgartirish:</span>
                                                            <select
                                                                className="block w-full mt-1 border rounded p-1 text-sm bg-white"
                                                                value={order.status}
                                                                onChange={async (e) => {
                                                                    try {
                                                                        await ShopAPI.updateOrder(order.id, { status: e.target.value })
                                                                        toast.success("Holat yangilandi")
                                                                        fetchOrders()
                                                                    } catch (err) {
                                                                        toast.error("Xatolik yuz berdi")
                                                                    }
                                                                }}
                                                            >
                                                                <option value="NEW">Yangi</option>
                                                                <option value="PREPARING">Tayyorlanmoqda</option>
                                                                <option value="ON_WAY">Yo'lda</option>
                                                                <option value="DELIVERED">Yetkazildi</option>
                                                                <option value="CANCELLED">Bekor qilindi</option>
                                                            </select>
                                                        </div>
                                                    </div>

                                                    {order.payment_proof && (
                                                        <div className="border rounded-lg p-2 bg-gray-50 text-center">
                                                            <p className="text-xs text-muted-foreground mb-2">To'lov skrinshoti:</p>
                                                            <img
                                                                src={order.payment_proof}
                                                                alt="Payment Proof"
                                                                className="max-h-64 mx-auto rounded shadow-sm cursor-zoom-in"
                                                                onClick={() => window.open(order.payment_proof, '_blank')}
                                                            />
                                                        </div>
                                                    )}

                                                    <div className="border rounded-lg p-4 bg-gray-50">
                                                        <h4 className="font-bold mb-3 text-blue-600">Mahsulotlar</h4>
                                                        <div className="space-y-2">
                                                            {order.items?.map((item: any, i: number) => (
                                                                <div key={i} className="flex justify-between items-center bg-white p-2 rounded border">
                                                                    <div>
                                                                        <p className="font-medium">{item.product_name}</p>
                                                                        <p className="text-xs text-muted-foreground">{item.quantity} x {Number(item.price).toLocaleString()}</p>
                                                                    </div>
                                                                    <div className="font-bold">
                                                                        {(Number(item.price) * item.quantity).toLocaleString()} UZS
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="flex justify-end text-xl font-bold">
                                                        Jami: {Number(order.total_price).toLocaleString()} UZS
                                                    </div>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
