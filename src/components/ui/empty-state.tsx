/**
 * empty-state.tsx
 *
 * Empty state placeholder shown when a list, queue, or result set is empty.
 * Used by: upload queue (Sprint 04), results panel (Sprint 15), etc.
 *
 * Usage:
 *   <EmptyState
 *     icon={<Upload className="h-8 w-8" />}
 *     title="No files yet"
 *     description="Drop files here or click to browse."
 *     action={<Button>Upload files</Button>}
 *   />
 */

import * as React from "react";
import { cn } from "@/lib/utils";

// =============================================================================
// EmptyState
// =============================================================================

interface EmptyStateProps {
  /** Icon shown above the title (e.g. a lucide icon node) */
  icon?: React.ReactNode;
  /** Primary label */
  title: string;
  /** Secondary descriptive text */
  description?: string;
  /** CTA button or link (optional) */
  action?: React.ReactNode;
  /** Additional className for the container */
  className?: string;
  /** Size of the empty state block */
  size?: "sm" | "default" | "lg";
}

const paddingMap = {
  sm:      "py-8",
  default: "py-16",
  lg:      "py-24",
};

const iconSizeMap = {
  sm:      "h-10 w-10 text-muted-foreground/40",
  default: "h-14 w-14 text-muted-foreground/40",
  lg:      "h-20 w-20 text-muted-foreground/30",
};

function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  size = "default",
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 text-center",
        paddingMap[size],
        className
      )}
      role="status"
      aria-label={title}
    >
      {/* Icon container — subtle glow ring */}
      {icon && (
        <div
          className={cn(
            "flex items-center justify-center rounded-2xl",
            "bg-muted/50 border border-border",
            size === "sm"      ? "h-12 w-12 rounded-xl" :
            size === "default" ? "h-16 w-16" : "h-20 w-20 rounded-3xl",
          )}
          aria-hidden="true"
        >
          <span className={iconSizeMap[size]}>{icon}</span>
        </div>
      )}

      {/* Text */}
      <div className="flex flex-col gap-1.5 max-w-xs">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {description && (
          <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
        )}
      </div>

      {/* Action */}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}

// =============================================================================
// Preset variants for common use cases
// =============================================================================

/** Queue is empty — shown in the upload zone area */
function EmptyQueue({ onUpload }: { onUpload?: () => void }) {
  return (
    <EmptyState
      icon={
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
          />
        </svg>
      }
      title="No files added yet"
      description="Drag and drop images, videos, or audio files here, or click to browse."
      action={
        onUpload ? (
          <button
            onClick={onUpload}
            className="text-xs text-[oklch(0.75_0.18_293)] hover:underline underline-offset-4 transition-colors"
          >
            Browse files →
          </button>
        ) : undefined
      }
    />
  );
}

/** No results after processing */
function EmptyResults() {
  return (
    <EmptyState
      icon={
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75a2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z"
          />
        </svg>
      }
      title="No results yet"
      description="Process your files to see the cleaned results here."
    />
  );
}

/** Error — failed to load */
function EmptyError({ onRetry }: { onRetry?: () => void }) {
  return (
    <EmptyState
      icon={
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
          />
        </svg>
      }
      title="Something went wrong"
      description="An unexpected error occurred. Please try again."
      action={
        onRetry ? (
          <button
            onClick={onRetry}
            className="text-xs text-[oklch(0.75_0.18_293)] hover:underline underline-offset-4 transition-colors"
          >
            Try again →
          </button>
        ) : undefined
      }
    />
  );
}

export { EmptyState, EmptyQueue, EmptyResults, EmptyError };
