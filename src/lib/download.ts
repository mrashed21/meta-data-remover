/**
 * download.ts
 *
 * Download utilities for single files and batch ZIP exports.
 *
 * Responsibilities:
 *  - Trigger browser file downloads safely (anchor click pattern)
 *  - Manage Object URL lifecycle (create → use → revoke) to prevent memory leaks
 *  - Generate ZIP archives from a set of processed files
 *  - Provide clean download filenames via the filename engine (Sprint 11)
 *
 * Audit issue fixed: Object URLs are always revoked after download triggers.
 * Previously page.tsx created Object URLs without consistent cleanup.
 */

import JSZip from "jszip";
import type { MediaFile } from "./types";

// =============================================================================
// Single file download
// =============================================================================

/**
 * Trigger a browser download for a Blob with the given filename.
 * Creates a temporary Object URL, triggers the download, and revokes
 * the URL after a short delay (required for Firefox compatibility).
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  triggerDownload(url, filename);
  // Revoke after a tick — browser needs the URL to be alive
  // while the download dialog opens (Firefox requires ~100ms)
  setTimeout(() => URL.revokeObjectURL(url), 250);
}

/**
 * Trigger a download from an existing URL (e.g. a pre-existing Object URL).
 * Does NOT revoke the URL — the caller is responsible for cleanup.
 */
export function triggerDownload(url: string, filename: string): void {
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}

/**
 * Download a single processed MediaFile.
 * Uses the result's filename if present, otherwise falls back to the
 * original filename with a "_cleaned" suffix.
 *
 * Returns false if the file has no processed result.
 */
export function downloadMediaFile(file: MediaFile): boolean {
  if (!file.result?.blob) return false;

  const filename = file.result.filename || getFallbackFilename(file);
  downloadBlob(file.result.blob, filename);
  return true;
}

// =============================================================================
// Batch ZIP download
// =============================================================================

export interface ZipResult {
  success: boolean;
  fileCount: number;
  error?: string;
}

/**
 * Create and download a ZIP archive of all completed MediaFiles.
 * Files without a processed result are silently skipped.
 *
 * @param files     - Array of MediaFile entries (only done files are zipped)
 * @param zipName   - The downloaded .zip filename (without extension)
 * @param onProgress - Optional callback receiving 0–100 progress
 */
export async function downloadAsZip(
  files: MediaFile[],
  zipName = "mrashed21-processed",
  onProgress?: (percent: number) => void
): Promise<ZipResult> {
  const completed = files.filter((f) => f.status === "done" && f.result?.blob);

  if (completed.length === 0) {
    return { success: false, fileCount: 0, error: "No completed files to download." };
  }

  try {
    const zip = new JSZip();

    for (const file of completed) {
      if (!file.result?.blob) continue;
      const filename = file.result.filename || getFallbackFilename(file);
      // Ensure unique filenames within the ZIP (append ID suffix if collision)
      const safeFilename = deduplicateZipName(zip, filename);
      zip.file(safeFilename, file.result.blob);
    }

    const blob = await zip.generateAsync(
      { type: "blob", compression: "DEFLATE", compressionOptions: { level: 1 } },
      (metadata) => {
        onProgress?.(Math.round(metadata.percent));
      }
    );

    const timestamp = getTimestampSuffix();
    downloadBlob(blob, `${zipName}-${timestamp}.zip`);

    return { success: true, fileCount: completed.length };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, fileCount: 0, error: message };
  }
}

// =============================================================================
// Object URL lifecycle management
// =============================================================================

/**
 * Create an Object URL for a File or Blob and return it.
 * Track the URL in the provided set so it can be bulk-revoked later.
 *
 * Usage:
 *   const tracked = new Set<string>();
 *   const url = createTrackedObjectUrl(file, tracked);
 *   // ... use url ...
 *   revokeTrackedObjectUrls(tracked); // cleanup
 */
export function createTrackedObjectUrl(
  source: File | Blob,
  tracker: Set<string>
): string {
  const url = URL.createObjectURL(source);
  tracker.add(url);
  return url;
}

/**
 * Revoke all Object URLs in a tracked set and clear the set.
 * Call this on component unmount or when clearing the file queue.
 */
export function revokeTrackedObjectUrls(tracker: Set<string>): void {
  for (const url of tracker) {
    URL.revokeObjectURL(url);
  }
  tracker.clear();
}

/**
 * Revoke a single Object URL if it starts with "blob:".
 * Safe to call with any string — non-blob URLs are ignored.
 */
export function safeRevokeObjectUrl(url: string | null | undefined): void {
  if (url?.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
}

// =============================================================================
// Helpers
// =============================================================================

/**
 * Generate a fallback download filename when the filename engine result
 * is not yet available. Appends "_cleaned" before the extension.
 */
function getFallbackFilename(file: MediaFile): string {
  const original = file.customName || file.file.name;
  const dot = original.lastIndexOf(".");
  if (dot < 0) return `${original}_cleaned`;
  return `${original.slice(0, dot)}_cleaned${original.slice(dot)}`;
}

/**
 * If a filename already exists in the ZIP, append a numeric suffix
 * to make it unique (e.g. "photo_cleaned(2).jpg").
 */
function deduplicateZipName(zip: JSZip, filename: string): string {
  if (!zip.file(filename)) return filename;

  const dot = filename.lastIndexOf(".");
  const base = dot >= 0 ? filename.slice(0, dot) : filename;
  const ext  = dot >= 0 ? filename.slice(dot) : "";

  let counter = 2;
  let candidate = `${base}(${counter})${ext}`;
  while (zip.file(candidate)) {
    counter++;
    candidate = `${base}(${counter})${ext}`;
  }
  return candidate;
}

/**
 * Return a YYYYMMDD-HHMMSS timestamp string for use in ZIP filenames.
 */
function getTimestampSuffix(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}` +
    `-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
  );
}
