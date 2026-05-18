"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Payment {
  id: number
  amount: number
  method: string
  date: Date
  notes?: string
}

interface Invoice {
  totalAmount: number
  payments: Payment[]
}

interface PaymentData {
  amount: number
  method: string
  notes: string
}

interface PaymentFormProps {
  invoice: Invoice
  onSave: (data: PaymentData) => void
  onCancel: () => void
}

export function PaymentForm({ invoice, onSave, onCancel }: PaymentFormProps) {
  const [amount, setAmount] = useState("")
  const [method, setMethod] = useState("cash")
  const [notes, setNotes] = useState("")
  const remainingAmount = invoice.totalAmount - invoice.payments.reduce((sum, p) => sum + p.amount, 0)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || Number.parseFloat(amount) > remainingAmount) return

    onSave({
      amount: Number.parseFloat(amount) * 1000,
      method,
      notes,
    })
    setAmount("")
    setNotes("")
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>To'lov qo'shish</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-3 bg-muted rounded">
              <p className="text-sm text-muted-foreground">Qolgan miqdor</p>
              <p className="text-2xl font-bold">{(remainingAmount / 1000).toFixed(0)}K</p>
            </div>

            <div>
              <label className="text-sm font-medium">To'lash miqdori (mingda)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                max={remainingAmount / 1000}
                className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="0"
              />
            </div>

            <div>
              <label className="text-sm font-medium">To'lov usuli</label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {[
                  { value: "cash", label: "Naqd" },
                  { value: "card", label: "Karta" },
                  { value: "transfer", label: "O'tkaza" },
                  { value: "online", label: "Onlayn" },
                ].map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setMethod(m.value)}
                    className={`p-2 rounded border text-sm transition-colors ${method === m.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:border-primary"
                      }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Izohlar</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                rows={2}
                placeholder="Izoh qo'shing..."
              />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={onCancel} className="flex-1 bg-transparent">
                Bekor
              </Button>
              <Button type="submit" className="flex-1">
                Saqlash
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
