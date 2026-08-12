import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 select-none",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground shadow",
        secondary: "border-border bg-muted text-muted-foreground",
        outline: "border-border bg-transparent text-foreground/80",

        brand:
          "border-[oklch(0.55_0.27_293/0.3)] bg-[oklch(0.55_0.27_293/0.12)] text-[oklch(0.75_0.18_293)]",

        purple:
          "border-[oklch(0.55_0.27_293/0.3)] bg-[oklch(0.55_0.27_293/0.12)] text-[oklch(0.75_0.18_293)]",

        success:
          "border-[oklch(0.62_0.17_162/0.3)] bg-[oklch(0.62_0.17_162/0.12)] text-[oklch(0.72_0.17_162)]",

        warning:
          "border-[oklch(0.75_0.17_70/0.3)] bg-[oklch(0.75_0.17_70/0.12)] text-[oklch(0.80_0.15_70)]",

        destructive:
          "border-[oklch(0.45_0.20_25/0.3)] bg-[oklch(0.45_0.20_25/0.12)] text-[oklch(0.70_0.20_25)]",

        processing:
          "border-[oklch(0.55_0.27_293/0.3)] bg-[oklch(0.55_0.27_293/0.12)] text-[oklch(0.75_0.18_293)] animate-pulse",
      },

      size: {
        sm: "text-[10px] px-2 py-px",
        default: "text-xs   px-2.5 py-0.5",
        lg: "text-sm   px-3 py-1 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
