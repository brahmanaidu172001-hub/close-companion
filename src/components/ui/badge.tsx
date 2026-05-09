import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium transition-colors gap-1.5 border",
  {
    variants: {
      variant: {
        default: "bg-white/[0.05] text-foreground border-white/[0.08]",
        secondary: "bg-secondary/60 text-secondary-foreground border-white/[0.06]",
        outline: "bg-transparent border-white/[0.12] text-foreground",
        critical: "bg-red-500/10 text-red-400 border-red-500/20",
        high: "bg-orange-500/10 text-orange-400 border-orange-500/20",
        medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
        low: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        info: "bg-sky-500/10 text-sky-400 border-sky-500/20",
        success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
