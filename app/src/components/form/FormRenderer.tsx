'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState, type FormEvent, type MouseEvent, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import { cn } from '@/lib/cn';
import { fillTokens, toFieldRows, toSteps, type FormDefinition } from '@/lib/form-fields';
import { FormField, type FormFieldVariant } from './fields';

/** Public half of the reCAPTCHA settings — the secret stays server-side. */
export type FormRecaptcha = {
  enabled: boolean;
  siteKey: string;
};

export type FormRendererProps = {
  form: FormDefinition;
  /** Heading above the form. Hidden once the form has been sent. */
  title?: string;
  lead?: string;
  /** Small print under the form, shown in every state. */
  footer?: ReactNode;
  recaptcha?: FormRecaptcha;
  variant?: FormFieldVariant;
  /**
   * Values the surrounding page knows and the visitor does not type — which
   * page the form was submitted from, say. A hidden field picks them up by
   * `{{token}}`.
   */
  context?: Record<string, string>;
};

type Control = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

const BUTTON_BASE = cn(
  'inline-flex items-center justify-center gap-2.5 rounded-pill border border-transparent',
  'bg-brand text-btn font-semibold text-brand-fg',
  'transition-[background,transform] duration-300 ease-brand hover:-translate-y-0.5 hover:bg-brand-hover',
  'focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-accent-strong',
  'cursor-pointer disabled:pointer-events-none disabled:opacity-60',
);

/**
 * Per-variant chrome. `stacked` is the page-width form (inline button, panel
 * confirmation), `compact` a narrow card (full-width button, centred
 * confirmation with a check mark).
 */
const VARIANTS = {
  stacked: {
    button: cn(BUTTON_BASE, 'px-[34px] py-[17px] whitespace-nowrap max-sm:w-full'),
    title: 'mb-6 text-[1.4rem]',
    lead: 'mb-6 leading-[1.7] text-muted',
    rowGap: 'gap-5',
  },
  compact: {
    button: cn(BUTTON_BASE, 'w-full px-[28px] py-[17px]'),
    title: 'mb-2 text-[1.55rem]',
    lead: 'text-[0.92rem] leading-[1.6] text-muted',
    rowGap: 'gap-3.5',
  },
} as const satisfies Record<FormFieldVariant, Record<string, string>>;

function IconArrowRight() {
  return (
    <svg width='15' height='15' viewBox='0 0 14 14' fill='none' aria-hidden='true'>
      <path d='M2 7h10M8.2 3.2 12 7l-3.8 3.8' stroke='currentColor' strokeWidth='1.4' />
    </svg>
  );
}

function SuccessPanel({
  variant,
  title,
  body,
}: {
  variant: FormFieldVariant;
  title?: string;
  body?: string;
}) {
  if (variant === 'stacked') {
    return (
      <div className='rounded border-l-[3px] border-accent-strong bg-surface px-10 py-11 max-sm:px-6 max-sm:py-8'>
        {title ? <h3 className='mb-2.5 text-[1.6rem]'>{title}</h3> : null}
        {body ? <p className='leading-[1.7] text-muted'>{body}</p> : null}
      </div>
    );
  }

  return (
    <div className='py-3 text-center'>
      <div className='mx-auto mb-4 grid size-[58px] place-items-center rounded-full bg-accent text-accent-strong'>
        <svg width='30' height='30' viewBox='0 0 24 24' fill='none' aria-hidden='true'>
          <path d='M4 12.5 9.5 18 20 7' stroke='currentColor' strokeWidth='2' />
        </svg>
      </div>
      {title ? <h3 className='mb-2.5 text-[1.6rem]'>{title}</h3> : null}
      {body ? (
        <p className='mx-auto max-w-[34ch] text-[0.95rem] leading-[1.7] text-muted'>{body}</p>
      ) : null}
    </div>
  );
}

/**
 * Renders any Sanity `form` — one page of fields or several steps — and posts
 * the whole thing to /api/submit-form in one request. A form with a redirect
 * sends the visitor to that page afterwards instead of showing its
 * confirmation panel.
 *
 * Every step stays mounted (hidden steps keep their values in the FormData),
 * which is why the form carries `noValidate`: the browser would otherwise
 * refuse to submit over a required field it cannot focus. Validation is driven
 * per step instead — `reportValidity()` still shows the native message.
 */
export function FormRenderer({
  form,
  title,
  lead,
  footer,
  recaptcha,
  variant = 'compact',
  context,
}: FormRendererProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<'idle' | 'sending' | 'done'>('idle');
  const [error, setError] = useState<string | null>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const styles = VARIANTS[variant];
  const steps = toSteps(form);
  const total = steps.length;
  const isLastStep = step >= total - 1;
  const usesRecaptcha = Boolean(recaptcha?.enabled && recaptcha.siteKey);

  function controlsOf(index: number): Control[] {
    const container = stepRefs.current[index];
    if (!container) return [];
    return Array.from(container.querySelectorAll<Control>('input, select, textarea'));
  }

  /** Silent check — safe to run on a step the user cannot see. */
  function stepIsValid(index: number) {
    return controlsOf(index).every((control) => control.checkValidity());
  }

  /** Focuses and explains the first problem on a step the user *can* see. */
  function reportStep(index: number) {
    const invalid = controlsOf(index).find((control) => !control.checkValidity());
    if (!invalid) return true;
    invalid.reportValidity();
    return false;
  }

  function goNext(event: MouseEvent<HTMLButtonElement>) {
    // This very button becomes the submit button on the last step. Its
    // activation behaviour is read after this handler runs, so without this the
    // step that setStep() just revealed is submitted by the same click — and
    // the visitor lands on step 2 staring at a native "fill in this field".
    event.preventDefault();
    if (reportStep(step)) setStep((current) => Math.min(current + 1, total - 1));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Should only ever be the current step, since you cannot walk past an
    // invalid one — but an earlier step is still recoverable: show it first,
    // because reportValidity() cannot open a bubble on a hidden field.
    const firstInvalid = steps.findIndex((_, index) => !stepIsValid(index));
    if (firstInvalid !== -1) {
      if (firstInvalid !== step) flushSync(() => setStep(firstInvalid));
      reportStep(firstInvalid);
      return;
    }

    const body = new FormData(event.currentTarget);
    body.set('formId', form.id);

    if (usesRecaptcha) {
      const token = recaptchaRef.current?.getValue();
      if (!token) {
        setError('Please confirm you are not a robot.');
        return;
      }
      body.set('recaptchaToken', token);
    }

    setStatus('sending');
    setError(null);
    try {
      const response = await fetch('/api/submit-form', { method: 'POST', body });
      const result = (await response.json()) as { success?: boolean; message?: string };
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Sending failed.');
      }
      if (form.redirect) {
        // Stay on 'sending' so the button keeps its disabled state until the
        // new page takes over — a second submit would mail the same answers.
        if (form.redirect.internal) router.push(form.redirect.href);
        else window.location.assign(form.redirect.href);
        return;
      }
      setStatus('done');
    } catch (submitError) {
      // A token is single-use: clear it so a retry gets a fresh one.
      recaptchaRef.current?.reset();
      setStatus('idle');
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Sending failed. Please try again later.',
      );
    }
  }

  if (status === 'done') {
    return <SuccessPanel variant={variant} title={form.successTitle} body={form.successBody} />;
  }

  return (
    <>
      {title || lead ? (
        <div className={variant === 'compact' ? 'mb-6' : undefined}>
          {title ? <h2 className={styles.title}>{title}</h2> : null}
          {lead ? <p className={styles.lead}>{lead}</p> : null}
        </div>
      ) : null}

      {total > 1 ? (
        <div className='mb-[26px] flex items-center gap-3.5'>
          <div className='h-1 flex-1 overflow-hidden rounded-pill bg-fg/13'>
            <span
              className='block h-full rounded-pill bg-accent-strong transition-[width] duration-[450ms] ease-brand'
              style={{ width: `${((step + 1) / total) * 100}%` }}
            />
          </div>
          <span className='text-[0.74rem] font-semibold tracking-[0.11em] whitespace-nowrap text-subtle uppercase'>
            Step {step + 1} of {total}
          </span>
        </div>
      ) : null}

      <form onSubmit={onSubmit} noValidate>
        {form.showTitle && form.title ? <h3 className={styles.title}>{form.title}</h3> : null}

        {steps.map((formStep, index) => (
          <div
            key={index}
            ref={(el) => {
              stepRefs.current[index] = el;
            }}
            hidden={index !== step}
          >
            {formStep.title ? <h3 className='mb-4 text-[1.15rem]'>{formStep.title}</h3> : null}

            {formStep.fields
              .filter((field) => field.type === 'hidden')
              .map((field) => (
                <input
                  key={field.name}
                  type='hidden'
                  name={field.name}
                  value={fillTokens(field.defaultValue ?? '', context)}
                />
              ))}

            {toFieldRows(formStep.fields).map((row) => {
              const key = row.map((field) => field.name).join('-');
              return row.length === 2 ? (
                <div
                  key={key}
                  className={cn(
                    'grid grid-cols-2 max-sm:grid-cols-1 max-sm:gap-0',
                    styles.rowGap,
                  )}
                >
                  {row.map((field) => (
                    <FormField
                      key={field.name}
                      field={field}
                      variant={variant}
                      idPrefix={form.id}
                    />
                  ))}
                </div>
              ) : (
                <FormField key={key} field={row[0]} variant={variant} idPrefix={form.id} />
              );
            })}
          </div>
        ))}

        {usesRecaptcha && isLastStep ? (
          <div className='mb-6'>
            <ReCAPTCHA ref={recaptchaRef} sitekey={recaptcha!.siteKey} />
          </div>
        ) : null}

        {error ? (
          <p role='alert' className='mb-4 text-[0.9rem] text-danger'>
            {error}
          </p>
        ) : null}

        {isLastStep ? (
          <button type='submit' disabled={status === 'sending'} className={styles.button}>
            {status === 'sending' ? 'Sending…' : (form.submitButtonText ?? 'Send')}
          </button>
        ) : (
          <button type='button' onClick={goNext} className={styles.button}>
            {form.nextButtonText ?? 'Next'}
            <IconArrowRight />
          </button>
        )}

        {step > 0 ? (
          <button
            type='button'
            onClick={() => setStep((current) => Math.max(current - 1, 0))}
            className='mt-3.5 flex w-full items-center justify-center gap-1.5 text-[0.85rem] font-medium text-subtle transition-colors duration-250 ease-brand hover:text-fg'
          >
            ← {form.backButtonText ?? 'Back'}
          </button>
        ) : null}

        {footer}
      </form>
    </>
  );
}
