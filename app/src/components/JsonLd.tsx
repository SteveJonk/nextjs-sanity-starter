import { serializeJsonLd, type JsonLdNode } from '@/lib/json-ld';

/** Put one graph into the page. */
export function JsonLd({ data }: { data: JsonLdNode | null | undefined }) {
  if (!data) return null;

  return (
    <script
      type='application/ld+json'
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
