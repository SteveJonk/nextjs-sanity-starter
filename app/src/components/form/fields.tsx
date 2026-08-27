import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import type { FormFieldDefinition } from '@/lib/form-fields';

/** `stacked` is the roomy page form, `compact` fits a narrow card or sidebar. */
export type FormFieldVariant = 'stacked' | 'compact';

const controlBase = cn(
  'w-full rounded-[3px] border border-fg/16 bg-surface text-fg',
  'transition-[border-color,box-shadow] duration-250 ease-brand placeholder:text-subtle',
  'focus:border-accent-strong focus:ring-[3px] focus:ring-accent-strong/20 focus:outline-none',
);

const VARIANTS = {
  stacked: {
    wrapper: 'mb-5',
    label: 'mb-[9px] block text-[0.78rem] font-semibold tracking-[0.1em] text-muted uppercase',
    control: 'px-[18px] py-4 text-[0.97rem]',
    caretY: '24px',
    checkboxWrapper: 'my-1.5 mb-[26px] flex items-start gap-3 max-sm:gap-3.5',
    checkboxInput:
      'mt-px size-[22px] shrink-0 cursor-pointer accent-accent-strong max-sm:size-[26px]',
    checkboxLabel: 'cursor-pointer text-[0.88rem] leading-[1.6] text-muted',
  },
  compact: {
    wrapper: 'mb-4',
    label: 'mb-2 block text-[0.86rem] font-medium text-fg',
    control: 'px-[18px] py-[15px] text-[0.95rem]',
    caretY: '22px',
    checkboxWrapper: 'my-1 mb-5 flex items-start gap-3',
    checkboxInput: 'mt-[3px] size-[20px] shrink-0 cursor-pointer accent-accent-strong',
    checkboxLabel: 'cursor-pointer text-[0.85rem] leading-[1.6] text-muted',
  },
} as const satisfies Record<FormFieldVariant, Record<string, string>>;

/**
 * The dropdown chevron, drawn with two gradients so it needs no asset. Built
 * from the theme's `--color-muted`, so recolouring the theme recolours it.
 */
function selectCaret(offsetY: string) {
  return {
    backgroundImage:
      'linear-gradient(45deg,transparent 50%,var(--color-muted) 50%),linear-gradient(135deg,var(--color-muted) 50%,transparent 50%)',
    backgroundPosition: `calc(100% - 21px) ${offsetY}, calc(100% - 15px) ${offsetY}`,
    backgroundSize: '6px 6px, 6px 6px',
    backgroundRepeat: 'no-repeat',
  } as const;
}

/** Turns `[label](href)` in editor copy into a real link. */
export function linkify(text: string): ReactNode {
  const parts = text.split(/\[([^\]]+)\]\(([^)]+)\)/g);
  if (parts.length === 1) return text;

  const nodes: ReactNode[] = [];
  for (let i = 0; i < parts.length; i += 3) {
    if (parts[i]) nodes.push(parts[i]);
    if (parts[i + 1]) {
      nodes.push(
        <Link
          key={i}
          href={parts[i + 2]}
          className='text-accent-strong underline underline-offset-[3px]'
        >
          {parts[i + 1]}
        </Link>,
      );
    }
  }
  return nodes;
}

export function FormField({
  field,
  variant = 'stacked',
  idPrefix = 'field',
}: {
  field: FormFieldDefinition;
  variant?: FormFieldVariant;
  idPrefix?: string;
}) {
  const styles = VARIANTS[variant];
  const id = `${idPrefix}-${field.name}`;
  const controlClass = cn(controlBase, styles.control);

  // Hidden fields are drawn by the renderer itself — it is the only place that
  // knows the page context their value is filled from.
  if (field.type === 'hidden') return null;

  // Checkboxes carry their own label per option, so they skip the field label.
  if (field.type === 'checkbox') {
    return (
      <>
        {(field.checkboxOptions ?? []).map((option, index) => (
          <div key={option} className={styles.checkboxWrapper}>
            <input
              type='checkbox'
              id={`${id}-${index}`}
              name={field.name}
              value={option}
              required={field.isRequired}
              className={styles.checkboxInput}
            />
            <label htmlFor={`${id}-${index}`} className={styles.checkboxLabel}>
              {linkify(option)}
            </label>
          </div>
        ))}
      </>
    );
  }

  return (
    <div className={styles.wrapper}>
      <label htmlFor={id} className={styles.label}>
        {field.label}
      </label>

      {field.type === 'textarea' ? (
        <textarea
          id={id}
          name={field.name}
          required={field.isRequired}
          placeholder={field.placeholder}
          className={cn(controlClass, 'min-h-[150px] resize-y leading-[1.6]')}
        />
      ) : field.type === 'select' ? (
        <select
          id={id}
          name={field.name}
          required={field.isRequired}
          // With a placeholder the empty option is the initial value, so a
          // required dropdown actually blocks submitting; without one the
          // browser preselects the first real option.
          defaultValue={field.placeholder ? '' : undefined}
          style={selectCaret(styles.caretY)}
          className={cn(controlClass, 'cursor-pointer appearance-none pr-[46px]')}
        >
          {field.placeholder ? <option value=''>{field.placeholder}</option> : null}
          {(field.selectOptions ?? []).map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      ) : field.type === 'radio' ? (
        <div className='flex flex-wrap gap-x-6 gap-y-2.5'>
          {(field.radioOptions ?? []).map((option) => (
            <label
              key={option}
              className='flex cursor-pointer items-center gap-2.5 text-[0.95rem] text-muted'
            >
              <input
                type='radio'
                name={field.name}
                value={option}
                required={field.isRequired}
                className='size-[18px] cursor-pointer accent-accent-strong'
              />
              {option}
            </label>
          ))}
        </div>
      ) : (
        <input
          type={field.type}
          id={id}
          name={field.name}
          required={field.isRequired}
          placeholder={field.placeholder}
          className={controlClass}
        />
      )}

      {field.helpText ? (
        <p className='mt-2 text-[0.82rem] text-subtle'>{linkify(field.helpText)}</p>
      ) : null}
    </div>
  );
}
