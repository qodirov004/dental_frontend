import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Save, X, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { api } from '@/services/api';

interface GamePrize {
    id: number;
    name: string;
    image: string | null;
    coefficient: number;
    daily_limit: number;
    is_active: boolean;
    product: number | null;
}

const GamesView = () => {
    const [prizes, setPrizes] = useState<GamePrize[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddOpen, setIsAddOpen] = useState(false);

    // Edit State for optimistic UI (tracking changes in input fields)
    const [editingRows, setEditingRows] = useState<{ [key: number]: Partial<GamePrize> }>({});

    useEffect(() => {
        fetchPrizes();
    }, []);

    const fetchPrizes = async () => {
        setIsLoading(true);
        try {
            // Assuming we have a public or admin endpoint for list. 
            // ViewSet handles it. If user is admin, they see all.
            const res = await api.get('/games/prizes/');
            setPrizes(res.data);
        } catch (error) {
            console.error("Error fetching prizes:", error);
            toast.error("Yutuqlarni yuklashda xatolik");
        } finally {
            setIsLoading(false);
        }
    };

    // Calculate Win Probability
    const totalWeight = prizes
        .filter(p => p.is_active) // Only active prizes count towards weight
        .reduce((sum, p) => sum + (editingRows[p.id]?.coefficient ?? p.coefficient), 0);

    const getProbability = (prizeId: number, currentCoeff: number, isActive: boolean) => {
        if (!isActive || totalWeight === 0) return "0.0%";
        // Note: For rows being edited, totalWeight uses their *edited* value. 
        // For current row, we pass currentCoeff. 
        // totalWeight logic above already accounts for editingRows.
        return ((currentCoeff / totalWeight) * 100).toFixed(1) + "%";
    };

    const handleEditChange = (id: number, field: keyof GamePrize, value: any) => {
        setEditingRows(prev => ({
            ...prev,
            [id]: { ...prev[id], [field]: value }
        }));
    };

    const handleSaveRow = async (id: number) => {
        const changes = editingRows[id];
        if (!changes) return;

        try {
            await api.patch(`/games/prizes/${id}/`, changes);
            toast.success("O'zgarishlar saqlandi");

            // Update local state cleanly
            setPrizes(prev => prev.map(p => p.id === id ? { ...p, ...changes } : p));
            setEditingRows(prev => {
                const newState = { ...prev };
                delete newState[id];
                return newState;
            });
        } catch (error) {
            console.error(error);
            toast.error("Saqlashda xatolik");
        }
    };

    const handleToggleActive = async (prize: GamePrize) => {
        const newValue = !prize.is_active;
        // Optimistic update
        setPrizes(prev => prev.map(p => p.id === prize.id ? { ...p, is_active: newValue } : p));

        try {
            await api.patch(`/games/prizes/${prize.id}/`, { is_active: newValue });
            toast.success(newValue ? "Yutuq faollashtirildi" : "Yutuq o'chirildi");
        } catch (error) {
            // Revert on error
            setPrizes(prev => prev.map(p => p.id === prize.id ? { ...p, is_active: !newValue } : p));
            toast.error("Xatolik yuz berdi");
        }
    };

    // New Prize Form State
    const [newPrize, setNewPrize] = useState({ name: '', coefficient: 1, daily_limit: 10 });
    const [selectedImage, setSelectedImage] = useState<File | null>(null);

    const handleAddPrize = async () => {
        try {
            const formData = new FormData();
            formData.append('name', newPrize.name);
            formData.append('coefficient', newPrize.coefficient.toString());
            formData.append('daily_limit', newPrize.daily_limit.toString());
            formData.append('is_active', 'true');
            if (selectedImage) {
                formData.append('image', selectedImage);
            }

            await api.post('/games/prizes/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setIsAddOpen(false);
            fetchPrizes();
            toast.success("Yangi yutuq qo'shildi");
            setNewPrize({ name: '', coefficient: 1, daily_limit: 10 });
            setSelectedImage(null);
        } catch (error) {
            console.error(error);
            toast.error("Qo'shishda xatolik");
        }
    };

    // Delete Handler
    const handleDelete = async (id: number) => {
        if (!confirm("Haqiqatan ham o'chirmoqchimisiz?")) return;
        try {
            await api.delete(`/games/prizes/${id}/`);
            toast.success("Yutuq o'chirildi");
            setPrizes(prev => prev.filter(p => p.id !== id));
        } catch (error) {
            console.error(error);
            toast.error("O'chirishda xatolik");
        }
    };

    // Edit Handler
    const [editingPrizeId, setEditingPrizeId] = useState<number | null>(null);

    const handleOpenEdit = (prize: GamePrize) => {
        setEditingPrizeId(prize.id);
        setNewPrize({
            name: prize.name,
            coefficient: prize.coefficient,
            daily_limit: prize.daily_limit
        });
        setIsAddOpen(true); // Reuse the dialog
    };

    const handleSavePrize = async () => {
        // Decide whether Creating or Updating
        if (editingPrizeId) {
            // Update logic
            try {
                const formData = new FormData();
                formData.append('name', newPrize.name);
                formData.append('coefficient', newPrize.coefficient.toString());
                formData.append('daily_limit', newPrize.daily_limit.toString());
                if (selectedImage) {
                    formData.append('image', selectedImage);
                }

                const res = await api.patch(`/games/prizes/${editingPrizeId}/`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });

                toast.success("Yutuq yangilandi");
                setPrizes(prev => prev.map(p => p.id === editingPrizeId ? res.data : p));
                setIsAddOpen(false);
                setEditingPrizeId(null);
                setNewPrize({ name: '', coefficient: 1, daily_limit: 10 });
                setSelectedImage(null);
            } catch (error) {
                console.error(error);
                toast.error("Yangilashda xatolik");
            }
        } else {
            // Create logic
            await handleAddPrize();
        }
    };

    const filteredPrizes = prizes.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="h-full flex flex-col p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Yutuqlar Boshqaruvi</h1>
                    <p className="text-sm text-gray-500 mt-1">O'yin sov g'alarini va ularning tushish ehtimolini boshqaring</p>
                </div>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                            <Plus size={16} />
                            <Plus size={16} />
                            {editingPrizeId ? "Tahrirlash" : "Yangi Qo'shish"}
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingPrizeId ? "Yutuqni Tahrirlash" : "Yangi Yutuq Qo'shish"}</DialogTitle>
                            <DialogDescription>
                                {editingPrizeId ? "Yutuq ma'lumotlarini o'zgartiring." : "Yangi o'yin yutug'i ma'lumotlarini kiriting va saqlang."}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Nomi</label>
                                <Input
                                    value={newPrize.name}
                                    onChange={e => setNewPrize({ ...newPrize, name: e.target.value })}
                                    placeholder="Masalan: 5% Chegirma"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Koeffitsiyent</label>
                                    <Input
                                        type="number"
                                        value={newPrize.coefficient}
                                        onChange={e => setNewPrize({ ...newPrize, coefficient: Number(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Kunlik Limit</label>
                                    <Input
                                        type="number"
                                        value={newPrize.daily_limit}
                                        onChange={e => setNewPrize({ ...newPrize, daily_limit: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Rasm (Ixtiyoriy)</label>
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            setSelectedImage(e.target.files[0]);
                                        }
                                    }}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => { setIsAddOpen(false); setEditingPrizeId(null); }}>Bekor qilish</Button>
                            <Button onClick={handleSavePrize} className="bg-blue-600">Saqlash</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 bg-white p-2 rounded-lg border shadow-sm w-fit">
                <Search className="w-4 h-4 text-gray-400 ml-2" />
                <input
                    className="outline-none text-sm min-w-[300px]"
                    placeholder="Qidiruv..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Table */}
            <div className="flex-1 border rounded-xl bg-white overflow-hidden shadow-sm flex flex-col">
                <div className="overflow-auto flex-1">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b sticky top-0 z-10">
                            <tr>
                                <th className="p-4 w-16">Rasm</th>
                                <th className="p-4">Nomi</th>
                                <th className="p-4 w-32 text-center">Koeffitsiyent</th>
                                <th className="p-4 w-32 text-center">Ehtimollik</th>
                                <th className="p-4 w-32 text-center">Kunlik Limit</th>
                                <th className="p-4 w-24 text-center">Status</th>
                                <th className="p-4 w-24">Amallar</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredPrizes.map(prize => {
                                const isEditing = !!editingRows[prize.id];
                                const currentCoeff = isEditing && editingRows[prize.id]?.coefficient !== undefined
                                    ? editingRows[prize.id]?.coefficient!
                                    : prize.coefficient;
                                const currentLimit = isEditing && editingRows[prize.id]?.daily_limit !== undefined
                                    ? editingRows[prize.id]?.daily_limit!
                                    : prize.daily_limit;
                                const isActive = isEditing && editingRows[prize.id]?.is_active !== undefined
                                    ? editingRows[prize.id]?.is_active!
                                    : prize.is_active;

                                return (
                                    <tr key={prize.id} className="hover:bg-gray-50 group">
                                        <td className="p-4">
                                            {prize.image ? (
                                                <img src={prize.image} className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                                                    <ImageIcon size={16} />
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4 font-medium text-gray-900">{prize.name}</td>
                                        <td className="p-4 text-center">
                                            <Input
                                                type="number"
                                                className="w-20 text-center h-8 mx-auto"
                                                value={currentCoeff}
                                                onChange={(e) => handleEditChange(prize.id, 'coefficient', Number(e.target.value))}
                                            />
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {getProbability(prize.id, currentCoeff, isActive)}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <Input
                                                type="number"
                                                className="w-20 text-center h-8 mx-auto"
                                                value={currentLimit}
                                                onChange={(e) => handleEditChange(prize.id, 'daily_limit', Number(e.target.value))}
                                            />
                                        </td>
                                        <td className="p-4 text-center">
                                            <Switch
                                                checked={isActive}
                                                onCheckedChange={() => handleToggleActive(prize)}
                                            />
                                        </td>
                                        <td className="p-4">
                                            {isEditing ? (
                                                <Button
                                                    size="sm"
                                                    className="w-8 h-8 p-0 bg-green-600 hover:bg-green-700"
                                                    onClick={() => handleSaveRow(prize.id)}
                                                >
                                                    <Save size={14} />
                                                </Button>
                                            ) : (
                                                <div className="flex gap-1">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="w-8 h-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                        onClick={() => handleOpenEdit(prize)}
                                                    >
                                                        <Edit2 size={14} />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="w-8 h-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        onClick={() => handleDelete(prize.id)}
                                                    >
                                                        <Trash2 size={14} />
                                                    </Button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {prizes.length === 0 && !isLoading ? (
                    <div className="p-12 text-center text-gray-500">Yutuqlar topilmadi</div>
                ) : (
                    <div className="bg-gray-50 p-4 border-t flex justify-end gap-6 text-sm">
                        <div className="font-medium text-gray-600">Jami Yutuqlar: <span className="text-gray-900">{prizes.length} ta</span></div>
                        <div className="font-medium text-gray-600">Jami Ehtimollik: <span className="text-green-600 font-bold">{totalWeight > 0 ? "100%" : "0%"}</span></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GamesView;
