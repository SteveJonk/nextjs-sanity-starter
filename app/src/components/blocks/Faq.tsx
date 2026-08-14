'use client';

import { useRef } from 'react';
import { ArrowLink } from '@/components/ui/ArrowLink';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Reveal } from '@/components/ui/Reveal';
import { Wrap } from '@/components/ui/Wrap';
import { FAQ_ITEMS, FAQ_SECTION, type FaqItem } from '@/lib/demo-content';
import Link from 'next/link';

export type FaqLink = {
  label: string;
  href: string;
};

export type FaqProps = {
  eyebrow?: string;
  title?: string;
  intro?: string;
  link?: FaqLink;
  items?: FaqItem[];
};

const DEFAULTS: Required<FaqProps> = { ...FAQ_SECTION, items: FAQ_ITEMS };

export function Faq({
  eyebrow = DEFAULTS.eyebrow,
  title = DEFAULTS.title,
  intro = DEFAULTS.intro,
  link = DEFAULTS.link,
  items = DEFAULTS.items,
}: FaqProps = {}) {
  const detailsRefs = useRef<(HTMLDetailsElement | null)[]>([]);

  return (
    <section className='bg-white py-[120px] max-sm:py-[84px]'>
      <Wrap className='grid grid-cols-[0.8fr_1.2fr] items-start gap-[76px] max-lg:gap-[52px] max-md:grid-cols-1'>
        <Reveal className='faq-intro'>
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2 className='mb-[18px] max-w-[13ch] text-[clamp(2rem,3.6vw,3rem)] max-sm:max-w-none'>
            {title}
          </h2>
          <p className='mb-[26px] max-w-[34ch] leading-[1.7] text-muted max-sm:mb-2 max-sm:max-w-none'>
            {intro}
          </p>
          <ArrowLink href={link.href}>{link.label}</ArrowLink>
        </Reveal>

        <Reveal delay={1}>
          {items.map((item, index) => (
            <details
              key={item.question}
              ref={(el) => {
                detailsRefs.current[index] = el;
              }}
              open={index === 0}
              className='group border-t border-fg/14 last:border-b last:border-fg/14'
              onToggle={(event) => {
                const el = event.currentTarget;
                if (!el.open) return;
                detailsRefs.current.forEach((other) => {
                  if (other && other !== el) other.open = false;
                });
              }}
            >
              <summary
                className={[
                  'relative cursor-pointer list-none py-[26px] pr-[46px] text-[1.12rem] font-medium',
                  'transition-colors duration-[250ms] ease-brand hover:text-brand-deep',
                  'focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-accent-strong',
                  '[&::-webkit-details-marker]:hidden',
                  'after:absolute after:top-1/2 after:right-2 after:mt-[-6px] after:size-[13px]',
                  'after:bg-[linear-gradient(var(--color-fg),var(--color-fg))_center/13px_1.4px_no-repeat,linear-gradient(var(--color-fg),var(--color-fg))_center/1.4px_13px_no-repeat]',
                  'after:transition-transform after:duration-[350ms] after:ease-brand',
                  'group-open:after:rotate-90',
                  'max-sm:py-[22px] max-sm:pr-10 max-sm:text-[1.03rem]',
                ].join(' ')}
              >
                {item.question}
              </summary>
              <p className='max-w-[60ch] pr-11 pb-7 text-[0.98rem] leading-[1.75] text-muted max-sm:pr-0 max-sm:pb-6 max-sm:text-[0.95rem]'>
                {item.answer}
                {item.link ? (
                  <Link
                    href={item.link.href}
                    className='text-brand-deep underline underline-offset-[3px]'
                  >
                    {item.link.label}
                  </Link>
                ) : null}
                {item.afterLink ?? null}
              </p>
            </details>
          ))}
        </Reveal>
      </Wrap>
    </section>
  );
}
