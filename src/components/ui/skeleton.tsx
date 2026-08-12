import { cn } from "@/lib/utils";
import * as React from "react";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-muted",
        "before:absolute before:inset-0",
        "before:bg-linear-to-r before:from-transparent before:via-white/5 before:to-transparent",
        "before:animate-[shimmer_2s_linear_infinite]",
        "before:bg-size-[200%_100%]",
        className,
      )}
      aria-hidden="true"
      {...props}
    />
  );
}

interface SpinnerProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  label?: string;
}

const spinnerSizes: Record<NonNullable<SpinnerProps["size"]>, string> = {
  xs: "h-3 w-3 border",
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-8 w-8 border-2",
  xl: "h-12 w-12 border-[3px]",
};

function Spinner({ size = "md", className, label = "Loading…" }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn(
        "inline-block rounded-full border-muted-foreground/20 border-t-[oklch(0.55_0.27_293)] animate-spin",
        spinnerSizes[size],
        className,
      )}
    />
  );
}

function SkeletonFileCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-4 flex gap-3",
        className,
      )}
      aria-hidden="true"
    >
      <Skeleton className="h-16 w-16 shrink-0 rounded-lg" />

      <div className="flex-1 flex flex-col gap-2 py-1">
        <Skeleton className="h-3.5 w-3/4 rounded" />
        <Skeleton className="h-3 w-1/2 rounded" />
        <Skeleton className="h-2 w-full rounded mt-auto" />
      </div>
    </div>
  );
}

function SkeletonStat({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-4 flex flex-col gap-2",
        className,
      )}
      aria-hidden="true"
    >
      <Skeleton className="h-3 w-1/3 rounded" />
      <Skeleton className="h-8 w-1/2 rounded" />
      <Skeleton className="h-2.5 w-2/3 rounded" />
    </div>
  );
}

function LoadingPanel({
  label = "Processing…",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground",
        className,
      )}
      role="status"
      aria-label={label}
    >
      <Spinner size="lg" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export { LoadingPanel, Skeleton, SkeletonFileCard, SkeletonStat, Spinner };
