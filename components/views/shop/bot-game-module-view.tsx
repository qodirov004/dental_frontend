"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BotSettingsView } from "./bot-settings-view"
import { BotUsersView } from "../bot-users-view"
import GamesView from "../games-view"
import { GameSettingsView } from "../game-settings-view"
import { Settings, Users, Trophy, Sliders } from "lucide-react"

export function BotGameModuleView() {
    return (
        <div className="h-full flex flex-col p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Bot & O'yinlar</h2>
                    <p className="text-muted-foreground">Telegram bot va o'yin tizimini boshqarish markazi</p>
                </div>
            </div>

            <Tabs defaultValue="bot-users" className="space-y-4 h-full flex flex-col">
                <TabsList className="bg-muted/50 p-1 rounded-lg w-fit">
                    <TabsTrigger value="bot-users" className="flex gap-2 items-center">
                        <Users className="w-4 h-4" />
                        Obunachilar
                    </TabsTrigger>
                    <TabsTrigger value="games" className="flex gap-2 items-center">
                        <Trophy className="w-4 h-4" />
                        Yutuqlar (Prizes)
                    </TabsTrigger>
                    <TabsTrigger value="game-settings" className="flex gap-2 items-center">
                        <Sliders className="w-4 h-4" />
                        Referal & Limitlar
                    </TabsTrigger>
                    <TabsTrigger value="bot-settings" className="flex gap-2 items-center">
                        <Settings className="w-4 h-4" />
                        Bot Sozlamalari
                    </TabsTrigger>
                </TabsList>

                <div className="flex-1 overflow-y-auto border rounded-xl p-4 bg-background shadow-sm">
                    <TabsContent value="bot-users" className="mt-0 h-full">
                        <BotUsersView />
                    </TabsContent>
                    <TabsContent value="games" className="mt-0 h-full">
                        <GamesView />
                    </TabsContent>
                    <TabsContent value="game-settings" className="mt-0 h-full">
                        <GameSettingsView />
                    </TabsContent>
                    <TabsContent value="bot-settings" className="mt-0 h-full">
                        <BotSettingsView />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    )
}
