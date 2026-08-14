import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { cn } from '@/lib/cn';
import { HERO, HERO_SLIDES } from '@/lib/demo-content';

export type HeroCta = {
  label: string;
  href: string;
};

export type HeroSlide = {
  src: string;
  alt: string;
};

export type HeroProps = {
  slides?: HeroSlide[];
  eyebrow?: string;
  title?: string;
  titleHighlight?: string;
  lead?: string;
  primaryCta?: HeroCta;
  secondaryCta?: HeroCta;
  badgeValue?: string;
  badgeLabel?: string;
};

const DEFAULTS: Required<HeroProps> = { slides: HERO_SLIDES, ...HERO };

const SLIDE_DELAYS = [
  '[animation-delay:0s]',
  '[animation-delay:7.5s]',
  '[animation-delay:15s]',
];

const shortLandscape =
  '[@media(max-height:560px)_and_(max-width:960px)]:min-h-0 [@media(max-height:560px)_and_(max-width:960px)]:pt-24';

export function Hero({
  slides = DEFAULTS.slides,
  eyebrow = DEFAULTS.eyebrow,
  title = DEFAULTS.title,
  titleHighlight = DEFAULTS.titleHighlight,
  lead = DEFAULTS.lead,
  primaryCta = DEFAULTS.primaryCta,
  secondaryCta = DEFAULTS.secondaryCta,
  badgeValue = DEFAULTS.badgeValue,
  badgeLabel = DEFAULTS.badgeLabel,
}: HeroProps = {}) {
  return (
    <header
      className={cn(
        'relative flex h-[100svh] min-h-[620px] items-end overflow-hidden',
        'max-md:h-auto max-md:min-h-[100svh] max-md:pt-[104px]',
        shortLandscape,
      )}
    >
      <div className='absolute inset-0'>
        {slides.map((slide, index) => (
          <div
            key={slide.src}
            className={cn(
              'absolute inset-0 animate-hero-cycle opacity-0',
              SLIDE_DELAYS[index],
              index === 0 && 'motion-reduce:animate-none motion-reduce:opacity-100',
              index > 0 && 'motion-reduce:animate-none',
            )}
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              priority={index === 0}
              sizes='100vw'
              className='object-cover'
            />
          </div>
        ))}
      </div>

      <div
        className='absolute inset-0 bg-[linear-gradient(180deg,rgba(30,23,20,0.34)_0%,rgba(30,23,20,0.06)_38%,rgba(30,23,20,0.62)_100%)]'
        aria-hidden='true'
      />

      <div className='relative z-[3] w-full px-wrap max-md:px-wrap-md max-xs:px-wrap-sm'>
        <div
          className={cn(
            'mx-auto max-w-site pb-24',
            'max-md:pb-[124px] max-xs:pb-[104px]',
            '[@media(max-height:560px)_and_(max-width:960px)]:pb-[60px]',
          )}
        >
          <Eyebrow light>{eyebrow}</Eyebrow>
          <h1
            className={cn(
              'mb-[26px] max-w-[15ch] text-[clamp(2.9rem,7.2vw,6.2rem)] text-white',
              'max-sm:mb-5 max-sm:max-w-none max-sm:text-[clamp(2.05rem,9.2vw,3.2rem)]',
              'max-xs:text-[2rem]',
            )}
          >
            {title}
            {titleHighlight ? (
              <>
                {' '}
                <em className='text-accent italic'>{titleHighlight}</em>
              </>
            ) : null}
          </h1>
          <p
            className={cn(
              'mb-[34px] max-w-[44ch] text-lead leading-[1.65] text-white/90',
              'max-sm:mb-7 max-sm:max-w-none max-sm:text-[0.97rem]',
            )}
          >
            {lead}
          </p>
          <div className='flex flex-wrap gap-[14px] max-sm:gap-2.5'>
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
        </div>
      </div>

      <div
        className={cn(
          'absolute z-0 inset-x-0 bottom-0 mx-auto flex max-w-site items-end justify-between px-wrap pb-[30px]',
          'max-xl:pb-[98px]',
          'max-md:top-0 max-md:bottom-auto max-md:items-start max-md:justify-end max-md:px-wrap-md max-md:pt-[100px] max-md:pb-0',
          'max-xs:px-wrap-sm max-xs:pt-[94px]',
          '[@media(max-height:560px)_and_(max-width:960px)]:hidden',
        )}
      >
        <div className='flex items-center gap-3 text-[0.72rem] tracking-[0.2em] text-white/75 uppercase max-md:hidden'>
          <i
            className='block h-[34px] w-px origin-top animate-cue bg-[linear-gradient(180deg,rgba(255,255,255,0.7),rgba(255,255,255,0))] motion-reduce:animate-none'
            aria-hidden='true'
          />
          Scroll
        </div>
        <div
          className={cn(
            'grid size-[120px] animate-spin-in place-items-center rounded-full bg-brand text-center text-brand-fg',
            'max-md:size-[84px] max-sm:size-[78px] max-xs:size-[72px]',
            'motion-reduce:animate-none',
          )}
        >
          <div>
            <b
              className={cn(
                'block font-display text-[2.05rem] leading-none font-normal',
                'max-md:text-[1.5rem] max-sm:text-[1.36rem] max-xs:text-[1.2rem]',
              )}
            >
              {badgeValue}
            </b>
            <small
              className={cn(
                'mt-[5px] block text-[0.58rem] font-semibold tracking-[0.19em]',
                'max-md:mt-1 max-md:text-[0.53rem] max-md:tracking-[0.13em]',
                'max-xs:text-[0.5rem] max-xs:tracking-[0.1em]',
              )}
            >
              {badgeLabel}
            </small>
          </div>
        </div>
      </div>
    </header>
  );
}
