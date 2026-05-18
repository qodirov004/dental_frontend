export type QueueStatus = "waiting" | "called" | "in-progress" | "completed" | "cancelled"
export type QueuePriority = "urgent" | "normal" | "routine"

export interface QueueItem {
  id: string
  customerId: string
  petId: string
  queueNumber: string
  customerName: string
  petName: string
  petSpecies: string
  doctor?: string
  status: QueueStatus
  priority: QueuePriority
  checkinTime: Date
  calledTime?: Date
  estimatedWaitTime: number // minutes
  notes?: string
  service?: string
}

export interface QueueSettings {
  averageServiceTime: number // minutes
  enableTelegramNotifications: boolean
  enableVoiceCall: boolean
  notificationBeforeCall: number // minutes
}
