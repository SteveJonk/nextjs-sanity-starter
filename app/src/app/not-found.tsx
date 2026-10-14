import { Button } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Wrap } from '@/components/ui/Wrap';
import { getSiteInformation } from '@/sanity/site-information';

export default async function NotFound() {
  const text = (await getSiteInformation()).interfaceText;

  return (
    <main className='flex min-h-[70vh] items-center py-32 max-sm:py-24'>
      <Wrap className='max-w-160'>
        <Eyebrow>{text.notFoundEyebrow}</Eyebrow>
        <h1 className='mb-5 text-[clamp(2.2rem,4vw,3.4rem)]'>{text.notFoundTitle}</h1>
        <p className='mb-9 max-w-[36ch] leading-[1.7] text-muted'>{text.notFoundBody}</p>
        <div className='flex flex-wrap gap-3.5'>
          <Button href='/' variant='primary'>
            {text.notFoundButtonLabel}
          </Button>
        </div>
      </Wrap>
    </main>
  );
}
