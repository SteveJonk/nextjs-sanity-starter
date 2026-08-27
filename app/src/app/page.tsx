import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { JsonLd } from '@/components/JsonLd';
import { PageBuilder } from '@/components/PageBuilder';
import { HOME_SLUG } from '@/lib/links';
import { client } from '@/sanity/client';
import { pageFaqs, pageJsonLd } from '@/lib/json-ld';
import { pageMetadata, seoImageUrl } from '@/sanity/metadata';
import { PAGE_QUERY } from '@/sanity/queries';

const options = { next: { revalidate: 30 } };

export async function generateMetadata(): Promise<Metadata> {
  const page = await client.fetch(PAGE_QUERY, { slug: HOME_SLUG }, options);

  return pageMetadata(page, { isHome: true });
}

export default async function HomePage() {
  const page = await client.fetch(PAGE_QUERY, { slug: HOME_SLUG }, options);

  if (!page) {
    notFound();
  }

  return (
    <>
      <JsonLd
        data={pageJsonLd({
          path: '/',
          title: page.seo?.title || page.title,
          description: page.seo?.description,
          imageUrl: seoImageUrl(page.seo),
          faqs: pageFaqs(page.content),
        })}
      />
      <main>
        <PageBuilder content={page.content} />
      </main>
    </>
  );
}
