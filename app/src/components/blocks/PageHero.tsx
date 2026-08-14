import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Wrap } from '@/components/ui/Wrap';
import { PAGE_HERO } from '@/lib/demo-content';
import Link from 'next/link';

export type PageHeroImage = {
  src: string;
  alt: string;
};

export type PageHeroCta = {
  label: string;
  href: string;
};

export type PageHeroProps = {
  image?: PageHeroImage;
  breadcrumbLabel?: string;
  eyebrow?: string;
  title?: string;
  titleHighlight?: string;
  lead?: string;
  primaryCta?: PageHeroCta;
  secondaryCta?: PageHeroCta;
};

const DEFAULTS: Required<PageHeroProps> = PAGE_HERO;

export function PageHero({
  image = DEFAULTS.image,
  breadcrumbLabel = DEFAULTS.breadcrumbLabel,
  eyebrow = DEFAULTS.eyebrow,
  title = DEFAULTS.title,
  titleHighlight = DEFAULTS.titleHighlight,
  lead = DEFAULTS.lead,
  primaryCta = DEFAULTS.primaryCta,
  secondaryCta = DEFAULTS.secondaryCta,
}: PageHeroProps = {}) {
  return (
    <header
      className={[
        'relative flex min-h-[74vh] items-end overflow-hidden py-40 pb-[104px]',
        'max-md:min-h-0 max-md:pt-[150px] max-md:pb-[92px]',
        'max-sm:pt-[132px] max-sm:pb-[76px]',
      ].join(' ')}
    >
      <Image
        src={image.src}
        alt={image.alt}
        fill
        priority
        sizes='100vw'
        className='object-cover'
      />
      <div
        className='absolute inset-0 bg-[linear-gradient(180deg,rgba(30,23,20,0.52)_0%,rgba(30,23,20,0.2)_42%,rgba(30,23,20,0.68)_100%)]'
        aria-hidden='true'
      />
      <Wrap className='relative z-[3]'>
        <nav
          className='mb-6 flex items-center gap-2.5 text-[0.78rem] text-white/72 max-sm:mb-[18px] max-sm:text-[0.74rem]'
          aria-label='Kruimelpad'
        >
          <Link
            href='/'
            className='transition-colors duration-[250ms] ease-brand hover:text-white hover:underline hover:underline-offset-[3px]'
          >
            Home
          </Link>
          <svg
            width='11'
            height='11'
            viewBox='0 0 14 14'
            fill='none'
            aria-hidden='true'
            className='opacity-60'
          >
            <path d='M5 3l4 4-4 4' stroke='currentColor' strokeWidth='1.3' />
          </svg>
          <b className='font-medium text-white'>{breadcrumbLabel}</b>
        </nav>
        <Eyebrow light>{eyebrow}</Eyebrow>
        <h1
          className={[
            'mb-[22px] max-w-[17ch] text-[clamp(2.5rem,5.6vw,4.6rem)] text-white',
            'max-sm:mb-[18px] max-sm:max-w-none max-sm:text-[clamp(2.05rem,8.6vw,3.2rem)]',
            'max-xs:text-[2rem]',
          ].join(' ')}
        >
          {title}
          {titleHighlight ? (
            <em className='text-accent italic'>{titleHighlight}</em>
          ) : null}
        </h1>
        <p
          className={[
            'mb-8 max-w-[50ch] text-[1.06rem] leading-[1.68] text-white/90',
            'max-sm:mb-[26px] max-sm:max-w-none max-sm:text-[0.97rem]',
          ].join(' ')}
        >
          {lead}
        </p>
        <div className='flex flex-wrap gap-[14px]'>
          <Button
            href={primaryCta.href}
            variant='primary'
            className='max-sm:w-full max-sm:flex-1 max-sm:basis-full max-sm:justify-center'
          >
            {primaryCta.label}
          </Button>
          <Button
            href={secondaryCta.href}
            variant='line'
            className='max-sm:w-full max-sm:flex-1 max-sm:basis-full max-sm:justify-center'
          >
            {secondaryCta.label}
          </Button>
        </div>
      </Wrap>
    </header>
  );
}
