export type UserRole = 'user' | 'pharmacy' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  pharmacy_id?: string;
  pharmacy_name?: string;
}

export interface Medicine {
  id: string;
  name: string;
  generic_name: string;
  brand_name: string;
  category: string;
  strength: string;
  dosage_form: string;
  manufacturer: string;
  description: string;
  requires_prescription: number;
  is_emergency: number;
  average_price: number;
  created_at?: string;
}

export interface InventoryItem {
  id: string;
  pharmacy_id: string;
  medicine_id: string;
  quantity: number;
  price: number;
  availability_status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  low_stock_threshold: number;
  last_updated: string;
  medicine_name?: string;
  generic_name?: string;
  brand_name?: string;
  category?: string;
  strength?: string;
  dosage_form?: string;
  requires_prescription?: number;
  is_emergency?: number;
}

export interface Pharmacy {
  id: string;
  user_id?: string;
  name: string;
  license_number: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  phone: string;
  email: string;
  is_verified: number;
  is_24_7: number;
  open_time: string;
  close_time: string;
  rating: number;
  distance_km?: number;
  is_open?: boolean;
  open_status_label?: string;
  inventory?: {
    inventory_id?: string;
    quantity: number;
    price: number;
    availability_status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
    last_updated: string;
    medicine_name?: string;
    generic_name?: string;
    strength?: string;
    dosage_form?: string;
  };
}

export interface Reservation {
  id: string;
  reservation_code: string;
  user_id: string;
  pharmacy_id: string;
  medicine_id: string;
  quantity: number;
  total_price: number;
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'READY_FOR_PICKUP' | 'COMPLETED' | 'CANCELLED';
  pickup_deadline?: string;
  notes?: string;
  rejection_reason?: string;
  created_at: string;
  pharmacy_name?: string;
  pharmacy_address?: string;
  pharmacy_phone?: string;
  pharmacy_lat?: number;
  pharmacy_lng?: number;
  medicine_name?: string;
  medicine_strength?: string;
  medicine_form?: string;
  requires_prescription?: number;
  user_name?: string;
  user_phone?: string;
  user_email?: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'STOCK_ALERT' | 'RESERVATION_UPDATE' | 'SYSTEM';
  is_read: number;
  metadata?: any;
  created_at: string;
}

export interface ExtractedMedicine {
  detected_name: string;
  matched_medicine_id?: string;
  matched_medicine_name?: string;
  dosage?: string;
  confidence: number;
}

export interface GenericAlternative {
  id: string;
  name: string;
  generic_name: string;
  brand_name: string;
  category: string;
  strength: string;
  dosage_form: string;
  manufacturer: string;
  average_price: number;
  lowest_available_price: number;
  in_stock_pharmacies: number;
  is_exact_generic_match: boolean;
  savings_amount: number;
  savings_percent: number;
}
