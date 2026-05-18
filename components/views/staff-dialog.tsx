"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ClinicAPI } from "@/services/api"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface StaffDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    member?: any
    onSuccess: () => void
}

export function StaffDialog({ open, onOpenChange, member, onSuccess }: StaffDialogProps) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        first_name: "",
        last_name: "",
        email: "",
        role: "DOCTOR",
        salary_percentage: "0",
        room_number: "",
        queue_prefix: ""
    })

    useEffect(() => {
        if (member) {
            setFormData({
                username: member.username || "",
                password: "", // Don't show existing password
                first_name: member.first_name || "",
                last_name: member.last_name || "",
                email: member.email || "",
                role: member.role || "DOCTOR",
                salary_percentage: member.salary_percentage?.toString() || "0",
                room_number: member.room_number || "",
                queue_prefix: member.queue_prefix || ""
            })
        } else {
            setFormData({
                username: "",
                password: "",
                first_name: "",
                last_name: "",
                email: "",
                role: "DOCTOR",
                salary_percentage: "0",
                room_number: "",
                queue_prefix: ""
            })
        }
    }, [member, open])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const data = { ...formData }
            if (member) {
                // If password is empty, don't send it to backend
                if (!data.password) delete (data as any).password
                
                // If username hasn't changed, we can keep it or let backend handle unique check
                await ClinicAPI.updateUser(member.id, data)
                toast.success("Xodim ma'lumotlari yangilandi")
            } else {
                await ClinicAPI.createUser(data)
                toast.success("Yangi xodim qo'shildi")
            }
            onSuccess()
            onOpenChange(false)
        } catch (error: any) {
            console.error(error)
            const errorMsg = error.response?.data?.username 
                ? "Ushbu login band, iltimos boshqa login tanlang." 
                : "Xatolik yuz berdi. Ma'lumotlarni tekshiring.";
            toast.error(errorMsg)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{member ? "Xodimni Tahrirlash" : "Yangi Xodim Qo'shish"}</DialogTitle>
                    <DialogDescription>
                        Xodim ma'lumotlarini kiriting va saqlash tugmasini bosing.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="first_name">Ism</Label>
                            <Input
                                id="first_name"
                                value={formData.first_name}
                                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="last_name">Familiya</Label>
                            <Input
                                id="last_name"
                                value={formData.last_name}
                                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="username">Login (Username)</Label>
                        <Input
                            id="username"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">{member ? "Yangi Parol (ixtiyoriy)" : "Parol"}</Label>
                        <Input
                            id="password"
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required={!member}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="role">Lavozimi (Rol)</Label>
                        <Select
                            value={formData.role}
                            onValueChange={(val) => setFormData({ ...formData, role: val })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Rolni tanlang" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ADMIN">Admin</SelectItem>
                                <SelectItem value="DOCTOR">Shifokor (Stomatolog)</SelectItem>
                                <SelectItem value="RECEPTIONIST">Registrator</SelectItem>
                                <SelectItem value="ASSISTANT">Yordamchi</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="room_number">Kabinet raqami</Label>
                            <Input
                                id="room_number"
                                value={formData.room_number}
                                onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                                placeholder="Masalan: 3"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="queue_prefix">Navbat harfi (Prefix)</Label>
                            <Input
                                id="queue_prefix"
                                value={formData.queue_prefix}
                                onChange={(e) => setFormData({ ...formData, queue_prefix: e.target.value.toUpperCase() })}
                                placeholder="Masalan: A"
                                maxLength={2}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={loading} className="w-full">
                            {loading ? "Saqlanmoqda..." : "Saqlash"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
