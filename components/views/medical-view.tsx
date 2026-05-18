"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Calendar, AlertCircle, Stethoscope, TrendingUp } from "lucide-react"
import { ClinicAPI } from "@/services/api"
import { toast } from "sonner"
import { MedicalRecordDialog } from "@/components/medical/medical-record-dialog"

export function MedicalView() {
  const [search, setSearch] = useState("")
  const [selectedPet, setSelectedPet] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [pets, setPets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [petsRes, recordsRes] = await Promise.all([
        ClinicAPI.getPets(),
        ClinicAPI.getMedicalRecords()
      ])

      const allPets = Array.isArray(petsRes.data) ? petsRes.data : [];
      const allRecords = Array.isArray(recordsRes.data) ? recordsRes.data : [];

      // Merge records into pets
      const petsWithRecords = allPets.map((pet: any) => ({
        ...pet,
        medicalRecords: allRecords
          .filter((r: any) => r.pet === pet.id)
          .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
      }))

      setPets(petsWithRecords)

    } catch (error) {
      console.error("Error fetching medical data", error)
    } finally {
      setLoading(false)
    }
  }


  const filteredPets = pets.filter(
    (pet) =>
      pet.name.toLowerCase().includes(search.toLowerCase()) ||
      pet.breed?.toLowerCase().includes(search.toLowerCase()) ||
      pet.customer_name?.toLowerCase().includes(search.toLowerCase())
  )

  const petsWithRecordsList = filteredPets.filter((pet) => pet.medicalRecords && pet.medicalRecords.length > 0)

  if (selectedPet) {
    return <MedicalRecordDetail pet={selectedPet} onBack={() => setSelectedPet(null)} />
  }

  if (loading) return <div className="p-8 text-center">Yuklanmoqda...</div>

  return (
    <div className="p-4 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Tibbiy Tarix</h1>
          <p className="text-muted-foreground">Bemorlarning tibbiy yozuvlari va dinamikasi</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tarix bor bemorlar</p>
                <p className="text-2xl font-bold mt-1">{petsWithRecordsList.length}</p>
              </div>
              <Stethoscope className="w-5 h-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Jami Yozuvlar</p>
                <p className="text-2xl font-bold mt-1">
                  {petsWithRecordsList.reduce((sum, pet) => sum + (pet.medicalRecords?.length || 0), 0)}
                </p>
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Kutilayotgan qayta kelishlar</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">
                  {pets.reduce((sum, pet) => {
                    return (
                      sum +
                      (pet.medicalRecords?.filter((r: any) => r.follow_up_date && new Date(r.follow_up_date) > new Date())
                        .length || 0)
                    )
                  }, 0)}
                </p>
              </div>
              <Calendar className="w-5 h-5 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Bemor yoki mijoz ismi bo'yicha qidirish..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Records List */}
      <div className="space-y-4">
        {petsWithRecordsList.length === 0 ? (
          <div className="text-center py-12">
            <Stethoscope className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground">Hech qanday tibbiy tarix topilmadi</p>
          </div>
        ) : (
          petsWithRecordsList.map((pet) => (
            <Card key={pet.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{pet.name}</CardTitle>
                    <CardDescription>
                      {pet.age} yosh • {pet.customer_name}
                    </CardDescription>
                  </div>
                  <Badge variant="outline">{pet.medicalRecords?.length || 0} ta yozuv</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Latest Record Preview */}
                {pet.medicalRecords && pet.medicalRecords.length > 0 && (
                  <div className="border-l-4 border-primary pl-4 py-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-primary">Oxirgi yozuv</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(pet.medicalRecords[0].date).toLocaleDateString("uz-UZ")}
                      </span>
                    </div>
                    <p className="text-sm">{pet.medicalRecords[0].description}</p>
                    <Badge variant="secondary" className="mt-2">
                      {pet.medicalRecords[0].record_type}
                    </Badge>

                    {/* Follow-up Alert */}
                    {pet.medicalRecords[0].follow_up_date &&
                      new Date(pet.medicalRecords[0].follow_up_date) > new Date() && (
                        <div className="mt-3 p-2 bg-orange-50 rounded border border-orange-200 flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-semibold text-orange-900">Qayta kelish kerak</p>
                            <p className="text-xs text-orange-800">
                              {new Date(pet.medicalRecords[0].follow_up_date).toLocaleDateString("uz-UZ")}
                            </p>
                          </div>
                        </div>
                      )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button onClick={() => setSelectedPet(pet)} variant="outline" className="flex-1">
                    Barcha yozuvlar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

function MedicalRecordDetail({ pet, onBack }: { pet: any; onBack: () => void }) {
  const records = pet.medicalRecords || []
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const recordTypeLabels: Record<string, string> = {
    DIAGNOSIS: "Tashxis",
    TREATMENT: "Muolaja",
    SURGERY: "Jarrohlik",
    VACCINATION: "Muolaja",
    OTHER: "Boshqa",
  }

  return (
    <div className="p-4 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            ← Orqaga
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{pet.name}</h1>
            <p className="text-muted-foreground">
              {pet.age} yosh • {records.length} ta tarix
            </p>
          </div>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Yangi Yozuv
        </Button>
      </div>

      {/* Timeline */}
      <div className="space-y-6">
        {records.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">Hech qanday tarix topilmadi</CardContent>
          </Card>
        ) : (
          records.map((record: any, index: number) => (
            <div key={record.id} className="relative">
              {index < records.length - 1 && <div className="absolute left-6 top-12 w-0.5 h-12 bg-border" />}

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary">
                        <Calendar className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{recordTypeLabels[record.record_type] || record.record_type}</CardTitle>
                          <CardDescription>
                            {new Date(record.date).toLocaleDateString("uz-UZ", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground mb-1">Tavsif</p>
                    <p className="text-base">{record.description}</p>
                  </div>

                  {record.diagnosis && (
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground mb-1">Tashxis</p>
                      <p className="text-base font-medium">{record.diagnosis}</p>
                    </div>
                  )}

                  {(record.additional_conditions || record.additionalConditions) && (
                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <p className="text-sm font-semibold text-amber-900 mb-1">🦷 Qo'shimcha tish kasalliklari</p>
                      <p className="text-sm text-amber-800">{record.additional_conditions || record.additionalConditions}</p>
                    </div>
                  )}

                  {record.follow_up_date && (
                    <div className="p-3 bg-blue-50 rounded border border-blue-200 inline-flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <div>
                        <p className="text-sm font-semibold text-blue-900">Qayta kelish sanasi</p>
                        <p className="text-sm text-blue-800">
                          {new Date(record.follow_up_date).toLocaleDateString("uz-UZ")}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ))
        )}
      </div>

      <MedicalRecordDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        petId={pet.id}
        onSuccess={() => { toast.info("Iltimos sahifani yangilang yoki qayta oching"); setIsDialogOpen(false); }}
      />
    </div>
  )
}
