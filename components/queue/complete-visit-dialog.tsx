"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ClinicAPI } from "@/services/api"
import { toast } from "sonner"
import { PDFPreviewModal } from "./pdf-preview-modal"
import { playAnnouncementWithDing } from "@/lib/tts"

interface CompleteVisitDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    visitId: number
    onSuccess: () => void
}

export function CompleteVisitDialog(props: CompleteVisitDialogProps) {
    const [loading, setLoading] = useState(false)
    const [previewOpen, setPreviewOpen] = useState(false)
    const [pdfUrl, setPdfUrl] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        diagnosis: "",
        treatment_notes: "",
        additional_conditions: "",
        follow_up_date: "",
        total_amount: "",
        payment_method: "CASH"
    })

    const handleFetchReceipt = async (id: number) => {
        try {
            const res = await ClinicAPI.downloadVisitReceipt(id.toString())
            const blob = new Blob([res.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            setPdfUrl(url)
            setPreviewOpen(true)
        } catch (e) {
            console.error(e)
            toast.error("Chekni yuklashda xatolik")
        }
    }

    const { open, onOpenChange, visitId, onSuccess } = props;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const updateData = {
                status: "COMPLETED",
                diagnosis: formData.diagnosis,
                treatment_notes: formData.treatment_notes,
                additional_conditions: formData.additional_conditions,
                follow_up_date: formData.follow_up_date || null,
                total_amount: formData.total_amount,
                payment_method: formData.payment_method
            }

            // Call complete endpoint
            const completeRes = await ClinicAPI.completeVisit(visitId.toString(), updateData)

            toast.success("Qabul yakunlandi va mijozga Telegram orqali yuborildi")

            // Auto-call next patient voice announcement
            if (completeRes.data?.next_called) {
                const next = completeRes.data.next_called
                const nextDoctorName = [next.veterinarian_first_name, next.veterinarian_last_name].filter(Boolean).join(' ')
                toast.info(`Keyingi bemor chaqirildi: ${next.queue_number} - ${next.pet_name}`, {
                    duration: 6000,
                })
                // Play voice announcement for next patient
                setTimeout(() => {
                    playAnnouncementWithDing(
                        `Hurmatli bemor! Navbat raqami ${next.queue_number}. Marhamat, ${nextDoctorName ? `doktor ${nextDoctorName}` : 'shifokor'} xonasiga kiring.`
                    )
                }, 1000)
            }

            // Show preview
            await handleFetchReceipt(visitId)

            onSuccess()
            // We don't close the main dialog yet because we want to see the preview
            // Or we close main and open preview. Let's close main.
            onOpenChange(false)
        } catch (error) {
            console.error(error)
            toast.error("Xatolik yuz berdi")
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Qabulni Yakunlash</DialogTitle>
                        <DialogDescription>
                            Tashxis va davolash choralarini kiriting.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="diagnosis">Tashxis (Diagnosis)</Label>
                            <Textarea
                                id="diagnosis"
                                placeholder="Asosiy tashxisni yozing..."
                                value={formData.diagnosis}
                                onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="notes">Davolash choralari (Treatment Notes)</Label>
                            <Textarea
                                id="notes"
                                placeholder="Nimalar qilinganini yozing..."
                                value={formData.treatment_notes}
                                onChange={(e) => setFormData({ ...formData, treatment_notes: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="additional_conditions">Qo'shimcha tish kasalliklari (ixtiyoriy)</Label>
                            <Textarea
                                id="additional_conditions"
                                placeholder="Boshqa tish muammolari bo'lsa yozing... (masalan: periodontit, kariyes, bruksizm, tish go'shti yallig'lanishi)"
                                value={formData.additional_conditions}
                                onChange={(e) => setFormData({ ...formData, additional_conditions: e.target.value })}
                                className="min-h-[60px]"
                            />
                            <p className="text-[10px] text-muted-foreground italic">
                                * Ixtiyoriy — bemorning qo'shimcha tish kasalliklari yoki og'iz bo'shlig'i muammolari.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="total_amount">Xizmat Narxi (UZS)</Label>
                            <Input
                                id="total_amount"
                                type="number"
                                placeholder="0"
                                value={formData.total_amount}
                                onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="payment_method">To'lov Turi</Label>
                            <select
                                id="payment_method"
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={formData.payment_method}
                                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                            >
                                <option value="CASH">Naqd (Cash)</option>
                                <option value="CARD">Karta (Terminal)</option>
                                <option value="CLICK">Click / Payme</option>
                                <option value="DEBT">Qarz (Keyin to'lash)</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="follow_up">Keyingi kelish sanasi (Follow-up)</Label>
                            <Input
                                id="follow_up"
                                type="date"
                                value={formData.follow_up_date}
                                onChange={(e) => setFormData({ ...formData, follow_up_date: e.target.value })}
                            />
                            <p className="text-[10px] text-muted-foreground italic">
                                * Bu sanada mijozga bot orqali avtomatik eslatma boradi.
                            </p>
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700">
                                {loading ? "Saqlanmoqda..." : "Tasdiqlash va Yakunlash"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <PDFPreviewModal
                open={previewOpen}
                onOpenChange={(v) => {
                    setPreviewOpen(v)
                    if (!v && pdfUrl) {
                        window.URL.revokeObjectURL(pdfUrl)
                        setPdfUrl(null)
                    }
                }}
                pdfUrl={pdfUrl}
            />
        </>
    )
}

