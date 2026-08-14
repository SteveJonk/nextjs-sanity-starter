/**
 * Demo copy for every block.
 *
 * This file has two jobs, and they are deliberately the same data:
 *
 *  1. Component defaults — each block in `src/components/blocks` falls back to
 *     these values when the CMS has not supplied a field, so the site renders
 *     something sensible before any content exists.
 *  2. Seed source — `scripts/seed/*.ts` pushes these same values into Sanity,
 *     so a freshly seeded studio matches what you see on screen.
 *
 * The copy is written for an invented studio so a seeded site looks like a real
 * site rather than a style guide. It is filler: replace it. Every string here
 * is generic on purpose, so nothing breaks when you swap in your own.
 */

import { SITE } from '@/lib/site';

const WIDE = '/images/placeholder-wide.png';
const PORTRAIT = '/images/placeholder-portrait.png';
const SQUARE = '/images/placeholder-square.png';

export const PLACEHOLDER_IMAGES = { WIDE, PORTRAIT, SQUARE } as const;

/* -------------------------------------------------------------------------- */
/* Home                                                                        */
/* -------------------------------------------------------------------------- */

export const HERO_SLIDES = [
  { src: WIDE, alt: 'Two people reviewing work at a shared desk' },
  { src: SQUARE, alt: 'A workshop wall covered in sketches' },
  { src: PORTRAIT, alt: 'Detail of a printed brand guideline' },
];

export const HERO = {
  eyebrow: 'Design and build studio',
  title: 'We make things that',
  titleHighlight: 'work properly',
  lead: 'A small team of designers and engineers. We take on a handful of projects a year, and we stay on them until they are actually finished.',
  primaryCta: { label: 'Start a project', href: '/about' },
  secondaryCta: { label: 'See how we work', href: '/about' },
  badgeValue: '12',
  badgeLabel: 'YEARS',
};

export const INTRO_FACTS = [
  { value: '120+', label: 'Projects shipped' },
  { value: '14', label: 'People on the team' },
  { value: '9', label: 'Countries worked in' },
];

export const INTRO = {
  image: { src: PORTRAIT, alt: 'Two colleagues talking beside a window' },
  stampValue: '12',
  stampLabel: 'YEARS',
  eyebrow: 'About the studio',
  title: 'Small team, unusually',
  titleHighlight: 'stubborn',
  leads: [
    'We started in 2014 because we were tired of watching good ideas get diluted somewhere between the pitch and the launch. So we kept the team small and the work close.',
    'Everyone you meet in the first conversation is someone who will work on the project. No handover to a delivery team, no account manager in between.',
  ],
  facts: INTRO_FACTS,
  link: { label: 'Meet the team', href: '/about' },
};

export const SERVICES = [
  {
    label: 'Strategy',
    title: 'Working out what to build',
    description:
      'Research, positioning and a scope you can actually afford. Usually two to three weeks, and it often shrinks the build.',
    image: { src: SQUARE, alt: 'Notes and diagrams pinned to a wall' },
    href: '/about',
  },
  {
    label: 'Design',
    title: 'Interfaces and identity',
    description:
      'Brand, product design and a component library your developers will not quietly abandon after a month.',
    image: { src: SQUARE, alt: 'Colour swatches laid out on a desk' },
    href: '/about',
  },
  {
    label: 'Engineering',
    title: 'Shipping it for real',
    description:
      'Web and mobile builds, in the open, with your team in the repository from day one rather than at handover.',
    image: { src: SQUARE, alt: 'A laptop showing code on a workbench' },
    href: '/about',
  },
];

export const SERVICES_SECTION = {
  title: 'What we do',
  lead: 'Three things, done properly. If a project needs something outside this list we will tell you and point you somewhere better.',
  highlight: {
    badge: 'B CORP',
    title: 'Certified since 2021',
    body: 'Independently audited on how we treat our team, our clients and our suppliers. The full scorecard is public, including the parts we are still working on.',
    cta: { label: 'Read the report', href: '/about' },
  },
};

/* -------------------------------------------------------------------------- */
/* Content page                                                                */
/* -------------------------------------------------------------------------- */

export const PAGE_HERO = {
  image: { src: WIDE, alt: 'The studio space on a weekday morning' },
  breadcrumbLabel: 'About',
  eyebrow: 'About us',
  title: 'Twelve years of',
  titleHighlight: 'finishing things',
  lead: 'How the studio is set up, who you will actually work with, and what the first six weeks of a project usually look like.',
  primaryCta: { label: 'Start a project', href: '#' },
  secondaryCta: { label: 'Download our rates', href: '#' },
};

export const BENEFITS_IMAGE = {
  src: PORTRAIT,
  alt: 'A designer sketching at a desk',
};

/** The icon set drawn inline by `Benefits` — see the switch in that component. */
export type BenefitIcon =
  | 'person'
  | 'camera'
  | 'chart'
  | 'doc'
  | 'house'
  | 'renovate'
  | 'scale';

export type Benefit = {
  icon: BenefitIcon;
  title: string;
  body: string;
};

export const BENEFITS: Benefit[] = [
  {
    icon: 'person',
    title: 'One team, start to finish',
    body: 'The people in the kickoff are the people who ship it. Nothing is handed to a delivery team you have never met.',
  },
  {
    icon: 'chart',
    title: 'Fixed scope, fixed price',
    body: 'We quote per phase, not per hour. If we estimate badly that is our problem, and it has happened.',
  },
  {
    icon: 'doc',
    title: 'You own everything',
    body: 'Code, design files and accounts are yours from the first commit. No licensing, no lock-in, no hostage situation.',
  },
  {
    icon: 'scale',
    title: 'We say no a lot',
    body: 'We take on roughly eight projects a year. If we are not the right studio for yours, you will hear it in week one.',
  },
];

export const BENEFITS_SECTION = {
  eyebrow: 'Why us',
  title: 'What you get that you would not elsewhere',
  lead: 'Most of this comes down to staying small on purpose. It costs us margin and it is the reason clients come back.',
};

export const STEPS = [
  {
    number: '01',
    title: 'A conversation',
    body: 'An hour, no charge, no deck. We work out whether the thing you want built is the thing you need built.',
    image: WIDE,
  },
  {
    number: '02',
    title: 'Discovery',
    body: 'Two to three weeks of research and scoping. You end up with a plan and a price, and you are free to take both elsewhere.',
    image: SQUARE,
  },
  {
    number: '03',
    title: 'Design and build',
    body: 'Two-week cycles with something working at the end of each one. You see it in a browser, not in a slide.',
    image: PORTRAIT,
  },
  {
    number: '04',
    title: 'Launch',
    body: 'We ship it, watch it for a fortnight, and fix what real traffic finds. That fortnight is included.',
    image: WIDE,
  },
  {
    number: '05',
    title: 'After',
    body: 'A support retainer if you want one, a clean handover to your own team if you do not. Both are fine by us.',
    image: SQUARE,
  },
];

export const STEPS_SECTION = {
  eyebrow: 'How it works',
  title: 'From first call to live site',
  lead: 'Five stages, about four months for a typical project. You know at every point what is happening and what it costs.',
  cta: { label: 'Book a conversation', href: '#' },
};

export type FaqItem = {
  question: string;
  answer: string;
  /** Optional inline link rendered straight after the answer text. */
  link?: { label: string; href: string };
  /** Optional trailing text after that link, so the sentence can continue. */
  afterLink?: string;
};

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'What does a project cost?',
    answer:
      'Most sit between £40k and £120k depending on scope. Discovery is quoted separately at around £8k, and it is the only way we can give you a number we will stand behind.',
  },
  {
    question: 'How long does it take?',
    answer:
      'Three to five months from kickoff to launch for a typical build. We can go faster by cutting scope, never by adding people.',
  },
  {
    question: 'Do you work with in-house teams?',
    answer:
      'Often, and it is usually the best setup. Your developers sit in the repository with ours from week one so there is nothing to hand over at the end.',
  },
  {
    question: 'What if we need changes after launch?',
    answer:
      'The first two weeks of fixes are included. After that it is either a monthly retainer or ad-hoc work at day rate — plenty of clients take neither and run it themselves.',
  },
  {
    question: 'Can we see the code before we commit?',
    answer:
      'Yes. Ask and we will point you at a repository from a past project, with the client’s permission.',
  },
];

export const FAQ_SECTION = {
  eyebrow: 'FAQ',
  title: 'Good to know',
  intro:
    'The questions that come up on nearly every first call. If yours is not here, ask — we would rather answer it now than in month three.',
  link: { label: 'Ask us anything', href: '#' },
};

export const CROSS_LINKS = [
  {
    title: 'How we work',
    body: 'Our process, our rates, and the kinds of projects we turn down.',
    href: '/about',
  },
  {
    title: 'Recent work',
    body: 'Six projects from the last two years, including what went wrong on two of them.',
    href: '/',
  },
];

/* -------------------------------------------------------------------------- */
/* Shared                                                                      */
/* -------------------------------------------------------------------------- */

export const MEDIA_TEXT = {
  eyebrow: 'The studio',
  title: 'Built to stay small',
  paragraphs: [
    'Fourteen people in one room, plus a handful of collaborators we have worked with for years. We have turned down the chance to double twice, and we would do it again.',
    'It means we can only take on eight or nine projects a year. It also means the person who designed your navigation is still around in month four when it needs changing.',
  ],
  cta: { label: 'Meet the team', href: '/about' },
  image: { src: PORTRAIT, alt: 'The studio team around a large table' },
};

export const CTA_BAND = {
  // `secondaryCta` is optional in the CMS; the default points at the phone number.
  image: { src: WIDE, alt: 'The studio entrance from the street' },
  eyebrow: 'Get in touch',
  title: 'Tell us what you are building',
  body: 'An hour on a call, no charge and no pitch deck. Worst case you leave with a clearer scope and a name of someone better suited.',
  primaryCta: { label: 'Book a conversation', href: '#' },
  secondaryCta: { label: SITE.phone, href: SITE.phoneHref },
};
