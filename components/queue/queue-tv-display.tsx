"use client"

import { useState, useEffect } from "react"
import { ClinicAPI } from "@/services/api"

export function QueueTVDisplay() {
  const [currentItem, setCurrentItem] = useState<any | null>(null)
  const [nextItems, setNextItems] = useState<any[]>([])
  const [time, setTime] = useState<string>("")

  useEffect(() => {
    fetchQueue()
    const interval = setInterval(fetchQueue, 5000) // Poll every 5 seconds

    const clockInterval = setInterval(() => {
      setTime(new Date().toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit", second: "2-digit" }))
    }, 1000)

    return () => {
      clearInterval(interval)
      clearInterval(clockInterval)
    }
  }, [])

  const fetchQueue = async () => {
    try {
      const res = await ClinicAPI.getVisits()
      const queue = Array.isArray(res.data) ? res.data : []

      const called = queue.find((q: any) => q.status === "CALLED" || q.status === "IN_PROGRESS")
      const waiting = queue.filter((q: any) => q.status === "WAITING")

      setCurrentItem(called || null)
      setNextItems(waiting) // Show all waiting items
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#0f172a] text-white flex flex-col p-8 font-sans overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 px-6 bg-white/5 p-6 rounded-2xl backdrop-blur-md border border-white/10">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-4xl shadow-lg shadow-blue-500/20">🦷</div>
          <div>
            <h1 className="text-5xl font-black tracking-tighter text-blue-400">DENTALCLINIC <span className="text-white font-light">PRO</span></h1>
            <p className="text-blue-200/60 font-bold tracking-[0.3em] text-sm">ELEKTRON NAVBAT TIZIMI</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-5xl font-mono font-bold tracking-widest text-blue-400">{time}</p>
          <p className="text-sm text-white/40 uppercase tracking-[0.2em] font-bold">Bugun: {new Date().toLocaleDateString("uz-UZ")}</p>
        </div>
      </div>

      {/* Main Content Split Area */}
      <div className="flex-1 grid grid-cols-12 gap-8 overflow-hidden">

        {/* LEFT: Current Serving (Col 8) - High Visibility */}
        <div className="col-span-8 flex flex-col gap-6">
          <div className="bg-gradient-to-br from-indigo-600 via-blue-700 to-blue-900 rounded-[3rem] p-12 flex-1 flex flex-col items-center justify-center text-center shadow-2xl border-4 border-white/10 relative overflow-hidden group">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-[100px] animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/10 rounded-full -ml-32 -mb-32 blur-[80px]"></div>

            {currentItem ? (
              <div className="relative z-10 w-full animate-in fade-in zoom-in duration-700">
                <div className="inline-block px-8 py-3 bg-white/20 rounded-full backdrop-blur-xl mb-12 border border-white/30 shadow-xl">
                  <span className="text-2xl font-black uppercase tracking-[0.3em]">
                    {currentItem.status === "CALLED" ? "🔔 CHAQIRILMOQDA" : "⚕️ QABULDA"}
                  </span>
                </div>

                <div className="mb-12 flex flex-col items-center">
                  <p className="text-[18rem] leading-none font-black text-white drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] tracking-tighter">
                    {currentItem.queue_number}
                  </p>
                  <div className="mt-4 px-10 py-4 bg-black/30 rounded-3xl border border-white/10 backdrop-blur-md">
                    <p className="text-4xl font-bold text-blue-300 uppercase tracking-widest">
                      {currentItem.veterinarian_room ? `${currentItem.veterinarian_room}-XONA` : "KABINETGA KIRING"}
                    </p>
                  </div>
                </div>

                <div className="space-y-6 w-full">
                  <p className="text-8xl font-black text-white uppercase tracking-tight truncate px-4">
                    {currentItem.pet_name}
                  </p>
                  
                  <div className="flex items-center justify-center gap-6">
                    <div className="h-[2px] w-16 bg-blue-400/50"></div>
                    <p className="text-4xl font-bold text-blue-100">{currentItem.customer_name}</p>
                    <div className="h-[2px] w-16 bg-blue-400/50"></div>
                  </div>
                  
                  {(currentItem.veterinarian_first_name || currentItem.veterinarian_name) && (
                    <div className="mt-8 bg-white/10 py-6 px-12 rounded-[2.5rem] inline-flex items-center gap-6 border border-white/20 shadow-2xl backdrop-blur-xl">
                       <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-4xl shadow-lg border-2 border-white/20">👨‍⚕️</div>
                       <div className="text-left">
                         <p className="text-lg font-bold text-blue-300 uppercase tracking-widest leading-none mb-1">Qabul qiluvchi shifokor:</p>
                         <p className="text-5xl font-black text-white">
                           {currentItem.veterinarian_first_name 
                             ? `${currentItem.veterinarian_first_name} ${currentItem.veterinarian_last_name || ''}`
                             : currentItem.veterinarian_name}
                         </p>
                       </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center opacity-40">
                <p className="text-5xl mb-8 font-black tracking-widest">NAVABAT KUTILMOQDA</p>
                <div className="w-32 h-32 border-8 border-dashed border-white/30 rounded-full mx-auto animate-spin-slow flex items-center justify-center">
                  <span className="text-4xl">🦷</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Waiting List (Col 4) */}
        <div className="col-span-4 flex flex-col bg-white/5 rounded-[2.5rem] border border-white/10 overflow-hidden backdrop-blur-md shadow-xl">
          <div className="p-8 border-b border-white/10 bg-white/5 flex items-center justify-between">
            <h2 className="text-2xl font-black uppercase tracking-widest text-blue-300">KEYINGI NAVBATLAR</h2>
            <span className="bg-blue-600 text-sm font-black px-4 py-2 rounded-full border border-blue-400/50 shadow-lg">
              {nextItems.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
            {nextItems.length > 0 ? (
              nextItems.map((item, idx) => (
                <div
                  key={item.id}
                  className="bg-white/10 hover:bg-white/15 border border-white/10 rounded-3xl p-6 transition-all duration-300 flex items-center gap-6 group"
                >
                  <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center text-4xl font-black shadow-lg group-hover:scale-105 transition-transform border border-white/20">
                    {item.queue_number?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-2xl font-black truncate text-white">{item.queue_number}</p>
                    <p className="text-lg text-white/50 truncate font-bold uppercase tracking-wide">{item.pet_name}</p>
                  </div>
                  <div className="text-blue-400 text-sm font-black bg-blue-400/10 px-3 py-1 rounded-lg border border-blue-400/20">
                    {idx + 1}
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-white/20 text-center p-12">
                <div className="text-6xl mb-4">📋</div>
                <p className="text-xl font-bold italic">Hozircha navbatda hech kim yo'q</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Footer Ticker */}
      <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center text-white/40 font-bold uppercase tracking-widest">
        <div className="flex gap-12">
          <p className="flex items-center gap-3"><span className="text-blue-400 text-xl">📍</span> DentalClinic Pro Markazi</p>
          <p className="flex items-center gap-3"><span className="text-blue-400 text-xl">📞</span> +998 71 200 00 00</p>
        </div>
        <div className="flex items-center gap-3 bg-blue-500/10 px-6 py-2 rounded-full border border-blue-500/20">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <p className="text-xs text-blue-300">Tizim Online</p>
        </div>
      </div>
    </div>
  )
}
