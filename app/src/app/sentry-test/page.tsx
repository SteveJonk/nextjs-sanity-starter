import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SentryTest } from '@/components/SentryTest';
import { Wrap } from '@/components/ui/Wrap';
import { isSentryTestSecret } from '@/lib/sentry-test';

/**
 * Served at `/sentry-test?secret=<SENTRY_TEST_SECRET>`: checks the Sentry connection
 * after a deploy. Without the right secret it is a 404. Not linked anywhere, not
 * in the sitemap, and kept out of search results.
 */
export const metadata: Metadata = {
  title: 'Sentry test',
  // The secret is in the URL; don't hand it to sites linked from the header/footer.
  referrer: 'no-referrer',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
};

type PageProps = { searchParams: Promise<{ secret?: string | string[] }> };

export default async function SentryTestPage({ searchParams }: PageProps) {
  const { secret } = await searchParams;
  if (typeof secret !== 'string' || !isSentryTestSecret(secret)) notFound();

  return (
    <main className='flex min-h-[70vh] items-center py-32 max-sm:py-24'>
      <Wrap className='w-full max-w-160'>
        <h1 className='mb-5 text-[clamp(2.2rem,4vw,3.4rem)]'>Sentry test</h1>
        <SentryTest secret={secret} />
      </Wrap>
    </main>
  );
}
