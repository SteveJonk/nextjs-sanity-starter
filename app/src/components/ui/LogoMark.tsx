import { cn } from '@/lib/cn';
import { SITE } from '@/lib/site';

type LogoMarkProps = {
  className?: string;
  /** Header mark responds to sticky/mobile; footer is a fixed 90px mark. */
  variant?: 'header' | 'footer';
  /** When true (header only), shrinks the mark and hides the subtitle. */
  stuck?: boolean;
};

/**
 * The site logo.
 *
 * Ships as a plain wordmark built from `SITE.name` so there is nothing to
 * replace before the first run. To use a real logo, swap the inner <span> for
 * an <Image> (or inline SVG) and keep the outer wrapper — the header and
 * footer size the mark through the `--mk` custom property set here, and the
 * `stuck` state animates it on scroll.
 */
export function LogoMark({
  className,
  variant = 'header',
  stuck = false,
}: LogoMarkProps) {
  const isFooter = variant === 'footer';

  return (
    <span
      className={cn(
        'grid shrink-0 place-items-center rounded-full bg-white',
        'size-[var(--mk)] transition-transform duration-[400ms] ease-brand',
        isFooter
          ? 'mb-[26px] [--mk:90px]'
          : stuck
            ? '[--mk:56px] max-md:[--mk:54px]'
            : '[--mk:80px] max-md:[--mk:66px]',
        className,
      )}
    >
      <span className='px-[calc(var(--mk)*0.12)] text-center leading-none'>
        <b
          className={cn(
            'block font-display text-[length:calc(var(--mk)*0.2)]',
            'font-normal tracking-[0.005em] text-fg',
          )}
        >
          {SITE.name}
        </b>
      </span>
    </span>
  );
}
