"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Plus, Edit2, Syringe } from "lucide-react"
import type { Customer, Pet } from "@/lib/types"

export function PetProfile({ pet, customer, onBack }: { pet: Pet; customer: Customer; onBack: () => void }) {
  return (
    <div className="p-4 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{pet.name}</h1>
          <p className="text-muted-foreground">
            {customer.name}'ning bemori | Ro'yxatga olingan: {pet.created_at || pet.createdAt ? new Date((pet.created_at || pet.createdAt) as string | number | Date).toLocaleDateString("uz-UZ") : "Nomalum"}
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Edit2 className="w-4 h-4" />
          Tahrirlash
        </Button>
      </div>

      {/* Pet Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Bemor Ma'lumoti</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-muted-foreground">Jinsi</p>
            <p className="font-semibold text-lg">
              {pet.gender === "M"
                ? "Erkak"
                : pet.gender === "F"
                  ? "Ayol"
                  : "Nomalum"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Tug'ilgan kuni</p>
            <p className="font-semibold text-lg">
              {pet.birth_date || pet.birthDate 
                ? new Date((pet.birth_date || pet.birthDate) as string).toLocaleDateString("uz-UZ") 
                : "Kiritilmagan"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Yoshi</p>
            <p className="font-semibold text-lg">{pet.age} yosh</p>
          </div>
        </CardContent>
      </Card>

      {/* Medical Tabs */}
      <Tabs defaultValue="history" className="w-full">
        <TabsList>
          <TabsTrigger value="history">Tibbiy Tarix</TabsTrigger>
          <TabsTrigger value="visits">Qabullar</TabsTrigger>
          <TabsTrigger value="vaccines">Muolajalar</TabsTrigger>
        </TabsList>

        <TabsContent value="history">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Tibbiy Tarix (Timeline)</CardTitle>
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Yangi Yozuv
              </Button>
            </CardHeader>
            <CardContent>
              {pet.medicalRecords?.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Tibbiy yozuvlar yo'q</p>
              ) : (
                <div className="space-y-4">
                  {pet.medicalRecords?.map((record) => (
                    <div key={record.id} className="pb-4 border-b last:border-b-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-sm">{record.date.toLocaleDateString("uz-UZ")}</p>
                          <p className="text-muted-foreground text-sm">Dr. {record.vetName}</p>
                        </div>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                          {record.recordType === "diagnoz" && "Diagnoz"}
                          {record.recordType === "prokurator" && "Prokurator"}
                          {record.recordType === "dori" && "Dori"}
                          {record.recordType === "surgiya" && "Surgiya"}
                          {record.recordType === "basqa" && "Boshqa"}
                        </span>
                      </div>
                      <p className="mt-2 text-sm">{record.description}</p>
                      
                      {record.additional_conditions && (
                        <div className="mt-2 p-2 bg-amber-50 rounded border border-amber-100 flex items-start gap-2">
                          <span className="text-sm">🦷</span>
                          <div>
                            <p className="text-[10px] font-semibold text-amber-900">Qo'shimcha tish kasalliklari</p>
                            <p className="text-xs text-amber-800">{record.additional_conditions}</p>
                          </div>
                        </div>
                      )}

                      {record.followUpDate && (
                        <p className="text-xs text-muted-foreground mt-2">
                          📅 Qayta kelish: {record.followUpDate.toLocaleDateString("uz-UZ")}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visits">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Qabullashlar Tarixi</CardTitle>
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Yangi Qabul
              </Button>
            </CardHeader>
            <CardContent>
              {pet.visits?.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Qabullash yozilmagan</p>
              ) : (
                <div className="space-y-4">
                  {pet.visits?.map((visit) => (
                    <div key={visit.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-semibold">{visit.date.toLocaleDateString("uz-UZ")}</p>
                        {visit.invoiceId && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            Invoice: {visit.invoiceId}
                          </span>
                        )}
                      </div>
                      {visit.diagnosis && (
                        <p className="text-sm font-medium text-destructive mb-1">📋 {visit.diagnosis}</p>
                      )}
                      {visit.symptoms && visit.symptoms.length > 0 && (
                        <p className="text-sm text-muted-foreground mb-2">Belgilar: {visit.symptoms.join(", ")}</p>
                      )}
                      <p className="text-sm mb-2">{visit.vetNotes}</p>
                      {visit.services && visit.services.length > 0 && (
                        <div className="flex gap-2 flex-wrap">
                          {visit.services.map((service) => (
                            <span key={service.id} className="text-xs bg-muted px-2 py-1 rounded">
                              {service.name}: {(service.price / 1000).toFixed(0)}K
                            </span>
                          ))}
                        </div>
                      )}
                      {visit.followUpDate && (
                        <p className="text-xs text-muted-foreground mt-2">
                          ⏰ Qayta kelish: {visit.followUpDate.toLocaleDateString("uz-UZ")}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vaccines">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Muolajalar Tarixi</CardTitle>
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Yangi Muolaja
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">Muolajalar yozilmagan</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
