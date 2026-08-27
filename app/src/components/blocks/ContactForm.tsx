import { FormRenderer, type FormRecaptcha } from '@/components/form/FormRenderer';
import { Button } from '@/components/ui/Button';
import { ContactIcon, type ContactIconName } from '@/components/ui/ContactIcon';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Reveal } from '@/components/ui/Reveal';
import { Wrap } from '@/components/ui/Wrap';
import { CONTACT_FORM } from '@/lib/demo-content';
import type { FormDefinition } from '@/lib/form-fields';

export type ContactFormAsideItem = {
  icon: ContactIconName;
  title: string;
  subtitle: string;
};

export type ContactFormAside = {
  title: string;
  body: string;
  items: ContactFormAsideItem[];
  cta?: { label: string; href: string };
};

export type ContactFormProps = {
  eyebrow?: string;
  title?: string;
  lead?: string;
  note?: string;
  /** The form itself, from the referenced `form` document. */
  form?: FormDefinition;
  aside?: ContactFormAside;
  recaptcha?: FormRecaptcha;
  /** Values a hidden field can pick up by `{{token}}` — see FormRenderer. */
  context?: Record<string, string>;
};

const DEFAULTS = {
  eyebrow: CONTACT_FORM.eyebrow,
  title: CONTACT_FORM.title,
  lead: CONTACT_FORM.lead,
  note: CONTACT_FORM.note,
  aside: {
    ...CONTACT_FORM.aside,
    items: [...CONTACT_FORM.aside.items],
  } as ContactFormAside,
};

export function ContactForm({
  eyebrow = DEFAULTS.eyebrow,
  title = DEFAULTS.title,
  lead = DEFAULTS.lead,
  note = DEFAULTS.note,
  form,
  aside = DEFAULTS.aside,
  recaptcha,
  context,
}: ContactFormProps = {}) {
  return (
    <section className='bg-surface-alt py-[118px] max-sm:py-[82px]'>
      <Wrap
        className={[
          'grid grid-cols-[1.32fr_0.68fr] items-start gap-16',
          'max-lg:gap-[50px] max-md:grid-cols-1',
        ].join(' ')}
      >
        <Reveal>
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2 className='mb-4 max-w-[15ch] text-[clamp(2rem,3.6vw,3rem)] max-sm:max-w-none'>
            {title}
          </h2>
          <p className='mb-10 max-w-[48ch] leading-[1.7] text-muted max-sm:mb-8 max-sm:max-w-none'>
            {lead}
          </p>
          {form ? (
            <FormRenderer
              form={form}
              variant='stacked'
              recaptcha={recaptcha}
              context={context}
              footer={note ? <p className='mt-4 text-[0.84rem] text-subtle'>{note}</p> : null}
            />
          ) : (
            // An editor added the block but has not picked a form yet. Saying
            // so beats rendering an empty column they cannot diagnose.
            <p className='text-subtle'>No form is connected to this block yet.</p>
          )}
        </Reveal>

        {aside?.title ? (
          <Reveal delay={1} className='sticky top-[120px] max-md:static max-md:mt-2'>
            <aside className='rounded bg-surface px-[34px] py-[38px] max-sm:px-[26px] max-sm:py-[30px]'>
              <h3 className='mb-3.5 text-[1.42rem]'>{aside.title}</h3>
              {aside.body ? (
                <p className='mb-[26px] text-[0.92rem] leading-[1.7] text-muted'>{aside.body}</p>
              ) : null}
              {aside.items.length > 0 ? (
                <ul className='mb-7 list-none'>
                  {aside.items.map((item) => (
                    <li
                      key={item.title}
                      className='flex items-start gap-[13px] border-t border-accent py-[13px] first:border-t-0 first:pt-0'
                    >
                      <span className='mt-[3px] shrink-0 text-accent-strong'>
                        <ContactIcon icon={item.icon} size={17} />
                      </span>
                      <span>
                        <b className='block text-[0.94rem] font-semibold'>{item.title}</b>
                        <span className='text-[0.83rem] text-subtle'>{item.subtitle}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}
              {aside.cta ? (
                <Button href={aside.cta.href} className='w-full justify-center'>
                  {aside.cta.label}
                </Button>
              ) : null}
            </aside>
          </Reveal>
        ) : null}
      </Wrap>
    </section>
  );
}
