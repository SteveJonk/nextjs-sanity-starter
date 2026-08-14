'use client';

import type { ReactNode } from 'react';
import { useRevealOnScroll } from '@/hooks/useRevealOnScroll';
import { cn } from '@/lib/cn';
import Link from 'next/link';

type RevealLinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
  delay?: 1 | 2 | 3;
};

const delayClass = {
  1: 'delay-[90ms]',
  2: 'delay-[180ms]',
  3: 'delay-[270ms]',
} as const;

export function RevealLink({ href, children, className, delay }: RevealLinkProps) {
  const { ref, visible } = useRevealOnScroll<HTMLAnchorElement>();

  return (
    <Link
      ref={ref}
      href={href}
      className={cn(
        'transition-[opacity,transform] duration-[850ms] ease-brand',
        'motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none',
        visible ? 'translate-y-0 opacity-100' : 'translate-y-[26px] opacity-0',
        delay && delayClass[delay],
        className,
      )}
    >
      {children}
    </Link>
  );
}
