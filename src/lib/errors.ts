/**
 * errors.ts
 *
 * Centralized error handling for the processing pipeline.
 *
 * Responsibilities:
 *  - Convert raw JS errors / API failures to typed ProcessingError
 *  - Map HTTP status codes to user-friendly messages
 *  - Categorize abort / cancellation separately from real failures
 *  - Provide a single entry point so no component ever formats raw errors
 *
 * Rule: technical details (stack traces, raw messages) NEVER reach the UI.
 * They are captured in `error.technical` for console logging only.
 */

import type { ProcessingError, ProcessingErrorCode } from "./types";
import { createProcessingError } from "./media-types";

// =============================================================================
// Convert unknown thrown values to ProcessingError
// =============================================================================

/**
 * Convert any thrown value (Error, string, unknown) into a ProcessingError.
 * This is the primary conversion used inside try/catch blocks.
 *
 * Special handling:
 *  - AbortError → CANCELLED (not a real failure, should not show error state)
 *  - Network errors → NETWORK_ERROR with offline-aware messaging
 *  - Everything else → PROCESSING_FAILED
 */
export function toProcessingError(err: unknown): ProcessingError {
  if (err instanceof DOMException && err.name === "AbortError") {
    return createProcessingError(
      "CANCELLED",
      "Processing was cancelled.",
      "AbortError"
    );
  }

  if (err instanceof TypeError && err.message.includes("fetch")) {
    return createProcessingError(
      "NETWORK_ERROR",
      "Could not reach the processing server. Please check your connection and try again.",
      err.message
    );
  }

  if (err instanceof Error) {
    return classifyError(err.message, err.message);
  }

  if (typeof err === "string") {
    return classifyError(err, err);
  }

  return createProcessingError(
    "UNKNOWN",
    "An unexpected error occurred. Please try again.",
    String(err)
  );
}

/**
 * Convert an API HTTP response error to a ProcessingError.
 * Reads the JSON body if available for a server-provided message.
 */
export async function fromApiResponse(
  response: Response
): Promise<ProcessingError> {
  let serverMessage: string | undefined;

  try {
    const body = await response.json();
    serverMessage = typeof body?.error === "string" ? body.error : undefined;
  } catch {
    // Body was not JSON — ignore
  }

  return fromHttpStatus(response.status, serverMessage);
}

/**
 * Convert an HTTP status code to a ProcessingError.
 * `serverMessage` is a technical detail, never shown directly to the user.
 */
export function fromHttpStatus(
  status: number,
  serverMessage?: string
): ProcessingError {
  const technical = serverMessage
    ? `HTTP ${status}: ${serverMessage}`
    : `HTTP ${status}`;

  if (status === 400) {
    return createProcessingError(
      "UNSUPPORTED_FILE",
      serverMessage ?? "This file could not be processed. Please check the file format.",
      technical
    );
  }

  if (status === 413) {
    return createProcessingError(
      "FILE_TOO_LARGE",
      "This file is too large for server processing.",
      technical
    );
  }

  if (status === 422) {
    return createProcessingError(
      "CORRUPTED_FILE",
      "The file appears to be corrupted or invalid.",
      technical
    );
  }

  if (status >= 500) {
    return createProcessingError(
      "PROCESSING_FAILED",
      "The processing server encountered an error. Please try again.",
      technical
    );
  }

  return createProcessingError(
    "PROCESSING_FAILED",
    "Processing failed. Please try again.",
    technical
  );
}

// =============================================================================
// User-facing messages by error code
// =============================================================================

/**
 * Return a user-friendly title for an error code.
 * Used in Toast notifications and file card error badges.
 */
export function getErrorTitle(code: ProcessingErrorCode): string {
  const titles: Record<ProcessingErrorCode, string> = {
    UNSUPPORTED_FILE: "Unsupported File",
    FILE_TOO_LARGE:   "File Too Large",
    EMPTY_FILE:       "Empty File",
    CORRUPTED_FILE:   "Corrupted File",
    PROCESSING_FAILED:"Processing Failed",
    CANCELLED:        "Cancelled",
    NETWORK_ERROR:    "Connection Error",
    UNKNOWN:          "Unexpected Error",
  };
  return titles[code] ?? "Error";
}

/**
 * Return true if the error code represents a cancellation (not a failure).
 * Cancelled files should show a neutral state, not a red error state.
 */
export function isCancellation(error: ProcessingError): boolean {
  return error.code === "CANCELLED";
}

/**
 * Return true if the error is retryable (user may click Retry).
 * Non-retryable errors (empty file, unsupported type) won't benefit from retry.
 */
export function isRetryable(error: ProcessingError): boolean {
  const nonRetryable: ProcessingErrorCode[] = [
    "UNSUPPORTED_FILE",
    "FILE_TOO_LARGE",
    "EMPTY_FILE",
    "CANCELLED",
  ];
  return !nonRetryable.includes(error.code);
}

// =============================================================================
// Logging — never expose technical details to the UI
// =============================================================================

/**
 * Log an error to the console for debugging.
 * The technical field is included here; it is NEVER sent to the UI.
 */
export function logError(context: string, error: ProcessingError): void {
  console.error(
    `[${context}] ${error.code}: ${error.message}`,
    error.technical ? `\n  Technical: ${error.technical}` : ""
  );
}

// =============================================================================
// Helpers
// =============================================================================

/**
 * Pattern-match common error messages to appropriate error codes.
 * Avoids leaking raw technical messages to users.
 */
function classifyError(message: string, technical: string): ProcessingError {
  const lower = message.toLowerCase();

  if (lower.includes("corrupt") || lower.includes("invalid image") || lower.includes("unsupported")) {
    return createProcessingError("CORRUPTED_FILE", "The file appears to be corrupted or in an unsupported format.", technical);
  }

  if (lower.includes("size") || lower.includes("too large") || lower.includes("limit")) {
    return createProcessingError("FILE_TOO_LARGE", "The file exceeds the allowed size limit.", technical);
  }

  if (lower.includes("fetch") || lower.includes("network") || lower.includes("offline")) {
    return createProcessingError("NETWORK_ERROR", "A network error occurred. Please check your connection.", technical);
  }

  return createProcessingError(
    "PROCESSING_FAILED",
    "Processing failed. Please try again or use a different file.",
    technical
  );
}
