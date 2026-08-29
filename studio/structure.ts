import {BlockElementIcon} from '@sanity/icons/BlockElement'
import {CogIcon} from '@sanity/icons/Cog'
import {EnvelopeIcon} from '@sanity/icons/Envelope'
import {ImagesIcon} from '@sanity/icons/Images'
import {MenuIcon} from '@sanity/icons/Menu'
import type {StructureResolver} from 'sanity/structure'
import {MediaLibrary} from './tools/MediaTool'

/**
 * Documents that exist exactly once. They get a fixed `_id` and a top-level
 * menu entry, and are filtered out of the generic document list below so they
 * cannot be created twice.
 */
const SINGLETONS = ['siteInformation', 'navigation', 'footer', 'formGeneralSettings']

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Site information')
        .id('siteInformation')
        .icon(CogIcon)
        .child(
          S.document()
            .schemaType('siteInformation')
            .documentId('siteInformation')
            .title('Site information'),
        ),
      S.listItem()
        .title('Navigation')
        .id('navigation')
        .icon(MenuIcon)
        .child(
          S.document().schemaType('navigation').documentId('navigation').title('Navigation'),
        ),
      S.listItem()
        .title('Footer')
        .id('footer')
        .icon(BlockElementIcon)
        .child(S.document().schemaType('footer').documentId('footer').title('Footer')),
      S.divider(),
      S.documentTypeListItem('page').title('Pages'),
      S.documentTypeListItem('faq').title('FAQs'),
      S.divider(),
      // Not a document type but a panel of its own: Sanity's asset browser only
      // opens from a field on a document, so without this the media library as
      // a whole is invisible. See `tools/MediaTool.tsx`.
      S.listItem()
        .title('Media')
        .id('media')
        .icon(ImagesIcon)
        .child(S.component(MediaLibrary).title('Media').id('media')),
      S.divider(),
      S.documentTypeListItem('form').title('Forms').icon(EnvelopeIcon),
      S.listItem()
        .title('Form settings')
        .id('formGeneralSettings')
        .icon(EnvelopeIcon)
        .child(
          S.document()
            .schemaType('formGeneralSettings')
            .documentId('formGeneralSettings')
            .title('Form settings'),
        ),
      S.divider(),
      ...S.documentTypeListItems().filter(
        (item) =>
          item.getId() && !['page', 'faq', 'form', ...SINGLETONS].includes(item.getId()!),
      ),
    ])
