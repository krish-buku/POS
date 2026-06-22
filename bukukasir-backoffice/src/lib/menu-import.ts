export interface ParsedMenuRow {
  rowNumber: number // 1-indexed, matches spreadsheet row including header
  category: string
  name: string
  price: number
  description?: string
}

export interface ParsedMenuRowError {
  rowNumber: number
  message: string
  raw: Record<string, unknown>
}

export interface ParseResult {
  valid: ParsedMenuRow[]
  errors: ParsedMenuRowError[]
  total: number
}

function normalizeKey(k: string): string {
  return k.trim().toLowerCase()
}

function normalizePrice(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value !== 'string') return null
  const digits = value.replace(/[^\d.-]/g, '').replace(/(?<=\d)[.,](?=\d{3}\b)/g, '')
  const n = Number(digits)
  return Number.isFinite(n) ? n : null
}

/**
 * Parse a CSV or XLSX file with columns: category, name, price, description.
 * Loads xlsx via dynamic import so the bundle cost only applies when used.
 */
export async function parseMenuFile(file: File): Promise<ParseResult> {
  const XLSX = await import('xlsx')
  const buf = await file.arrayBuffer()
  const wb = XLSX.read(buf, { type: 'array' })
  const firstSheetName = wb.SheetNames[0]
  if (!firstSheetName) {
    return { valid: [], errors: [], total: 0 }
  }
  const sheet = wb.Sheets[firstSheetName]
  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: '',
    raw: true,
  })

  const valid: ParsedMenuRow[] = []
  const errors: ParsedMenuRowError[] = []

  rawRows.forEach((raw, i) => {
    const rowNumber = i + 2 // +1 for 0-index, +1 for header
    // Normalize keys (case-insensitive)
    const normalized: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(raw)) {
      normalized[normalizeKey(k)] = v
    }

    const category = String(normalized['category'] ?? '').trim()
    const name = String(normalized['name'] ?? '').trim()
    const rawPrice = normalized['price']
    const description = String(normalized['description'] ?? '').trim()

    if (!name) {
      errors.push({ rowNumber, message: 'Missing "name"', raw })
      return
    }
    if (!category) {
      errors.push({ rowNumber, message: 'Missing "category"', raw })
      return
    }
    const price = normalizePrice(rawPrice)
    if (price === null || price < 0) {
      errors.push({ rowNumber, message: `Invalid "price": ${String(rawPrice)}`, raw })
      return
    }

    valid.push({
      rowNumber,
      category,
      name,
      price,
      description: description || undefined,
    })
  })

  return { valid, errors, total: rawRows.length }
}
