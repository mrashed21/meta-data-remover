/**
 * filename-engine.ts
 *
 * Generates clean, collision-safe output filenames for processed media files.
 *
 * Format (per plan.md Sprint 11):
 *   mrashed21-YYYYMMDD-HHMMSS.ext
 *   mrashed21-YYYYMMDD-HHMMSS(2).ext   ← collision suffix
 *
 * Examples:
 *   mrashed21-20260812-113025.jpg
 *   mrashed21-20260812-113025.mp4
 *   mrashed21-20260812-113025.mp3
 *
 * Rules:
 *  - Prefix is configurable (default: "mrashed21")
 *  - Date and time are derived from Date.now() at generation time
 *  - Extension is always preserved from the source file (lowercased)
 *  - JPEG files always use ".jpg" (not ".jpeg")
 *  - Unicode filenames are normalized to ASCII-safe equivalents
 *  - Same-second batch: append (2), (3), … to prevent collisions
 *  - No spaces, no special characters in output filename
 */

// =============================================================================
// Configuration
// =============================================================================

export interface FilenameConfig {
  /** Filename prefix (default: "mrashed21") */
  prefix: string;
  /** Separator between parts (default: "-") */
  separator: string;
}

const DEFAULT_CONFIG: FilenameConfig = {
  prefix:    "mrashed21",
  separator: "-",
};

// =============================================================================
// Core generation
// =============================================================================

/**
 * Generate a clean output filename for a processed media file.
 *
 * @param sourceFilename  - Original filename (used to extract extension)
 * @param date            - Timestamp to use (defaults to now)
 * @param config          - Prefix/separator config
 * @returns               - Clean filename string, e.g. "mrashed21-20260812-113025.jpg"
 */
export function generateFilename(
  sourceFilename: string,
  date: Date = new Date(),
  config: FilenameConfig = DEFAULT_CONFIG
): string {
  const ext       = extractCleanExtension(sourceFilename);
  const datePart  = formatDate(date);
  const timePart  = formatTime(date);
  const sep       = config.separator;

  return `${config.prefix}${sep}${datePart}${sep}${timePart}${ext}`;
}

/**
 * Generate filenames for a batch of files processed at the same moment.
 * Files processed within the same second get a collision counter suffix.
 *
 * @param sourceFilenames - Array of original filenames
 * @param date            - Shared timestamp for the batch (defaults to now)
 * @param config          - Prefix/separator config
 * @returns               - Array of unique filenames, same order as input
 */
export function generateBatchFilenames(
  sourceFilenames: string[],
  date: Date = new Date(),
  config: FilenameConfig = DEFAULT_CONFIG
): string[] {
  const seen = new Map<string, number>(); // basename → count of occurrences so far

  return sourceFilenames.map((source) => {
    const base = generateFilename(source, date, config);
    const ext  = extractCleanExtension(source);

    // Strip extension to get the candidate base
    const bareBase = base.slice(0, base.length - ext.length);

    const count = seen.get(bareBase) ?? 0;
    seen.set(bareBase, count + 1);

    if (count === 0) {
      return base; // first occurrence — no suffix needed
    }

    return `${bareBase}(${count + 1})${ext}`;
  });
}

// =============================================================================
// Extension utilities
// =============================================================================

/**
 * Extract and normalize the file extension from a filename.
 * - Returns lower-cased extension including the leading dot
 * - Normalizes ".jpeg" → ".jpg"
 * - Returns ".jpg" as a safe default when no extension is found
 */
export function extractCleanExtension(filename: string): string {
  // Strip query strings or hash fragments (edge case for web-derived filenames)
  const cleanName = filename.split("?")[0].split("#")[0];

  const dot = cleanName.lastIndexOf(".");
  if (dot < 0 || dot === cleanName.length - 1) return ".jpg"; // no extension

  const raw = cleanName.slice(dot).toLowerCase();

  // Normalize aliases
  const aliases: Record<string, string> = {
    ".jpeg": ".jpg",
    ".jfif": ".jpg",
    ".tiff": ".tif",
  };

  return aliases[raw] ?? raw;
}

// =============================================================================
// Sanitization
// =============================================================================

/**
 * Sanitize a user-provided custom filename:
 *  - Normalize Unicode (NFC)
 *  - Replace non-ASCII characters with their ASCII equivalents where possible
 *  - Strip characters that are unsafe in filenames on Windows/macOS/Linux
 *  - Collapse whitespace to underscores
 *  - Trim leading/trailing dots and spaces
 *
 * Does NOT strip the extension — pass only the base name if needed.
 */
export function sanitizeFilename(filename: string): string {
  // Normalize Unicode to NFC first
  let name = filename.normalize("NFC");

  // Transliterate common accented characters to ASCII
  name = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // Replace whitespace with underscores
  name = name.replace(/\s+/g, "_");

  // Remove characters unsafe for filenames (Windows + Unix reserved)
  name = name.replace(/[<>:"/\\|?*\x00-\x1F]/g, "");

  // Collapse multiple underscores/dashes
  name = name.replace(/[_-]{2,}/g, "_");

  // Trim leading/trailing dots, underscores, spaces
  name = name.replace(/^[._\s]+|[._\s]+$/g, "");

  // Windows reserved names (COM1, LPT1, etc.)
  const reserved = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(\..*)?$/i;
  if (reserved.test(name)) {
    name = `_${name}`;
  }

  // If nothing remains after sanitization, provide a safe default
  return name || "processed";
}

/**
 * Validate a custom filename entered by the user.
 * Returns an error message string if invalid, or null if valid.
 */
export function validateCustomFilename(name: string): string | null {
  if (!name.trim()) return "Filename cannot be empty.";
  if (name.length > 255) return "Filename is too long (max 255 characters).";
  if (/[<>:"/\\|?*\x00-\x1F]/.test(name)) {
    return "Filename contains invalid characters.";
  }
  return null;
}

// =============================================================================
// Date/time formatting
// =============================================================================

/** Format a Date as YYYYMMDD */
function formatDate(date: Date): string {
  const y  = date.getFullYear();
  const m  = pad(date.getMonth() + 1);
  const d  = pad(date.getDate());
  return `${y}${m}${d}`;
}

/** Format a Date as HHMMSS */
function formatTime(date: Date): string {
  const h  = pad(date.getHours());
  const mi = pad(date.getMinutes());
  const s  = pad(date.getSeconds());
  return `${h}${mi}${s}`;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}
