"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-context"
import { api } from "@/services/api"
import { toast } from "sonner"
import { Stethoscope, ShoppingBag, Lock, User } from "lucide-react"

export default function LoginPage() {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const { login } = useAuth()
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await api.post("/api-token-auth/", { username, password })
            const token = res.data.token
            await login(token)
            toast.success("Muvaffaqiyatli kirdingiz!")
            router.push("/")
        } catch (err) {
            toast.error("Login yoki parol xato!")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex w-full">
            {/* Left Side - Image & Branding */}
            <div className="hidden lg:flex w-1/2 bg-slate-900 relative items-center justify-center p-12 overflow-hidden">
                {/* Background Image Overlay */}
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay"
                    style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=2668&auto=format&fit=crop")' }}
                ></div>

                {/* Content */}
                <div className="relative z-10 text-white space-y-6 max-w-lg">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                            <Stethoscope className="w-8 h-8 text-blue-400" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">Dental CRM</h1>
                    </div>

                    <h2 className="text-4xl font-extrabold leading-tight">
                        Tishlar salomatligi ishonchli qo'llarda
                    </h2>
                    <p className="text-lg text-slate-300">
                        Klinika boshqaruvi va bemorlar bilan ishlash uchun yagona professional tizim.
                    </p>

                    {/* Features List */}
                    <div className="grid grid-cols-1 gap-4 mt-8 pt-8 border-t border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-500/20 rounded-lg">
                                <Stethoscope className="w-5 h-5 text-green-400" />
                            </div>
                            <span className="font-medium text-slate-200">Stomatologiya & Bemorlar</span>
                        </div>
                    </div>
                </div>

                {/* Decorative Circles */}
                <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-blue-500 rounded-full blur-[100px] opacity-20"></div>
                <div className="absolute -top-32 -right-32 w-64 h-64 bg-green-500 rounded-full blur-[100px] opacity-20"></div>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left space-y-2">
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Tizimga kirish</h2>
                        <p className="text-slate-500">Davom etish uchun login va parolingizni kiriting.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="username" className="text-slate-700">Login ID</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                    <Input
                                        id="username"
                                        placeholder="Masalan: shop_manager"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="pl-10 h-10 bg-slate-50 border-slate-200 focus:bg-white transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-slate-700">Parol</Label>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10 h-10 bg-slate-50 border-slate-200 focus:bg-white transition-all"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <Button
                            className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all shadow-md hover:shadow-lg hover:shadow-blue-500/20"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Kirish...
                                </div>
                            ) : (
                                "Tizimga kirish"
                            )}
                        </Button>
                    </form>

                    <p className="text-center text-sm text-slate-400">
                        &copy; {new Date().getFullYear()} Dental Clinic. Barcha huquqlar himoyalangan.
                    </p>
                </div>
            </div>
        </div>
    )
}
