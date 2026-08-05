export type Role = 'rep' | 'manager' | 'admin'

export interface User {
  id: number
  name: string
  email: string
  password_hash: string
  role: Role
  created_at: string
}

export type VisitStatus = 'new' | 'in_progress' | 'close_deal' | 'lost'

export type LeadSource = 'referral' | 'canvassing' | 'linkedin' | 'relasi' | 'inbound'

export const LEAD_SOURCE_LABELS: Record<LeadSource, string> = {
  referral:   'Referral',
  canvassing: 'Canvassing',
  linkedin:   'LinkedIn',
  relasi:     'Relasi (dapet sendiri)',
  inbound:    'Inbound',
}

export const LEAD_SOURCES: LeadSource[] = ['referral', 'canvassing', 'linkedin', 'relasi', 'inbound']

export interface Visit {
  id: number
  user_id: number
  user_name?: string
  location_name: string
  address: string
  lead_source: LeadSource | ''
  pic_name: string
  pic_phone: string
  pic_email: string
  products: string        // JSON array of product names
  existing_system: string
  website: string
  status: VisitStatus
  interested: number      // 0 = tidak tertarik, 1 = tertarik
  next_follow_up: string  // ISO date string or empty
  notes: string
  photo: string           // base64 data URL or empty
  lat: number | null
  lng: number | null
  created_at: string
}

export interface Product {
  id: number
  name: string
  active: number
  created_at: string
}

export interface CanvassingActivity {
  id: number
  visit_id: number
  user_id: number
  user_name?: string
  tanggal: string       // ISO date string
  catatan: string
  status: VisitStatus | ''  // optional status update for this activity
  photo: string         // base64 data URL or empty
  created_at: string
}

export interface AuthUser {
  id: number
  name: string
  email: string
  role: Role
}

export interface OfflineQueueItem {
  id: string
  type: 'visit'
  payload: Omit<Visit, 'id' | 'synced'>
  created_at: string
}
