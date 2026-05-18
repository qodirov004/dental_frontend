import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CalendarClock, PackageOpen } from "lucide-react";
import { ProductBatch } from '@/lib/types';
import { ShopAPI } from '@/services/api';

export function ExpiryAlertWidget() {
    const [alerts, setAlerts] = useState<ProductBatch[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch expiring batches
        const fetchAlerts = async () => {
            try {
                const response = await ShopAPI.getAlerts();
                setAlerts(response.data);
            } catch (error) {
                console.error("Failed to fetch expiry alerts", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAlerts();
    }, []);

    if (loading) return <div>Loading alerts...</div>;
    if (alerts.length === 0) return null; // Don't show if empty

    return (
        <Card className="border-red-200 bg-red-50/50">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium text-red-700 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Muddati tugayotgan partiyalar
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                    {alerts.map((batch) => (
                        <div key={batch.id} className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm border border-red-100">
                            <div>
                                <h4 className="font-semibold text-gray-800">{batch.product_name}</h4>
                                <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                                    <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 font-mono text-[10px]">{batch.batch_id}</span>
                                    <span className="flex items-center gap-1">
                                        <PackageOpen className="h-3 w-3" /> {batch.quantity} dona
                                    </span>
                                </div>
                            </div>
                            <div className="text-right">
                                <Badge variant={batch.days_left <= 7 ? "destructive" : "secondary"} className={`${batch.days_left <= 7 ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-500 hover:bg-orange-600 text-white'}`}>
                                    {batch.days_left} kun qoldi
                                </Badge>
                                <div className="text-[10px] text-gray-400 mt-1 flex items-center justify-end gap-1">
                                    <CalendarClock className="h-3 w-3" />
                                    {batch.expiry_date}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
