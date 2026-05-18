"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, Plus, X } from "lucide-react"

interface Payment {
  id: number
  amount: number
  method: string
  date: Date
  notes?: string
}

interface Service {
  id: number
  name: string
  price: number
}

interface Invoice {
  id: number
  customerName: string
  petName: string
  date: Date
  dueDate?: Date
  totalAmount: number
  status: 'paid' | 'partial' | 'unpaid'
  payments: Payment[]
  services: Service[]
}

interface InvoiceDetailProps {
  invoice: Invoice
  onPaymentAdd: () => void
  onClose: () => void
}

export function InvoiceDetail({ invoice, onPaymentAdd, onClose }: InvoiceDetailProps) {
  const remainingAmount = invoice.totalAmount - invoice.payments.reduce((sum, p) => sum + p.amount, 0)
  const paymentPercentage = (invoice.payments.reduce((sum, p) => sum + p.amount, 0) / invoice.totalAmount) * 100

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 border-green-300"
      case "partial":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "unpaid":
        return "bg-red-100 text-red-800 border-red-300"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle>Hisob #{invoice.id}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{invoice.date.toLocaleDateString("uz-UZ")}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Patient info */}
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Bemor ma'lumoti</h3>
            <p className="text-sm">{invoice.petName}</p>
            <p className="text-xs text-muted-foreground">Mijoz: {invoice.customerName}</p>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold mb-3">Xizmatlar</h3>
            <div className="space-y-2">
              {invoice.services.map((service) => (
                <div key={service.id} className="flex justify-between text-sm">
                  <span>{service.name}</span>
                  <span className="font-medium">{(service.price / 1000).toFixed(0)}K</span>
                </div>
              ))}
            </div>
            <div className="border-t mt-3 pt-3 flex justify-between font-bold">
              <span>Jami:</span>
              <span>{(invoice.totalAmount / 1000000).toFixed(1)}M</span>
            </div>
          </div>

          {/* Payment progress */}
          <div>
            <div className="flex justify-between mb-2">
              <h3 className="font-semibold">To'lov holati</h3>
              <Badge className={getStatusColor(invoice.status)}>
                {invoice.status === "paid" ? "To'landi" : invoice.status === "partial" ? "Qisman" : "To'lanmadi"}
              </Badge>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{ width: `${paymentPercentage}%` }}
              />
            </div>
            <div className="grid grid-cols-3 gap-2 mt-3 text-sm">
              <div>
                <p className="text-muted-foreground">To'landi</p>
                <p className="font-bold text-green-600">
                  {(invoice.payments.reduce((sum, p) => sum + p.amount, 0) / 1000).toFixed(0)}K
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Qolgan</p>
                <p className="font-bold text-red-600">{(remainingAmount / 1000).toFixed(0)}K</p>
              </div>
              <div>
                <p className="text-muted-foreground">Muddati</p>
                <p className="font-bold">{invoice.dueDate?.toLocaleDateString("uz-UZ") || "-"}</p>
              </div>
            </div>
          </div>

          {/* Payments history */}
          {invoice.payments.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">To'lovlar tarixi</h3>
              <div className="space-y-2">
                {invoice.payments.map((payment) => (
                  <div key={payment.id} className="flex justify-between items-start p-3 bg-muted rounded">
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {payment.method === "cash"
                          ? "Naqd"
                          : payment.method === "card"
                            ? "Karta"
                            : payment.method === "transfer"
                              ? "O'tkaza"
                              : "Boshqa"}
                      </p>
                      <p className="text-xs text-muted-foreground">{payment.date.toLocaleDateString("uz-UZ")}</p>
                      {payment.notes && <p className="text-xs mt-1">{payment.notes}</p>}
                    </div>
                    <p className="font-semibold">{(payment.amount / 1000).toFixed(0)}K</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            {invoice.status !== "paid" && (
              <Button onClick={onPaymentAdd} className="flex-1 gap-2">
                <Plus className="w-4 h-4" />
                To'lov qo'shish
              </Button>
            )}
            <Button variant="outline" className="flex-1 gap-2 bg-transparent">
              <Download className="w-4 h-4" />
              PDF
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
