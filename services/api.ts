import axios from "axios"

const API_Base_URL = "https://dental.api.ardentsoft.uz/api"

export const api = axios.create({
    baseURL: API_Base_URL,
    headers: {
        "Content-Type": "application/json",
    },
})

// Add auth token interceptor
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Token ${token}`;
    }
    return config
})

export const ClinicAPI = {
    // Customers
    getCustomers: () => api.get("/clinic/customers/"),
    getCustomer: (id: string) => api.get(`/clinic/customers/${id}/`),
    createCustomer: (data: any) => api.post("/clinic/customers/", data),
    updateCustomer: (id: string, data: any) => api.patch(`/clinic/customers/${id}/`, data),
    deleteCustomer: (id: string) => api.delete(`/clinic/customers/${id}/`),
    getStats: () => api.get("/clinic/customers/stats/"),
    sendTelegramMessage: (id: string, message: string) =>
        api.post(`/clinic/customers/${id}/send_telegram/`, { message }),

    // Pets
    getPets: () => api.get("/clinic/pets/"),
    getPet: (id: string) => api.get(`/clinic/pets/${id}/`),
    createPet: (data: any) => api.post("/clinic/pets/", data),
    updatePet: (id: string, data: any) => api.patch(`/clinic/pets/${id}/`, data),
    deletePet: (id: string) => api.delete(`/clinic/pets/${id}/`),

    // Medical Records
    getMedicalRecords: () => api.get("/clinic/medical-records/"),
    createMedicalRecord: (data: any) => api.post("/clinic/medical-records/", data),

    // Visits/Queue
    getVisits: () => api.get("/clinic/visits/"),
    createVisit: (data: any) => api.post("/clinic/visits/", data),
    updateVisit: (id: string, data: any) => api.patch(`/clinic/visits/${id}/`, data),
    completeVisit: (id: string, data: any) => api.post(`/clinic/visits/${id}/complete/`, data),

    // Receipt
    downloadVisitReceipt: (id: string) =>
        api.get(`/clinic/visits/${id}/download_receipt/`, { responseType: 'blob' }),

    downloadTicket: (id: string) =>
        api.post(`/clinic/visits/${id}/download_ticket/`),

    // Feedback
    getFeedbacks: () => api.get("/clinic/feedback/"),

    // Analytics
    getAnalyticsSummary: () => api.get("/clinic/analytics/summary/"),
    getAnalyticsCharts: (days: number = 30) => api.get(`/clinic/analytics/charts/?days=${days}`),
    getStaffPerformance: () => api.get("/clinic/analytics/staff/"),
    getDoctorStats: (period: string = 'month') => api.get(`/clinic/kpi/doctor_stats/?period=${period}`),

    // Users (Staff)
    getUsers: () => api.get("/users/users/"),
    createUser: (data: any) => api.post("/users/users/", data),
    updateUser: (id: number, data: any) => api.patch(`/users/users/${id}/`, data),
    deleteUser: (id: number) => api.delete(`/users/users/${id}/`),
    getDoctorSalaries: (doctorId?: string) => api.get("/users/salaries/", { params: { doctor_id: doctorId } }),
    createDoctorSalary: (data: any) => api.post("/users/salaries/", data),
}

export const BillingAPI = {
    getInvoices: () => api.get("/billing/invoices/"),
    createInvoice: (data: any) => api.post("/billing/invoices/", data),
    getPayments: () => api.get("/billing/payments/"),
    getDebtors: () => api.get("/billing/invoices/debtors/"),
    addPayment: (invoiceId: string, data: any) =>
        api.post(`/billing/invoices/${invoiceId}/add_payment/`, data),
}
// Shop
export const ShopAPI = {
    getProducts: () => api.get("/shop/products/"),
    getOrders: () => api.get("/shop/orders/"),
    createOrder: (data: any) => api.post("/shop/orders/", data),
    getStats: () => api.get("/shop/orders/stats/"),
    updateOrder: (id: number, data: any) => api.patch(`/shop/orders/${id}/`, data),
    notifyAdmin: (id: number) => api.post(`/shop/orders/${id}/notify-admin/`),
    getAlerts: () => api.get("/shop/products/alerts/"),

    // Categories
    getCategories: () => api.get("/shop/categories/"),
    createCategory: (data: any) => api.post("/shop/categories/", data),

    // Receipt
    downloadReceipt: (id: string) =>
        api.get(`/shop/orders/${id}/download_receipt/`, { responseType: 'blob' }),
}

export const GamesAPI = {
    validateCoupon: (code: string) => api.post("/games/validate-coupon/", { code }),
    getSettings: () => api.get("/games/settings/"),
    updateSettings: (data: any) => api.post("/games/settings/", data),
    getReferrals: (params?: any) => api.get("/games/referrals/", { params }),
}
