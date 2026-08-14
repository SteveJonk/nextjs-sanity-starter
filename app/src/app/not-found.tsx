import { Button } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Wrap } from '@/components/ui/Wrap';

export default function NotFound() {
  return (
    <main className='flex min-h-[70vh] items-center py-32 max-sm:py-24'>
      <Wrap className='max-w-160'>
        <Eyebrow>404</Eyebrow>
        <h1 className='mb-5 text-[clamp(2.2rem,4vw,3.4rem)]'>
          This page does not exist
        </h1>
        <p className='mb-9 max-w-[36ch] leading-[1.7] text-muted'>
          The link has expired, moved, or never existed. Head back to the home page, or
          get in touch if you were looking for something specific.
        </p>
        <div className='flex flex-wrap gap-3.5'>
          <Button href='/' variant='primary'>
            Back to home
          </Button>
        </div>
      </Wrap>
    </main>
  );
}
