/**
 * Format a number as Indonesian Rupiah (IDR)
 * @param amount - The amount to format
 * @returns Formatted string like "Rp 25.000"
 */
export function formatRupiah(amount: number | null | undefined): string {
  const n = typeof amount === 'number' && isFinite(amount) ? amount : 0;
  const formatted = Math.abs(n)
    .toFixed(0)
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return n < 0 ? `-Rp ${formatted}` : `Rp ${formatted}`;
}

/**
 * Format a date to Indonesian locale string
 * @param date - Date string or Date object
 * @returns Formatted date like "28 Mar 2026"
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (!(d instanceof Date) || isNaN(d.getTime())) return '-';
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
  ];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * Format a time to HH:MM
 * @param date - Date string or Date object
 * @returns Formatted time like "14:30"
 */
export function formatTime(date: string | Date | null | undefined): string {
  if (!date) return '--:--';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (!(d instanceof Date) || isNaN(d.getTime())) return '--:--';
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Format elapsed time in minutes and seconds
 * @param startTime - Start time as Date or ISO string
 * @returns Formatted elapsed time like "5m 30s"
 */
export function formatElapsed(startTime: string | Date | null | undefined): string {
  if (!startTime) return '0m 0d';
  const start = typeof startTime === 'string' ? new Date(startTime) : startTime;
  if (!(start instanceof Date) || isNaN(start.getTime())) return '0m 0d';
  const now = new Date();
  const diffMs = Math.max(0, now.getTime() - start.getTime());
  const diffMin = Math.floor(diffMs / 60000);
  const diffSec = Math.floor((diffMs % 60000) / 1000);

  if (diffMin >= 60) {
    const hours = Math.floor(diffMin / 60);
    const mins = diffMin % 60;
    return `${hours}j ${mins}m`;
  }

  return `${diffMin}m ${diffSec}d`;
}

/**
 * Get elapsed minutes from a start time
 * @param startTime - Start time as Date or ISO string
 * @returns Elapsed minutes as a number
 */
export function getElapsedMinutes(
  startTime: string | Date | null | undefined
): number {
  if (!startTime) return 0;
  const start = typeof startTime === 'string' ? new Date(startTime) : startTime;
  if (!(start instanceof Date) || isNaN(start.getTime())) return 0;
  const now = new Date();
  return Math.max(0, Math.floor((now.getTime() - start.getTime()) / 60000));
}

/**
 * Generate an order number
 * @returns Order number like "ORD-20260328-001"
 */
export function generateOrderNumber(): string {
  const now = new Date();
  const dateStr = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}`;
  const random = Math.floor(Math.random() * 999) + 1;
  return `ORD-${dateStr}-${random.toString().padStart(3, '0')}`;
}
