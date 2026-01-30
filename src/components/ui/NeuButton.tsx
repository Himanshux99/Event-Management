import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const neuButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring <focus-visible:ring-offset-1></focus-visible:ring-offset-1> disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground border-[1px] border-foreground rounded-[12px] shadow-neu hover:shadow-neu-lg hover:-translate-x-0.2 hover:-translate-y-0.5 active:shadow-neu-sm active:translate-x-0.5 active:translate-y-0.5",
        secondary:
          "bg-secondary text-secondary-foreground border-[1px] border-foreground rounded-[12px] shadow-neu hover:shadow-neu-lg hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-neu-sm active:translate-x-0.5 active:translate-y-0.5",
        accent:
          "bg-accent text-accent-foreground border-[1px] border-foreground rounded-[12px] shadow-neu hover:shadow-neu-lg hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-neu-sm active:translate-x-0.5 active:translate-y-0.5",
        destructive:
          "bg-destructive text-destructive-foreground border-[1px] border-foreground rounded-[12px] shadow-neu hover:shadow-neu-lg hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-neu-sm active:translate-x-0.5 active:translate-y-0.5",
        outline:
          "bg-background text-foreground border-[1px] border-foreground rounded-[12px] shadow-neu hover:shadow-neu-lg hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-neu-sm active:translate-x-0.5 active:translate-y-0.5",
        ghost:
          "text-foreground border-[1px] border-transparent rounded-[12px] hover:bg-muted",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-12 px-6 py-3 text-base",
        sm: "h-10 px-4 py-2 text-sm",
        lg: "h-14 px-8 py-4 text-lg",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface NeuButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof neuButtonVariants> {
  asChild?: boolean;
}

const NeuButton = React.forwardRef<HTMLButtonElement, NeuButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(neuButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
NeuButton.displayName = "NeuButton";

export { NeuButton, neuButtonVariants };
