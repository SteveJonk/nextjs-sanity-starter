/**
 * The smallest thing that fails when the CMS-driven form breaks.
 *
 * Five rules carry the weight here:
 *   1. `toSteps` turns either mode — one page or several steps — into the one
 *      shape the renderer draws, so there is no second code path;
 *   2. half-width fields pair up and everything else gets its own row;
 *   3. `FORM_QUERY` is the server's allow-list, and it has to resolve to
 *      exactly the fields the renderer shows. If those two disagree the form
 *      silently stops accepting answers;
 *   4. a form only redirects when the switch is on *and* the link resolves —
 *      otherwise the visitor is stranded on a form already sent;
 *   5. the mail escapes what it interpolates: an answer is visitor input.
 *
 * Run with `npm run check:form`. No Sanity, no React, no mail provider.
 */
import assert from 'node:assert/strict';
import { evaluate, parse } from 'groq-js';
import { CONTACT_FORM_FIELDS } from '@/lib/demo-content';
import {
  fillTokens,
  toFieldRows,
  toFormDefinition,
  toRedirect,
  toSteps,
  type FormFieldDefinition,
} from '@/lib/form-fields';
import { renderFormMail } from '@/lib/form-mail';
import { FORM_QUERY } from '@/sanity/queries';

function names(rows: FormFieldDefinition[][]) {
  return rows.map((row) => row.map((field) => field.name));
}

const field = (
  name: string,
  width?: 'full' | 'half',
  type: FormFieldDefinition['type'] = 'text',
): FormFieldDefinition => ({ label: name, name, type, width });

// 1. Both modes collapse to the same shape.
assert.deepEqual(
  toSteps({ id: 'f', mode: 'simple', fields: [field('a')] }),
  [{ title: undefined, fields: [field('a')] }],
  'a simple form is one step',
);
assert.deepEqual(
  toSteps({
    id: 'f',
    mode: 'steps',
    fields: [field('ignored')],
    steps: [
      { title: 'One', fields: [field('a')] },
      { title: 'Two', fields: [field('b')] },
    ],
  }).map((step) => step.title),
  ['One', 'Two'],
  'in steps mode the top-level fields are not used',
);
assert.equal(
  toSteps({ id: 'f', mode: 'steps', steps: [{ fields: [] }, { fields: [field('a')] }] }).length,
  1,
  'an empty step is dropped — it could be neither filled in nor left',
);
assert.equal(toSteps({ id: 'f', mode: 'simple' }).length, 0);

// 2. Layout: two halves share a row, everything else gets its own.
assert.deepEqual(
  names(toFieldRows([field('a', 'half'), field('b', 'half'), field('c', 'full')])),
  [['a', 'b'], ['c']],
);
assert.deepEqual(
  names(toFieldRows([field('a', 'half'), field('b', 'full'), field('c', 'half')])),
  [['a'], ['b'], ['c']],
  'a full-width field between two halves breaks the pair',
);
assert.deepEqual(
  names(toFieldRows([field('a', 'half'), field('b', 'half'), field('c', 'half')])),
  [['a', 'b'], ['c']],
  'three halves are a pair and a remainder, never a row of three',
);
assert.deepEqual(
  names(toFieldRows([field('a', 'half'), field('h', 'half', 'hidden'), field('b', 'half')])),
  [['a', 'b']],
  'a hidden field draws nothing and must not break the pair around it',
);
assert.deepEqual(names(toFieldRows([field('a'), field('b')])), [['a'], ['b']]);

// 3. FORM_QUERY resolves to exactly the fields the renderer shows.
const stepsDocument = {
  _id: 'form-steps',
  _type: 'form',
  title: 'In steps',
  mode: 'steps',
  fields: [{ label: 'Unused', name: 'unused', type: 'text', isRequired: true }],
  steps: [
    { fields: [{ label: 'Name', name: 'name', type: 'text', isRequired: true }] },
    { fields: [{ label: 'E-mail', name: 'email', type: 'email', isRequired: true }] },
  ],
};
const simpleDocument = {
  _id: 'form-simple',
  _type: 'form',
  title: 'One page',
  mode: 'simple',
  fields: [
    { label: 'Name', name: 'name', type: 'text', isRequired: true },
    { label: 'Message', name: 'message', type: 'textarea' },
  ],
};

async function runFormQuery(document: Record<string, unknown>) {
  const tree = parse(FORM_QUERY);
  const value = await evaluate(tree, {
    dataset: [document],
    params: { formId: document._id as string },
  });
  return (await value.get()) as { fields?: Array<{ name: string }> | null } | null;
}

/** The only async part: groq-js evaluates the real query against fake docs. */
async function checkAllowList() {
  const fromSteps = await runFormQuery(stepsDocument);
  assert.deepEqual(
    fromSteps?.fields?.map((item) => item.name),
    ['name', 'email'],
    'a multi-step form flattens every step, and ignores the unused top-level fields',
  );

  const fromSimple = await runFormQuery(simpleDocument);
  assert.deepEqual(
    fromSimple?.fields?.map((item) => item.name),
    ['name', 'message'],
  );

  // The renderer and the allow-list have to agree, or answers vanish silently.
  const rendered = toSteps(toFormDefinition(stepsDocument)!).flatMap((step) =>
    step.fields.map((item) => item.name),
  );
  assert.deepEqual(
    rendered,
    fromSteps?.fields?.map((item) => item.name),
    'every field the renderer draws must be in FORM_QUERY',
  );
}

// The demo form the seed pushes has to survive the same round trip.
const demo = toFormDefinition({
  _id: 'form-contact',
  mode: 'simple',
  fields: CONTACT_FORM_FIELDS,
});
assert.ok(demo, 'the seeded demo form must render');
const demoNames = new Set(CONTACT_FORM_FIELDS.map((item) => item.name));
assert.equal(demoNames.size, CONTACT_FORM_FIELDS.length, 'field names are the mail keys — unique');

// 4. Redirect only when the switch is on and the link actually resolves.
assert.equal(toRedirect(false, { linkType: 'external', href: 'https://x.example' }), undefined);
assert.equal(toRedirect(true, null), undefined, 'switch on but no link: show the confirmation');
assert.equal(
  toRedirect(true, { linkType: 'internal', internalLink: { slug: null } }),
  undefined,
  'switch on but no page picked yet: show the confirmation',
);
assert.deepEqual(toRedirect(true, { linkType: 'internal', internalLink: { slug: 'thanks' } }), {
  href: '/thanks',
  internal: true,
});
assert.deepEqual(toRedirect(true, { linkType: 'internal', internalLink: { slug: 'home' } }), {
  href: '/',
  internal: true,
});
assert.deepEqual(toRedirect(true, { linkType: 'external', href: 'https://x.example/thanks' }), {
  href: 'https://x.example/thanks',
  internal: false,
});

// Hidden-field tokens: known ones are filled, unknown ones do not leak.
assert.equal(fillTokens('{{path}}', { path: '/about' }), '/about');
assert.equal(fillTokens('{{ path }}', { path: '/about' }), '/about');
assert.equal(fillTokens('{{nope}}', { path: '/about' }), '', 'an unknown token sends empty');
assert.equal(fillTokens('plain'), 'plain');

// 5. The mail escapes what it interpolates — every answer is visitor input.
const mail = renderFormMail({
  title: 'New message',
  intro: 'Someone wrote in.',
  answers: [{ label: 'Message', value: '<script>alert(1)</script> & "quoted"' }],
  branding: { primaryColor: 'javascript:alert(1)', textColor: '#0f172a' },
});
assert.ok(!mail.html.includes('<script>alert(1)</script>'), 'an answer must not become markup');
assert.ok(mail.html.includes('&lt;script&gt;'), 'it is escaped instead');
assert.ok(
  !mail.html.includes('javascript:alert(1)'),
  'a colour that is not a hex code must not reach the style attribute',
);
assert.ok(mail.text.includes('Message: '), 'the plain-text part carries the same answers');
assert.ok(
  mail.html.includes('&amp;') && mail.html.includes('&quot;'),
  'ampersands and quotes are escaped too',
);

checkAllowList()
  .then(() => console.log('check:form — all assertions passed'))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
