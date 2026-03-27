export interface Appointment {
  id: string
  scheduled_at: string
  supplier: 'A' | 'B' | 'C'
  product_line: 'Camisetas' | 'Pantalones' | 'Zapatos' | 'Accesorios'
  status: 'Programada' | 'En proceso' | 'Entregada' | 'Cancelada'
  delivered_at: string | null
  observations: string
  created_by: number
  created_by_username: string
  created_at: string
  updated_at: string
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface ReportResult {
  product_line: string
  total_deliveries: number
  avg_hours: number
  avg_minutes: number
}