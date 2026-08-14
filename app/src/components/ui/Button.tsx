import type { MouseEventHandler, ReactNode } from 'react';
import { cn } from '@/lib/cn';
import Link from 'next/link';

type ButtonVariant = 'primary' | 'line' | 'outline';

type ButtonProps = {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
  size?: 'md' | 'sm';
  className?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
};

const baseClass = cn(
  'inline-flex items-center gap-2.5 whitespace-nowrap rounded-pill border',
  'text-btn font-semibold transition-[background,transform,border-color,color] duration-300 ease-brand',
  'hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-accent-strong',
);

const variantClass: Record<ButtonVariant, string> = {
  primary: 'border-transparent bg-brand text-brand-fg hover:bg-brand-hover',
  line: 'border-white/50 text-white hover:border-white hover:bg-white/14',
  outline: 'border-fg/25 text-fg hover:border-fg hover:bg-inverse hover:text-inverse-fg',
};

const sizeClass = {
  md: 'px-[30px] py-4',
  sm: 'px-6 py-[14px] text-btn-sm',
} as const;

export function Button({
  href,
  children,
  variant = 'primary',
  size = 'md',
  className,
  onClick,
}: ButtonProps) {
  return onClick ? (
    <a
      href={href}
      className={cn(baseClass, variantClass[variant], sizeClass[size], className)}
      onClick={onClick}
    >
      {children}
    </a>
  ) : (
    <Link
      href={href}
      className={cn(baseClass, variantClass[variant], sizeClass[size], className)}
      onClick={onClick}
    >
      {children}
    </Link>
  );
}
