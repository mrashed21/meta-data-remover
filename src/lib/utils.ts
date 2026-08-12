import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

let fileCounter = 0;
let lastTimeStr = "";

export function generateOutputFilename(ext: string): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  
  const timeStr = `${year}${month}${day}-${h}${m}${s}`;
  
  if (timeStr === lastTimeStr) {
    fileCounter++;
  } else {
    lastTimeStr = timeStr;
    fileCounter = 0;
  }
  
  // Format: mrashed21-YYYYMMDD-HHMMSS.ext
  // In case of rapid generation within the same second, append -01, -02, etc.
  const suffix = fileCounter > 0 ? `-${String(fileCounter).padStart(2, '0')}` : "";
  
  // Clean extension (remove leading dot if present)
  const cleanExt = ext.replace(/^\./, '').toLowerCase();
  
  return `mrashed21-${timeStr}${suffix}.${cleanExt}`;
}
