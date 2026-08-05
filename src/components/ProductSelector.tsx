// Hardcoded product list — no master data needed
export const PRODUCT_LIST = [
  'Inbound',
  'Outbound',
  'Omnichannel',
  'AI QA Scoring',
  'Human Resource',
]

export interface ProductEntry {
  [name: string]: string // product name -> free text notes
}

interface Props {
  value: ProductEntry
  onChange: (val: ProductEntry) => void
}

export default function ProductSelector({ value, onChange }: Props) {
  const toggle = (name: string) => {
    if (value[name] !== undefined) {
      // deselect
      const next = { ...value }
      delete next[name]
      onChange(next)
    } else {
      // select
      onChange({ ...value, [name]: '' })
    }
  }

  const setNote = (name: string, note: string) => {
    onChange({ ...value, [name]: note })
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {PRODUCT_LIST.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => toggle(name)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              value[name] !== undefined
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white text-gray-600 border-gray-300'
            }`}
          >
            {name}
          </button>
        ))}
      </div>
      {Object.keys(value).length > 0 && (
        <div className="space-y-2 pt-1">
          {Object.keys(value).map((name) => (
            <div key={name}>
              <label className="text-xs font-medium text-gray-500 mb-1 block">{name}</label>
              <input
                className="input-field py-2 text-sm"
                placeholder={`Detail / catatan untuk ${name}...`}
                value={value[name]}
                onChange={(e) => setNote(name, e.target.value)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Helper: encode ProductEntry to JSON string for storage
export function encodeProducts(val: ProductEntry): string {
  return JSON.stringify(val)
}

// Helper: decode stored string to ProductEntry
// Handles both old format (array) and new format (object)
export function decodeProducts(raw: string): ProductEntry {
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      // old format: ["Kontakami", "Reservation System"]
      const result: ProductEntry = {}
      parsed.forEach((name: string) => { result[name] = '' })
      return result
    }
    if (typeof parsed === 'object' && parsed !== null) {
      return parsed as ProductEntry
    }
  } catch { /* ignore */ }
  return {}
}

// Helper: get product names only (for display)
export function getProductNames(raw: string): string[] {
  return Object.keys(decodeProducts(raw))
}
