"use client";

import * as React from "react";
import { Progress as ProgressPrimitive } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// =============================================================================
// Track variants
// =============================================================================

const progressTrackVariants = cva(
  "relative w-full overflow-hidden rounded-full bg-[#1C1C1C]",
  {
    variants: {
      size: {
        xs:      "h-1",
        sm:      "h-1.5",
        default: "h-2",
        lg:      "h-3",
        xl:      "h-4",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

// Use `colorScheme` (not `color`) to avoid clash with HTML element's color attribute
const progressIndicatorVariants = cva(
  "h-full w-full flex-1 transition-all duration-500 ease-out rounded-full",
  {
    variants: {
      colorScheme: {
        brand:   "bg-primary shadow-[0_0_8px_rgba(228,199,170,0.30)]",
        success: "bg-[#A3E635] shadow-[0_0_8px_rgba(163,230,53,0.35)]",
        danger:  "bg-gradient-to-r from-red-500 to-orange-500",
        warning: "bg-gradient-to-r from-amber-400 to-yellow-500",
        neutral: "bg-gradient-to-r from-zinc-400 to-zinc-300",
      },
    },
    defaultVariants: {
      colorScheme: "brand",
    },
  }
);

// =============================================================================
// Progress component
// =============================================================================

export interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>,
    VariantProps<typeof progressTrackVariants>,
    VariantProps<typeof progressIndicatorVariants> {
  /** Show the percentage label next to the bar */
  showLabel?: boolean;
  /** Custom label text (overrides the default "N%" label) */
  label?: string;
  /** Indeterminate shimmer animation when progress is unknown */
  indeterminate?: boolean;
}

const Progress = React.forwardRef<
  React.ComponentRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, size, colorScheme, showLabel, label, indeterminate, ...props }, ref) => (
  <div className="flex items-center gap-2 w-full">
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(progressTrackVariants({ size }), "flex-1", className)}
      value={indeterminate ? undefined : value}
      {...props}
    >
      {indeterminate ? (
        /* Indeterminate: sliding shimmer */
        <div
          className={cn(
            "absolute inset-0 -translate-x-full animate-[shimmer_1.5s_ease-in-out_infinite]",
            "bg-gradient-to-r from-transparent via-white/10 to-transparent"
          )}
        />
      ) : (
        <ProgressPrimitive.Indicator
          className={cn(progressIndicatorVariants({ colorScheme }))}
          style={{ transform: `translateX(-${100 - (value ?? 0)}%)` }}
        />
      )}
    </ProgressPrimitive.Root>

    {showLabel && !indeterminate && (
      <span className="text-xs tabular-nums text-muted-foreground w-8 text-right shrink-0">
        {label ?? `${Math.round(value ?? 0)}%`}
      </span>
    )}
  </div>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
