import { VisitStatus } from '@/types'

export const STATUS_LABELS: Record<VisitStatus, string> = {
  interested:     'Tertarik',
  not_interested: 'Tidak Tertarik',
  follow_up:      'Follow Up',
  closed:         'Closed',
  no_contact:     'Tidak Ada Kontak',
}

export const STATUS_COLORS: Record<VisitStatus, string> = {
  interested:     'bg-green-100 text-green-800',
  not_interested: 'bg-red-100 text-red-800',
  follow_up:      'bg-yellow-100 text-yellow-800',
  closed:         'bg-blue-100 text-blue-800',
  no_contact:     'bg-gray-100 text-gray-700',
}

export const VISIT_STATUSES: VisitStatus[] = [
  'interested',
  'not_interested',
  'follow_up',
  'closed',
  'no_contact',
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
