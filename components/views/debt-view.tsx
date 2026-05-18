import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { DollarSign, AlertTriangle, Search, Clock } from "lucide-react"
import { BillingAPI } from "@/services/api"
import { toast } from "sonner"
import { PaymentDialog } from "@/components/dialogs/payment-dialog"

export function DebtView() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await BillingAPI.getInvoices()
      // Filter out paid invoices
      const data = Array.isArray(res.data) ? res.data : []
      setInvoices(data.filter((inv: any) => inv.status !== "PAID"))
    } catch (error) {
      console.error(error)
      toast.error("Ma'lumotlarni yuklashda xatolik")
    } finally {
      setLoading(false)
    }
  }

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.pet_name?.toLowerCase().includes(searchTerm.toLowerCase())

    if (filterStatus === "all") return matchesSearch
    // if (filterStatus === "overdue") return matchesSearch && new Date(inv.due_date) < new Date()
    return matchesSearch
  })

  const totalDebt = filteredInvoices.reduce((sum, d) => sum + Number(d.total_amount), 0)

  if (loading) return <div className="p-8 text-center text-muted-foreground">Yuklanmoqda...</div>

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Qarzlar Boshqaruvi</h1>
          <p className="text-muted-foreground">Barcha qarzdorlarni va muddati o'tgan to'lovlarni nazorat qiling</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Umumiy qarz miqdori</p>
                <p className="text-2xl md:text-3xl font-bold">
                  {totalDebt.toLocaleString()} so'm
                </p>
              </div>
              <div className="bg-destructive/10 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Qarzdorlar soni</p>
                <p className="text-2xl md:text-3xl font-bold">{filteredInvoices.length} ta mijoz</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter & Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Qidirish: mijoz ismi yoki bemor ismi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Debt List */}
      <div className="space-y-3">
        {filteredInvoices.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">Qarzdorliklar mavjud emas</CardContent>
          </Card>
        ) : (
          filteredInvoices.map((inv) => {
            return (
              <Card key={inv.id} className="hover:border-primary/50 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-lg">{inv.customer_name}</h3>
                        <Badge variant={inv.status === 'PARTIAL' ? 'secondary' : 'destructive'}>
                          {inv.status === 'PARTIAL' ? 'Qisman To\'langan' : 'To\'lanmagan'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        🐾 {inv.pet_name} • {new Date(inv.created_at).toLocaleDateString("uz-UZ")}
                      </p>
                      <div className="grid grid-cols-2 gap-3 text-sm max-w-xs">
                        <div>
                          <p className="text-muted-foreground">Hujjat ID</p>
                          <p className="font-bold">#{inv.id}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Qarz Summasi</p>
                          <p className="font-bold text-destructive">{Number(inv.total_amount).toLocaleString()} so'm</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => {
                          setSelectedInvoice(inv)
                          setPaymentDialogOpen(true)
                        }}
                        className="gap-2"
                      >
                        <DollarSign className="w-4 h-4" />
                        To'lov Qo'shish
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      <PaymentDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        invoice={selectedInvoice}
        onSuccess={fetchData}
      />
    </div>
  )
}
