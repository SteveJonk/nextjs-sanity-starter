import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { JsonLd } from '@/components/JsonLd';
import { PageBuilder } from '@/components/PageBuilder';
import { HOME_SLUG, pathForSlug } from '@/lib/links';
import { client } from '@/sanity/client';
import { pageBreadcrumbLabel, pageFaqs, pageJsonLd } from '@/lib/json-ld';
import { pageMetadata, seoImageUrl } from '@/sanity/metadata';
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

  if (slug === HOME_SLUG) {
    return {};
  }

  return pageMetadata(await client.fetch(PAGE_QUERY, { slug }, options));
}

export default async function SanityPage({ params }: PageProps) {
  const { slug } = await params;

  // /home is the same document as /, so keep one canonical URL.
  if (slug === HOME_SLUG) {
    permanentRedirect('/');
  }

  const page = await client.fetch(PAGE_QUERY, { slug }, options);

  if (!page) {
    notFound();
  }

  const path = pathForSlug(slug);

  return (
    <>
      <JsonLd
        data={pageJsonLd({
          path,
          title: page.seo?.title || page.title,
          description: page.seo?.description,
          imageUrl: seoImageUrl(page.seo),
          faqs: pageFaqs(page.content),
          // Matches the breadcrumb the pageHero block renders: Home > this page.
          trail: [
            { name: pageBreadcrumbLabel(page.content) ?? page.title, path },
          ],
        })}
      />
      <main>
        <PageBuilder content={page.content} />
      </main>
    </>
  );
}
