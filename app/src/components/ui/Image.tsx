'use client';

import NextImage, { type ImageProps } from 'next/image';
import { isSanityImage, sanityLoader } from '@/sanity/image-loader';

/**
 * next/image, but Sanity images are resized by the Sanity CDN (see
 * `sanityLoader`). Local images from `public/` still go through `/_next/image`.
 *
 * A client component because `loader` is a function, which can't be passed as
 * a prop from a server component. A global `images.loaderFile` doesn't work
 * either: it makes Next disable `/_next/image`, which breaks local images.
 */
export default function Image(props: ImageProps) {
  return <NextImage {...props} loader={isSanityImage(props.src) ? sanityLoader : props.loader} />;
}
