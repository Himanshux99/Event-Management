import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const neuBadgeVariants = cva(
  "inline-flex items-center px-3 py-1 font-semibold text-sm border-[2px] border-foreground rounded-full transition-all",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground shadow-neu-sm",
        primary: "bg-primary text-primary-foreground shadow-neu-sm",
        secondary: "bg-secondary text-secondary-foreground shadow-neu-sm",
        accent: "bg-accent text-accent-foreground shadow-neu-sm",
        success: "bg-success text-success-foreground shadow-neu-sm",
        destructive: "bg-destructive text-destructive-foreground shadow-neu-sm",
        warning: "bg-warning text-warning-foreground shadow-neu-sm",
        outline: "bg-transparent text-foreground",
      },
      size: {
        default: "px-3 py-1 text-sm",
        sm: "px-2 py-0.5 text-xs",
        lg: "px-4 py-1.5 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface NeuBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof neuBadgeVariants> {}

const NeuBadge = React.forwardRef<HTMLSpanElement, NeuBadgeProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <span
        className={cn(neuBadgeVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
NeuBadge.displayName = "NeuBadge";

export { NeuBadge, neuBadgeVariants };
