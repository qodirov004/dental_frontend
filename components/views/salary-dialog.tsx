"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ClinicAPI } from "@/services/api"
import { toast } from "sonner"

interface SalaryDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    member: any
    onSuccess: () => void
}

export function SalaryDialog({ open, onOpenChange, member, onSuccess }: SalaryDialogProps) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        amount: "",
        notes: "",
        date: new Date().toISOString().split('T')[0]
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!member) return
        
        setLoading(true)
        try {
            await ClinicAPI.createDoctorSalary({
                doctor: member.id,
                amount: formData.amount,
                notes: formData.notes,
                date: new Date(formData.date).toISOString()
            })
            toast.success("To'lov muvaffaqiyatli qayd etildi")
            onSuccess()
            onOpenChange(false)
            setFormData({ amount: "", notes: "", date: new Date().toISOString().split('T')[0] })
        } catch (error) {
            console.error(error)
            toast.error("Xatolik yuz berdi")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Kassadan pul berish: {member?.name}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="amount">Summa (UZS)</Label>
                        <Input
                            id="amount"
                            type="number"
                            placeholder="Masalan: 500000"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="date">Sana</Label>
                        <Input
                            id="date"
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Izoh (ixtiyoriy)</Label>
                        <Input
                            id="notes"
                            placeholder="Masalan: Avans"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={loading} className="w-full">
                            {loading ? "Saqlanmoqda..." : "Tasdiqlash"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
