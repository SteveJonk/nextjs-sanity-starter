export type ContactIconName = 'phone' | 'whatsapp' | 'mail' | 'pin';

type ContactIconProps = {
  icon: ContactIconName;
  size?: number;
};

/** Phone / WhatsApp / mail / map-pin, for the contact panel beside a form. */
export function ContactIcon({ icon, size = 21 }: ContactIconProps) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    'aria-hidden': true as const,
  };

  switch (icon) {
    case 'phone':
      return (
        <svg {...common} fill='none'>
          <path
            d='M6.5 3h3l1.5 4-2 1.5a12 12 0 006.5 6.5L17 13l4 1.5v3a2 2 0 01-2.2 2A17 17 0 014 5.2 2 2 0 016 3z'
            stroke='currentColor'
            strokeWidth='1.5'
            strokeLinejoin='round'
          />
        </svg>
      );
    case 'whatsapp':
      return (
        <svg {...common} fill='currentColor'>
          <path d='M12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.5 1.3 5L2 22l5.2-1.4c1.4.8 3.1 1.2 4.8 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2zm5.9 14.2c-.2.6-1.4 1.2-1.9 1.3-.5.1-1.1.1-1.8-.1-.4-.1-1-.3-1.7-.6-3-1.3-4.9-4.3-5.1-4.5-.1-.2-1.2-1.6-1.2-3s.7-2.1 1-2.4c.3-.3.6-.4.8-.4h.6c.2 0 .4 0 .6.5.2.5.7 1.8.8 1.9.1.2.1.3 0 .5-.1.2-.1.3-.3.5l-.4.5c-.1.2-.3.3-.1.6.2.3.9 1.4 1.9 2.3 1.3 1.1 2.3 1.5 2.7 1.7.3.1.4.1.6-.1.2-.2.7-.8.9-1.1.2-.3.4-.2.6-.1.2.1 1.5.7 1.8.8.3.1.4.2.5.3.1.1.1.7-.1 1.3z' />
        </svg>
      );
    case 'mail':
      return (
        <svg {...common} fill='none'>
          <path
            d='M3 6h18v12H3zM3 7l9 6 9-6'
            stroke='currentColor'
            strokeWidth='1.5'
            strokeLinejoin='round'
          />
        </svg>
      );
    case 'pin':
      return (
        <svg {...common} fill='none'>
          <path
            d='M12 21s7-5.7 7-11a7 7 0 10-14 0c0 5.3 7 11 7 11z'
            stroke='currentColor'
            strokeWidth='1.5'
            strokeLinejoin='round'
          />
          <circle cx='12' cy='10' r='2.6' stroke='currentColor' strokeWidth='1.5' />
        </svg>
      );
  }
}
