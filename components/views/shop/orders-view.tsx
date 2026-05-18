"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Eye, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ShopAPI } from "@/services/api"
import { format } from "date-fns"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"

import { Download, Loader2 } from "lucide-react"

export function ShopOrdersView() {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        fetchOrders()
    }, [])

    const fetchOrders = async () => {
        try {
            const res = await ShopAPI.getOrders()
            // Sort by ID descending (newest first)
            setOrders(res.data.sort((a: any, b: any) => b.id - a.id))
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

    const handleDownloadReceipt = async (id: string) => {
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
            // toast.error("Chekni yuklab olishda xatolik")
        }
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Buyurtmalar</h2>
                    <p className="text-muted-foreground">Barcha sotuvlar va buyurtmalar tarixi</p>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="ID yoki Mijoz ismi bo'yicha..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button variant="outline"><Filter className="mr-2 h-4 w-4" /> Filter</Button>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Mijoz</TableHead>
                            <TableHead>Sana</TableHead>
                            <TableHead>Holat</TableHead>
                            <TableHead>Summa</TableHead>
                            <TableHead className="text-right">Ko'rish</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredOrders.map((order: any) => (
                            <TableRow key={order.id}>
                                <TableCell className="font-medium">#{order.id}</TableCell>
                                <TableCell>{order.client_name || "Mijozsiz"}</TableCell>
                                <TableCell>{format(new Date(order.created_at), "dd.MM.yyyy HH:mm")}</TableCell>
                                <TableCell>
                                    <Badge variant={
                                        order.status === 'NEW' ? 'default' :
                                            order.status === 'DELIVERED' ? 'secondary' : 'outline'
                                    }>
                                        {order.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>{Number(order.total_price).toLocaleString()} UZS</TableCell>
                                <TableCell className="text-right">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-2xl">
                                            <DialogHeader>
                                                <DialogTitle>Buyurtma #{order.id} tafsilotlari</DialogTitle>
                                            </DialogHeader>
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <span className="text-muted-foreground">Mijoz:</span>
                                                        <p className="font-bold">{order.client_name}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-muted-foreground">Sana:</span>
                                                        <p className="font-bold">{format(new Date(order.created_at), "dd MMMM yyyy, HH:mm")}</p>
                                                    </div>
                                                </div>

                                                {order.latitude && order.longitude && (
                                                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-blue-600 font-medium">📍 Yetkazib berish lokatsiyasi</span>
                                                        </div>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="bg-white hover:bg-blue-50 text-blue-600 border-blue-200"
                                                            onClick={() => window.open(`https://www.google.com/maps?q=${order.latitude},${order.longitude}`, '_blank')}
                                                        >
                                                            Xaritada ko'rish
                                                        </Button>
                                                    </div>
                                                )}

                                                <div className="border rounded-lg p-4 bg-gray-50">
                                                    <h4 className="font-bold mb-3">Mahsulotlar</h4>
                                                    <div className="space-y-2">
                                                        {order.items?.map((item: any, i: number) => (
                                                            <div key={i} className="flex justify-between items-center bg-white p-2 rounded border">
                                                                <div>
                                                                    <p className="font-medium">{item.product_name}</p>
                                                                    <p className="text-xs text-muted-foreground">{Number(item.price).toLocaleString()} UZS x {item.quantity}</p>
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

                                                <div className="flex justify-end pt-4 border-t">
                                                    <Button onClick={() => handleDownloadReceipt(order.id)} variant="outline" className="gap-2">
                                                        <Download className="h-4 w-4" />
                                                        Chekni Yuklash
                                                    </Button>
                                                </div>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
