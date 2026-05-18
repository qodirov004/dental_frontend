"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ClinicAPI } from "@/services/api"
import { toast } from "sonner"

export function MedicalRecordDialog({ open, onOpenChange, onSuccess, record, petId }: any) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        record_type: "DIAGNOSIS",
        description: "",
        follow_up_date: ""
    })

    useEffect(() => {
        if (record) {
            setFormData({
                record_type: record.record_type || "DIAGNOSIS",
                description: record.description || "",
                follow_up_date: record.follow_up_date ? record.follow_up_date.split('T')[0] : ""
            })
        } else {
            setFormData({
                record_type: "DIAGNOSIS",
                description: "",
                follow_up_date: ""
            })
        }
    }, [record, open])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const payload = {
                ...formData,
                pet: petId,
                follow_up_date: formData.follow_up_date || null
            }
            if (record) {
                // await ClinicAPI.updateMedicalRecord(record.id, payload)
                // Add update method if needed
            } else {
                await ClinicAPI.createMedicalRecord(payload)
                toast.success("Tibbiy yozuv saqlandi")
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
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{record ? "Yozuvni tahrirlash" : "Yangi tibbiy yozuv"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Turi</Label>
                        <Select value={formData.record_type} onValueChange={v => setFormData({ ...formData, record_type: v })}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="DIAGNOSIS">Tashxis</SelectItem>
                                <SelectItem value="TREATMENT">Dori/Muolaja</SelectItem>
                                <SelectItem value="SURGERY">Jarrohlik</SelectItem>
                                <SelectItem value="VACCINATION">Muolaja</SelectItem>
                                <SelectItem value="OTHER">Boshqa</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Tavsif</Label>
                        <Textarea
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            required
                            className="min-h-32"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Qayta kelish (ixtiyoriy)</Label>
                        <Input
                            type="date"
                            value={formData.follow_up_date}
                            onChange={e => setFormData({ ...formData, follow_up_date: e.target.value })}
                        />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            Saqlash
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
