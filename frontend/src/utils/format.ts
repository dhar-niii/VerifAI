export { clsx as cn } from 'clsx';

export function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const date = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const time = d.toLocaleTimeString('en-GB', { hour12: false });
  return `${date} • ${time}`;
}

export function formatDateOnly(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatLatency(ms: number): string {
  return `${(ms / 1000).toFixed(2)}s`;
}

export function statusLabel(status: 'verified' | 'suspicious' | 'invalid'): string {
  if (status === 'verified') return '✓ VERIFIED (CLEARED)';
  if (status === 'suspicious') return '⚠ SUSPICIOUS (MANUAL REVIEW)';
  return '✕ INVALID (FORGERY DETECTED)';
}

export function statusShort(status: 'verified' | 'suspicious' | 'invalid'): string {
  if (status === 'verified') return '✓ Verified';
  if (status === 'suspicious') return '⚠ Suspicious';
  return '✕ Invalid';
}

export function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, value));
}
