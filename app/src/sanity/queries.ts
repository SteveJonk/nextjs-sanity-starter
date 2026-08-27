import { defineQuery } from 'next-sanity';

/**
 * Resolve internal page references on link/cta objects.
 *
 * A link in the studio is either an external URL or a reference to a `page`
 * document; this projection pulls the referenced slug up so `resolveHref` in
 * `src/lib/links.ts` can turn either shape into an href.
 */
const linkExpansion = /* groq */ `{
  ...,
  internalLink->{
    "slug": slug.current
  }
}`;

/**
 * Everything the renderer needs to draw a form.
 *
 * `fields[]` and `steps[]` are spread wholesale — a form field is a flat object
 * with no references in it, so there is nothing to resolve. Only the redirect
 * link needs expanding.
 */
const formProjection = /* groq */ `{
  _id,
  title,
  showTitle,
  mode,
  fields[],
  steps[]{
    title,
    fields[]
  },
  submitButtonText,
  nextButtonText,
  backButtonText,
  successTitle,
  successBody,
  redirectAfterSubmit,
  redirectLink${linkExpansion}
}`;

/**
 * One page and its blocks.
 *
 * The `content[]` projection spreads every block wholesale (`...`) and then
 * re-projects the fields that need resolving — links, referenced documents.
 * When you add a block with a link field, add its field name here or the href
 * will arrive as an unresolved reference.
 */
export const PAGE_QUERY = defineQuery(`
  *[_type == "page" && slug.current == $slug][0]{
    _id,
    title,
    slug,
    seo,
    content[]{
      ...,
      primaryCta${linkExpansion},
      secondaryCta${linkExpansion},
      link${linkExpansion},
      cta${linkExpansion},
      highlight{
        ...,
        cta${linkExpansion}
      },
      items[]{
        ...,
        link${linkExpansion},
        cta${linkExpansion}
      },
      // The form lives in its own document so several pages can share it, and
      // the public half of the reCAPTCHA settings rides along — the secret
      // stays server-side, in the submit route.
      _type == "contactForm" => {
        form->${formProjection},
        // The panel's own CTA is nested, so the top-level link projections do
        // not reach it — an internal link would arrive as a bare reference.
        aside{
          ...,
          cta${linkExpansion}
        },
        "recaptcha": *[_type == "formGeneralSettings"][0]{
          recaptchaEnabled,
          recaptchaSiteKey
        }
      },
      _type == "faqs" => {
        ...,
        faqs[]->{
          ...,
          link${linkExpansion}
        },
        link${linkExpansion}
      }
    }
  }
`);

/** Slugs of every page, for generateStaticParams and the sitemap. */
export const PAGE_SLUGS_QUERY = defineQuery(`
  *[_type == "page" && defined(slug.current)]{
    "slug": slug.current,
    _updatedAt
  }
`);

export const NAVIGATION_QUERY = defineQuery(`
  *[_id == "navigation"][0]{
    navLeft[]${linkExpansion},
    navRight[]${linkExpansion}
  }
`);

/**
 * The site's own details — name, contact, language, social profiles.
 *
 * Every field is optional in the studio; `resolveSiteInformation` in
 * `src/lib/site.ts` lays what comes back over the defaults, so an empty field
 * falls back rather than rendering blank.
 */
export const SITE_INFORMATION_QUERY = defineQuery(`
  *[_id == "siteInformation"][0]{
    name,
    description,
    language,
    phone,
    email,
    address,
    addressCountry,
    badges,
    // Only the URLs: they become sameAs in the structured data.
    "socialLinks": socialLinks[].url,
    "logoUrl": logo.asset->url
  }
`);

export const FOOTER_QUERY = defineQuery(`
  *[_id == "footer"][0]{
    linkGroups[]{
      title,
      links[]${linkExpansion}
    },
    copyright
  }
`);

/**
 * What the submit route needs: the mail settings, plus a flat list of every
 * field the form declares — both modes collapse to the same shape here.
 *
 * This list is the server's allow-list. A key the browser posts that is not in
 * it never reaches the mail, so it has to stay in step with what the renderer
 * draws; `npm run check:form` asserts exactly that.
 */
export const FORM_QUERY = defineQuery(`
  *[_id == $formId && _type == "form"][0]{
    _id,
    title,
    mailRecipients,
    mailSubject,
    mailMessage,
    sendCopyToSubmitter,
    copySubject,
    copyMessage,
    "fields": select(
      mode == "steps" => steps[].fields[]{label, name, type, isRequired},
      fields[]{label, name, type, isRequired}
    )
  }
`);

/** Shared mail and spam settings. Server-side only — it carries secrets. */
export const FORM_SETTINGS_QUERY = defineQuery(`
  *[_type == "formGeneralSettings"][0]{
    adminEmail,
    fromEmail,
    fromName,
    mailLogo,
    primaryColor,
    textColor,
    mailjetApiKey,
    mailjetApiSecret,
    confirmationSubject,
    confirmationMessage,
    recaptchaEnabled,
    recaptchaSecretKey
  }
`);
