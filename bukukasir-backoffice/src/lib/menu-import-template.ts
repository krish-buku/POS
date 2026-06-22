export interface TemplateRow {
  category: string
  name: string
  description: string
  price: number
  imageUrl?: string
  available?: string
}

export const TEMPLATE_ROWS: TemplateRow[] = [
  { category: 'Minuman', name: 'Es Teh Manis', description: 'Teh hitam diseduh dengan gula, disajikan dingin', price: 8000, available: 'yes' },
  { category: 'Minuman', name: 'Es Jeruk', description: 'Perasan jeruk segar dengan es batu', price: 10000, available: 'yes' },
  { category: 'Minuman', name: 'Kopi Susu Gula Aren', description: 'Espresso, susu segar, sirup gula aren', price: 18000, available: 'yes' },
  { category: 'Minuman', name: 'Air Mineral', description: 'Botol 600ml', price: 5000, available: 'yes' },
  { category: 'Makanan', name: 'Nasi Goreng Spesial', description: 'Nasi goreng dengan ayam, telur, acar, kerupuk', price: 28000, available: 'yes' },
  { category: 'Makanan', name: 'Mie Ayam Bakso', description: 'Mie ayam dengan bakso sapi dan pangsit', price: 25000, available: 'yes' },
  { category: 'Makanan', name: 'Soto Ayam', description: 'Kuah bening rempah dengan ayam suwir dan soun', price: 22000, available: 'yes' },
  { category: 'Makanan', name: 'Ayam Geprek Sambal Matah', description: 'Ayam goreng digeprek dengan sambal matah khas Bali', price: 26000, available: 'yes' },
  { category: 'Makanan Ringan', name: 'Pisang Goreng', description: 'Pisang kepok goreng tepung renyah, 4 pcs', price: 12000, available: 'yes' },
  { category: 'Makanan Ringan', name: 'Kentang Goreng', description: 'French fries dengan saus sambal dan mayo', price: 18000, available: 'yes' },
  { category: 'Makanan Ringan', name: 'Roti Bakar Cokelat Keju', description: 'Roti tawar panggang isi cokelat dan keju parut', price: 15000, available: 'yes' },
  { category: 'Paket', name: 'Paket Hemat Nasi Goreng', description: 'Nasi goreng + es teh manis + kerupuk', price: 32000, available: 'yes' },
  { category: 'Paket', name: 'Paket Ngopi Santai', description: 'Kopi susu gula aren + pisang goreng', price: 26000, available: 'yes' },
  { category: 'Makanan', name: 'Grilled Chicken Rice Bowl', description: 'Grilled chicken thigh, rice, salad, teriyaki sauce', price: 35000, available: 'yes' },
  { category: 'Minuman', name: 'Matcha Latte (Iced)', description: 'Ceremonial grade matcha with fresh milk, iced', price: 22000, available: 'no' },
]

export const TEMPLATE_HEADERS: (keyof TemplateRow)[] = [
  'category',
  'name',
  'description',
  'price',
  'imageUrl',
  'available',
]

export function buildCsv(): string {
  const esc = (v: unknown) => {
    const s = v == null ? '' : String(v)
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const lines = [TEMPLATE_HEADERS.join(',')]
  for (const row of TEMPLATE_ROWS) {
    lines.push(TEMPLATE_HEADERS.map((h) => esc((row as any)[h])).join(','))
  }
  return lines.join('\n') + '\n'
}
