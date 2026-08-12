import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import * as React from "react";

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
        default: "bg-primary text-primary-foreground hover:bg-[#D8B894]",

        success: [
          "bg-success text-white",
          "shadow-[0_2px_12px_rgba(163,230,53,0.15)]",
          "hover:bg-[#86d628]",
        ],

        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",

        secondary:
          "bg-transparent border border-border text-foreground hover:bg-[#141414]",

        outline: [
          "border border-border bg-transparent",
          "text-foreground",
          "hover:bg-[#141414] hover:text-foreground",
        ],

        ghost: "text-foreground/70 hover:bg-muted hover:text-foreground",

        link: "text-[oklch(0.75_0.18_293)] underline-offset-4 hover:underline",
      },

      size: {
        sm: "h-8  px-3  text-xs  rounded-md  gap-1.5",
        default: "h-10 px-4  text-sm",
        lg: "h-12 px-6  text-base rounded-xl",
        xl: "h-14 px-8  text-lg  rounded-xl  gap-3",
        "icon-sm": "h-8  w-8  rounded-md  p-0",
        icon: "h-10 w-10 p-0",
        "icon-lg": "h-12 w-12 rounded-xl p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, asChild = false, loading, children, ...props },
    ref,
  ) => {
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
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            {children}
          </>
        ) : (
          children
        )}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
