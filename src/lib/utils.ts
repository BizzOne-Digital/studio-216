import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function formatPrice(value?: number | null) {
  if (value === undefined || value === null) return null;
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

export function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

export function toPlain<T>(doc: unknown): T {
  return JSON.parse(JSON.stringify(doc)) as T;
}

export function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function telHref(phone: string) {
  return `tel:+1${phone.replace(/\D/g, "")}`;
}

export function makeReference(prefix: string) {
  const d = new Date();
  const ymd = `${d.getFullYear().toString().slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `${prefix}-${ymd}-${rand}`;
}
