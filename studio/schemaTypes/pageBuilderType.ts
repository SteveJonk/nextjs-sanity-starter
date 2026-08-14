import {defineArrayMember, defineType} from 'sanity'

/**
 * The block list editors can insert on a page.
 *
 * Order here is the order of the "Add item" menu, so keep the blocks an editor
 * reaches for most near the top.
 */
export const pageBuilderType = defineType({
  name: 'pageBuilder',
  type: 'array',
  of: [
    // Openers
    defineArrayMember({type: 'hero'}),
    defineArrayMember({type: 'pageHero'}),
    // Body
    defineArrayMember({type: 'intro'}),
    defineArrayMember({type: 'services'}),
    defineArrayMember({type: 'mediaText'}),
    defineArrayMember({type: 'benefits'}),
    defineArrayMember({type: 'steps'}),
    defineArrayMember({type: 'faqs'}),
    // Closers
    defineArrayMember({type: 'crossLinks'}),
    defineArrayMember({type: 'ctaBand'}),
  ],
})
