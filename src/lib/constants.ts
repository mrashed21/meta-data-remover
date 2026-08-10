import type { ProcessingOptions } from "./types";

export const DEFAULT_PROCESSING_OPTIONS: ProcessingOptions = {
  mode: "fast",
  format: "jpeg",
  quality: 95,
  microCrop: 0,
  colorShift: 0,
  noiseInjection: 0,
  globalResize: {
    maintainAspectRatio: true,
  },
};

export const SUPPORTED_FILE_TYPES: Record<string, string[]> = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
  "image/tiff": [".tiff", ".tif"],
};

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export const FORMAT_LABELS: Record<string, string> = {
  jpeg: "JPG",
  png: "PNG",
  webp: "WebP",
};

export const FORMAT_MIME: Record<string, string> = {
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export const SLIDER_CONFIG = {
  quality: { min: 80, max: 100, step: 1, unit: "%" },
  microCrop: { min: 0, max: 5, step: 1, unit: "px" },
  colorShift: { min: -1, max: 1, step: 0.1, unit: "%" },
  noiseInjection: { min: 0, max: 1, step: 0.1, unit: "%" },
} as const;

export const EXIF_CATEGORIES = {
  camera: { label: "Camera Info", color: "blue" },
  location: { label: "Location", color: "red" },
  ai: { label: "AI Tags", color: "purple" },
  software: { label: "Software", color: "yellow" },
  other: { label: "Other", color: "zinc" },
} as const;
