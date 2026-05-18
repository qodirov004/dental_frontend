"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash, Image as ImageIcon, Loader2 } from "lucide-react"
import { ShopAPI, api } from "@/services/api" // Assuming api instance is exported for multipart
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

export function ShopProductsView() {
    const [products, setProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [saving, setSaving] = useState(false)

    // Form State
    const [formData, setFormData] = useState({
        id: null,
        name: "",
        price: "",
        category: "FOOD",
        stock: "",
        discount_percent: "0",
        description: "",
        image: null as File | null
    })

    useEffect(() => {
        fetchProducts()
    }, [])

    const fetchProducts = async () => {
        try {
            const res = await ShopAPI.getProducts()
            setProducts(Array.isArray(res.data) ? res.data : [])
        } catch (e) {
            console.error(e)
            toast.error("Mahsulotlarni yuklashda xatolik!")
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm("Haqiqatan ham o'chirmoqchimisiz?")) return
        try {
            await shopApiDelete(id)
            toast.success("Mahsulot o'chirildi")
            fetchProducts()
        } catch (e) {
            toast.error("O'chirishda xatolik")
        }
    }

    // Helper for delete since it wasn't in main ShopAPI
    const shopApiDelete = (id: number) => api.delete(`/shop/products/${id}/`)

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        const data = new FormData()
        data.append("name", formData.name)
        data.append("price", formData.price)
        data.append("category", formData.category)
        data.append("stock", formData.stock)
        data.append("discount_percent", formData.discount_percent)
        data.append("description", formData.description)
        if (formData.image) {
            data.append("image", formData.image)
        }

        try {
            if (formData.id) {
                await api.patch(`/shop/products/${formData.id}/`, data, {
                    headers: { "Content-Type": "multipart/form-data" }
                })
                toast.success("Mahsulot yangilandi")
            } else {
                await api.post("/shop/products/", data, {
                    headers: { "Content-Type": "multipart/form-data" }
                })
                toast.success("Yangi mahsulot qo'shildi")
            }
            setIsDialogOpen(false)
            fetchProducts()
            resetForm()
        } catch (err) {
            console.error(err)
            toast.error("Saqlashda xatolik yuz berdi")
        } finally {
            setSaving(false)
        }
    }

    const resetForm = () => {
        setFormData({
            id: null,
            name: "",
            price: "",
            category: "FOOD",
            stock: "",
            discount_percent: "0",
            description: "",
            image: null
        })
    }

    const handleEdit = (product: any) => {
        setFormData({
            id: product.id,
            name: product.name,
            price: product.price,
            category: product.category,
            stock: product.stock,
            discount_percent: product.discount_percent || "0",
            description: product.description || "",
            image: null // Don't preload image file, just keep existing if not changed
        })
        setIsDialogOpen(true)
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Mahsulotlar</h2>
                    <p className="text-muted-foreground">Web App va Bot uchun mahsulotlar boshqaruvi</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                    setIsDialogOpen(open)
                    if (!open) resetForm()
                }}>
                    <DialogTrigger asChild>
                        <Button onClick={resetForm}>
                            <Plus className="mr-2 h-4 w-4" /> Yangi Mahsulot
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>{formData.id ? "Mahsulotni Tahrirlash" : "Yangi Mahsulot Qo'shish"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSave} className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nomi</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="category">Kategoriya</Label>
                                    <Select value={formData.category} onValueChange={v => setFormData({ ...formData, category: v })}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Tanlang" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="FOOD">Oziq-ovqat</SelectItem>
                                            <SelectItem value="MEDICINE">Dori vositalari</SelectItem>
                                            <SelectItem value="VITAMINS">Vitaminlar</SelectItem>
                                            <SelectItem value="ACCESSORIES">Aksessuarlar</SelectItem>
                                            <SelectItem value="CLOTHES">Kiyimlar</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="price">Narxi (UZS)</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="stock">Zaxira soni</Label>
                                    <Input
                                        id="stock"
                                        type="number"
                                        value={formData.stock}
                                        onChange={e => setFormData({ ...formData, stock: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="discount">Chegirma (%)</Label>
                                <Input
                                    id="discount"
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={formData.discount_percent}
                                    onChange={e => setFormData({ ...formData, discount_percent: e.target.value })}
                                />
                                {formData.discount_percent && Number(formData.discount_percent) > 0 && formData.price && (
                                    <p className="text-sm text-muted-foreground">
                                        Chegirmali narx: {(Number(formData.price) * (1 - Number(formData.discount_percent) / 100)).toLocaleString()} UZS
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Tavsif</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="image">Rasm Yuklash</Label>
                                <Input
                                    id="image"
                                    type="file"
                                    accept="image/*"
                                    onChange={e => setFormData({ ...formData, image: e.target.files?.[0] || null })}
                                />
                            </div>

                            <DialogFooter>
                                <Button type="submit" disabled={saving}>
                                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Saqlash
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Nomi bo'yicha izlash..." className="pl-8" />
                </div>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">Rasm</TableHead>
                            <TableHead>Nomi</TableHead>
                            <TableHead>Kategoriya</TableHead>
                            <TableHead>Narx</TableHead>
                            <TableHead>Chegirma</TableHead>
                            <TableHead>Zaxira</TableHead>
                            <TableHead className="text-right">Amallar</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.map((product: any) => (
                            <TableRow key={product.id}>
                                <TableCell>
                                    <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center overflow-hidden border">
                                        {product.image ? (
                                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <ImageIcon className="h-4 w-4 text-gray-400" />
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="font-medium">
                                    <div>{product.name}</div>
                                    <div className="text-xs text-muted-foreground truncate max-w-[150px]">{product.description}</div>
                                </TableCell>
                                <TableCell><Badge variant="outline">{product.category}</Badge></TableCell>
                                <TableCell>
                                    <div>{Number(product.price).toLocaleString()} UZS</div>
                                    {product.discount_percent > 0 && (
                                        <div className="text-xs text-green-600 font-semibold">
                                            {(Number(product.price) * (1 - product.discount_percent / 100)).toLocaleString()} UZS
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {product.discount_percent > 0 ? (
                                        <Badge variant="secondary">{product.discount_percent}%</Badge>
                                    ) : (
                                        <span className="text-muted-foreground">-</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {product.stock <= 5 ? (
                                        <span className="text-red-500 font-bold">{product.stock} (Kam)</span>
                                    ) : (
                                        product.stock
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(product)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)}>
                                            <Trash className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
