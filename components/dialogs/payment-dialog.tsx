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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { DollarSign, Loader2 } from "lucide-react"
import { BillingAPI } from "@/services/api"
import { toast } from "sonner"

interface PaymentDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    invoice: {
        id: string
        customer_name: string
        total_amount: number
        remaining_debt: number
        status: string
    } | null
    onSuccess: () => void
}

export function PaymentDialog({
    open,
    onOpenChange,
    invoice,
    onSuccess,
}: PaymentDialogProps) {
    const [amount, setAmount] = useState("")
    const [method, setMethod] = useState("CASH")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async () => {
        if (!invoice || !amount) {
            toast.error("Summa kiritilishi shart")
            return
        }

        const amountNum = parseFloat(amount)
        if (isNaN(amountNum) || amountNum <= 0) {
            toast.error("Noto'g'ri summa")
            return
        }

        if (amountNum > invoice.remaining_debt) {
            toast.error(`To'lov summasi qolgan qarzdan (${Number(invoice.remaining_debt).toLocaleString()} so'm) oshmasligi kerak`)
            return
        }

        setLoading(true)
        try {
            const response = await BillingAPI.addPayment(invoice.id, {
                amount: amountNum,
                method: method,
            })

            toast.success(response.data.message || "To'lov muvaffaqiyatli qabul qilindi")
            setAmount("")
            setMethod("CASH")
            onOpenChange(false)
            onSuccess()
        } catch (error: any) {
            const errorMsg = error.response?.data?.error || "Xatolik yuz berdi"
            toast.error(errorMsg)
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        setAmount("")
        setMethod("CASH")
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="w-full max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>To'lov Qo'shish</DialogTitle>
                    <DialogDescription>
                        Invoice #{invoice?.id} uchun to'lov qo'shing
                    </DialogDescription>
                </DialogHeader>

                {invoice && (
                    <div className="space-y-4 py-4">
                        {/* Invoice Info */}
                        <div className="space-y-2 p-3 bg-muted rounded-lg">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Mijoz:</span>
                                <span className="font-medium">{invoice.customer_name}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Qolgan Qarz:</span>
                                <span className="font-bold text-destructive">{Number(invoice.remaining_debt).toLocaleString()} so'm</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Jami summa:</span>
                                <span className="font-medium">{Number(invoice.total_amount).toLocaleString()} so'm</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Status:</span>
                                <span className={`font-medium ${invoice.status === 'PAID' ? 'text-green-600' :
                                    invoice.status === 'PARTIAL' ? 'text-orange-600' :
                                        'text-red-600'
                                    }`}>
                                    {invoice.status === 'PAID' ? 'To\'langan' :
                                        invoice.status === 'PARTIAL' ? 'Qisman' :
                                            'To\'lanmagan'}
                                </span>
                            </div>
                        </div>

                        {/* Amount Input */}
                        <div className="grid gap-2">
                            <Label htmlFor="amount">To'lov Summasi (so'm)</Label>
                            <Input
                                id="amount"
                                type="number"
                                placeholder="Summa kiriting..."
                                value={amount}
                                max={invoice.remaining_debt}
                                onChange={(e) => setAmount(e.target.value)}
                                disabled={loading}
                            />
                        </div>

                        {/* Payment Method */}
                        <div className="grid gap-2">
                            <Label htmlFor="method">To'lov Usuli</Label>
                            <Select value={method} onValueChange={setMethod} disabled={loading}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="CASH">💵 Naqd</SelectItem>
                                    <SelectItem value="CARD">💳 Karta</SelectItem>
                                    <SelectItem value="CLICK">📱 Click</SelectItem>
                                    <SelectItem value="PAYME">💰 Payme</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                )}

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        disabled={loading}
                    >
                        Bekor qilish
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading || !amount}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saqlanmoqda...
                            </>
                        ) : (
                            <>
                                <DollarSign className="mr-2 h-4 w-4" />
                                To'lovni Saqlash
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
