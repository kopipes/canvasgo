import { useEffect } from 'react'
import { X } from 'lucide-react'

interface Props {
  src: string
  onClose: () => void
}

export default function PhotoModal({ src, onClose }: Props) {
  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white bg-black/40 rounded-full p-2"
        aria-label="Tutup"
      >
        <X size={22} />
      </button>
      <img
        src={src}
        alt="Foto"
        className="max-w-full max-h-[90vh] rounded-xl object-contain"
        onClick={e => e.stopPropagation()}
      />
    </div>
  )
}
