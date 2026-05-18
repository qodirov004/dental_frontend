import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AnalyticsView } from "./analytics-view"
import { KPIView } from "./kpi-view"
import { ReportsView } from "./reports-view"

export function UnifiedAnalyticsView() {
    return (
        <div className="p-4 lg:p-8 space-y-6 h-full flex flex-col">
            <h1 className="text-3xl font-bold">Hisobotlar va Tahlil</h1>

            <Tabs defaultValue="reports" className="flex-1 overflow-hidden flex flex-col">
                <TabsList className="w-full justify-start border-b rounded-none px-4 bg-transparent h-12">
                    <TabsTrigger value="reports" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">Hisobotlar</TabsTrigger>
                    <TabsTrigger value="analytics" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">Analitika</TabsTrigger>
                    <TabsTrigger value="kpi" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">Samaradorlik (KPI)</TabsTrigger>
                </TabsList>

                <div className="flex-1 overflow-y-auto bg-gray-50/50 p-4">
                    <TabsContent value="reports" className="mt-0 h-full">
                        <ReportsView />
                    </TabsContent>
                    <TabsContent value="analytics" className="mt-0 h-full">
                        <AnalyticsView />
                    </TabsContent>
                    <TabsContent value="kpi" className="mt-0 h-full">
                        <KPIView />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    )
}
