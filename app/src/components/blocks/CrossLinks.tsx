import { Reveal } from '@/components/ui/Reveal';
import { Wrap } from '@/components/ui/Wrap';
import { IconArrow } from '@/components/ui/IconArrow';
import { CROSS_LINKS } from '@/lib/demo-content';
import Link from 'next/link';

export type CrossLinkItem = {
  title: string;
  body: string;
  href: string;
};

export type CrossLinksProps = {
  items?: CrossLinkItem[];
};

const DEFAULTS: Required<CrossLinksProps> = {
  items: [...CROSS_LINKS],
};

export function CrossLinks({ items = DEFAULTS.items }: CrossLinksProps = {}) {
  return (
    <section className='pb-[124px] max-sm:pb-[84px]'>
      <Wrap>
        <div className='grid grid-cols-2 gap-[26px] max-md:grid-cols-1'>
          {items.map((link, index) => (
            <Reveal key={link.title} delay={index === 1 ? 1 : undefined}>
              <Link
                href={link.href}
                className={[
                  'group flex items-center justify-between gap-[26px] rounded bg-white px-10 py-[38px]',
                  'transition-[transform,box-shadow] duration-[450ms] ease-brand',
                  'hover:-translate-y-[5px] hover:shadow-[0_26px_54px_-32px_rgba(36,31,28,0.42)]',
                  'max-sm:gap-5 max-sm:px-[26px] max-sm:py-7',
                  'max-xs:flex-col max-xs:items-start max-xs:gap-[18px]',
                ].join(' ')}
              >
                <div>
                  <h3 className='mb-[7px] text-[1.5rem] max-sm:text-[1.3rem]'>
                    {link.title}
                  </h3>
                  <p className='max-w-[34ch] text-[0.92rem] leading-[1.6] text-muted'>
                    {link.body}
                  </p>
                </div>
                <span
                  className={[
                    'grid size-[46px] shrink-0 place-items-center rounded-full border border-fg/22',
                    'transition duration-[350ms] ease-brand',
                    'group-hover:border-fg group-hover:bg-inverse group-hover:text-inverse-fg',
                  ].join(' ')}
                >
                  <IconArrow size={15} />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </Wrap>
    </section>
  );
}
