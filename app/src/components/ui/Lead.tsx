import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type LeadProps = {
  children: ReactNode;
  className?: string;
};

export function Lead({ children, className }: LeadProps) {
  return (
    <p className={cn("text-lead text-muted max-sm:text-base", className)}>
      {children}
    </p>
  );
}
