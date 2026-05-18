"use client"

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Send, Loader2 } from "lucide-react"
import { ClinicAPI } from "@/services/api"
import { toast } from "sonner"

interface SendTelegramDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    customer: {
        id: string
        name: string
        phone?: string
        has_telegram?: boolean
    } | null
}

export function SendTelegramDialog({
    open,
    onOpenChange,
    customer,
}: SendTelegramDialogProps) {
    const [message, setMessage] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSend = async () => {
        if (!customer || !message.trim()) {
            toast.error("Xabar matni kiritilishi shart")
            return
        }

        setLoading(true)
        try {
            const response = await ClinicAPI.sendTelegramMessage(customer.id, message.trim())
            toast.success(response.data.message || "Xabar muvaffaqiyatli yuborildi")
            setMessage("")
            onOpenChange(false)
        } catch (error: any) {
            const errorMsg = error.response?.data?.error || "Xatolik yuz berdi"
            toast.error(errorMsg)
        } finally {
            setLoading(false)
        }
    }

    const templates = [
        {
            label: "Ko'rikdan o'tish eslatmasi",
            text: "🏥 Hurmatli mijoz, ko'rikdan o'tish vaqtingiz yaqinlashdi. Iltimos, klinikamizga tashrif buyuring."
        },
        {
            label: "Qarz haqida ogohlantirish",
            text: "💰 Hurmatli mijoz, sizda klinikamizga qarzdorligingiz mavjud. Iltimos, qarzni to'lashni so'raymiz. Rahmat!"
        },
        {
            label: "Vaksina eslatmasi",
            text: "💉 Hurmatli mijoz, muolaja qilish muddati yaqinlashdi. Iltimos, klinikaga tashrif buyuring."
        }
    ]

    const handleTemplateSelect = (templateText: string) => {
        setMessage(templateText)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                    <DialogTitle>Telegram Xabar Yuborish</DialogTitle>
                    <DialogDescription>
                        Mijozga Telegram orqali xabar yuborish
                    </DialogDescription>
                </DialogHeader>

                {/* Customer Info - moved outside DialogDescription */}
                {customer && (
                    <div className="space-y-2 text-sm border-b pb-4">
                        <div>
                            <span className="font-medium">Mijoz:</span> {customer.name}
                        </div>
                        {customer.phone && (
                            <div>
                                <span className="font-medium">Telefon:</span> {customer.phone}
                            </div>
                        )}
                        {!customer.has_telegram && (
                            <div className="text-red-500 font-medium">
                                ⚠️ Bu mijozning Telegram hisobi bog'lanmagan
                            </div>
                        )}
                    </div>
                )}

                <div className="grid gap-4 py-4">
                    {/* Templates */}
                    <div className="grid gap-2">
                        <Label>Shablonlar</Label>
                        <div className="grid grid-cols-1 gap-2">
                            {templates.map((template, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => handleTemplateSelect(template.text)}
                                    disabled={loading || !customer?.has_telegram}
                                    className="text-left p-2 text-sm border rounded-md hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {template.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="message">Xabar</Label>
                        <Textarea
                            id="message"
                            placeholder="Xabar matnini kiriting yoki yuqoridan shablon tanlang..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={6}
                            className="resize-none"
                            disabled={loading || !customer?.has_telegram}
                        />
                        <p className="text-xs text-muted-foreground">
                            {message.length} / 1000 belgi
                        </p>
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                    >
                        Bekor qilish
                    </Button>
                    <Button
                        onClick={handleSend}
                        disabled={loading || !message.trim() || !customer?.has_telegram}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Yuborilmoqda...
                            </>
                        ) : (
                            <>
                                <Send className="mr-2 h-4 w-4" />
                                Yuborish
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
