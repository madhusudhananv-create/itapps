export function statusPillClass(status: string): string {
  return 'status-pill status-' + status.toLowerCase().replace(/\s+/g, '-');
}
