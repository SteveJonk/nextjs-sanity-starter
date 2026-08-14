import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { IconArrow } from './IconArrow';
import Link from 'next/link';

export const arrowLinkClass = cn(
  'group inline-flex items-center gap-3 py-[5px] text-arrow font-semibold',
  'max-md:py-[7px]',
);

export const arrowLinkCircClass = {
  md: cn(
    'grid size-9 place-items-center rounded-full border border-current',
    'transition-[background,color,transform] duration-300 ease-brand',
    'group-hover:translate-x-1 group-hover:bg-inverse group-hover:text-inverse-fg',
    'max-md:size-[38px]',
  ),
  sm: cn(
    'grid size-[34px] place-items-center rounded-full border border-current',
    'transition-[background,color,transform] duration-300 ease-brand',
    'group-hover:translate-x-1 group-hover:bg-inverse group-hover:text-inverse-fg',
    'max-md:size-[38px]',
  ),
} as const;

type ArrowLinkProps = {
  href: string;
  children: ReactNode;
  iconSize?: number;
  className?: string;
};

/** Standalone text link with circular arrow (renders as `<a>`). */
export function ArrowLink({
  href,
  children,
  iconSize = 13,
  className,
}: ArrowLinkProps) {
  return (
    <Link href={href} className={cn(arrowLinkClass, className)}>
      {children}{' '}
      <span className={arrowLinkCircClass.md}>
        <IconArrow size={iconSize} />
      </span>
    </Link>
  );
}

type ArrowLinkLabelProps = {
  children: ReactNode;
  iconSize?: number;
  circ?: keyof typeof arrowLinkCircClass;
  className?: string;
};

/** Same look as ArrowLink, but as a `<span>` for nesting inside another link. */
export function ArrowLinkLabel({
  children,
  iconSize = 12,
  circ = 'sm',
  className,
}: ArrowLinkLabelProps) {
  return (
    <span className={cn(arrowLinkClass, className)}>
      {children}{' '}
      <span className={arrowLinkCircClass[circ]}>
        <IconArrow size={iconSize} />
      </span>
    </span>
  );
}
