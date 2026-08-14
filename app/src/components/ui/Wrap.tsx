import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type WrapProps = {
  children: ReactNode;
  className?: string;
};

/** Site content width shell. */
export function Wrap({ children, className }: WrapProps) {
  return (
    <div
      className={cn(
        "mx-auto max-w-site px-wrap max-md:px-wrap-md max-xs:px-wrap-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}
