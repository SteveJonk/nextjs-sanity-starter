'use client';

import { useEffect, useImperativeHandle, useRef, type Ref } from 'react';
import type { CaptchaProvider } from '@/lib/captcha';

/** Public half of the spam-check settings — the secret stays server-side. */
export type FormCaptcha = {
  provider: CaptchaProvider;
  siteKey: string;
};

export type CaptchaHandle = {
  /**
   * The token to post. `''` while the widget is showing but not solved yet;
   * `null` when it never loaded or errored — the form then posts without one
   * and the server checks whether the provider is really down.
   */
  token(): string | null;
  /** Tokens are single-use: a retry after a failed send needs a fresh one. */
  reset(): void;
};

/** `grecaptcha` and `turnstile` share this much of their explicit-render API. */
type WidgetApi = {
  render(element: HTMLElement, options: Record<string, unknown>): string | number;
  reset(id: string | number): void;
  remove?(id: string | number): void;
};

const SCRIPTS: Record<CaptchaProvider, { src: string; global: string }> = {
  recaptcha: { src: 'https://www.google.com/recaptcha/api.js', global: 'grecaptcha' },
  turnstile: { src: 'https://challenges.cloudflare.com/turnstile/v0/api.js', global: 'turnstile' },
};

const loading: Partial<Record<CaptchaProvider, Promise<WidgetApi>>> = {};

/** Injects the provider's script once per page, however many forms it has. */
function loadScript(provider: CaptchaProvider) {
  return (loading[provider] ??= new Promise<WidgetApi>((resolve, reject) => {
    const { src, global } = SCRIPTS[provider];
    const onload = `__${provider}Loaded`;
    const w = window as unknown as Record<string, unknown>;
    // The script calls this once its API is ready — `async` rules out
    // touching the global straight after the load event.
    w[onload] = () => resolve(w[global] as WidgetApi);
    const script = document.createElement('script');
    script.src = `${src}?render=explicit&onload=${onload}`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      // Forget the failure so a form mounted later tries again.
      delete loading[provider];
      script.remove();
      reject(new Error(`${provider} script failed to load`));
    };
    document.head.append(script);
  }));
}

/**
 * reCAPTCHA v2 or Turnstile, loaded only once the form scrolls near the
 * viewport: a page without a form, or a visitor who never gets that far, never
 * fetches the provider's script.
 */
export function Captcha({
  provider,
  siteKey,
  hidden,
  ref,
}: FormCaptcha & { hidden?: boolean; ref?: Ref<CaptchaHandle> }) {
  const box = useRef<HTMLDivElement>(null);
  const widget = useRef<{ api?: WidgetApi; id?: string | number; token: string | null }>({
    token: null,
  });

  useImperativeHandle(
    ref,
    () => ({
      token: () => widget.current.token,
      reset() {
        const { api, id } = widget.current;
        if (!api || id === undefined) return;
        widget.current.token = '';
        api.reset(id);
      },
    }),
    [],
  );

  useEffect(() => {
    const element = box.current;
    if (!element) return;
    let cancelled = false;
    const unavailable = () => {
      widget.current.token = null;
    };

    // A `hidden` box never intersects, so on a multi-step form this waits for
    // the last step.
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        loadScript(provider).then((api) => {
          if (cancelled) return;
          // A fresh node each time: reCAPTCHA refuses an element it already used.
          const target = element.appendChild(document.createElement('div'));
          widget.current = {
            api,
            token: '',
            id: api.render(target, {
              sitekey: siteKey,
              callback: (token: string) => {
                widget.current.token = token;
              },
              'expired-callback': () => {
                widget.current.token = '';
              },
              'error-callback': unavailable,
            }),
          };
        }, unavailable);
      },
      { rootMargin: '400px' },
    );
    observer.observe(element);

    return () => {
      cancelled = true;
      observer.disconnect();
      const { api, id } = widget.current;
      if (id !== undefined) api?.remove?.(id);
      element.replaceChildren();
      widget.current = { token: null };
    };
  }, [provider, siteKey]);

  // Both widgets are about 65–78px tall; reserving it keeps the button from
  // jumping down when the script arrives.
  return <div ref={box} hidden={hidden} className='mb-6 min-h-[78px]' />;
}
