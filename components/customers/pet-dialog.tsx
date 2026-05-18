"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ClinicAPI } from "@/services/api"
import { toast } from "sonner"

export function PetDialog({ open, onOpenChange, onSuccess, pet, customerId }: any) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        birth_date: "",
        gender: "M",
    })

    useEffect(() => {
        if (pet) {
            setFormData({
                name: pet.name,
                birth_date: pet.birth_date || "",
                gender: pet.gender || "M",
            })
        } else {
            setFormData({
                name: "",
                birth_date: "",
                gender: "M",
            })
        }
    }, [pet, open])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const payload = { ...formData, customer: customerId }
            if (pet) {
                await ClinicAPI.updatePet(pet.id, payload)
                toast.success("Bemor ma'lumotlari yangilandi")
            } else {
                await ClinicAPI.createPet(payload)
                toast.success("Yangi bemor qo'shildi")
            }
            onSuccess()
            onOpenChange(false)
        } catch (error) {
            toast.error("Xatolik yuz berdi")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{pet ? "Bemorni tahrirlash" : "Yangi bemor qo'shish"}</DialogTitle>
                    <DialogDescription>
                        {pet ? "Bemor ma'lumotlarini o'zgartiring" : "Yangi bemor ma'lumotlarini to'ldiring"}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Ismi</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="gender">Jinsi</Label>
                                <Select value={formData.gender} onValueChange={v => setFormData({ ...formData, gender: v })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Jinsi" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="M">Erkak</SelectItem>
                                        <SelectItem value="F">Ayol</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="birth_date">Tug'ilgan sanasi</Label>
                                <Input
                                    id="birth_date"
                                    type="date"
                                    value={formData.birth_date}
                                    onChange={e => setFormData({ ...formData, birth_date: e.target.value })}
                                    required
                                />
                            </div>
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
