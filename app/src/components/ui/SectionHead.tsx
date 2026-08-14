import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type SectionHeadProps = {
  children: ReactNode;
  className?: string;
};

export function SectionHead({ children, className }: SectionHeadProps) {
  return (
    <div
      className={cn(
        "mb-[60px] flex flex-wrap items-end justify-between gap-10",
        "[&_h2]:max-w-[16ch] [&_h2]:text-[clamp(2rem,3.6vw,3.1rem)]",
        "max-sm:mb-10 max-sm:gap-[22px] max-sm:[&>a]:w-full max-sm:[&>a]:justify-center",
        className,
      )}
    >
      {children}
    </div>
  );
}
