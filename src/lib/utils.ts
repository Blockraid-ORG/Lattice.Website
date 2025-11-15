import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const cutString = (data: string, count: number) => {
  const F = data.slice(0, count || 3);
  const L = data.slice(-count);
  return F ? `${F}...${L}` : "-";
};

export function NumberComma(data: number) {
  const r = new Intl.NumberFormat("en-US", {
    currency: "USD",
  });
  return r.format(data);
}

// Format number with thousand separators for display
export function formatNumberWithCommas(value: string | number): string {
  if (!value && value !== 0) return "";
  const numStr = String(value).replace(/,/g, "");
  const num = parseFloat(numStr);
  if (isNaN(num)) return "";
  return new Intl.NumberFormat("en-US").format(num);
}

// Parse formatted number back to raw number
// export function parseFormattedNumber(value: string): string {
//   if (!value) return "";
//   return value.replace(/,/g, "");
// }

export function parseFormattedNumber(value: string): string {
  if (!value) return "";

  // Hapus semua karakter kecuali angka dan titik desimal
  let sanitized = value.replace(/[^0-9.]/g, "");

  // Pastikan hanya 1 titik desimal
  const parts = sanitized.split(".");
  if (parts.length > 2) {
    sanitized = parts[0] + "." + parts.slice(1).join(""); // gabungkan sisa bagian setelah titik kedua
  }

  // Hapus nol di depan jika bukan "0." (tetap pertahankan angka desimal kecil seperti 0.001)
  if (!sanitized.startsWith("0.")) {
    sanitized = sanitized.replace(/^0+/, "");
    if (sanitized === "") sanitized = "0";
  }

  return sanitized;
}

export const toUrlAsset = (path: string) => {
  if (path.startsWith("http")) {
    return path;
  } else {
    const baseUrl = process.env.BASE_URL;
    return `${baseUrl}/${path}`;
  }
};

export function toSeconds(value: number, unit: string): number {
  const secondsInDay = 24 * 60 * 60;
  const secondsInMonth = 30 * secondsInDay;

  if (unit.toLowerCase() === 'day') {
    return value * secondsInDay;
  } else if (unit.toLowerCase() === 'month') {
    return value * secondsInMonth;
  } else {
    throw new Error('Invalid unit: must be "day" or "month"');
  }
}

export function safeDivide(a:number, b:number) {
  if (b === 0) return 0; // kalau pembagi 0, kembalikan 0
  const result = a / b;
  return Number.isNaN(result) ? 0 : result; // kalau NaN juga balikin 0
}
