"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Search, Save, Info, Users, AlertTriangle } from "lucide-react"
import { GamesAPI } from "@/services/api"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

export function GameSettingsView() {
    const [settings, setSettings] = useState({
        daily_referral_limit: 5,
        fraud_threshold_ip: 3
    })
    const [referrals, setReferrals] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [search, setSearch] = useState("")

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            const [settingsRes, refRes] = await Promise.all([
                GamesAPI.getSettings(),
                GamesAPI.getReferrals()
            ])
            setSettings(settingsRes.data)
            setReferrals(refRes.data)
        } catch (e) {
            console.error(e)
            toast.error("Ma'lumotlarni yuklashda xatolik")
        } finally {
            setLoading(false)
        }
    }

    const handleSaveSettings = async () => {
        try {
            await GamesAPI.updateSettings(settings)
            toast.success("Sozlamalar saqlandi")
        } catch (e) {
            toast.error("Saqlashda xatolik")
        }
    }

    const handleSearch = async () => {
        try {
            const res = await GamesAPI.getReferrals({ search })
            setReferrals(res.data)
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <div className="space-y-6 p-6 h-[calc(100vh-2rem)] overflow-y-auto">
            <h2 className="text-3xl font-bold tracking-tight">O'yin Sozlamalari (Referal)</h2>

            {/* Global Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Save className="h-5 w-5" />
                        Global Cheklovlar
                    </CardTitle>
                    <CardDescription>
                        Referal tizimi uchun kunlik limitlar va xavfsizlik sozlamalari
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Kunlik Referal Limiti (Spin)</Label>
                            <div className="flex gap-2">
                                <Input
                                    type="number"
                                    value={settings.daily_referral_limit}
                                    onChange={e => setSettings({ ...settings, daily_referral_limit: parseInt(e.target.value) })}
                                />
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <Info className="mr-1 h-4 w-4" />
                                    Maksimal spin (1 kishi uchun)
                                </div>
                            </div>
                        </div>

                        {/* <div className="space-y-2">
                            <Label>IP Cheklovi (Fraud Threshold)</Label>
                            <div className="flex gap-2">
                                <Input 
                                    type="number" 
                                    value={settings.fraud_threshold_ip}
                                    onChange={e => setSettings({...settings, fraud_threshold_ip: parseInt(e.target.value)})}
                                />
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <AlertTriangle className="mr-1 h-4 w-4 text-yellow-500" />
                                    Shubhali IP chegarasi
                                </div>
                            </div>
                        </div> */}
                    </div>
                    <Button onClick={handleSaveSettings} disabled={loading} className="mt-2">
                        Saqlash
                    </Button>
                </CardContent>
            </Card>

            {/* Referral Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Referal Statistikasi
                        </div>
                        <div className="relative w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Qidirish (Tel/Ism)..."
                                className="pl-8"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                            />
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Foydalanuvchi</TableHead>
                                <TableHead>Telefon</TableHead>
                                <TableHead>Takliflar Soni</TableHead>
                                <TableHead>Mavjud Spinlar</TableHead>
                                <TableHead>Batafsil</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {referrals.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.name}</TableCell>
                                    <TableCell>{user.phone}</TableCell>
                                    <TableCell>
                                        <Badge variant={user.referrals_count > 0 ? "default" : "secondary"}>
                                            {user.referrals_count} ta
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{user.spins}</TableCell>
                                    <TableCell>
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" size="sm" disabled={user.referrals_count === 0}>
                                                    Ko'rish
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-md">
                                                <DialogHeader>
                                                    <DialogTitle>{user.name} taklif qilganlar</DialogTitle>
                                                </DialogHeader>
                                                <div className="max-h-[300px] overflow-y-auto space-y-2 mt-2">
                                                    {user.referrals_list && user.referrals_list.length > 0 ? (
                                                        user.referrals_list.map((ref: any, idx: number) => (
                                                            <div key={idx} className="flex justify-between items-center p-2 border rounded bg-slate-50">
                                                                <div>
                                                                    <p className="font-medium text-sm">{ref.name}</p>
                                                                    <p className="text-xs text-muted-foreground">{ref.phone}</p>
                                                                </div>
                                                                <span className="text-xs text-muted-foreground">
                                                                    {new Date(ref.created_at).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <p className="text-center text-muted-foreground">Ma'lumot yo'q</p>
                                                    )}
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {referrals.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        Ma'lumot topilmadi
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
