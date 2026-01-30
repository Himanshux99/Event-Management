import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const neuCardVariants = cva(
  "bg-card border-[3px] border-foreground transition-all duration-200",
  {
    variants: {
      variant: {
        default: "rounded-[20px] shadow-neu hover:shadow-neu-lg hover:-translate-x-0.5 hover:-translate-y-0.5",
        static: "rounded-[20px] shadow-neu",
        flat: "rounded-[20px]",
        accent: "rounded-[20px] shadow-neu-accent border-accent",
      },
      padding: {
        default: "p-6",
        sm: "p-4",
        lg: "p-8",
        none: "",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "default",
    },
  }
);

export interface NeuCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof neuCardVariants> {}

const NeuCard = React.forwardRef<HTMLDivElement, NeuCardProps>(
  ({ className, variant, padding, ...props }, ref) => {
    return (
      <div
        className={cn(neuCardVariants({ variant, padding, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
NeuCard.displayName = "NeuCard";

const NeuCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5", className)}
    {...props}
  />
));
NeuCardHeader.displayName = "NeuCardHeader";

const NeuCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-xl font-bold leading-none tracking-tight", className)}
    {...props}
  />
));
NeuCardTitle.displayName = "NeuCardTitle";

const NeuCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
NeuCardDescription.displayName = "NeuCardDescription";

const NeuCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("pt-0", className)} {...props} />
));
NeuCardContent.displayName = "NeuCardContent";

const NeuCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center pt-4", className)}
    {...props}
  />
));
NeuCardFooter.displayName = "NeuCardFooter";

export {
  NeuCard,
  NeuCardHeader,
  NeuCardTitle,
  NeuCardDescription,
  NeuCardContent,
  NeuCardFooter,
  neuCardVariants,
};
