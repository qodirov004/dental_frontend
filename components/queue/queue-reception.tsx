import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Plus, UserPlus, Phone, MapPin, Edit2, Trash2, Mic2, FileText, Printer, RefreshCw, ChevronUp, X } from "lucide-react"
import { ClinicAPI, api } from "@/services/api"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { playAnnouncementWithDing } from "@/lib/tts"
import { CompleteVisitDialog } from "./complete-visit-dialog"
import { useAuth } from "../auth-context"

const getApiBase = (): string => {
  if (typeof window === "undefined") return "https://dental.api.ardentsoft.uz/api";
  const { protocol, hostname, port } = window.location;
  let resolvedHost = hostname;
  if (hostname === "localhost") {
    resolvedHost = "127.0.0.1";
  }
  if (port === "3000" || port === "3001" || port === "3002" || resolvedHost === "127.0.0.1" || /^192\.168\./.test(resolvedHost)) {
    return `${protocol}//${resolvedHost}:8000/api`;
  }
  return `${protocol}//${resolvedHost}${port ? `:${port}` : ""}/api`;
};

export function QueueReception() {
  const { user } = useAuth()
  const [queue, setQueue] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [pets, setPets] = useState<any[]>([])
  const [selectedPet, setSelectedPet] = useState<string>("")
  const [purpose, setPurpose] = useState("Tekshiruv")
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false)
  const [selectedVisitId, setSelectedVisitId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'active' | 'completed'>('active')
  const [announcedIds, setAnnouncedIds] = useState<Set<number>>(new Set())

  useEffect(() => {
    fetchQueue()
    fetchPets()

    // Polling fallback (less aggressive when SSE is active)
    const interval = setInterval(fetchQueue, 15000)

    // Real-time SSE Connection
    let eventSource: EventSource | null = null;
    const connectSSE = () => {
      try {
        const apiBase = getApiBase()
        eventSource = new EventSource(`${apiBase}/clinic/visits/events/`)

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            if (data.event === "queue_updated") {
              fetchQueue()

              if (data.status === "CALLED") {
                const docName = [data.veterinarian_first_name, data.veterinarian_last_name].filter(Boolean).join(' ') || "Shifokor"
                const patName = data.customer_name || data.pet_name || "Bemor"
                const roomStr = data.room_number ? `${data.room_number}-xona` : "Qabulxona"

                toast.info(
                  <div className="flex flex-col gap-1 text-left">
                    <span className="font-bold text-blue-600 flex items-center gap-1.5">🔔 Yangi Chaqiruv (Real-time)</span>
                    <span className="text-sm font-semibold">{roomStr}, {docName} qabuli</span>
                    <span className="text-xs text-muted-foreground">Navbat: {data.queue_number} — {patName}</span>
                  </div>,
                  { duration: 8000 }
                )
              }
            }
          } catch (e) {
            console.error("SSE parse error:", e)
          }
        }

        eventSource.onerror = (err) => {
          console.error("SSE Connection error, reconnecting in 5s...", err)
          if (eventSource) {
            eventSource.close()
          }
          setTimeout(connectSSE, 5000)
        }
      } catch (err) {
        console.error("SSE creation error:", err)
        setTimeout(connectSSE, 5000)
      }
    }

    connectSSE()

    return () => {
      clearInterval(interval)
      if (eventSource) {
        eventSource.close()
      }
    }
  }, [])

  const fetchQueue = async () => {
    setLoading(true)
    try {
      const res = await ClinicAPI.getVisits()
      const queueList = Array.isArray(res.data) ? res.data : []
      setQueue(queueList)

      // Reception screen no longer processes or marks unannounced patients.
      // This is exclusively handled by queue-tv-display.tsx to prevent race conditions.
    } catch (e) {
      console.error("Queue fetch error:", e)
    } finally {
      setLoading(false)
    }
  }

  const fetchPets = async () => {
    try {
      const res = await ClinicAPI.getPets()
      setPets(Array.isArray(res.data) ? res.data : [])
    } catch (e) {
      console.error(e)
    }
  }

  const patchVisit = async (id: number, data: any) => {
    try {
      await ClinicAPI.updateVisit(id.toString(), data)
      fetchQueue()
      toast.success("Navbat yangilandi")
    } catch (e) {
      toast.error("Statusni o'zgartirishda xatolik")
    }
  }

  const handleDownloadReceipt = async (id: number) => {
    try {
      const res = await ClinicAPI.downloadVisitReceipt(id.toString())
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `visit_${id}_receipt.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      console.error(e)
      toast.error("Chekni yuklab olishda xatolik")
    }
  }

  const handleDownloadTicket = async (id: number) => {
    try {
      const res = await ClinicAPI.downloadTicket(id.toString());
      toast.success(res.data?.message || "Navbat cheki printerga yuborildi");
    } catch (e) {
      console.error(e);
      toast.error("Navbat chekini chiqarishda xatolik");
    }
  }

  const [selectedDoctor, setSelectedDoctor] = useState<string>("none")

  const handleAddQueue = async () => {
    if (!selectedPet) {
      toast.error("Bemorni tanlang")
      return
    }

    try {
      const res = await ClinicAPI.createVisit({
        pet: selectedPet,
        purpose: purpose,
        veterinarian: selectedDoctor !== "none" ? selectedDoctor : null,
        status: "WAITING"
      })
      fetchQueue()
      toast.success("Navbatga qo'shildi")

      setSelectedPet("")
      setSelectedDoctor("none")
      setPurpose("Tekshiruv")
    } catch (e) {
      toast.error("Xatolik yuz berdi")
    }
  }

  const [doctors, setDoctors] = useState<any[]>([])
  useEffect(() => {
    ClinicAPI.getUsers().then(res => {
      setDoctors(res.data.filter((u: any) => u.role === 'DOCTOR'))
    })
  }, [])

  const filteredQueue = queue.filter(
    (item) =>
      item.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.pet_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.queue_number?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const activeQueue = filteredQueue.filter((item) =>
    viewMode === 'active'
      ? item.status !== "COMPLETED" && item.status !== "CANCELLED"
      : item.status === "COMPLETED"
  )
  const completedCount = queue.filter((item) => item.status === "COMPLETED").length

  const getStatusColor = (status: string) => {
    switch (status) {
      case "IN_PROGRESS": return "bg-blue-100 text-blue-800"
      case "CALLED": return "bg-yellow-100 text-yellow-800"
      case "WAITING": return "bg-gray-100 text-gray-800"
      case "COMPLETED": return "bg-green-100 text-green-800"
      case "CANCELLED": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Navbat Tizimi</h1>
          <p className="text-muted-foreground">Bugungi qabullarni boshqaring</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchQueue} className="gap-2">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Yangilash
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Kutilmoqda", val: "WAITING" },
          { label: "Chaqirilgan", val: "CALLED" },
          { label: "Jarayonda", val: "IN_PROGRESS" },
          { label: "Yakunlangan", val: "COMPLETED" }
        ].map((s, idx) => (
          <Card key={idx}
            className={`cursor-pointer transition-colors ${s.val === 'COMPLETED' && viewMode === 'completed' ? 'border-primary bg-primary/5' : ''}`}
            onClick={() => {
              if (s.val === 'COMPLETED') setViewMode('completed')
              else setViewMode('active')
            }}
          >
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</p>
                <p className="text-2xl font-bold mt-1">
                  {s.val === "COMPLETED" ? completedCount : queue.filter(q => q.status === s.val).length}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add new queue */}
      {user?.role !== "DOCTOR" && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Yangi Navbat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1">
                <Select value={selectedPet} onValueChange={setSelectedPet}>
                  <SelectTrigger>
                    <SelectValue placeholder="Bemor va egasini tanlang" />
                  </SelectTrigger>
                  <SelectContent>
                    {pets.map(pet => (
                      <SelectItem key={pet.id} value={pet.id.toString()}>
                        {pet.name} ({pet.customer_name || 'Mijozsiz'})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                  <SelectTrigger id="vet-select-trigger">
                    <SelectValue placeholder="Shifokorni tanlang" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Ixtiyoriy shifokor</SelectItem>
                    {doctors.map(doc => (
                      <SelectItem key={doc.id} value={doc.id.toString()}>
                        {doc.first_name} {doc.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-[2]">
                <Input
                  id="purpose-input"
                  placeholder="Tashrif maqsadi"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                />
              </div>
              <Button onClick={handleAddQueue} className="gap-2">
                <Plus className="w-4 h-4" />
                Qo'shish
              </Button>
            </div>
          </CardContent>
        </Card>
      )}


      {/* Queue list */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-4">
            <CardTitle>{viewMode === 'active' ? "Navbatdagilar" : "Yakunlangan Qabullar"}</CardTitle>
            <div className="relative w-64">
              <Input
                placeholder="Qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 pr-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activeQueue.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                <p>Hozircha faol navbatlar yo'q</p>
              </div>
            ) : (
              activeQueue.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border transition-all ${item.status === 'CALLED' ? 'border-yellow-400 bg-yellow-50 shadow-md ring-2 ring-yellow-200 ring-offset-2' : 'border-border bg-card'
                    }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col items-center justify-center bg-primary/10 rounded-lg p-2 min-w-[64px]">
                        <div className="text-2xl font-bold text-primary">{item.queue_number}</div>
                        <div className="text-[10px] uppercase text-muted-foreground font-semibold">
                          {new Date(item.arrived_at).toLocaleTimeString("uz-UZ", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>

                      <div>
                        <p className="font-bold text-lg">{item.pet_name}</p>
                        <p className="text-sm text-muted-foreground">{item.customer_name}</p>
                        <Badge variant="outline" className="mt-2 font-normal border-primary/30 text-primary">
                          {item.purpose}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <Badge className={getStatusColor(item.status)}>
                        {item.status === "WAITING" && "Kutilmoqda"}
                        {item.status === "CALLED" && "Chaqirilgan"}
                        {item.status === "IN_PROGRESS" && "Jarayonda"}
                      </Badge>

                      <div className="flex gap-2">
                        {item.status === "WAITING" && (
                          <Button
                            size="sm"
                            disabled={queue.some(q => q.status === 'CALLED' || q.status === 'IN_PROGRESS')}
                            onClick={() => patchVisit(item.id, { status: 'CALLED' })}
                            className="gap-2 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Mic2 className="w-4 h-4" />
                            Chaqirish
                          </Button>
                        )}
                        {item.status === "CALLED" && (
                          <Button size="sm" onClick={() => patchVisit(item.id, { status: 'IN_PROGRESS' })} className="gap-2 bg-blue-600 hover:bg-blue-700">
                            Qabulni boshlash
                          </Button>
                        )}
                        {item.status === "IN_PROGRESS" && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedVisitId(item.id);
                              setIsCompleteDialogOpen(true);
                            }}
                            className="gap-2 bg-green-600 hover:bg-green-700"
                          >
                            Yakunlash
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadTicket(item.id)}
                          title="Navbat chekini chiqarish"
                        >
                          <Printer className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => patchVisit(item.id, { status: 'CANCELLED' })} className="text-destructive hover:bg-destructive/10">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>

                      {item.status === 'COMPLETED' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadReceipt(item.id)}
                          className="gap-2"
                        >
                          <FileText className="w-4 h-4" /> Chek
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {selectedVisitId && (
        <CompleteVisitDialog
          open={isCompleteDialogOpen}
          onOpenChange={setIsCompleteDialogOpen}
          visitId={selectedVisitId}
          onSuccess={fetchQueue}
        />
      )}
    </div>
  )
}
