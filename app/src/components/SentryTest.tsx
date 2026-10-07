'use client';

import { useState } from 'react';
import { buttonClass } from '@/components/ui/Button';

// Literal env read: Next inlines it at build time, like everywhere else Sentry is gated.
const enabled = Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN);

/**
 * Buttons that raise a deliberate error in the browser and on the server, so
 * you can check that both reach Sentry. Each shows up there as a new issue
 * named "Sentry test: …".
 */
export function SentryTest() {
  const [status, setStatus] = useState<string | null>(null);

  function throwClientError() {
    setStatus('Client error thrown. Look for "Sentry test: client error" in Sentry → Issues.');
    // Thrown outside React so nothing catches it: Sentry's global handler has to.
    setTimeout(() => {
      throw new Error('Sentry test: client error');
    });
  }

  async function triggerServerError() {
    setStatus('Calling /api/sentry-test …');
    try {
      const response = await fetch('/api/sentry-test', { cache: 'no-store' });
      setStatus(
        response.status === 500
          ? 'Server error thrown (500). Look for "Sentry test: server error" in Sentry → Issues.'
          : `Unexpected response: ${response.status}.`,
      );
    } catch {
      setStatus('The request failed before reaching the server.');
    }
  }

  return (
    <>
      <p className='mb-8 leading-[1.7]'>
        Sentry is{' '}
        <strong>{enabled ? 'enabled' : 'disabled: NEXT_PUBLIC_SENTRY_DSN is not set'}</strong>.
      </p>
      <div className='flex flex-wrap gap-3.5'>
        <button type='button' className={buttonClass()} onClick={throwClientError}>
          Throw client error
        </button>
        <button type='button' className={buttonClass('outline')} onClick={triggerServerError}>
          Throw server error
        </button>
      </div>
      <p className='mt-6 min-h-[1.7em] text-muted' role='status'>
        {status}
      </p>
    </>
  );
}
