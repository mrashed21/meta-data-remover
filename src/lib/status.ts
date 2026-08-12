import type { FileStatus, MediaFile } from "./types";

/** All valid FileStatus values in logical pipeline order */
export const FILE_STATUS_ORDER: FileStatus[] = [
  "queued",
  "processing",
  "done",
  "error",
];

/** Human-readable labels for each status */
export const FILE_STATUS_LABELS: Record<FileStatus, string> = {
  queued: "Waiting",
  processing: "Processing",
  done: "Completed",
  error: "Failed",
};

export function canTransition(from: FileStatus, to: FileStatus): boolean {
  const allowed: Partial<Record<FileStatus, FileStatus[]>> = {
    queued: ["processing"],
    processing: ["done", "error"],
    error: ["queued", "processing"],
    done: [],
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

export function clampProgress(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function statusToProgress(status: FileStatus): number {
  const map: Record<FileStatus, number> = {
    queued: 0,
    processing: 50,
    done: 100,
    error: 0,
  };
  return map[status];
}

export interface BatchStats {
  total: number;
  queued: number;
  processing: number;
  completed: number;
  failed: number;
  remaining: number;
  percent: number;
  allDone: boolean;
  hasFailures: boolean;
}

export function computeBatchStats(files: MediaFile[]): BatchStats {
  const total = files.length;
  const queued = files.filter((f) => f.status === "queued").length;
  const processing = files.filter((f) => f.status === "processing").length;
  const completed = files.filter((f) => f.status === "done").length;
  const failed = files.filter((f) => f.status === "error").length;
  const remaining = queued + processing;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    total,
    queued,
    processing,
    completed,
    failed,
    remaining,
    percent,
    allDone: total > 0 && remaining === 0,
    hasFailures: failed > 0,
  };
}

export function hasProcessableFiles(files: MediaFile[]): boolean {
  return files.some((f) => f.status === "queued" || f.status === "error");
}

export function hasDownloadableFiles(files: MediaFile[]): boolean {
  return files.some((f) => f.status === "done" && f.result !== null);
}

export function getDownloadableFiles(files: MediaFile[]): MediaFile[] {
  return files.filter((f) => f.status === "done" && f.result !== null);
}

export function getRetryableFiles(files: MediaFile[]): MediaFile[] {
  return files.filter((f) => f.status === "error");
}

export function getPendingFiles(files: MediaFile[]): MediaFile[] {
  return files.filter((f) => f.status === "queued");
}

export interface SavingsStats {
  totalOriginalBytes: number;
  totalProcessedBytes: number;
  totalSavedBytes: number;
  savedPercent: number;
  totalMetadataFieldsRemoved: number;
}

export function computeSavingsStats(files: MediaFile[]): SavingsStats {
  const completed = files.filter((f) => f.status === "done" && f.result);

  let totalOriginalBytes = 0;
  let totalProcessedBytes = 0;
  let totalMetadataFieldsRemoved = 0;

  for (const f of completed) {
    if (!f.result) continue;
    totalOriginalBytes += f.result.stats.originalSize;
    totalProcessedBytes += f.result.stats.processedSize;
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
