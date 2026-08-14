'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogoMark } from '@/components/ui/LogoMark';
import { useMobileNav } from '@/hooks/useMobileNav';
import { useStickyTopbar } from '@/hooks/useStickyTopbar';
import { cn } from '@/lib/cn';
import { SITE, type NavLink } from '@/lib/site';

function isActivePath(pathname: string, href: string) {
  if (href === '#' || href === '/') return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function DesktopNav({
  links,
  align = 'start',
  stuck,
}: {
  links: NavLink[];
  align?: 'start' | 'end';
  stuck: boolean;
}) {
  const pathname = usePathname();

  return (
    <ul
      className={cn(
        'flex list-none items-center gap-[30px] max-lg:gap-[18px] max-md:hidden',
        align === 'end' && 'justify-end',
      )}
    >
      {links.map((link) => {
        const active = isActivePath(pathname, link.href);
        return (
          <li key={link.label}>
            <Link
              href={link.href}
              className={cn(
                'relative py-1.5 text-nav font-medium transition-colors duration-[400ms] ease-brand max-lg:text-[0.79rem]',
                stuck ? 'text-fg' : 'text-white',
                'after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:origin-right after:scale-x-0 after:bg-current',
                'after:transition-transform after:duration-[350ms] after:ease-brand',
                'hover:after:origin-left hover:after:scale-x-100',
                active && 'after:origin-left after:scale-x-100',
              )}
            >
              {link.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function Burger({
  open,
  stuck,
  onToggle,
}: {
  open: boolean;
  stuck: boolean;
  onToggle: () => void;
}) {
  const barTone = open || stuck ? 'bg-inverse' : 'bg-white';

  return (
    <button
      type='button'
      aria-label='Menu'
      aria-expanded={open}
      onClick={onToggle}
      className='relative z-[130] mr-[-8px] hidden size-11 max-md:block'
    >
      <span
        className={cn(
          'absolute left-[9px] h-[1.5px] w-[26px] transition duration-300 ease-brand',
          barTone,
          open ? 'top-[22px] rotate-45' : 'top-[15px]',
        )}
      />
      <span
        className={cn(
          'absolute top-[22px] left-[9px] h-[1.5px] w-[26px] transition duration-300 ease-brand',
          barTone,
          open && 'opacity-0',
        )}
      />
      <span
        className={cn(
          'absolute left-[9px] h-[1.5px] w-[26px] transition duration-300 ease-brand',
          barTone,
          open ? 'top-[22px] -rotate-45' : 'top-[29px]',
        )}
      />
    </button>
  );
}

type SiteHeaderProps = {
  navLeft?: NavLink[] | null;
  navRight?: NavLink[] | null;
};

export function SiteHeader({ navLeft = [], navRight = [] }: SiteHeaderProps) {
  const stuck = useStickyTopbar();
  const { open, toggle, close } = useMobileNav();
  const left = navLeft ?? [];
  const right = navRight ?? [];
  const navMobile = left.concat(right);

  return (
    <>
      <div
        className={cn(
          'fixed inset-x-0 top-0 z-[120] grid grid-cols-[1fr_auto_1fr] items-center gap-[30px] px-wrap',
          'transition-[padding,background-color,box-shadow] duration-[400ms] ease-brand',
          stuck ? 'bg-surface py-2.5 shadow-topbar' : 'bg-transparent py-5',
          'max-md:flex max-md:justify-between max-md:gap-4 max-md:px-wrap-md',
          stuck ? 'max-md:py-[9px]' : 'max-md:py-[14px]',
          'max-xs:px-wrap-sm',
          'before:pointer-events-none before:absolute before:inset-0 before:-z-10',
          'before:bg-gradient-to-b before:from-[rgba(28,22,19,0.5)] before:to-transparent',
          'before:transition-opacity before:duration-[400ms] before:ease-brand',
          (stuck || open) && 'before:opacity-0',
        )}
      >
        <DesktopNav links={left} stuck={stuck} />
        <Link href='/' aria-label={SITE.name}>
          <LogoMark stuck={stuck} />
        </Link>
        <DesktopNav links={right} align='end' stuck={stuck} />
        <Burger open={open} stuck={stuck} onToggle={toggle} />
      </div>

      <nav
        aria-hidden={!open}
        className={cn(
          'fixed inset-0 z-[115] flex flex-col justify-center gap-1.5 bg-surface px-wrap',
          'transition-transform duration-[550ms] ease-brand',
          open ? 'translate-y-0' : '-translate-y-full',
          'max-md:justify-start max-md:overflow-y-auto max-md:px-wrap-md max-md:pt-[110px] max-md:pb-11',
          'max-xs:px-wrap-sm',
        )}
      >
        {navMobile.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            onClick={close}
            className={cn(
              'border-b border-fg/10 py-[9px] font-display text-[2rem]',
              'max-md:py-[13px] max-md:text-[1.72rem]',
              'max-xs:py-[11px] max-xs:text-[1.5rem]',
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
