import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { PageBuilder } from '@/components/PageBuilder';
import { client } from '@/sanity/client';
import { pageMetadata } from '@/sanity/metadata';
import { PAGE_QUERY } from '@/sanity/queries';

const options = { next: { revalidate: 30 } };

type PageProps = {
  params: Promise<{ slug: string }>;
};

/**
 * Every CMS page except the home page renders through this one route — there
 * are no per-page route files. Add a page in the studio and it is live.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  if (slug === 'home') {
    return {};
  }

  return pageMetadata(await client.fetch(PAGE_QUERY, { slug }, options));
}

export default async function SanityPage({ params }: PageProps) {
  const { slug } = await params;

  // /home is the same document as /, so keep one canonical URL.
  if (slug === 'home') {
    permanentRedirect('/');
  }

  const page = await client.fetch(PAGE_QUERY, { slug }, options);

  if (!page) {
    notFound();
  }

  return (
    <main>
      <PageBuilder content={page.content} />
    </main>
  );
}
