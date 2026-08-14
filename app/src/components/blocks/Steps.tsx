'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Reveal } from '@/components/ui/Reveal';
import { Wrap } from '@/components/ui/Wrap';
import { useActiveStep } from '@/hooks/useActiveStep';
import { cn } from '@/lib/cn';
import { STEPS, STEPS_SECTION } from '@/lib/demo-content';

export type StepsCta = {
  label: string;
  href: string;
};

export type StepsItem = {
  number: string;
  title: string;
  body: string;
  image: string | { src: string };
};

export type StepsProps = {
  eyebrow?: string;
  title?: string;
  lead?: string;
  cta?: StepsCta;
  items?: StepsItem[];
};

const DEFAULTS: Required<StepsProps> = { ...STEPS_SECTION, items: STEPS };

function stepImageSrc(image: StepsItem['image']): string {
  return typeof image === 'string' ? image : image.src;
}

export function Steps({
  eyebrow = DEFAULTS.eyebrow,
  title = DEFAULTS.title,
  lead = DEFAULTS.lead,
  cta = DEFAULTS.cta,
  items = DEFAULTS.items,
}: StepsProps = {}) {
  const { active, itemRefs } = useActiveStep(items.length);
  const current = items[active] ?? items[0];

  return (
    <section className='bg-accent pt-[120px] pb-[34px] max-sm:py-[84px]'>
      <Wrap className='grid grid-cols-[0.86fr_1.14fr] items-stretch gap-[74px] max-lg:gap-[52px] max-md:grid-cols-1'>
        <div className='max-md:contents'>
          <Reveal className='mb-11 max-md:mb-8'>
            <Eyebrow>{eyebrow}</Eyebrow>
            <h2 className='mb-5 max-w-[14ch] text-[clamp(2rem,3.6vw,3.1rem)] max-sm:max-w-none'>
              {title}
            </h2>
            <p className='mb-7 max-w-[38ch] leading-[1.7] text-muted max-sm:mb-6 max-sm:max-w-none'>
              {lead}
            </p>
            <Button
              href={cta.href}
              variant='outline'
              className='max-sm:w-full max-sm:justify-center'
            >
              {cta.label}
            </Button>
          </Reveal>

          <div
            className={cn(
              'hidden md:block',
              'sticky top-[118px] aspect-[4/5] overflow-hidden rounded-arch',
              'shadow-[0_30px_64px_-34px_rgba(36,31,28,0.5)]',
              'max-md:top-20 max-md:mb-11 max-md:aspect-16/10 max-md:max-w-none',
              'max-sm:top-[74px] max-sm:aspect-3/2',
              'after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-[46%]',
              'after:bg-[linear-gradient(180deg,rgba(30,23,20,0),rgba(30,23,20,0.72))]',
              'max-md:after:h-[60%]',
            )}
            aria-hidden='true'
          >
            {items.map((step, index) => (
              <div
                key={step.number}
                className={cn(
                  'absolute inset-0 scale-105 opacity-0 ease-brand',
                  'transition-[opacity,transform] duration-[750ms]',
                  '[transition-duration:750ms,1400ms]',
                  index === active && 'scale-100 opacity-100',
                )}
              >
                <Image
                  src={stepImageSrc(step.image)}
                  alt=''
                  fill
                  sizes='(max-width: 960px) 100vw, 42vw'
                  className='object-cover'
                />
              </div>
            ))}
            <div
              className={cn(
                'absolute inset-x-[26px] bottom-6 z-[3] flex items-baseline gap-3 text-white',
                'max-md:inset-x-5 max-md:bottom-[18px]',
              )}
            >
              <b className='font-display text-[1.5rem] leading-none text-accent max-sm:text-[1.3rem]'>
                {current.number}
              </b>
              <span className='text-[0.95rem] font-medium tracking-[0.01em] max-sm:text-[0.88rem]'>
                {current.title}
              </span>
              <i className='ml-auto text-[0.7rem] tracking-[0.16em] not-italic opacity-70 whitespace-nowrap max-sm:hidden'>
                {current.number} / 0{items.length}
              </i>
            </div>
          </div>
        </div>

        <Reveal delay={1}>
          <ol className='list-none pb-[185px] max-sm:pb-0'>
            {items.map((step, index) => (
              <li
                key={step.number}
                ref={(el) => {
                  itemRefs.current[index] = el;
                }}
                className={cn(
                  'relative pb-11 pl-[82px] transition-opacity duration-500 ease-brand last:pb-0',
                  'before:absolute before:top-14 before:bottom-0 before:left-[26px] before:w-px before:bg-inverse/22 last:before:hidden',
                  'max-sm:pb-[34px] max-sm:pl-[62px] max-sm:before:top-12 max-sm:before:left-[21px]',
                  index === active ? 'opacity-100' : 'opacity-[0.62]',
                )}
              >
                <span
                  className={cn(
                    'absolute top-0 left-0 grid size-[54px] place-items-center rounded-full',
                    'font-display text-[1.12rem] transition-[background,color] duration-[450ms] ease-brand',
                    'max-sm:size-11 max-sm:text-[0.98rem]',
                    index === active ? 'bg-inverse text-inverse-fg' : 'bg-surface text-fg',
                  )}
                >
                  {step.number}
                </span>
                <h3 className='pt-[11px] mb-2.5 text-[1.6rem] max-sm:pt-2 max-sm:text-[1.38rem]'>
                  {step.title}
                </h3>
                <p className='max-w-[52ch] text-[0.98rem] leading-[1.7] text-muted max-sm:text-[0.95rem]'>
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </Reveal>
      </Wrap>
    </section>
  );
}
