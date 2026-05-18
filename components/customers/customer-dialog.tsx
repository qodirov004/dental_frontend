import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ClinicAPI } from "@/services/api"
import { toast } from "sonner"
import { Plus, Trash2 } from "lucide-react"

export function CustomerDialog({ open, onOpenChange, onSuccess, customer }: any) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        address: ""
    })
    const [pets, setPets] = useState<any[]>([])

    useEffect(() => {
        if (customer) {
            setFormData({
                name: customer.name,
                phone: customer.phone,
                address: customer.address || ""
            })
            setPets([])
        } else {
            setFormData({ name: "", phone: "", address: "" })
            setPets([{ name: "", species: "Inson", breed: "", gender: "M" }])
        }
    }, [customer, open])

    const handleAddPet = () => {
        setPets([...pets, { name: "", species: "Inson", breed: "", gender: "M" }])
    }

    const handleRemovePet = (index: number) => {
        setPets(pets.filter((_, i) => i !== index))
    }

    const handleUpdatePet = (index: number, field: string, value: string) => {
        const newPets = [...pets]
        newPets[index] = { ...newPets[index], [field]: value }
        setPets(newPets)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const payload: any = {
                ...formData,
                pets: pets.filter(p => p.name.trim() !== "")
            }

            if (customer) {
                await ClinicAPI.updateCustomer(customer.id, formData)
                toast.success("Mijoz ma'lumotlari yangilandi")
            } else {
                await ClinicAPI.createCustomer(payload)
                toast.success("Yangi mijoz va bemorlar qo'shildi")
            }
            onSuccess()
            onOpenChange(false)
        } catch (error) {
            toast.error("Xatolik yuz berdi")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-full max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{customer ? "Mijozni tahrirlash" : "Yangi mijoz qo'shish"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Ism-sharif</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Telefon raqam</Label>
                            <Input
                                id="phone"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                required
                            />
                        </div>
                        <div className="col-span-2 space-y-2">
                            <Label htmlFor="address">Manzil</Label>
                            <Textarea
                                id="address"
                                className="h-20"
                                value={formData.address}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                            />
                        </div>
                    </div>

                    {!customer && (
                        <div className="space-y-4 pt-4 border-t">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-primary">Bemorlar</h3>
                                <Button type="button" variant="outline" size="sm" onClick={handleAddPet} className="gap-2">
                                    <Plus className="w-4 h-4" />
                                    Bemor qo'shish
                                </Button>
                            </div>

                            <div className="space-y-4">
                                {pets.map((pet, index) => (
                                    <div key={index} className="p-4 border rounded-lg bg-muted/30 relative space-y-4">
                                        {pets.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="absolute top-2 right-2 text-destructive hover:bg-destructive/10"
                                                onClick={() => handleRemovePet(index)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        )}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Bemor ismi (F.I.O)</Label>
                                                <Input
                                                    value={pet.name}
                                                    onChange={e => handleUpdatePet(index, "name", e.target.value)}
                                                    placeholder="Ism-sharifi"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Jinsi</Label>
                                                <Select
                                                    value={pet.gender}
                                                    onValueChange={v => handleUpdatePet(index, "gender", v)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Tanlang" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="M">Erkak</SelectItem>
                                                        <SelectItem value="F">Ayol</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="col-span-2 space-y-2">
                                                <Label>Tug'ilgan yili / Yoshi</Label>
                                                <Input
                                                    value={pet.breed}
                                                    onChange={e => handleUpdatePet(index, "breed", e.target.value)}
                                                    placeholder="Masalan: 1990 yoki 34 yosh"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <DialogFooter className="pt-4">
                        <Button type="submit" disabled={loading} className="w-full">
                            {loading ? "Saqlanmoqda..." : "Saqlash"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
