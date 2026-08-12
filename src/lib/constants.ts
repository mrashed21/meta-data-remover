/**
 * constants.ts
 *
 * Application-wide constants organized by domain.
 *
 * Sections:
 *  1. Processing defaults (image settings, sliders)
 *  2. File types and MIME (backward compat + new)
 *  3. UI configuration (labels, animation, limits)
 *  4. Output format mappings
 *  5. EXIF category display config
 *
 * DEPRECATED exports are kept for backward compatibility with existing
 * components. New code should use media-types.ts or metadata-config.ts.
 */

import type { ProcessingOptions } from "./types";

// =============================================================================
// 1. Processing defaults
// =============================================================================

/**
 * Default settings for the legacy ProcessingOptions (image-only mode).
 * Used by the existing settings panel until Sprint 12 replaces it.
 */
export const DEFAULT_PROCESSING_OPTIONS: ProcessingOptions = {
  mode:            "fast",
  privacyMode:     "privacy-clean",
  format:          "jpeg",
  quality:         95,
  microCrop:       0,
  colorShift:      0,
  noiseInjection:  0,
  globalResize: {
    maintainAspectRatio: true,
  },
};

/**
 * Slider range configuration for the settings panel.
 * Sprint 12 settings UI will import these for consistent range validation.
 */
export const SLIDER_CONFIG = {
  quality:        { min: 80,  max: 100, step: 1,   unit: "%" },
  microCrop:      { min: 0,   max: 5,   step: 1,   unit: "px" },
  colorShift:     { min: -1,  max: 1,   step: 0.1, unit: "%" },
  noiseInjection: { min: 0,   max: 1,   step: 0.1, unit: "%" },
} as const;

/**
 * Preset quality levels for the quick-select quality UI.
 */
export const QUALITY_PRESETS = {
  high:   { label: "High",   value: 95 },
  medium: { label: "Medium", value: 85 },
  low:    { label: "Low",    value: 80 },
} as const;

// =============================================================================
// 2. File types and MIME mappings
// =============================================================================

/**
 * @deprecated Use `ALL_SUPPORTED_TYPES` from `./media-types` instead.
 * Kept for backward compatibility with existing upload components.
 */
export const SUPPORTED_FILE_TYPES: Record<string, string[]> = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png":  [".png"],
  "image/webp": [".webp"],
  "image/gif":  [".gif"],
};

/**
 * Accept string for the legacy file input element (image-only).
 * Sprint 04 will replace this with a media-type-aware accept string.
 */
export const IMAGE_ACCEPT_STRING = Object.keys(SUPPORTED_FILE_TYPES).join(",");

/**
 * @deprecated Use `MAX_FILE_SIZE` record from `./media-types` instead.
 * The flat value here only covers images. Kept for backward compat.
 */
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

/**
 * Maximum number of files that can be queued at once.
 */
export const MAX_QUEUE_SIZE = 50;

// =============================================================================
// 3. Output format mappings
// =============================================================================

export const FORMAT_LABELS: Record<string, string> = {
  jpeg: "JPG",
  png:  "PNG",
  webp: "WebP",
};

export const FORMAT_MIME: Record<string, string> = {
  jpeg: "image/jpeg",
  png:  "image/png",
  webp: "image/webp",
};

/**
 * All available output format options for the format selector.
 */
export const OUTPUT_FORMAT_OPTIONS = [
  { value: "jpeg" as const, label: "JPG",  description: "Best for photos" },
  { value: "png"  as const, label: "PNG",  description: "Lossless, best for graphics" },
  { value: "webp" as const, label: "WebP", description: "Modern format, smallest size" },
];

// =============================================================================
// 4. EXIF category display config
// =============================================================================

/**
 * Display configuration for EXIF/metadata field categories.
 * Used by the metadata inspector (Sprint 14) and file result cards.
 */
export const EXIF_CATEGORIES = {
  camera:   { label: "Camera Info", color: "blue"   },
  location: { label: "Location",    color: "red"    },
  ai:       { label: "AI Tags",     color: "purple" },
  software: { label: "Software",    color: "yellow" },
  other:    { label: "Other",       color: "zinc"   },
} as const;

// =============================================================================
// 5. UI configuration
// =============================================================================

/**
 * Consistent animation durations (ms) used across Motion components.
 * Keeps animations visually unified without per-component magic numbers.
 */
export const ANIMATION_MS = {
  fast:   150,
  normal: 300,
  slow:   500,
} as const;

/**
 * Consistent animation easing presets for Framer Motion transitions.
 */
export const ANIMATION_EASE = {
  default: [0.4, 0, 0.2, 1] as const,
  enter:   [0, 0, 0.2, 1]   as const,
  exit:    [0.4, 0, 1, 1]   as const,
} as const;

/**
 * Breakpoints matching Tailwind CSS defaults.
 * Used in resize-observer hooks to determine layout.
 */
export const BREAKPOINTS = {
  sm:  640,
  md:  768,
  lg:  1024,
  xl:  1280,
  xxl: 1536,
} as const;

/**
 * Page title template. Interpolate with the page name:
 *   `My Page | ${TITLE_TEMPLATE}` → "My Page | mrashed21 Media Processor"
 */
export const TITLE_TEMPLATE = "mrashed21 Media Processor";

/**
 * Shared accessible aria-labels for common actions.
 * Sprint 07 a11y task will use these to ensure consistent labelling.
 */
export const ARIA_LABELS = {
  uploadZone:    "Upload files — drag and drop or click to browse",
  removeFile:    "Remove file from queue",
  downloadFile:  "Download processed file",
  downloadAll:   "Download all as ZIP",
  processAll:    "Process all queued files",
  retryFile:     "Retry processing this file",
  clearQueue:    "Remove all files from queue",
  compareSlider: "Drag to compare original and processed image",
} as const;
