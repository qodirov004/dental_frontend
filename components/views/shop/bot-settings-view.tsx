"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { api } from "@/services/api"
import { toast } from "sonner" // Assuming installed, or use alert for now


export function BotSettingsView() {
    const [token, setToken] = useState("")
    const [adminId, setAdminId] = useState("")
    const [address, setAddress] = useState("")
    const [phone, setPhone] = useState("")
    const [contactMsg, setContactMsg] = useState("")
    const [webappUrl, setWebappUrl] = useState("")
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        const keys = [
            { key: "bot_token", setter: setToken },
            { key: "admin_telegram_id", setter: setAdminId },
            { key: "contact_address", setter: setAddress },
            { key: "contact_phone", setter: setPhone },
            { key: "contact_message", setter: setContactMsg },
            { key: "webapp_url", setter: setWebappUrl },
        ]

        keys.forEach(async (item) => {
            try {
                const res = await api.get(`/users/settings/${item.key}/`)
                item.setter(res.data.value)
            } catch (e) { }
        })
    }

    const saveSetting = async (key: string, value: string) => {
        try {
            await api.put(`/users/settings/${key}/`, { key, value })
        } catch {
            await api.post("/users/settings/", { key, value })
        }
    }

    const handleSaveAll = async () => {
        setLoading(true)
        try {
            await Promise.all([
                saveSetting("bot_token", token),
                saveSetting("admin_telegram_id", adminId),
                saveSetting("contact_address", address),
                saveSetting("contact_phone", phone),
                saveSetting("contact_message", contactMsg),
                saveSetting("webapp_url", webappUrl),
            ])
            toast.success("Barcha sozlamalar saqlandi!")
        } catch (e) {
            toast.error("Saqlashda xatolik yuz berdi")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6 pb-20">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">Bot Sozlamalari</h2>
                <Button onClick={handleSaveAll} disabled={loading} size="lg">
                    {loading ? "Saqlanmoqda..." : "Barchasini Saqlash"}
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Asosiy Sozlamalar</CardTitle>
                        <CardDescription>Bot va Admin bog'lanishi</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Bot Token</Label>
                            <Input type="password" value={token} onChange={(e) => setToken(e.target.value)} placeholder="BotFather token..." />
                        </div>
                        <div className="space-y-2">
                            <Label>Admin Telegram ID</Label>
                            <Input value={adminId} onChange={(e) => setAdminId(e.target.value)} placeholder="Masalan: 99890123" />
                        </div>
                        <div className="space-y-2">
                            <Label>Web App URL</Label>
                            <Input value={webappUrl} onChange={(e) => setWebappUrl(e.target.value)} placeholder="https://..." />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Kontakt Ma'lumotlari</CardTitle>
                        <CardDescription>Botdagi "Bog'lanish" tugmasi uchun</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Manzil</Label>
                            <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Klinika manzili..." />
                        </div>
                        <div className="space-y-2">
                            <Label>Telefon Raqam</Label>
                            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+998 90 ..." />
                        </div>
                        <div className="space-y-2">
                            <Label>Qo'shimcha Xabar (Ijtimoiy tarmoqlar)</Label>
                            <textarea
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={contactMsg}
                                onChange={(e) => setContactMsg(e.target.value)}
                                placeholder="Instagram: @..., Telegram: @..."
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Xabarnomalar</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">Eslatmalar avtomatik ravishda har kuni 09:00 da yuboriladi.</p>
                </CardContent>
            </Card>
        </div>
    )
}
