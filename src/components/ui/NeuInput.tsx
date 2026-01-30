import * as React from "react";
import { cn } from "@/lib/utils";

export interface NeuInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const NeuInput = React.forwardRef<HTMLInputElement, NeuInputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full bg-card border-[3px] border-foreground rounded-[12px] px-4 py-3 text-base font-medium shadow-neu transition-all duration-150 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:shadow-neu-lg disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
NeuInput.displayName = "NeuInput";

export { NeuInput };
