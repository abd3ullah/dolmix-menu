export function formatPrice(price: number): string {
  return new Intl.NumberFormat('ar-IQ', {
    style: 'decimal',
    maximumFractionDigits: 0
  }).format(price) + ' د.ع';
}
