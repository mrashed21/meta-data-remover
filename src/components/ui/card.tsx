import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

const cardVariants = cva("rounded-xl border transition-colors duration-200", {
  variants: {
    variant: {
      default: "bg-card border-border shadow-sm",

      elevated:
        "bg-card border-border shadow-[0_4px_24px_oklch(0_0_0/0.30),_0_1px_4px_oklch(0_0_0/0.20)]",

      glass: [
        "bg-card/70 border-border",
        "backdrop-blur-xl backdrop-saturate-150",
        "shadow-sm",
      ],

      brand: [
        "bg-[oklch(0.55_0.27_293/0.06)] border-[oklch(0.55_0.27_293/0.20)]",
        "shadow-sm",
      ],

      success: [
        "bg-[oklch(0.62_0.17_162/0.06)] border-[oklch(0.62_0.17_162/0.20)]",
        "shadow-sm",
      ],

      danger: [
        "bg-[oklch(0.45_0.20_25/0.06)] border-[oklch(0.45_0.20_25/0.20)]",
        "shadow-sm",
      ],

      flat: "bg-muted/40 border-border/50",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface CardProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant }), className)}
      {...props}
    />
  ),
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col gap-1.5 p-5", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-base font-semibold leading-tight tracking-tight text-foreground",
      className,
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground leading-relaxed", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-5 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center gap-3 p-5 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

const CardAction = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("absolute top-3 right-3 flex items-center gap-1", className)}
    {...props}
  />
));
CardAction.displayName = "CardAction";

export {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  cardVariants,
};
