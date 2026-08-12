import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const h = String(now.getHours()).padStart(2, "0");
  const m = String(now.getMinutes()).padStart(2, "0");
  const s = String(now.getSeconds()).padStart(2, "0");

  const timeStr = `${year}${month}${day}-${h}${m}${s}`;

  if (timeStr === lastTimeStr) {
    fileCounter++;
  } else {
    lastTimeStr = timeStr;
    fileCounter = 0;
  }

  const suffix =
    fileCounter > 0 ? `-${String(fileCounter).padStart(2, "0")}` : "";

  const cleanExt = ext.replace(/^\./, "").toLowerCase();

  return `mrashed21-${timeStr}${suffix}.${cleanExt}`;
}

export function getImageDimensions(
  file: File,
): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    if (!file.type.startsWith("image/")) {
      resolve(null);
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      resolve(null);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
}

export function calculateAspectRatio(width: number, height: number): string {
  function gcd(a: number, b: number): number {
    return b === 0 ? a : gcd(b, a % b);
  }
  const divisor = gcd(width, height);
  if (divisor === 1 && width > 100 && height > 100) {
    return `${(width / height).toFixed(2)}:1`;
  }
  return `${width / divisor}:${height / divisor}`;
}
