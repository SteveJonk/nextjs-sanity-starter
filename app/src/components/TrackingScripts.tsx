import Script from 'next/script';
import { env } from '@/lib/env';

/**
 * Google Tag Manager and the Meta (Facebook) pixel, both opt-in.
 *
 * Nothing is loaded unless the matching id is set, so a fresh clone ships no
 * third-party scripts at all — set NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID or
 * NEXT_PUBLIC_FACEBOOK_PIXEL_ID in `.env` to turn one on.
 *
 * Both vendors publish these as inline snippets, which is why they are
 * injected as raw strings rather than rewritten as module imports: keeping
 * them verbatim means they can be re-pasted from the vendor when they change.
 * The only interpolated value is the id itself, which comes from the
 * environment and never from user input.
 *
 * Consent: this loads the tags as soon as the page does. If you need a cookie
 * banner, gate GTM behind it and let GTM's own consent mode handle the rest.
 */

export function TrackingScriptsHead() {
  return (
    <>
      {env.gtmId && (
        <Script
          id='gtm-script'
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${env.gtmId}')`,
          }}
        />
      )}
      {env.facebookPixelId && (
        <Script
          id='facebook-pixel-script'
          dangerouslySetInnerHTML={{
            __html: `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${env.facebookPixelId}');
fbq('track', 'PageView');`,
          }}
        />
      )}
    </>
  );
}

/**
 * The `<noscript>` halves of the same two tags.
 *
 * These must be the first thing inside `<body>` — a `<noscript>` in `<head>`
 * is invalid, and both vendors specify this placement.
 */
export function TrackingScriptsBody() {
  return (
    <>
      {env.gtmId && (
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${env.gtmId}`}
            height='0'
            width='0'
            style={{ display: 'none', visibility: 'hidden' }}
            title='Google Tag Manager'
          />
        </noscript>
      )}
      {env.facebookPixelId && (
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            height='1'
            width='1'
            style={{ display: 'none' }}
            src={`https://www.facebook.com/tr?id=${env.facebookPixelId}&ev=PageView&noscript=1`}
            alt=''
          />
        </noscript>
      )}
    </>
  );
}
