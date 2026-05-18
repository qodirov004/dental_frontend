"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash, Image as ImageIcon, Loader2, RefreshCw, AlertTriangle, Package, Boxes } from "lucide-react"
import { ShopAPI, api } from "@/services/api"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function ShopInventoryView() {
    const [products, setProducts] = useState<any[]>([])
    const [categories, setCategories] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isProductDialogOpen, setIsProductDialogOpen] = useState(false)
    const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
    const [saving, setSaving] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")

    // New Category State
    const [newCategoryName, setNewCategoryName] = useState("")

    // Stock Adjustment State
    const [selectedProductForStock, setSelectedProductForStock] = useState<any>(null)
    const [stockAdjustment, setStockAdjustment] = useState(0)

    // Product Form State
    const [formData, setFormData] = useState({
        id: null,
        name: "",
        price: "",
        category: "",
        stock: "",
        discount_percent: "0",
        description: "",
        image: null as File | null
    })

    useEffect(() => {
        fetchProducts()
        fetchCategories()
    }, [])

    const fetchProducts = async () => {
        setLoading(true)
        try {
            const res = await ShopAPI.getProducts()
            setProducts(Array.isArray(res.data) ? res.data : [])
        } catch (e) {
            console.error(e)
            toast.error("Ma'lumotlarni yuklashda xatolik!")
        } finally {
            setLoading(false)
        }
    }

    const fetchCategories = async () => {
        try {
            const res = await ShopAPI.getCategories()
            setCategories(Array.isArray(res.data) ? res.data : [])
        } catch (e) {
            console.error(e)
            toast.error("Kategoriyalarni yuklashda xatolik!")
        }
    }

    const handleCreateCategory = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newCategoryName) return
        setSaving(true)
        try {
            await ShopAPI.createCategory({ name: newCategoryName })
            toast.success("Yangi kategoriya qo'shildi")
            setNewCategoryName("")
            setIsCategoryDialogOpen(false)
            fetchCategories()
        } catch (e) {
            toast.error("Kategoriya qo'shishda xatolik")
        } finally {
            setSaving(false)
        }
    }

    const resetForm = () => {
        setFormData({
            id: null,
            name: "",
            price: "",
            category: "",
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
            image: null
        })
        setIsProductDialogOpen(true)
    }

    const handleDelete = async (id: number) => {
        if (!confirm("Haqiqatan ham ushbu mahsulotni o'chirmoqchimisiz?")) return
        try {
            await api.delete(`/shop/products/${id}/`)
            toast.success("Mahsulot o'chirildi")
            fetchProducts()
        } catch (e) {
            toast.error("O'chirishda xatolik yuz berdi")
        }
    }

    const handleSaveProduct = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        const data = new FormData()
        data.append("name", formData.name)
        data.append("price", formData.price)
        if (formData.category) data.append("category", formData.category)
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
            setIsProductDialogOpen(false)
            fetchProducts()
            resetForm()
        } catch (err) {
            console.error(err)
            toast.error("Saqlashda xatolik yuz berdi")
        } finally {
            setSaving(false)
        }
    }

    const handleUpdateStock = async () => {
        if (!selectedProductForStock) return

        try {
            const newStock = Number(selectedProductForStock.stock) + Number(stockAdjustment)
            const formData = new FormData()
            formData.append("stock", newStock.toString())

            await api.patch(`/shop/products/${selectedProductForStock.id}/`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            })

            toast.success("Zaxira muvaffaqiyatli yangilandi")
            fetchProducts()
            setSelectedProductForStock(null)
            setStockAdjustment(0)
        } catch (e) {
            toast.error("Xatolik yuz berdi")
        }
    }

    const filteredProducts = products.filter((p: any) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="p-6 space-y-6 bg-gray-50/30 min-h-full">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-blue-600 flex items-center gap-2">
                        <Package className="h-8 w-8" /> Ombor & Mahsulotlar
                    </h2>
                    <p className="text-muted-foreground italic">Mahsulotlar katalogi va zaxira nazorati bir joyda</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={fetchProducts} disabled={loading}>
                        <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Yangilash
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="products" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-[400px] mb-4">
                    <TabsTrigger value="products">Mahsulotlar</TabsTrigger>
                    <TabsTrigger value="stock">Zaxira (Ombor)</TabsTrigger>
                </TabsList>

                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Izlash..."
                        className="pl-9 bg-white shadow-sm"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <TabsContent value="products" className="m-0 hidden md:block">
                    <Dialog open={isProductDialogOpen} onOpenChange={(open) => {
                        setIsProductDialogOpen(open)
                        if (!open) resetForm()
                    }}>
                        <DialogTrigger asChild>
                            <Button onClick={resetForm} className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200">
                                <Plus className="mr-2 h-4 w-4" /> Yangi Mahsulot
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <Plus className="h-5 w-5 text-blue-600" />
                                    {formData.id ? "Mahsulotni Tahrirlash" : "Yangi Mahsulot Qo'shish"}
                                </DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSaveProduct} className="space-y-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Nomi</Label>
                                        <Input id="name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="category">Kategoriya</Label>
                                            <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                                                <DialogTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="h-6 text-[10px] text-blue-600">
                                                        + Yangi
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="sm:max-w-[300px]">
                                                    <DialogHeader>
                                                        <DialogTitle>Yangi Kategoriya</DialogTitle>
                                                    </DialogHeader>
                                                    <form onSubmit={handleCreateCategory} className="space-y-4 pt-2">
                                                        <Input
                                                            placeholder="Nomi (masalan: O'yinchoqlar)"
                                                            value={newCategoryName}
                                                            onChange={e => setNewCategoryName(e.target.value)}
                                                            required
                                                        />
                                                        <Button type="submit" className="w-full" disabled={saving}>
                                                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Qo'shish"}
                                                        </Button>
                                                    </form>
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                        <Select value={formData.category} onValueChange={v => setFormData({ ...formData, category: v })}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Tanlang" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map((cat: any) => (
                                                    <SelectItem key={cat.id} value={cat.id.toString()}>
                                                        {cat.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="price">Narxi (UZS)</Label>
                                        <Input id="price" type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="stock">Zaxira soni</Label>
                                        <Input id="stock" type="number" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} required />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="discount">Chegirma (%)</Label>
                                    <Input id="discount" type="number" min="0" max="100" value={formData.discount_percent} onChange={e => setFormData({ ...formData, discount_percent: e.target.value })} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Tavsif</Label>
                                    <Textarea id="description" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="image">Rasm Yuklash</Label>
                                    <Input id="image" type="file" accept="image/*" onChange={e => setFormData({ ...formData, image: e.target.files?.[0] || null })} />
                                </div>

                                <DialogFooter>
                                    <Button type="submit" disabled={saving} className="w-full">
                                        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Saqlash"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </TabsContent>


                <TabsContent value="products" className="animate-in fade-in-50 duration-500">
                    <div className="border rounded-xl bg-white shadow-sm w-full overflow-hidden">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-gray-50/50">
                                    <TableRow>
                                        <TableHead className="w-[80px]">Rasm</TableHead>
                                        <TableHead>Nomi</TableHead>
                                        <TableHead>Kategoriya</TableHead>
                                        <TableHead>Narx</TableHead>
                                        <TableHead>Zaxira</TableHead>
                                        <TableHead className="text-right">Amallar</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredProducts.map((p: any) => (
                                        <TableRow key={p.id} className="hover:bg-blue-50/30 transition-colors">
                                            <TableCell>
                                                <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-100">
                                                    {p.image ? (
                                                        <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <ImageIcon className="h-5 w-5 text-gray-300" />
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-bold">{p.name}</div>
                                                <div className="text-xs text-muted-foreground truncate max-w-[200px]">{p.description}</div>
                                            </TableCell>
                                            <TableCell><Badge variant="secondary" className="bg-blue-100 text-blue-700">{p.category_name || 'Kategoriya yo\'q'}</Badge></TableCell>
                                            <TableCell>
                                                <div className="font-semibold">{Number(p.price).toLocaleString()} UZS</div>
                                                {p.discount_percent > 0 && (
                                                    <Badge className="bg-green-100 text-green-700 text-[10px] h-4">-{p.discount_percent}%</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <span className={`font-bold ${p.stock <= 5 ? 'text-red-500' : 'text-gray-700'}`}>
                                                    {p.stock} ta
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600" onClick={() => handleEdit(p)}>
                                                        <Edit className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDelete(p.id)}>
                                                        <Trash className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </TabsContent >

                <TabsContent value="stock" className="animate-in fade-in-50 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-blue-600 text-white p-4 rounded-2xl shadow-lg flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm">Jami mahsulotlar</p>
                                <p className="text-2xl font-black">{products.length} ta tur</p>
                            </div>
                            <Package className="h-8 w-8 text-blue-400 opacity-50" />
                        </div>
                        <div className="bg-orange-500 text-white p-4 rounded-2xl shadow-lg flex items-center justify-between">
                            <div>
                                <p className="text-orange-100 text-sm">Zaxira kam qolgan</p>
                                <p className="text-2xl font-black">{products.filter((p: any) => p.stock <= 5).length} ta</p>
                            </div>
                            <AlertTriangle className="h-8 w-8 text-orange-300 opacity-50" />
                        </div>
                    </div>

                    <div className="border rounded-xl bg-white shadow-sm w-full overflow-hidden">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-gray-50/50">
                                    <TableRow>
                                        <TableHead>Mahsulot Nomi</TableHead>
                                        <TableHead>Kategoriya</TableHead>
                                        <TableHead>Qoldiq</TableHead>
                                        <TableHead>Holat</TableHead>
                                        <TableHead className="text-right">Amallar</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredProducts.map((p: any) => (
                                        <TableRow key={p.id} className="hover:bg-blue-50/30 transition-colors">
                                            <TableCell className="font-bold">{p.name}</TableCell>
                                            <TableCell><Badge variant="outline">{p.category_name || 'Noma\'lum'}</Badge></TableCell>
                                            <TableCell className="text-lg font-black">{p.stock}</TableCell>
                                            <TableCell>
                                                {p.stock <= 5 ? (
                                                    <Badge variant="destructive" className="flex w-fit items-center gap-1">
                                                        <AlertTriangle className="h-3 w-3" /> Diqqat! Kam qoldi
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Optimal</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button variant="outline" size="sm" onClick={() => {
                                                            setSelectedProductForStock(p)
                                                            setStockAdjustment(0)
                                                        }} className="hover:bg-blue-600 hover:text-white transition-all">
                                                            <Boxes className="mr-2 h-4 w-4" /> Kirim / Chiqim
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle className="flex items-center gap-2">
                                                                <RefreshCw className="h-5 w-5 text-blue-600" />
                                                                Zaxirani Yangilash: {p.name}
                                                            </DialogTitle>
                                                        </DialogHeader>
                                                        <div className="py-6 space-y-6">
                                                            <div className="flex items-center justify-between bg-blue-50 p-6 rounded-2xl border border-blue-100">
                                                                <div className="text-sm font-medium text-blue-600">Hozirgi zaxira</div>
                                                                <div className="font-black text-3xl text-blue-900">{p.stock} ta</div>
                                                            </div>
                                                            <div className="space-y-3">
                                                                <Label className="text-base">Mqdorni kiriting</Label>
                                                                <Input
                                                                    type="number"
                                                                    placeholder="Masalan: +10 yoki -5"
                                                                    className="text-lg py-6"
                                                                    onChange={e => setStockAdjustment(Number(e.target.value))}
                                                                />
                                                                <p className="text-xs text-muted-foreground bg-gray-100 p-2 rounded">
                                                                    * Yangi mahsulot kelsa musbat (+), sotilsa yoki nuqsonli bo'lsa manfiy (-) son kiriting.
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <DialogFooter>
                                                            <Button onClick={handleUpdateStock} className="w-full bg-blue-600 hover:bg-blue-700 p-6 text-lg">
                                                                Tasdiqlash
                                                            </Button>
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
                </TabsContent >
            </Tabs >
        </div >
    )
}
