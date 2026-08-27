import {benefitsType} from './blocks/benefitsType'
import {contactFormType} from './blocks/contactFormType'
import {crossLinksType} from './blocks/crossLinksType'
import {ctaBandType} from './blocks/ctaBandType'
import {faqsType} from './blocks/faqsType'
import {heroType} from './blocks/heroType'
import {introType} from './blocks/introType'
import {mediaTextType} from './blocks/mediaTextType'
import {pageHeroType} from './blocks/pageHeroType'
import {servicesType} from './blocks/servicesType'
import {stepsType} from './blocks/stepsType'
import {faqType} from './faqType'
import {formGeneralSettingsType} from './formGeneralSettingsType'
import {formType} from './formType'
import {footerType} from './footerType'
import {navigationType} from './navigationType'
import {ctaType} from './objects/ctaType'
import {formFieldType} from './objects/formFieldType'
import {linkType} from './objects/linkType'
import {seoType} from './objects/seoType'
import {pageBuilderType} from './pageBuilderType'
import {pageType} from './pageType'
import {siteInformationType} from './siteInformationType'

/**
 * Every schema type the studio knows about.
 *
 * ADDING A BLOCK: create `blocks/<name>Type.ts`, import it here, add it to the
 * Blocks list below, and add it to `pageBuilderType.ts` so editors can insert
 * it. Then project any link fields in the app's `queries.ts` and add a case to
 * `PageBuilder.tsx`.
 */
export const schemaTypes = [
  // Documents
  pageType,
  faqType,
  navigationType,
  footerType,
  siteInformationType,
  formType,
  formGeneralSettingsType,
  // Shared objects
  seoType,
  linkType,
  ctaType,
  formFieldType,
  pageBuilderType,
  // Blocks
  heroType,
  introType,
  servicesType,
  mediaTextType,
  pageHeroType,
  benefitsType,
  stepsType,
  faqsType,
  crossLinksType,
  ctaBandType,
  contactFormType,
]
