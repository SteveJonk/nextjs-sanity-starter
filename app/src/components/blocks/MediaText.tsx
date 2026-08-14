import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Reveal } from '@/components/ui/Reveal';
import { Wrap } from '@/components/ui/Wrap';
import { MEDIA_TEXT } from '@/lib/demo-content';

export type MediaTextImage = {
  src: string;
  alt: string;
};

export type MediaTextCta = {
  label: string;
  href: string;
};

export type MediaTextProps = {
  eyebrow?: string;
  title?: string;
  paragraphs?: string[];
  cta?: MediaTextCta;
  image?: MediaTextImage;
};

const DEFAULTS: Required<MediaTextProps> = {
  ...MEDIA_TEXT,
  paragraphs: [...MEDIA_TEXT.paragraphs],
};

/** Text column with a supporting photo on the right. */
export function MediaText({
  eyebrow = DEFAULTS.eyebrow,
  title = DEFAULTS.title,
  paragraphs = DEFAULTS.paragraphs,
  cta = DEFAULTS.cta,
  image = DEFAULTS.image,
}: MediaTextProps = {}) {
  return (
    <section className='pb-[122px] max-sm:pb-[82px]'>
      <Wrap
        className={[
          'grid grid-cols-[1.12fr_0.88fr] items-center gap-[74px]',
          'max-lg:gap-11 max-md:grid-cols-1',
        ].join(' ')}
      >
        <Reveal>
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2 className='mb-5 max-w-[16ch] text-[clamp(1.9rem,3.4vw,2.7rem)] max-sm:max-w-none'>
            {title}
          </h2>
          {paragraphs.map((paragraph) => (
            <p
              key={paragraph}
              className='mb-[18px] max-w-[46ch] leading-[1.75] text-muted max-sm:max-w-none'
            >
              {paragraph}
            </p>
          ))}
          {cta ? (
            <Button href={cta.href} className='mt-3.5'>
              {cta.label}
            </Button>
          ) : null}
        </Reveal>

        <Reveal delay={1}>
          <div className='relative aspect-[5/4] overflow-hidden rounded-arch max-md:aspect-4/3'>
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes='(max-width: 960px) 100vw, 40vw'
              className='object-cover'
            />
          </div>
        </Reveal>
      </Wrap>
    </section>
  );
}
