"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Plus, Minus, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import type { Product } from "@/lib/types"

export default function ShopPage() {
    const [cart, setCart] = useState<{ [key: number]: number }>({})
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchProducts()

        // Check if running in Telegram WebApp
        if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
            (window as any).Telegram.WebApp.ready();
            (window as any).Telegram.WebApp.expand();
        }
    }, [])

    const fetchProducts = async () => {
        setLoading(true)
        try {
            const { ShopAPI } = await import("@/services/api")
            const res = await ShopAPI.getProducts()
            setProducts(res.data)
        } catch (error) {
            console.error("Failed to fetch products", error)
            toast.error("Mahsulotlarni yuklashda xatolik")
        } finally {
            setLoading(false)
        }
    }

    const addToCart = (productId: number) => {
        setCart(prev => ({ ...prev, [productId]: (prev[productId] || 0) + 1 }))
    }

    const removeFromCart = (productId: number) => {
        setCart(prev => {
            const newCart = { ...prev }
            if (newCart[productId] > 1) {
                newCart[productId]--
            } else {
                delete newCart[productId]
            }
            return newCart
        })
    }

    const handleCheckout = async () => {
        try {
            const { ShopAPI } = await import("@/services/api")

            // For Web App, we might not have a customer login yet. 
            // We'll send it as an anonymous order or use Telegram User data if available.
            // For now, let's assume anonymous (backend needs to support null customer).

            const telegramUser = (window as any).Telegram?.WebApp?.initDataUnsafe?.user;

            const orderData = {
                // Pass telegram info if needed, or leave customer null for now
                telegram_user_id: telegramUser?.id,
                customer_name: telegramUser ? `${telegramUser.first_name} ${telegramUser.last_name || ''}` : "Web App User",
                items_input: Object.entries(cart).map(([id, qty]) => ({
                    product_id: Number(id),
                    quantity: qty
                }))
            }

            await ShopAPI.createOrder(orderData)
            toast.success("Buyurtma qabul qilindi!")

            // Close WebApp or Reset
            setCart({})
            if ((window as any).Telegram?.WebApp) {
                (window as any).Telegram.WebApp.close();
            }
        } catch (e) {
            console.error(e)
            toast.error("Buyurtma berishda xatolik")
        }
    }

    const totalItems = Object.values(cart).reduce((a, b) => a + b, 0)
    const totalPrice = Object.entries(cart).reduce((sum, [id, qty]) => {
        const product = products.find(p => p.id === Number(id))
        return sum + (product ? Number(product.price) * qty : 0)
    }, 0)

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                <p className="text-muted-foreground">Yuklanmoqda...</p>
            </div>
        )
    }

    if (products.length === 0 && !loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
                <p className="text-muted-foreground mb-4">Mahsulotlar topilmadi yoki yuklashda xatolik.</p>
                <Button onClick={fetchProducts} variant="outline" className="gap-2">
                    <RefreshCw className="w-4 h-4" /> Qayta yuklash
                </Button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <header className="bg-white p-4 sticky top-0 z-10 shadow-sm flex items-center justify-between">
                <h1 className="text-xl font-bold">Dental Shop</h1>
                {totalItems > 0 && (
                    <Badge className="bg-primary text-white">
                        {totalItems} dona | {totalPrice.toLocaleString()} UZS
                    </Badge>
                )}
            </header>

            <main className="p-4 grid grid-cols-2 gap-4">
                {products.map(product => (
                    <Card key={product.id} className="overflow-hidden flex flex-col">
                        <div className="aspect-square bg-white flex items-center justify-center relative">
                            {product.image ? (
                                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-gray-300 flex flex-col items-center">
                                    <span className="text-xs">No Image</span>
                                </div>
                            )}
                            {product.stock <= 0 && (
                                <div className="absolute inset-0 bg-white/80 flex items-center justify-center font-bold text-red-500 text-sm">
                                    TUGAGAN
                                </div>
                            )}
                        </div>
                        <CardHeader className="p-3 pb-0">
                            <CardTitle className="text-sm font-bold truncate leading-tight">{product.name}</CardTitle>
                            <p className="text-[10px] text-muted-foreground">{product.category}</p>
                        </CardHeader>
                        <CardContent className="p-3 mt-auto">
                            <p className="font-bold text-primary text-sm mb-3">{Number(product.price).toLocaleString()} UZS</p>

                            {/* Stock Check */}
                            {product.stock > 0 ? (
                                cart[product.id] ? (
                                    <div className="flex items-center justify-between bg-gray-100 rounded-lg p-1">
                                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => removeFromCart(product.id)}>
                                            <Minus className="h-3 w-3" />
                                        </Button>
                                        <span className="text-sm font-bold">{cart[product.id]}</span>
                                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => addToCart(product.id)} disabled={cart[product.id] >= product.stock}>
                                            <Plus className="h-3 w-3" />
                                        </Button>
                                    </div>
                                ) : (
                                    <Button size="sm" className="w-full h-8" onClick={() => addToCart(product.id)}>
                                        Savatga
                                    </Button>
                                )
                            ) : (
                                <Button size="sm" disabled className="w-full h-8 bg-gray-200 text-gray-400">
                                    Mavjud Emas
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </main>

            {totalItems > 0 && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t safe-area-bottom">
                    <Button className="w-full size-lg text-lg" onClick={handleCheckout}>
                        Buyurtma berish ({totalPrice.toLocaleString()} UZS)
                    </Button>
                </div>
            )}
        </div>
    )
}
