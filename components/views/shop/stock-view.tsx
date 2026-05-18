"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, RefreshCw, AlertTriangle } from "lucide-react"
import { ShopAPI, api } from "@/services/api"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

export function ShopStockView() {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedProduct, setSelectedProduct] = useState<any>(null)
    const [stockAdjustment, setStockAdjustment] = useState(0)

    useEffect(() => {
        fetchProducts()
    }, [])

    const fetchProducts = async () => {
        setLoading(true)
        try {
            const res = await ShopAPI.getProducts()
            setProducts(res.data)
        } catch (e) {
            console.error(e)
            toast.error("Ma'lumotlarni yuklashda xatolik")
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateStock = async () => {
        if (!selectedProduct) return

        try {
            const newStock = selectedProduct.stock + Number(stockAdjustment)

            // Backend update (using patch)
            const formData = new FormData()
            formData.append("stock", newStock.toString())

            await api.patch(`/shop/products/${selectedProduct.id}/`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            })

            toast.success("Zaxira yangilandi")
            fetchProducts()
            setSelectedProduct(null)
            setStockAdjustment(0)
        } catch (e) {
            toast.error("Xatolik yuz berdi")
        }
    }

    const filteredProducts = products.filter((p: any) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Ombor Zaxirasi</h2>
                    <p className="text-muted-foreground">Mahsulotlar qoldig'ini boshqarish</p>
                </div>
                <Button variant="outline" onClick={fetchProducts}>
                    <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Yangilash
                </Button>
            </div>

            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Mahsulotni izlash..."
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
                            <TableHead>Mahsulot</TableHead>
                            <TableHead>Kategoriya</TableHead>
                            <TableHead>Hozirgi Qoldiq</TableHead>
                            <TableHead>Holat</TableHead>
                            <TableHead className="text-right">Boshqarish</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredProducts.map((product: any) => (
                            <TableRow key={product.id}>
                                <TableCell className="font-medium">{product.name}</TableCell>
                                <TableCell><Badge variant="outline">{product.category}</Badge></TableCell>
                                <TableCell className="text-lg font-bold">{product.stock}</TableCell>
                                <TableCell>
                                    {product.stock <= 5 ? (
                                        <Badge variant="destructive" className="flex w-fit items-center gap-1">
                                            <AlertTriangle className="h-3 w-3" /> Kam qolgan
                                        </Badge>
                                    ) : (
                                        <Badge variant="secondary" className="bg-green-100 text-green-700">Yetarli</Badge>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="sm" onClick={() => setSelectedProduct(product)}>
                                                Kirim / Chiqim
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>{product.name} - Zaxirani Tahrirlash</DialogTitle>
                                            </DialogHeader>
                                            <div className="py-4 space-y-4">
                                                <div className="flex items-center justify-between bg-gray-100 p-4 rounded-lg">
                                                    <span>Hozirgi zaxira:</span>
                                                    <span className="font-bold text-xl">{product.stock} ta</span>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Qo'shish / Ayirish (masalan: +10 yoki -5)</Label>
                                                    <Input
                                                        type="number"
                                                        placeholder="Agar 10 ta kelsa 10 deb yozing"
                                                        onChange={(e) => setStockAdjustment(Number(e.target.value))}
                                                    />
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button onClick={handleUpdateStock}>Saqlash</Button>
                                            </DialogFooter>
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
