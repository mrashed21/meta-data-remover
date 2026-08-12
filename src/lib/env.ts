/**
 * env.ts
 *
 * Type-safe environment variable accessor.
 *
 * Rules:
 *  - All env access goes through this module — never read process.env directly
 *    in components, API routes, or lib files.
 *  - NEXT_PUBLIC_* values are available client- and server-side.
 *  - Non-prefixed values are server-only (reading them client-side returns undefined).
 *  - Required variables without a default throw clearly at startup.
 *  - All values are validated and typed here; consumers get typed strings/numbers.
 *
 * See: .env.example for all supported variables and their defaults.
 */

// =============================================================================
// Helpers
// =============================================================================

/**
 * Read a NEXT_PUBLIC env variable with an optional default.
 * Throws if the variable is required but missing.
 */
function getPublic(key: string, defaultValue?: string): string {
  const value = process.env[key] ?? defaultValue;
  if (value === undefined) {
    throw new Error(
      `[env] Required environment variable "${key}" is not set. ` +
      `Add it to .env.local (see .env.example).`
    );
  }
  return value;
}

/**
 * Read a server-only env variable with an optional default.
 * Throws if the variable is required but missing.
 */
function getServer(key: string, defaultValue?: string): string {
  if (typeof window !== "undefined") {
    // This function is called client-side — return the default silently
    // rather than exposing server-only keys to the browser.
    return defaultValue ?? "";
  }
  const value = process.env[key] ?? defaultValue;
  if (value === undefined) {
    throw new Error(
      `[env] Required server-only environment variable "${key}" is not set. ` +
      `Add it to .env.local (see .env.example).`
    );
  }
  return value;
}

// =============================================================================
// Public environment (client + server)
// =============================================================================

/** Public URL of the deployed site, no trailing slash */
export const SITE_URL = getPublic(
  "NEXT_PUBLIC_SITE_URL",
  "http://localhost:3000"
);

/** App display name shown in navbar, page titles, OG meta */
export const APP_NAME = getPublic(
  "NEXT_PUBLIC_APP_NAME",
  "mrashed21 Media Processor"
);

/** Creator name injected into metadata in Mode B (Sprint 10) */
export const CREATOR_NAME = getPublic(
  "NEXT_PUBLIC_CREATOR_NAME",
  "Muhammad Rashed"
);

/** Software name injected into metadata in Mode B (Sprint 10) */
export const SOFTWARE_NAME = getPublic(
  "NEXT_PUBLIC_SOFTWARE_NAME",
  "ZeroMeta"
);

/** GitHub repository URL for the navbar link */
export const GITHUB_URL = getPublic(
  "NEXT_PUBLIC_GITHUB_URL",
  "https://github.com/mrashed21/meta-data-remover"
);

// =============================================================================
// Server-only environment
// =============================================================================

/**
 * Maximum concurrent sharp operations.
 * Returns undefined if unset — sharp auto-detects based on CPU cores.
 */
export function getSharpConcurrency(): number | undefined {
  const raw = getServer("SHARP_CONCURRENCY", "");
  if (!raw) return undefined;
  const n = parseInt(raw, 10);
  return isNaN(n) || n < 1 ? undefined : n;
}

/**
 * Maximum upload file size in bytes (server-side guard).
 * Defaults to 50 MB if not set.
 */
export function getMaxUploadBytes(): number {
  const raw = getServer("MAX_UPLOAD_BYTES", "");
  if (!raw) return 50 * 1024 * 1024;
  const n = parseInt(raw, 10);
  return isNaN(n) || n < 1 ? 50 * 1024 * 1024 : n;
}

// =============================================================================
// Derived values
// =============================================================================

/** True when running in production (Next.js sets NODE_ENV). */
export const IS_PRODUCTION = process.env.NODE_ENV === "production";

/** True when running in development mode. */
export const IS_DEVELOPMENT = process.env.NODE_ENV === "development";
