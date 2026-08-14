/**
 * Seed Sanity content. Runs every target, or only the ones you name.
 *
 * Usage (from app/):
 *   npm run seed                 # everything
 *   npm run seed:home            # one page
 *   npm run seed -- home nav
 *
 * Each target is idempotent and only touches its own documents, so seeding one
 * page leaves the others alone. Page content is defined per page in
 * scripts/seed/<page>.ts and comes from src/lib/demo-content.ts.
 *
 * ADDING A PAGE: create scripts/seed/<page>.ts exporting a `seed<Page>`
 * function, then register it in TARGETS below and add an npm script.
 */
import {seedAbout} from './seed/about'
import {seedHome} from './seed/home'
import {seedNavigation} from './seed/navigation'
import {projectRef} from './seed/shared'

const TARGETS = {
  home: seedHome,
  about: seedAbout,
  // `nav` runs last by default: it links menu items to pages by slug, so the
  // pages need to exist first.
  nav: seedNavigation,
} as const

type TargetName = keyof typeof TARGETS

function parseTargets(args: string[]): TargetName[] {
  if (args.length === 0) return Object.keys(TARGETS) as TargetName[]

  const unknown = args.filter((arg) => !(arg in TARGETS))
  if (unknown.length > 0) {
    throw new Error(
      `Unknown target(s): ${unknown.join(', ')}. Available: ${Object.keys(TARGETS).join(', ')}`,
    )
  }
  return args as TargetName[]
}

async function main() {
  const targets = parseTargets(process.argv.slice(2))
  console.log(`Seeding Sanity project ${projectRef} — ${targets.join(', ')}\n`)

  for (const target of targets) {
    await TARGETS[target]()
    console.log('')
  }

  console.log('Done. Refresh the site to see the changes.')
}

main().catch((error) => {
  console.error('\nSeed failed:', error.message || error)
  process.exit(1)
})
