/**
 * Shape and layout rules for CMS-authored forms. No React in here, so the
 * grouping logic can be checked by `npm run check:form`.
 */
import { isInternalHref, resolveHref, type SanityLink } from '@/lib/links';

export type FormFieldType =
  | 'text'
  | 'email'
  | 'tel'
  | 'url'
  | 'textarea'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'file'
  /** Not drawn: submitted as-is, so the mail carries context the visitor never typed. */
  | 'hidden';

/** One input, as authored in the `form` document. */
export type FormFieldDefinition = {
  label: string;
  name: string;
  type: FormFieldType;
  isRequired?: boolean;
  width?: 'full' | 'half';
  placeholder?: string;
  helpText?: string;
  /** Hidden fields only: the value to submit, with `{{token}}` placeholders. */
  defaultValue?: string;
  selectOptions?: string[];
  radioOptions?: string[];
  checkboxOptions?: string[];
};

export type FormStep = {
  title?: string;
  fields: FormFieldDefinition[];
};

/**
 * A form as authored in the `form` document. A simple form keeps its fields
 * under `fields`; a multi-step one spreads them over `steps`. Everything the
 * front end needs is here, so the block that renders it only supplies chrome.
 */
export type FormDefinition = {
  id: string;
  title?: string;
  showTitle?: boolean;
  mode?: 'simple' | 'steps';
  fields?: FormFieldDefinition[];
  steps?: FormStep[];
  nextButtonText?: string;
  backButtonText?: string;
  submitButtonText?: string;
  successTitle?: string;
  successBody?: string;
  /**
   * Where to send the visitor after a successful submission, instead of
   * showing the confirmation. Resolved from the document's
   * `redirectAfterSubmit` + `redirectLink` by `toFormDefinition`.
   */
  redirect?: FormRedirect;
};

/** A resolved redirect target. `internal` ones go through the Next router. */
export type FormRedirect = {
  href: string;
  internal: boolean;
};

/**
 * The redirect a form document asks for, or undefined when it should show its
 * confirmation instead. A link that resolves to nothing (the switch is on but
 * no page was picked yet) falls back to the confirmation rather than stranding
 * the visitor on a form that has already been sent.
 */
export function toRedirect(
  redirectAfterSubmit: boolean | null | undefined,
  link: SanityLink | null | undefined,
): FormRedirect | undefined {
  if (!redirectAfterSubmit) return undefined;
  const href = resolveHref(link)?.trim();
  if (!href) return undefined;
  return { href, internal: isInternalHref(href) };
}

/**
 * The one shape the renderer works with. A simple form becomes a single step,
 * so there is no second code path for it. Steps without fields are dropped —
 * they would render a page the visitor can neither fill in nor leave.
 */
export function toSteps(form: FormDefinition): FormStep[] {
  const steps = form.mode === 'steps' ? (form.steps ?? []) : [{ fields: form.fields ?? [] }];

  return steps
    .map((step) => ({ title: step.title, fields: step.fields ?? [] }))
    .filter((step) => step.fields.length > 0);
}

/**
 * `{{path}}` -> context.path. A token the page does not know becomes empty
 * rather than leaking the raw `{{…}}` into the mail.
 */
export function fillTokens(value: string, context: Record<string, string> = {}) {
  return value.replace(
    /\{\{\s*([a-zA-Z0-9_-]+)\s*\}\}/g,
    (_, token: string) => context[token] ?? '',
  );
}

/**
 * Groups fields into rows: two consecutive half-width fields pair up, the rest
 * get a row of their own. Hidden fields are left out — they draw nothing, and a
 * row of their own would break the pairing of the fields around them.
 */
export function toFieldRows(fields: FormFieldDefinition[]): FormFieldDefinition[][] {
  const rows: FormFieldDefinition[][] = [];

  for (const field of fields.filter((item) => item.type !== 'hidden')) {
    const last = rows[rows.length - 1];
    const pairs = field.width === 'half' && last?.length === 1 && last[0].width === 'half';

    if (pairs) last.push(field);
    else rows.push([field]);
  }

  return rows;
}

/**
 * Turns a resolved `form->` reference into what the renderer takes. Unset keys
 * come back as null from GROQ, so they are normalised to undefined rather than
 * leaking null into the component's defaults.
 */
export function toFormDefinition(value: unknown): FormDefinition | undefined {
  const form = value as
    | {
        _id?: string;
        title?: string | null;
        showTitle?: boolean | null;
        mode?: string | null;
        fields?: FormFieldDefinition[] | null;
        steps?: Array<{ title?: string | null; fields?: FormFieldDefinition[] | null }> | null;
        submitButtonText?: string | null;
        nextButtonText?: string | null;
        backButtonText?: string | null;
        successTitle?: string | null;
        successBody?: string | null;
        redirectAfterSubmit?: boolean | null;
        redirectLink?: SanityLink | null;
      }
    | undefined
    | null;

  if (!form?._id) return undefined;

  const definition: FormDefinition = {
    id: form._id,
    title: form.title ?? undefined,
    showTitle: form.showTitle ?? undefined,
    mode: form.mode === 'steps' ? 'steps' : 'simple',
    fields: form.fields ?? undefined,
    steps: (form.steps ?? []).map((step) => ({
      title: step.title ?? undefined,
      fields: step.fields ?? [],
    })),
    submitButtonText: form.submitButtonText ?? undefined,
    nextButtonText: form.nextButtonText ?? undefined,
    backButtonText: form.backButtonText ?? undefined,
    successTitle: form.successTitle ?? undefined,
    successBody: form.successBody ?? undefined,
    redirect: toRedirect(form.redirectAfterSubmit, form.redirectLink),
  };

  // A form with nothing fillable would render an empty card.
  return toSteps(definition).length > 0 ? definition : undefined;
}
