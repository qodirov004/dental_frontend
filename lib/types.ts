export interface Customer {
  id: string
  name: string
  phone: string
  email?: string
  address?: string
  createdAt?: Date
  created_at?: string | Date
  updatedAt?: Date
  updated_at?: string | Date
  pets: Pet[]
  has_telegram?: boolean
  debt_amount?: number
}

export interface Pet {
  id: string
  customerId: string
  name: string
  species: string
  breed?: string
  gender?: "M" | "F" | "UNKNOWN"
  birthDate?: string | Date
  birth_date?: string | Date
  age?: number
  weight?: number
  color?: string
  microchip?: string
  createdAt?: Date
  created_at?: string | Date
  updatedAt?: Date
  updated_at?: string | Date
  medicalRecords: MedicalRecord[]
  visits: Visit[]
}

export interface Visit {
  id: string
  petId: string
  date: Date
  vetNotes: string
  diagnosis?: string
  symptoms?: string[]
  services: Service[]
  invoiceId?: string
  followUpDate?: Date
  additional_conditions?: string
}

export interface MedicalRecord {
  id: string
  petId: string
  date: Date
  recordType: "DIAGNOSIS" | "TREATMENT" | "SURGERY" | "VACCINATION" | "OTHER" | "diagnoz" | "prokurator" | "dori" | "surgiya" | "basqa"
  description: string
  vetName: string
  followUpDate?: Date
  additional_conditions?: string
  attachments?: string[]
}

export interface Service {
  id: string
  name: string
  price: number
  category: "inspection" | "treatment" | "vaccination" | "surgery" | "other"
}

export interface Invoice {
  id: string
  visitId: string
  customerId: string
  date: Date
  totalAmount: number
  services: Service[]
  payments: Payment[]
  status: "paid" | "partial" | "unpaid"
  dueDate?: Date
  petName?: string
  notes?: string
}

export interface Payment {
  id: string
  invoiceId: string
  amount: number
  date: Date
  method: "cash" | "card" | "transfer" | "other"
  notes?: string
}

export interface Debt {
  id: string
  customerId: string
  invoiceId: string
  amount: number
  daysOverdue: number
  status: "active" | "overdue" | "closed"
}

export interface KPIStats {
  period: string;
  total_visits: number;
  total_revenue: number;
  avg_rating: number;
  critical_cases_handled: number;
}

export interface ProductBatch {
  id: number;
  product_name: string;
  batch_id: string;
  expiry_date: string;
  days_left: number;
  quantity: number;
  status: "CRITICAL" | "WARNING" | "NOTICE" | "SAFE";
}

export interface AnalysisTemplate {
  id: number;
  title: string;
  indicators_schema: any[];
}

export interface Prescription {
  id: number;
  medical_record: number;
  notes: string;
  created_at: string;
  items: PrescriptionItem[];
}

export interface Product {
  id: number
  name: string
  price: string
  description: string
  image: string | null
  stock: number
  category: string
  discount_percent: number
}

export interface PrescriptionItem {
  id: number;
  drug_name: string;
  dosage: string;
  duration_days: number;
  morning: boolean;
  afternoon: boolean;
  evening: boolean;
  instruction: string;
}
