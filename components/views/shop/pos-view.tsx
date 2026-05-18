"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Search, ShoppingCart, Minus, Plus, Trash2, Image as ImageIcon, UserPlus, User, Printer } from "lucide-react"
import { ShopAPI, ClinicAPI, GamesAPI } from "@/services/api"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Ticket, CheckCircle2, ChevronsUpDown, Check, Bot, User as UserIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export function ShopPOSView() {
    const [products, setProducts] = useState<any[]>([])
    const [cart, setCart] = useState<{ product: any, quantity: number }[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [customers, setCustomers] = useState<any[]>([])
    const [customerSearch, setCustomerSearch] = useState("")
    const [selectedCustomer, setSelectedCustomer] = useState<string>("anonymous") // 'anonymous' or ID
    const [loading, setLoading] = useState(false)
    const [openCombobox, setOpenCombobox] = useState(false)

    // New Customer Form
    const [isClientOpen, setIsClientOpen] = useState(false)
    const [newClient, setNewClient] = useState({ name: "", phone: "" })

    // Coupon State
    const [couponCode, setCouponCode] = useState("")
    const [appliedCoupon, setAppliedCoupon] = useState<any>(null)
    const [validatingCoupon, setValidatingCoupon] = useState(false)
    const [lastOrderId, setLastOrderId] = useState<number | null>(null)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [prodRes, custRes] = await Promise.all([
                ShopAPI.getProducts(),
                ClinicAPI.getCustomers()
            ])
            setProducts(Array.isArray(prodRes.data) ? prodRes.data : [])
            setCustomers(Array.isArray(custRes.data) ? custRes.data : [])
        } catch (e) {
            console.error(e)
            toast.error("Ma'lumotlarni yuklashda xatolik")
        }
    }

    const handleCreateClient = async () => {
        if (!newClient.name || !newClient.phone) {
            toast.error("Ism va telefon raqam kiritilishi shart")
            return
        }
        try {
            const res = await ClinicAPI.createCustomer(newClient)
            toast.success("Mijoz yaratildi")
            setCustomers([...customers, res.data])
            setSelectedCustomer(res.data.id.toString())
            setIsClientOpen(false)
            setNewClient({ name: "", phone: "" })
        } catch (e) {
            toast.error("Mijoz yaratishda xatolik")
        }
    }

    const addToCart = (product: any) => {
        if (product.stock <= 0) {
            toast.error("Mahsulot tugagan")
            return
        }

        // Check current cart quantity vs stock
        const currentInCart = cart.find(c => c.product.id === product.id)?.quantity || 0
        if (currentInCart >= product.stock) {
            toast.error("Boshqa zaxira yo'q")
            return
        }

        setCart(prev => {
            const existing = prev.find(item => item.product.id === product.id)
            if (existing) {
                return prev.map(item =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                )
            }
            return [...prev, { product, quantity: 1 }]
        })
    }

    const updateQuantity = (productId: number, delta: number) => {
        const product = products.find(p => p.id === productId)
        if (!product) return

        setCart(prev => prev.map(item => {
            if (item.product.id === productId) {
                const newQty = item.quantity + delta
                if (newQty > product.stock) {
                    toast.error("Zaxiradan ko'p tanlab bo'lmaydi")
                    return item
                }
                return { ...item, quantity: Math.max(1, newQty) }
            }
            return item
        }))
    }

    const removeFromCart = (productId: number) => {
        setCart(prev => prev.filter(item => item.product.id !== productId))
    }

    const handleValidateCoupon = async () => {
        if (!couponCode.trim()) return

        setValidatingCoupon(true)
        try {
            const res = await GamesAPI.validateCoupon(couponCode)
            if (res.data.valid) {
                setAppliedCoupon({
                    code: couponCode,
                    ...res.data.prize
                })
                toast.success("Kupon qo'llaniladi!")
            }
        } catch (e: any) {
            // console.error(e) - suppressed to avoid confusion on 404
            let msg = "Kupon yaroqsiz"

            if (e.response?.status === 404) {
                msg = "Bunday kupon mavjud emas"
            } else if (e.response?.data?.error) {
                const err = e.response.data.error
                if (err === "Invalid coupon code") msg = "Bunday kupon mavjud emas"
                else if (err === "Coupon already used") msg = "Bu kupon allaqachon ishlatilgan"
                else msg = err
            }

            toast.error(msg)
            setAppliedCoupon(null)
        } finally {
            setValidatingCoupon(false)
        }
    }

    const handleCheckout = async () => {
        if (cart.length === 0) return

        setLoading(true)
        try {
            const isAnonymous = selectedCustomer === "anonymous"
            const orderData = {
                // If anonymous, customer is null, else customer ID
                customer: isAnonymous ? null : selectedCustomer,
                customer_name: isAnonymous ? "Do'kon Mijozi" : undefined,
                items_input: cart.map(item => ({
                    product_id: item.product.id,
                    quantity: item.quantity
                })),
                coupon_code: appliedCoupon ? appliedCoupon.code : undefined
            }

            const res = await ShopAPI.createOrder(orderData)
            toast.success("Sotuv muvaffaqiyatli amalga oshirildi!")
            setCart([])
            if (!isAnonymous) setSelectedCustomer("anonymous")
            setCouponCode("")
            setAppliedCoupon(null)
            setLastOrderId(res.data.id) // Show Receipt Modal
            fetchData() // Refresh stock
        } catch (e) {
            console.error(e)
            toast.error("Sotuvda xatolik yuz berdi")
        } finally {
            setLoading(false)
        }
    }

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const totalAmount = cart.reduce((sum, item) => sum + (Number(item.product.price) * item.quantity), 0)

    // Calculate display totals
    let discount = 0
    let finalAmount = totalAmount

    if (appliedCoupon) {
        const name = appliedCoupon.name.toLowerCase()
        if (name.includes('5%')) {
            discount = totalAmount * 0.05
            finalAmount = totalAmount - discount
        } else if (name.includes('10%')) {
            discount = totalAmount * 0.10
            finalAmount = totalAmount - discount
        }
    }

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] lg:h-[calc(100vh-2rem)] overflow-hidden">
            {/* Left: Product Grid */}
            <div className="flex-1 p-4 lg:p-6 space-y-4 lg:space-y-6 overflow-y-auto bg-gray-50/50 order-2 lg:order-1 h-full">
                <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold tracking-tight">Sotuv (Kassa)</h2>
                    <div className="relative w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Mahsulotni izlash..."
                            className="pl-8 bg-white"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-20">
                    {filteredProducts.map(p => {
                        const inCart = cart.find(c => c.product.id === p.id)?.quantity || 0
                        const remaining = p.stock - inCart

                        return (
                            <Card
                                key={p.id}
                                className={`cursor-pointer transition-all hover:border-primary group ${remaining <= 0 ? 'opacity-60 grayscale' : 'hover:shadow-md'}`}
                                onClick={() => addToCart(p)}
                            >
                                <div className="h-32 bg-white flex items-center justify-center relative overflow-hidden rounded-t-lg">
                                    {p.image ? (
                                        <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                    ) : (
                                        <ImageIcon className="h-8 w-8 text-gray-300" />
                                    )}
                                    {remaining <= 0 && (
                                        <div className="absolute inset-0 bg-white/80 flex items-center justify-center font-bold text-red-500">
                                            {p.stock <= 0 ? "TUGAGAN" : "SAVATCHADA"}
                                        </div>
                                    )}
                                </div>
                                <CardContent className="p-4">
                                    <h3 className="font-bold truncate" title={p.name}>{p.name}</h3>
                                    <div className="flex justify-between items-center mt-1">
                                        <p className="text-sm font-medium text-primary">{Number(p.price).toLocaleString()} UZS</p>
                                        <span className={`text-xs ${remaining < 5 ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
                                            {remaining} ta
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            </div>

            {/* Right: Cart */}
            <div className="w-full lg:w-96 border-b lg:border-l lg:border-b-0 bg-white flex flex-col shadow-xl z-20 order-1 lg:order-2 h-[40vh] lg:h-auto">
                <div className="p-4 border-b bg-gray-50">
                    <h3 className="font-bold text-lg mb-4">Savatcha</h3>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-medium text-muted-foreground">Mijoz</Label>
                            <Dialog open={isClientOpen} onOpenChange={setIsClientOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                                        <UserPlus className="mr-1 h-3 w-3" /> Yangi qo'shish
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Yangi Mijoz Qo'shish</DialogTitle>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid gap-2">
                                            <Label>Ism (F.I.SH)</Label>
                                            <Input value={newClient.name} onChange={e => setNewClient({ ...newClient, name: e.target.value })} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Telefon</Label>
                                            <Input value={newClient.phone} onChange={e => setNewClient({ ...newClient, phone: e.target.value })} placeholder="+998..." />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button onClick={handleCreateClient}>Saqlash</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>

                        <div className="flex flex-col gap-2">
                            <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={openCombobox}
                                        className="w-full justify-between bg-white"
                                    >
                                        {selectedCustomer === "anonymous"
                                            ? "Mijozsiz (Anonim)"
                                            : customers.find((c) => c.id.toString() === selectedCustomer)
                                                ? customers.find((c) => c.id.toString() === selectedCustomer)?.name
                                                : "Mijoz tanlang..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[350px] p-2" align="start">
                                    <div className="flex flex-col gap-2">
                                        <Input
                                            placeholder="Mijozni izlash..."
                                            value={customerSearch}
                                            onChange={(e) => setCustomerSearch(e.target.value)}
                                            className="h-9"
                                        />
                                        <div className="max-h-[300px] overflow-y-auto space-y-1">
                                            <div
                                                className={cn(
                                                    "flex items-center px-2 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground rounded-sm text-sm",
                                                    selectedCustomer === "anonymous" && "bg-accent text-accent-foreground"
                                                )}
                                                onClick={() => {
                                                    setSelectedCustomer("anonymous")
                                                    setOpenCombobox(false)
                                                }}
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4 shrink-0",
                                                        selectedCustomer === "anonymous" ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                Mijozsiz (Anonim)
                                            </div>

                                            {customers
                                                .filter(c => {
                                                    const s = customerSearch.toLowerCase()
                                                    return (
                                                        (c.name || "").toLowerCase().includes(s) ||
                                                        (c.phone || "").includes(s) ||
                                                        (c.telegram_id || "").includes(s)
                                                    )
                                                })
                                                .map(customer => {
                                                    const displayName = customer.name || "Ism ko'rsatilmagan";

                                                    return (
                                                        <div
                                                            key={customer.id}
                                                            className={cn(
                                                                "flex items-start px-2 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground rounded-sm text-sm",
                                                                selectedCustomer === String(customer.id) && "bg-accent text-accent-foreground"
                                                            )}
                                                            onClick={() => {
                                                                setSelectedCustomer(String(customer.id))
                                                                setOpenCombobox(false)
                                                            }}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4 mt-0.5 shrink-0",
                                                                    selectedCustomer === String(customer.id) ? "opacity-100" : "opacity-0"
                                                                )}
                                                            />
                                                            <div className="flex flex-col w-full overflow-hidden">
                                                                <div className="flex items-center gap-2">
                                                                    {customer.telegram_id ? (
                                                                        <Bot className="w-3 h-3 text-blue-500 shrink-0" />
                                                                    ) : (
                                                                        <UserIcon className="w-3 h-3 text-gray-500 shrink-0" />
                                                                    )}
                                                                    <span className="font-medium truncate">{displayName}</span>
                                                                </div>
                                                                <span className="text-xs text-muted-foreground ml-5 truncate">
                                                                    {customer.phone || "Tel yo'q"}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )
                                                })}

                                            {customers.length > 0 && customers.filter(c => {
                                                const s = customerSearch.toLowerCase()
                                                return (
                                                    (c.name || "").toLowerCase().includes(s) ||
                                                    (c.phone || "").includes(s) ||
                                                    (c.telegram_id || "").includes(s)
                                                )
                                            }).length === 0 && (
                                                    <div className="text-center text-sm text-muted-foreground py-6">
                                                        Mijoz topilmadi
                                                    </div>
                                                )}
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>

                            {selectedCustomer !== "anonymous" && (
                                <div className="p-2 border rounded bg-blue-50 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-blue-500" />
                                        <span className="text-sm font-medium">
                                            {customers.find(c => c.id.toString() === selectedCustomer)?.name}
                                        </span>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSelectedCustomer("anonymous")}>
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                            <ShoppingCart className="h-12 w-12 mb-2 opacity-20" />
                            <p>Savatcha bo'sh</p>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.product.id} className="flex justify-between items-center bg-gray-50 p-2 rounded-lg border">
                                <div className="flex-1 min-w-0 pr-2">
                                    <p className="font-bold text-sm truncate">{item.product.name}</p>
                                    <p className="text-xs text-muted-foreground">{Number(item.product.price).toLocaleString()} UZS</p>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => updateQuantity(item.product.id, -1)}>
                                        <Minus className="h-3 w-3" />
                                    </Button>
                                    <span className="font-bold w-6 text-center text-sm">{item.quantity}</span>
                                    <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => updateQuantity(item.product.id, 1)}>
                                        <Plus className="h-3 w-3" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-6 w-6 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => removeFromCart(item.product.id)}>
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-4 border-t bg-gray-50 space-y-4">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Jami soni:</span>
                            <span>{cart.reduce((a, b) => a + b.quantity, 0)} dona</span>
                        </div>
                        {discount > 0 && (
                            <div className="flex justify-between text-sm text-green-600 font-bold">
                                <span>Chegirma:</span>
                                <span>-{discount.toLocaleString()} UZS</span>
                            </div>
                        )}
                        <div className="flex justify-between font-bold text-xl">
                            <span>Jami summa:</span>
                            <span className="text-primary">{finalAmount.toLocaleString()} UZS</span>
                        </div>

                        {/* Coupon Input */}
                        <div className="pt-2">
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Ticket className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Kupon kodi"
                                        className="pl-8"
                                        value={couponCode}
                                        onChange={e => setCouponCode(e.target.value)}
                                        disabled={!!appliedCoupon}
                                    />
                                </div>
                                {appliedCoupon ? (
                                    <Button variant="outline" size="icon" onClick={() => { setAppliedCoupon(null); setCouponCode(""); }}>
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                ) : (
                                    <Button variant="secondary" onClick={handleValidateCoupon} disabled={validatingCoupon || !couponCode}>
                                        {validatingCoupon ? "..." : "Ok"}
                                    </Button>
                                )}
                            </div>
                            {appliedCoupon && (
                                <div className="mt-2 text-xs bg-green-50 text-green-700 p-2 rounded flex items-center gap-2">
                                    <CheckCircle2 className="h-3 w-3" />
                                    <span>{appliedCoupon.name} qo'llanilmoqda</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <Button
                    className="w-full size-lg text-lg shadow-lg shadow-primary/20"
                    disabled={cart.length === 0 || loading || (!selectedCustomer && selectedCustomer !== 'anonymous')}
                    onClick={handleCheckout}
                >
                    {loading ? "Jarayonda..." : "To'lovni Qabul Qilish"}
                </Button>
            </div>

            {/* Receipt Modal */}
            <Dialog open={!!lastOrderId} onOpenChange={(open) => !open && setLastOrderId(null)}>
                <DialogContent className="max-w-2xl h-[90vh] flex flex-col p-0 gap-0">
                    <DialogHeader className="p-4 border-b">
                        <DialogTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-6 w-6 text-green-500" />
                                <span>To'lov Muvaffaqiyatli!</span>
                            </div>
                            <span className="text-sm font-normal text-muted-foreground">Buyurtma #{lastOrderId}</span>
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex-1 bg-gray-100 p-4 overflow-hidden relative">
                        {lastOrderId && (
                            <iframe
                                id="receipt-iframe"
                                src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/shop/orders/${lastOrderId}/download_receipt/?inline=true`}
                                className="w-full h-full bg-white shadow-sm rounded-md"
                                title="Receipt Preview"
                            />
                        )}
                    </div>

                    <DialogFooter className="p-4 border-t bg-white gap-2 sm:justify-between">
                        <Button
                            variant="outline"
                            onClick={() => setLastOrderId(null)}
                        >
                            Yopish
                        </Button>
                        <Button
                            className="gap-2"
                            onClick={() => {
                                const iframe = document.getElementById('receipt-iframe') as HTMLIFrameElement
                                if (iframe && iframe.contentWindow) {
                                    iframe.contentWindow.print()
                                }
                            }}
                        >
                            <Printer className="h-4 w-4" />
                            Chop Etish
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>

    )
}
