"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, Users, AlertCircle, Send } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { CustomerDetail } from "@/components/customers/customer-detail"
import { CustomerDialog } from "@/components/customers/customer-dialog"
import { SendTelegramDialog } from "@/components/dialogs/send-telegram-dialog"
import type { Customer } from "@/lib/types"
import { ClinicAPI, BillingAPI } from "@/services/api"
import { toast } from "sonner"

export function CustomersView() {
  const [search, setSearch] = useState("")
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [telegramDialogOpen, setTelegramDialogOpen] = useState(false)
  const [telegramCustomer, setTelegramCustomer] = useState<Customer | null>(null)
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalPets: 0,
    totalDebt: 0
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const customerRes = await ClinicAPI.getCustomers()
      const data = Array.isArray(customerRes.data) ? customerRes.data : []
      setCustomers(data)

      // Calculate Stats
      const totalPets = data.reduce((sum: number, c: any) => sum + (c.pets?.length || 0), 0)

      // Fetch debt (using mock calculation logic for now as API might need explicit endpoint)
      try {
        const invoicesRes = await BillingAPI.getInvoices()
        const invoiceData = Array.isArray(invoicesRes.data) ? invoicesRes.data : []
        const totalDebt = invoiceData
          .filter((inv: any) => inv.status !== 'PAID')
          .reduce((sum: number, inv: any) => sum + (Number(inv.total_amount) - 0), 0)
        setStats({
          totalCustomers: data.length,
          totalPets,
          totalDebt
        })
      } catch (err) {
        setStats({
          totalCustomers: data.length,
          totalPets,
          totalDebt: 0
        })
      }

    } catch (error: any) {
      console.error("Failed to fetch customers", error)
      if (error?.response?.status === 401) {
        toast.error("Siz tizimga kirmagansiz yoki sessiya muddati tugagan. Iltimos, qayta kiring.")
      } else {
        toast.error("Ma'lumotlarni yuklashda xatolik yuz berdi")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    const message = "Haqiqatan ham ushbu mijozni o'chirib tashlamoqchimisiz?";

    const proceed = async () => {
      try {
        await ClinicAPI.deleteCustomer(id)
        toast.success("Mijoz o'chirildi")
        fetchData()
      } catch (e) {
        toast.error("O'chirishda xatolik")
      }
    };

    if (window.Telegram?.WebApp?.showConfirm) {
      window.Telegram.WebApp.showConfirm(message, (confirmed) => {
        if (confirmed) proceed();
      });
    } else if (confirm(message)) {
      proceed();
    }
  }

  const filtered = customers.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search),
  )

  if (selectedCustomer) {
    return <CustomerDetail customer={selectedCustomer} onBack={() => setSelectedCustomer(null)} />
  }

  if (loading) return <div className="p-8">Yuklanmoqda...</div>

  return (
    <div className="p-4 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Mijozlar va Bemorlar</h1>
          <p className="text-muted-foreground">
            Umumiy {stats.totalCustomers} mijoz, {stats.totalPets} bemor
          </p>
        </div>
        <Button onClick={() => { setEditCustomer(null); setIsDialogOpen(true); }} className="bg-primary hover:bg-primary/90 gap-2">
          <Plus className="w-4 h-4" />
          Yangi Mijoz
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Faol Mijozlar</p>
                <p className="text-2xl font-bold mt-1">{stats.totalCustomers}</p>
              </div>
              <Users className="w-5 h-5 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Jami Bemorlar</p>
                <p className="text-2xl font-bold mt-1">{stats.totalPets}</p>
              </div>
              <Users className="w-5 h-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Umumiy Qarz</p>
                <p className="text-2xl font-bold text-destructive mt-1">
                  {(stats.totalDebt / 1000000).toFixed(1)} M
                </p>
              </div>
              <AlertCircle className="w-5 h-5 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Mijoz ismi yoki telefon orqali qidirish..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((customer) => {
          return (
            <Card key={customer.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3 border-b">
                <div className="flex items-start justify-between">
                  <div className="flex-1 cursor-pointer" onClick={(e) => { e.stopPropagation(); setSelectedCustomer(customer); }}>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{customer.name}</CardTitle>
                      {customer.has_telegram && (
                        <Badge variant="secondary" className="text-xs">
                          📱 Telegram
                        </Badge>
                      )}
                      {customer.debt_amount !== undefined && customer.debt_amount > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          Qarzdor
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{customer.phone}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setTelegramCustomer(customer);
                        setTelegramDialogOpen(true);
                      }}
                      disabled={!customer.has_telegram}
                      title={customer.has_telegram ? "Telegram xabar yuborish" : "Telegram bog'lanmagan"}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setEditCustomer(customer); setIsDialogOpen(true); }}>
                      Tahrirlash
                    </Button>
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleDelete(customer.id.toString()); }} className="text-destructive">
                      O'chirish
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                {/* Address */}
                <div className="text-sm">
                  <p className="text-muted-foreground">Manzil</p>
                  <p className="font-medium">{customer.address || 'Manzil kiritilmagan'}</p>
                </div>

                {/* Pets */}
                <div>
                  <p className="text-sm font-semibold mb-2">Bemorlar ({customer.pets?.length || 0})</p>
                  <div className="space-y-2">
                    {customer.pets?.slice(0, 2).map((pet) => (
                      <div key={pet.id} className="flex items-center gap-2 p-2 bg-muted rounded-lg text-sm">
                        <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-xs font-bold">
                          {pet.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{pet.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {pet.age} yosh
                          </p>
                        </div>
                      </div>
                    ))}
                    {customer.pets && customer.pets.length > 2 && (
                      <p className="text-xs text-muted-foreground px-2">+{customer.pets.length - 2} boshqa</p>
                    )}
                    {(!customer.pets || customer.pets.length === 0) && (
                      <p className="text-xs text-muted-foreground italic">Bemorlar qo'shilmagan</p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <Button onClick={() => setSelectedCustomer(customer)} className="w-full">
                  Barcha ma'lumot
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-muted-foreground font-medium">Mijozlar topilmadi</p>
          <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">
            Agar ma'lumotlar borligiga amin bo'lsangiz, iltimos sahifani yangilang yoki qayta tizimga kiring.
          </p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => fetchData()}>
            Qayta yuklash
          </Button>
        </div>
      )}

      <CustomerDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        customer={editCustomer}
        onSuccess={fetchData}
      />

      <SendTelegramDialog
        open={telegramDialogOpen}
        onOpenChange={setTelegramDialogOpen}
        customer={telegramCustomer}
      />
    </div>
  )
}
