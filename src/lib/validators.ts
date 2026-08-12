/**
 * validators.ts
 *
 * File validation utilities for the upload pipeline.
 * All validation logic lives here — no raw error strings scattered across
 * the codebase. Returns typed ProcessingError | null so callers get
 * structured errors with user-friendly messages and optional technical detail.
 *
 * Used by: upload zone (Sprint 04), API routes.
 */

import type { MediaFile, MediaType, ProcessingError } from "./types";
import {
  getMediaType,
  isSupportedMimeType,
  isWithinSizeLimit,
  isNonEmptyFile,
  getSupportedType,
  MAX_FILE_SIZE,
  formatBytes,
} from "./media-types";
import { createProcessingError } from "./media-types";

// =============================================================================
// Single-file validation
// =============================================================================

/**
 * Validate a single File before adding it to the processing queue.
 *
 * Checks (in order):
 *  1. Non-empty (size > 0)
 *  2. MIME type is in the supported registry
 *  3. File size is within the limit for its media type
 *  4. File extension is consistent with the declared MIME type
 *
 * Returns null on success, or a ProcessingError describing the failure.
 * The `message` field is always user-friendly.
 * The `technical` field contains raw details for console/debugging only.
 */
export function validateFile(file: File): ProcessingError | null {
  // 1. Empty file check
  if (!isNonEmptyFile(file)) {
    return createProcessingError(
      "EMPTY_FILE",
      "This file is empty and cannot be processed.",
      `File size is 0 bytes: ${file.name}`
    );
  }

  // 2. MIME type support check
  if (!isSupportedMimeType(file.type)) {
    return createProcessingError(
      "UNSUPPORTED_FILE",
      `"${getReadableType(file.type)}" files are not supported. Please upload an image, video, or audio file.`,
      `Unsupported MIME type: ${file.type || "(empty)"} — file: ${file.name}`
    );
  }

  // 3. File size limit check
  const mediaType = getMediaType(file) as MediaType;
  if (!isWithinSizeLimit(file, mediaType)) {
    const limit = formatBytes(MAX_FILE_SIZE[mediaType]);
    const size = formatBytes(file.size);
    return createProcessingError(
      "FILE_TOO_LARGE",
      `This file is too large (${size}). The limit for ${mediaType} files is ${limit}.`,
      `File size ${file.size} exceeds limit ${MAX_FILE_SIZE[mediaType]} for ${mediaType}: ${file.name}`
    );
  }

  // 4. Extension / MIME consistency check (warns about mismatches)
  const extensionError = validateExtension(file);
  if (extensionError) return extensionError;

  return null;
}

/**
 * Check whether a file is a duplicate of one already in the queue.
 * Duplicate detection is based on filename + size + lastModified.
 * This combination is a reliable heuristic without reading file content.
 *
 * Returns a ProcessingError if the file is a duplicate, null otherwise.
 */
export function validateNotDuplicate(
  file: File,
  queue: MediaFile[]
): ProcessingError | null {
  const isDuplicate = queue.some(
    (queued) =>
      queued.file.name === file.name &&
      queued.file.size === file.size &&
      queued.file.lastModified === file.lastModified
  );

  if (isDuplicate) {
    return createProcessingError(
      "UNSUPPORTED_FILE",
      `"${file.name}" is already in the queue.`,
      `Duplicate file detected: ${file.name} (${file.size} bytes, ${file.lastModified})`
    );
  }

  return null;
}

// =============================================================================
// Batch validation
// =============================================================================

export interface ValidationResult {
  valid: File[];
  errors: Array<{ file: File; error: ProcessingError }>;
}

/**
 * Validate a batch of files against the current queue.
 * Returns two lists: files that passed, and files that failed with their errors.
 * Duplicate detection is performed against both the existing queue and
 * files already validated within the same batch.
 */
export function validateBatch(
  files: File[],
  existingQueue: MediaFile[]
): ValidationResult {
  const valid: File[] = [];
  const errors: Array<{ file: File; error: ProcessingError }> = [];

  // Build a working queue that grows as valid files are accepted,
  // so duplicates within the same batch are also caught.
  const workingQueue: MediaFile[] = [...existingQueue];

  for (const file of files) {
    // Check for duplicate against existing queue + accepted batch files
    const dupError = validateNotDuplicate(file, workingQueue);
    if (dupError) {
      errors.push({ file, error: dupError });
      continue;
    }

    const fileError = validateFile(file);
    if (fileError) {
      errors.push({ file, error: fileError });
      continue;
    }

    valid.push(file);

    // Add a stub entry so subsequent files in this batch can detect it as a dupe
    workingQueue.push({
      id: `pending-${file.name}-${file.size}`,
      file,
      mediaType: getMediaType(file) ?? "image",
      preview: null,
      status: "queued",
      progress: 0,
      result: null,
      metadataBefore: [],
    });
  }

  return { valid, errors };
}

// =============================================================================
// Helpers
// =============================================================================

/**
 * Validate that the file extension is consistent with the declared MIME type.
 * This catches renamed files (e.g. a .jpg renamed to .png).
 */
function validateExtension(file: File): ProcessingError | null {
  const registryEntry = getSupportedType(file.type);
  if (!registryEntry) return null; // Already caught by MIME check above

  const filename = file.name.toLowerCase();
  const hasValidExtension = registryEntry.extensions.some((ext) =>
    filename.endsWith(ext)
  );

  // Some files have no extension at all — allow those through;
  // the MIME type is the authoritative source.
  const hasAnyExtension = filename.includes(".");

  if (hasAnyExtension && !hasValidExtension) {
    return createProcessingError(
      "UNSUPPORTED_FILE",
      `The file "${file.name}" has an extension that doesn't match its detected type (${registryEntry.label}). Please check the file.`,
      `Extension mismatch: file "${file.name}" declared as ${file.type}, expected one of ${registryEntry.extensions.join(", ")}`
    );
  }

  return null;
}

/**
 * Convert a raw MIME type string to a human-readable label.
 * Falls back to just the type portion if unrecognised.
 */
function getReadableType(mime: string): string {
  if (!mime) return "Unknown";
  const entry = getSupportedType(mime);
  if (entry) return entry.label;
  // e.g. "application/pdf" → "PDF"
  const [, subtype] = mime.split("/");
  return subtype?.toUpperCase() ?? mime;
}
