import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-foreground/10 text-foreground",
        secondary: "border-transparent bg-secondary text-muted-foreground",
        destructive: "border-transparent bg-destructive/20 text-destructive",
        success: "border-transparent bg-success/20 text-success",
        warning: "border-transparent bg-warning/20 text-warning",
        outline: "border-border text-muted-foreground bg-transparent",
        sourced: "border-transparent bg-status-sourced/15 text-status-sourced",
        screened: "border-transparent bg-status-screened/15 text-status-screened",
        takehome: "border-transparent bg-status-takehome/15 text-status-takehome",
        interview: "border-transparent bg-status-interview/15 text-status-interview",
        offer: "border-transparent bg-status-offer/15 text-status-offer",
        rejected: "border-transparent bg-status-rejected/15 text-status-rejected",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
