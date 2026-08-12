import * as React from "react";
import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  // Base styles — shared by all variants
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "rounded-lg text-sm font-medium",
    "transition-all duration-150 ease-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-50",
    "active:scale-[0.97]",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        // ─── Default — white/dark filled (shadcn default) ───────────────────
        default:
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",

        // ─── Brand — violet filled, primary CTA ─────────────────────────────
        brand: [
          "bg-[oklch(0.55_0.27_293)] text-white",
          "shadow-[0_2px_12px_oklch(0.55_0.27_293/0.35)]",
          "hover:bg-[oklch(0.60_0.27_293)]",
          "hover:shadow-[0_4px_20px_oklch(0.55_0.27_293/0.45)]",
        ],

        // ─── Brand gradient — violet→fuchsia, premium CTA ───────────────────
        gradient: [
          "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white",
          "shadow-[0_2px_16px_oklch(0.55_0.27_293/0.35)]",
          "hover:from-violet-500 hover:to-fuchsia-500",
          "hover:shadow-[0_4px_24px_oklch(0.55_0.27_293/0.50)]",
        ],

        // ─── Brand outline — violet border, transparent ─────────────────────
        "brand-outline": [
          "border border-[oklch(0.55_0.27_293/0.5)] bg-transparent",
          "text-[oklch(0.75_0.18_293)]",
          "hover:bg-[oklch(0.55_0.27_293/0.1)]",
          "hover:border-[oklch(0.55_0.27_293/0.8)]",
        ],

        // ─── Success — emerald filled ────────────────────────────────────────
        success: [
          "bg-[oklch(0.62_0.17_162)] text-white",
          "shadow-[0_2px_12px_oklch(0.62_0.17_162/0.30)]",
          "hover:bg-[oklch(0.67_0.17_162)]",
          "hover:shadow-[0_4px_20px_oklch(0.62_0.17_162/0.40)]",
        ],

        // ─── Destructive ─────────────────────────────────────────────────────
        destructive:
          "bg-destructive text-white shadow-sm hover:bg-destructive/90",

        // ─── Secondary — zinc-800 surface ────────────────────────────────────
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",

        // ─── Outline — zinc border, transparent ─────────────────────────────
        outline: [
          "border border-border bg-transparent",
          "text-foreground/80",
          "hover:bg-muted hover:text-foreground",
        ],

        // ─── Ghost — no border, subtle hover ────────────────────────────────
        ghost:
          "text-foreground/70 hover:bg-muted hover:text-foreground",

        // ─── Link — text only ────────────────────────────────────────────────
        link:
          "text-[oklch(0.75_0.18_293)] underline-offset-4 hover:underline",
      },

      size: {
        sm:      "h-8  px-3  text-xs  rounded-md  gap-1.5",
        default: "h-10 px-4  text-sm",
        lg:      "h-12 px-6  text-base rounded-xl",
        xl:      "h-14 px-8  text-lg  rounded-xl  gap-3",
        "icon-sm": "h-8  w-8  rounded-md  p-0",
        icon:    "h-10 w-10 p-0",
        "icon-lg": "h-12 w-12 rounded-xl p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size:    "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  /** Show a loading spinner and disable the button */
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, children, ...props }, ref) => {
    const Comp = asChild ? Slot.Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={loading || props.disabled}
        aria-busy={loading}
        {...props}
      >
        {loading ? (
          <>
            {/* Spinner */}
            <svg
              className="animate-spin h-4 w-4 shrink-0"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12" cy="12" r="10"
                stroke="currentColor" strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            {children}
          </>
        ) : children}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
