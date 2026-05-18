"use client"

import { useState, useEffect } from "react"
import { ClinicAPI } from "@/services/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"
import { format } from "date-fns"

export function FeedbackView() {
    const [feedbacks, setFeedbacks] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const fetchFeedbacks = async () => {
        try {
            const res = await ClinicAPI.getFeedbacks()
            setFeedbacks(Array.isArray(res.data) ? res.data : [])
        } catch (error) {
            console.error("Error fetching feedbacks:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchFeedbacks()
    }, [])

    const renderStars = (rating: number) => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`w-4 h-4 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                    />
                ))}
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Mijozlar Baholari</h2>
                    <p className="text-muted-foreground">Telegram orqali kelgan barcha fikr-mulohazalar.</p>
                </div>
                <Card className="bg-primary/5 border-none">
                    <CardContent className="p-4">
                        <div className="text-sm text-muted-foreground">O'rtacha baho</div>
                        <div className="text-2xl font-bold flex items-center gap-2">
                            {feedbacks.length > 0
                                ? (feedbacks.reduce((acc: any, curr: any) => acc + curr.rating, 0) / feedbacks.length).toFixed(1)
                                : "0.0"}
                            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Fikrlar Ro'yxati</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Sana</TableHead>
                                <TableHead>Mijoz</TableHead>
                                <TableHead>Bemor</TableHead>
                                <TableHead>Baho</TableHead>
                                <TableHead>Izoh</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-gray-400">
                                        Yuklanmoqda...
                                    </TableCell>
                                </TableRow>
                            ) : feedbacks.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-gray-400">
                                        Hozircha baholar yo'q
                                    </TableCell>
                                </TableRow>
                            ) : (
                                feedbacks.map((item: any) => (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            {format(new Date(item.created_at), "dd.MM.yyyy HH:mm")}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {item.customer_name}
                                        </TableCell>
                                        <TableCell>
                                            {item.pet_name}
                                        </TableCell>
                                        <TableCell>
                                            {renderStars(item.rating)}
                                        </TableCell>
                                        <TableCell className="italic text-muted-foreground">
                                            "{item.comment || "Izoh yo'q"}"
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
