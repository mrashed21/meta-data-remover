/**
 * status.ts
 *
 * Processing status model — pure functions for status transitions,
 * progress tracking, and batch queue statistics.
 *
 * No React, no side effects. All functions are pure and testable.
 *
 * Used by: batch progress component (Sprint 13), file cards (Sprint 05),
 *          result dashboard (Sprint 15), processing pipeline (page.tsx).
 */

import type { FileStatus, MediaFile } from "./types";

// =============================================================================
// Status constants and ordering
// =============================================================================

/** All valid FileStatus values in logical pipeline order */
export const FILE_STATUS_ORDER: FileStatus[] = [
  "queued",
  "processing",
  "done",
  "error",
];

/** Human-readable labels for each status */
export const FILE_STATUS_LABELS: Record<FileStatus, string> = {
  queued:     "Waiting",
  processing: "Processing",
  done:       "Completed",
  error:      "Failed",
};

// =============================================================================
// Status transition guards
// =============================================================================

/**
 * Returns true if transitioning from `from` to `to` is a valid step.
 * Prevents illegal state jumps (e.g. done → processing).
 *
 * Valid transitions:
 *   queued     → processing
 *   processing → done
 *   processing → error
 *   error      → queued   (retry)
 *   error      → processing (direct retry)
 */
export function canTransition(from: FileStatus, to: FileStatus): boolean {
  const allowed: Partial<Record<FileStatus, FileStatus[]>> = {
    queued:     ["processing"],
    processing: ["done", "error"],
    error:      ["queued", "processing"],
    done:       [],  // terminal — cannot re-process without explicit reset
  };
  return allowed[from]?.includes(to) ?? false;
}

/** Returns true if the file is in a terminal state (done or error). */
export function isTerminal(status: FileStatus): boolean {
  return status === "done" || status === "error";
}

/** Returns true if the file is actively being processed. */
export function isActive(status: FileStatus): boolean {
  return status === "processing";
}

/** Returns true if the file is waiting to be processed. */
export function isPending(status: FileStatus): boolean {
  return status === "queued";
}

/** Returns true if the file can be retried (failed). */
export function isRetryable(status: FileStatus): boolean {
  return status === "error";
}

/** Returns true if the file has been successfully processed. */
export function isComplete(status: FileStatus): boolean {
  return status === "done";
}

// =============================================================================
// Per-file progress helpers
// =============================================================================

/**
 * Clamp a progress value to the valid range 0–100.
 * Prevents out-of-range values from reaching the UI.
 */
export function clampProgress(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

/**
 * Return the expected progress for a given status when exact progress
 * is unknown. Useful for fake/estimated progress states.
 */
export function statusToProgress(status: FileStatus): number {
  const map: Record<FileStatus, number> = {
    queued:     0,
    processing: 50,
    done:       100,
    error:      0,
  };
  return map[status];
}

// =============================================================================
// Batch statistics
// =============================================================================

export interface BatchStats {
  total: number;
  queued: number;
  processing: number;
  completed: number;
  failed: number;
  remaining: number;    // queued + processing
  percent: number;      // completed / total * 100 (0 if total is 0)
  allDone: boolean;     // true when no files are queued or processing
  hasFailures: boolean;
}

/**
 * Compute aggregate statistics for the current file queue.
 * This is the single source of truth for the progress bar and dashboard.
 */
export function computeBatchStats(files: MediaFile[]): BatchStats {
  const total      = files.length;
  const queued     = files.filter((f) => f.status === "queued").length;
  const processing = files.filter((f) => f.status === "processing").length;
  const completed  = files.filter((f) => f.status === "done").length;
  const failed     = files.filter((f) => f.status === "error").length;
  const remaining  = queued + processing;
  const percent    = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    total,
    queued,
    processing,
    completed,
    failed,
    remaining,
    percent,
    allDone:     total > 0 && remaining === 0,
    hasFailures: failed > 0,
  };
}

/**
 * Returns true if there are any files that can be processed
 * (queued or failed/retryable).
 */
export function hasProcessableFiles(files: MediaFile[]): boolean {
  return files.some((f) => f.status === "queued" || f.status === "error");
}

/**
 * Returns true if there are any completed files ready for download.
 */
export function hasDownloadableFiles(files: MediaFile[]): boolean {
  return files.some((f) => f.status === "done" && f.result !== null);
}

/**
 * Returns only the files that are ready for download.
 */
export function getDownloadableFiles(files: MediaFile[]): MediaFile[] {
  return files.filter((f) => f.status === "done" && f.result !== null);
}

/**
 * Returns only the files that failed and can be retried.
 */
export function getRetryableFiles(files: MediaFile[]): MediaFile[] {
  return files.filter((f) => f.status === "error");
}

/**
 * Returns only the files still waiting to be processed.
 */
export function getPendingFiles(files: MediaFile[]): MediaFile[] {
  return files.filter((f) => f.status === "queued");
}

// =============================================================================
// Savings statistics (for result dashboard — Sprint 15)
// =============================================================================

export interface SavingsStats {
  totalOriginalBytes: number;
  totalProcessedBytes: number;
  totalSavedBytes: number;
  savedPercent: number;
  totalMetadataFieldsRemoved: number;
}

/**
 * Aggregate file-size savings and metadata removal counts
 * across all completed files.
 */
export function computeSavingsStats(files: MediaFile[]): SavingsStats {
  const completed = files.filter((f) => f.status === "done" && f.result);

  let totalOriginalBytes        = 0;
  let totalProcessedBytes       = 0;
  let totalMetadataFieldsRemoved = 0;

  for (const f of completed) {
    if (!f.result) continue;
    totalOriginalBytes        += f.result.stats.originalSize;
    totalProcessedBytes       += f.result.stats.processedSize;
    totalMetadataFieldsRemoved += f.result.stats.fieldsRemoved;
  }

  const totalSavedBytes = totalOriginalBytes - totalProcessedBytes;
  const savedPercent =
    totalOriginalBytes > 0
      ? Math.round((totalSavedBytes / totalOriginalBytes) * 100)
      : 0;

  return {
    totalOriginalBytes,
    totalProcessedBytes,
    totalSavedBytes,
    savedPercent,
    totalMetadataFieldsRemoved,
  };
}
