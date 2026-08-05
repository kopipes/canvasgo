import { VisitStatus } from '@/types'

export const STATUS_LABELS: Record<VisitStatus, string> = {
  new:        'New',
  in_progress:'In Progress',
  close_deal: 'Close Deal',
  lost:       'Lost',
}

export const STATUS_COLORS: Record<VisitStatus, string> = {
  new:        'bg-sky-100 text-sky-700',
  in_progress:'bg-yellow-100 text-yellow-800',
  close_deal: 'bg-green-100 text-green-800',
  lost:       'bg-red-100 text-red-700',
}

// Pipeline statuses (for canvassing stage selector — excludes 'new' prospect stage)
export const VISIT_STATUSES: VisitStatus[] = [
  'in_progress',
  'close_deal',
  'lost',
]

// All statuses including prospect
export const ALL_VISIT_STATUSES: VisitStatus[] = [
  'new',
  'in_progress',
  'close_deal',
  'lost',
]

export function formatDate(iso: string): string {
  if (!iso) return '-'
  try {
    return new Date(iso).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}

export function formatDateTime(iso: string): string {
  if (!iso) return '-'
  try {
    return new Date(iso).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

export function compressImage(file: File, maxWidth = 1024, quality = 0.75): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let { width, height } = img
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.onerror = reject
      img.src = e.target?.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}
