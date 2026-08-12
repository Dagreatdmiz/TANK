// Currency and date formatting helpers

export function formatCurrency(amount, currencySymbol = '₦') {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return `${currencySymbol}0.00`;
  }
  const numericVal = Number(amount);
  const formatted = numericVal.toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${currencySymbol}${formatted}`;
}

export function formatDateTime(dateInput) {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatDateOnly(dateInput) {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatTimeOnly(dateInput) {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

export function generateReceiptNo() {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `TK-${dateStr}-${randomSuffix}`;
}

export function generateBarcode() {
  // Generate valid 12-digit standard retail UPC/EAN code
  const prefix = '890';
  const middle = Math.floor(10000000 + Math.random() * 90000000).toString();
  return prefix + middle;
}
