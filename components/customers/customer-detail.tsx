import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Plus, Phone, Mail, MapPin, Edit2, Trash2 } from "lucide-react"
import { PetProfile } from "./pet-profile"
import { PetDialog } from "./pet-dialog"
import type { Customer, Pet } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { ClinicAPI, BillingAPI } from "@/services/api"
import { toast } from "sonner"

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        showConfirm?: (message: string, callback: (confirmed: boolean) => void) => void
      }
    }
  }
}

export function CustomerDetail({ customer: initialCustomer, onBack }: { customer: Customer; onBack: () => void }) {
  const [customer, setCustomer] = useState<any>(initialCustomer)
  const [selectedPet, setSelectedPet] = useState<any>(null)
  const [editPet, setEditPet] = useState<any>(null)
  const [isPetDialogOpen, setIsPetDialogOpen] = useState(false)
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchDetails()
  }, [])

  const fetchDetails = async () => {
    try {
      const res = await ClinicAPI.getCustomer(customer.id.toString())
      setCustomer(res.data)

      const invRes = await BillingAPI.getInvoices()
      setInvoices(invRes.data.filter((inv: any) => inv.customer === customer.id))
    } catch (e) {
      console.error(e)
    }
  }

  const handleDeletePet = async (petId: string) => {
    const message = "Haqiqatan ham ushbu bemorni o'chirib tashlamoqchimisiz?";

    const proceed = async () => {
      try {
        await ClinicAPI.deletePet(petId)
        toast.success("Bemor o'chirildi")
        fetchDetails()
      } catch (e) {
        toast.error("Xatolik yuz berdi")
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

  const totalDebt = invoices
    .filter(inv => inv.status !== 'PAID')
    .reduce((total, inv) => total + Number(inv.total_amount), 0)

  if (selectedPet) {
    return <PetProfile pet={selectedPet} customer={customer} onBack={() => setSelectedPet(null)} />
  }

  return (
    <div className="p-4 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{customer.name}</h1>
          <p className="text-muted-foreground">
            Mijoz ma'lumoti | Ro'yxatga olingan: {new Date(customer.created_at || customer.createdAt).toLocaleDateString("uz-UZ")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Info */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Aloqa Ma'lumoti</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Telefon</p>
                    <p className="font-medium">{customer.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground">Manzil</p>
                    <p className="font-medium">{customer.address || "Kiritilmagan"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {totalDebt > 0 && (
            <Card className="border-destructive/50 bg-destructive/5">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-destructive">Faol Qarzlar</p>
                    <p className="text-2xl font-bold text-destructive mt-1">{new Intl.NumberFormat('uz-UZ').format(totalDebt)} so'm</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: Pets & History */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Bemorlar ({customer.pets?.length || 0})</CardTitle>
                <CardDescription>Bemorlar ro'yxati</CardDescription>
              </div>
              <Button size="sm" onClick={() => { setEditPet(null); setIsPetDialogOpen(true); }} className="gap-2">
                <Plus className="w-4 h-4" />
                Yangi Bemor
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {customer.pets?.map((pet: any) => {
                  const birthDate = pet.birth_date || pet.birthDate;
                  const age = pet.age ?? (birthDate ? new Date().getFullYear() - new Date(birthDate).getFullYear() : 0);
                  
                  return (
                    <div
                      key={pet.id}
                      className="p-4 border border-border rounded-lg hover:border-primary/50 transition-colors group relative"
                    >
                      <div className="flex items-start justify-between mb-3 cursor-pointer" onClick={() => setSelectedPet(pet)}>
                        <div>
                          <h3 className="font-semibold text-lg">{pet.name}</h3>
                          <p className="text-sm text-primary font-medium">{age} yosh</p>
                        </div>
                        <span className="text-2xl">
                          👤
                        </span>
                      </div>
                      <div className="space-y-1 text-sm border-t pt-3 mt-3 cursor-pointer" onClick={() => setSelectedPet(pet)}>
                        <p><span className="text-muted-foreground">Tug'ilgan kuni:</span> {birthDate ? new Date(birthDate).toLocaleDateString("uz-UZ") : "Kiritilmagan"}</p>
                      </div>

                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); setEditPet(pet); setIsPetDialogOpen(true); }}>
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={(e) => { e.stopPropagation(); handleDeletePet(pet.id.toString()); }}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
                {(!customer.pets || customer.pets.length === 0) && (
                  <div className="col-span-full py-8 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                    Bemorlar yo'q
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="invoices" className="w-full">
            <TabsList>
              <TabsTrigger value="invoices">Invoiceler</TabsTrigger>
              <TabsTrigger value="history">Qabul Tarixi</TabsTrigger>
            </TabsList>

            <TabsContent value="invoices">
              <Card>
                <CardHeader>
                  <CardTitle>To'lovlar Tarixi</CardTitle>
                </CardHeader>
                <CardContent>
                  {invoices.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">Invoiceler yo'q</p>
                  ) : (
                    <div className="space-y-3">
                      {invoices.map((invoice) => (
                        <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                          <div>
                            <p className="font-semibold">Invoice #{invoice.id}</p>
                            <p className="text-sm text-muted-foreground">{new Date(invoice.created_at).toLocaleDateString("uz-UZ")}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">{new Intl.NumberFormat('uz-UZ').format(Number(invoice.total_amount))} so'm</p>
                            <Badge variant={invoice.status === "PAID" ? "default" : "destructive"}>
                              {invoice.status === "PAID" ? "To'landi" : "Qarzdor"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <VisitHistory customerId={customer.id} pets={customer.pets || []} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <PetDialog
        open={isPetDialogOpen}
        onOpenChange={setIsPetDialogOpen}
        pet={editPet}
        customerId={customer.id}
        onSuccess={fetchDetails}
      />
    </div>
  )
}

function VisitHistory({ customerId, pets }: { customerId: number; pets: any[] }) {
  const [visits, setVisits] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchVisits()
  }, [])

  const fetchVisits = async () => {
    try {
      const res = await ClinicAPI.getVisits()
      const allVisits = Array.isArray(res.data) ? res.data : []
      const petIds = pets.map((p: any) => p.id)
      const customerVisits = allVisits
        .filter((v: any) => petIds.includes(v.pet))
        .sort((a: any, b: any) => new Date(b.arrived_at).getTime() - new Date(a.arrived_at).getTime())
      setVisits(customerVisits)
    } catch (e) {
      console.error("Error fetching visits:", e)
    } finally {
      setLoading(false)
    }
  }

  const statusMap: Record<string, { label: string; color: string }> = {
    WAITING: { label: "Kutilmoqda", color: "bg-gray-100 text-gray-800" },
    CALLED: { label: "Chaqirilgan", color: "bg-yellow-100 text-yellow-800" },
    IN_PROGRESS: { label: "Jarayonda", color: "bg-blue-100 text-blue-800" },
    COMPLETED: { label: "Yakunlangan", color: "bg-green-100 text-green-800" },
    CANCELLED: { label: "Bekor qilingan", color: "bg-red-100 text-red-800" },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Oxirgi Qabullar</CardTitle>
        <CardDescription>{visits.length} ta qabul topildi</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-center py-8 text-muted-foreground">Yuklanmoqda...</p>
        ) : visits.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">Qabul tarixi yo'q</p>
        ) : (
          <div className="space-y-4">
            {visits.map((visit) => {
              const status = statusMap[visit.status] || statusMap.WAITING
              return (
                <div key={visit.id} className="p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-center justify-center bg-primary/10 rounded-lg p-2 min-w-[56px]">
                        <span className="text-lg font-bold text-primary">{visit.queue_number || "—"}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(visit.arrived_at).toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold">{visit.pet_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(visit.arrived_at).toLocaleDateString("uz-UZ", { year: "numeric", month: "long", day: "numeric" })}
                        </p>
                        {(visit.veterinarian_first_name || visit.veterinarian_name) && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            👨‍⚕️ {visit.veterinarian_first_name
                              ? `${visit.veterinarian_first_name} ${visit.veterinarian_last_name || ''}`
                              : visit.veterinarian_name}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                      <Badge className={status.color}>{status.label}</Badge>
                      {visit.total_amount > 0 && (
                        <span className="text-sm font-semibold">{new Intl.NumberFormat('uz-UZ').format(Number(visit.total_amount))} so'm</span>
                      )}
                    </div>
                  </div>

                  {visit.purpose && (
                    <p className="text-sm mt-2"><span className="text-muted-foreground">Maqsad:</span> {visit.purpose}</p>
                  )}

                  {visit.additional_conditions && (
                    <div className="mt-3 p-2 bg-amber-50 rounded border border-amber-100 flex items-start gap-2">
                      <span className="text-sm">🦷</span>
                      <div>
                        <p className="text-xs font-semibold text-amber-900">Qo'shimcha tish kasalliklari</p>
                        <p className="text-xs text-amber-800">{visit.additional_conditions}</p>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
