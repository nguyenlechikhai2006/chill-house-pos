import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(amount).replace('₫', 'đ');
}

export function formatDate(dateStr?: string | Date): string {
  if (!dateStr) return '';
  const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(d);
}

export function formatDateTime(dateStr?: string | Date): string {
  if (!dateStr) return '';
  const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(d);
}

export function generateOrderCode(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `CH${year}${month}${day}-${random}`;
}

/**
 * Tạo link VietQR chuẩn Napas 247
 * Cú pháp: https://img.vietqr.io/image/<BANK_BIN>-<ACCOUNT_NO>-compact2.png?amount=<AMOUNT>&addInfo=<INFO>&accountName=<NAME>
 */
export function generateVietQRUrl(params: {
  bankBin: string;
  accountNumber: string;
  amount: number;
  description: string;
  accountName?: string;
}): string {
  const { bankBin, accountNumber, amount, description, accountName } = params;
  const encodedInfo = encodeURIComponent(description);
  const encodedName = accountName ? encodeURIComponent(accountName) : '';
  return `https://img.vietqr.io/image/${bankBin}-${accountNumber}-compact2.png?amount=${Math.round(amount)}&addInfo=${encodedInfo}&accountName=${encodedName}`;
}
