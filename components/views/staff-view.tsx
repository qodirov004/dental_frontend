"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, UserPlus, Phone, Mail, Award, TrendingUp, Star, MoreHorizontal, UserCheck, Wallet, ArrowDownCircle, History } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ClinicAPI } from "@/services/api"
import { toast } from "sonner"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { StaffDialog } from "./staff-dialog"
import { SalaryDialog } from "./salary-dialog"

export function StaffView() {
    const [staff, setStaff] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [dialogOpen, setDialogOpen] = useState(false)
    const [salaryDialogOpen, setSalaryDialogOpen] = useState(false)
    const [selectedMember, setSelectedMember] = useState<any>(null)
    const [period, setPeriod] = useState("month")

    useEffect(() => {
        fetchData()
    }, [period])

    const fetchData = async () => {
        setLoading(true)
        try {
            const statsRes = await ClinicAPI.getStaffPerformance()
            const stats = Array.isArray(statsRes.data) ? statsRes.data : []
            setStaff(stats)
        } catch (error) {
            console.error(error)
            toast.error("Ma'lumotlarni yuklashda xatolik")
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm("Haqiqatan ham ushbu xodimni o'chirmoqchimisiz?")) return
        try {
            await ClinicAPI.deleteUser(id)
            toast.success("Xodim o'chirildi")
            fetchData()
        } catch (error) {
            toast.error("Xatolik yuz berdi")
        }
    }

    const handleEdit = (member: any) => {
        setSelectedMember(member)
        setDialogOpen(true)
    }

    const handleAdd = () => {
        setSelectedMember(null)
        setDialogOpen(true)
    }

    const handlePaySalary = (member: any) => {
        setSelectedMember(member)
        setSalaryDialogOpen(true)
    }

    const filtered = staff.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="p-4 lg:p-8 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Xodimlar va Shifokorlar</h1>
                    <p className="text-muted-foreground">Klinika jamoasi boshqaruvi va samaradorlik</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2" onClick={fetchData}>
                        <History className="w-4 h-4" /> Yangilash
                    </Button>
                    <Button className="gap-2" onClick={handleAdd}>
                        <UserPlus className="w-4 h-4" />
                        Yangi xodim
                    </Button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative max-w-md flex-1">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Ism bo'yicha qidirish..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                    {[1, 2, 3].map(i => <div key={i} className="h-80 bg-muted rounded-xl" />)}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map((member) => (
                        <Card key={member.id} className="overflow-hidden hover:shadow-lg transition-shadow border-muted/50">
                            <CardHeader className="pb-4 relative bg-muted/20">
                                <div className="absolute top-4 right-4">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Amallar</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={() => handleEdit(member)}>Tahrirlash</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handlePaySalary(member)}>Maosh berish</DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(member.id)}>O'chirish</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-bold border-2 border-primary/20">
                                        {member.name?.[0]?.toUpperCase()}
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">{member.name}</CardTitle>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge variant={member.role === 'Admin' ? 'default' : 'secondary'}>
                                                {member.role}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground font-medium">{member.salary_percentage}% ulush</span>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-4">
                                {/* Key Stats Grid */}
                                <div className="grid grid-cols-2 gap-4 pb-4 border-b">
                                    <div className="space-y-1">
                                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                                            <UserCheck className="w-3 h-3" /> Qabullar
                                        </p>
                                        <p className="font-bold text-lg">{member.total_visits} ta</p>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1 justify-end">
                                            <Star className="w-3 h-3" /> Baho
                                        </p>
                                        <p className="font-bold text-lg">{member.avg_rating} / 5.0</p>
                                    </div>
                                </div>

                                {/* Financial Info */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground flex items-center gap-2">
                                            <TrendingUp className="w-4 h-4 text-green-500" /> Jami daromad
                                        </span>
                                        <span className="font-semibold text-sm">{member.total_revenue?.toLocaleString()} UZS</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground flex items-center gap-2">
                                            <Wallet className="w-4 h-4 text-blue-500" /> Hisoblangan maosh
                                        </span>
                                        <span className="font-bold text-sm text-blue-600">{member.total_earned?.toLocaleString()} UZS</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground flex items-center gap-2">
                                            <ArrowDownCircle className="w-4 h-4 text-red-500" /> Kassadan olindi
                                        </span>
                                        <span className="font-semibold text-sm text-red-500">-{member.total_withdrawn?.toLocaleString()} UZS</span>
                                    </div>
                                </div>

                                {/* Balance Card */}
                                <div className="mt-4 p-3 bg-primary/5 rounded-xl border border-primary/10 flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wider text-primary font-bold">To'lanadigan qoldiq</p>
                                        <p className="text-xl font-black text-primary">{member.balance?.toLocaleString()} UZS</p>
                                    </div>
                                    <Button size="sm" className="h-8 rounded-lg" onClick={() => handlePaySalary(member)}>
                                        To'lash
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {filtered.length === 0 && (
                        <div className="col-span-full text-center py-20 text-muted-foreground border-2 border-dashed rounded-xl bg-muted/10">
                            <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            Hech qanday xodim topilmadi
                        </div>
                    )}
                </div>
            )}

            <StaffDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                member={selectedMember}
                onSuccess={fetchData}
            />

            <SalaryDialog
                open={salaryDialogOpen}
                onOpenChange={setSalaryDialogOpen}
                member={selectedMember}
                onSuccess={fetchData}
            />
        </div>
    )
}
