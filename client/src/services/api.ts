import {
  User,
  Medicine,
  Pharmacy,
  InventoryItem,
  Reservation,
  NotificationItem,
  GenericAlternative,
  ExtractedMedicine
} from '../types/index.js';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('medifind_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers = options.body instanceof FormData
    ? {
        ...(localStorage.getItem('medifind_token')
          ? { Authorization: `Bearer ${localStorage.getItem('medifind_token')}` }
          : {})
      }
    : {
        ...getAuthHeaders(),
        ...options.headers
      };

  const response = await fetch(url, {
    ...options,
    headers
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `HTTP Error ${response.status}`);
  }

  return data;
}

// Authentication API
export const authApi = {
  login: (email: string, password: string) =>
    request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),

  register: (data: any) =>
    request<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  getMe: () => request<{ user: User }>('/auth/me'),

  getDemoAccounts: () =>
    request<{ users: any[]; defaultPassword: string }>('/auth/demo-accounts')
};

// Medicines API
export const medicineApi = {
  search: (q: string, category?: string, emergency?: boolean) => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (category) params.set('category', category);
    if (emergency) params.set('emergency', 'true');
    return request<{ count: number; medicines: Medicine[] }>(`/medicines/search?${params.toString()}`);
  },

  getById: (id: string) =>
    request<{ medicine: Medicine; stats: any }>(`/medicines/${id}`),

  getAlternatives: (id: string) =>
    request<{
      original_medicine: Medicine;
      disclaimer: string;
      alternatives: GenericAlternative[];
    }>(`/medicines/${id}/alternatives`),

  getCategories: () =>
    request<{ categories: { category: string; count: number }[] }>('/medicines/categories')
};

// Pharmacies API
export const pharmacyApi = {
  getNearby: (options: {
    lat?: number;
    lng?: number;
    medicineId?: string;
    q?: string;
    emergency?: boolean;
    sortBy?: 'distance' | 'price' | 'availability';
    maxRadius?: number;
  }) => {
    const params = new URLSearchParams();
    if (options.lat) params.set('lat', options.lat.toString());
    if (options.lng) params.set('lng', options.lng.toString());
    if (options.medicineId) params.set('medicineId', options.medicineId);
    if (options.q) params.set('q', options.q);
    if (options.emergency) params.set('emergency', 'true');
    if (options.sortBy) params.set('sortBy', options.sortBy);
    if (options.maxRadius) params.set('maxRadius', options.maxRadius.toString());

    return request<{
      count: number;
      user_location: { latitude: number; longitude: number };
      medicine_id: string | null;
      pharmacies: Pharmacy[];
    }>(`/pharmacies/nearby?${params.toString()}`);
  },

  getById: (id: string) =>
    request<{ pharmacy: Pharmacy; stats: any; inventory: InventoryItem[] }>(`/pharmacies/${id}`)
};

// Inventory API (Pharmacy staff)
export const inventoryApi = {
  getMyInventory: (q?: string, status?: string) => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (status) params.set('status', status);
    return request<{ summary: any; inventory: InventoryItem[] }>(`/inventory/my?${params.toString()}`);
  },

  updateItem: (id: string, updates: { quantity?: number; price?: number; low_stock_threshold?: number }) =>
    request<{ message: string; item: any }>(`/inventory/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    }),

  addItem: (medicine_id: string, quantity: number, price: number) =>
    request<{ message: string; id: string; availability_status: string }>('/inventory/add', {
      method: 'POST',
      body: JSON.stringify({ medicine_id, quantity, price })
    })
};

// Reservations API
export const reservationApi = {
  create: (data: { pharmacy_id: string; medicine_id: string; quantity: number; notes?: string }) =>
    request<{ message: string; reservation: any }>('/reservations', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  getMyReservations: () =>
    request<{ reservations: Reservation[] }>('/reservations/my'),

  getPharmacyReservations: (status?: string) => {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    return request<{ counts: any; reservations: Reservation[] }>(`/reservations/pharmacy?${params.toString()}`);
  },

  updateStatus: (id: string, status: string, rejection_reason?: string) =>
    request<{ message: string; reservation: any }>(`/reservations/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, rejection_reason })
    })
};

// Prescription OCR API
export const prescriptionApi = {
  upload: (formData: FormData) =>
    request<{
      message: string;
      prescription_id: string;
      file_name: string;
      raw_text: string;
      detected_medicines: ExtractedMedicine[];
      disclaimer: string;
    }>('/prescriptions/upload', {
      method: 'POST',
      body: formData
    }),

  searchAvailability: (medicine_ids: string[], lat?: number, lng?: number) =>
    request<{
      requested_count: number;
      pharmacies: any[];
    }>('/prescriptions/search-availability', {
      method: 'POST',
      body: JSON.stringify({ medicine_ids, lat, lng })
    })
};

// Notifications & Alerts API
export const notificationApi = {
  getMyNotifications: () =>
    request<{ unread_count: number; notifications: NotificationItem[] }>('/notifications'),

  markAsRead: (id: string = 'all') =>
    request<{ message: string }>(`/notifications/${id}/read`, {
      method: 'PATCH'
    }),

  subscribeStockAlert: (medicine_id: string, pharmacy_id?: string) =>
    request<{ message: string; alert_id?: string }>('/notifications/alerts/subscribe', {
      method: 'POST',
      body: JSON.stringify({ medicine_id, pharmacy_id })
    })
};

// Admin API
export const adminApi = {
  getStats: () => request<{ stats: any }>('/admin/stats'),

  getAnalytics: () =>
    request<{
      topOutages: any[];
      statusDistribution: any[];
      pharmacyPerformance: any[];
      demandTrend: any[];
    }>('/admin/analytics'),

  getPharmacies: () => request<{ pharmacies: any[] }>('/admin/pharmacies'),

  toggleVerification: (id: string, is_verified: boolean) =>
    request<{ message: string }>(`/admin/pharmacies/${id}/verify`, {
      method: 'PATCH',
      body: JSON.stringify({ is_verified })
    }),

  createMedicine: (data: any) =>
    request<{ message: string; id: string }>('/admin/medicines', {
      method: 'POST',
      body: JSON.stringify(data)
    })
};

// System Health API
export const systemApi = {
  getHealth: () =>
    request<{ status: string; service: string; timestamp: string; version: string }>('/health')
};
