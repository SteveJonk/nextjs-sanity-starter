'use client';

import { useEffect, useRef, useState } from 'react';

const REVEAL_OPTIONS: IntersectionObserverInit = {
  threshold: 0.12,
  rootMargin: '0px 0px -40px 0px',
};

export function useRevealOnScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)')?.matches) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisible(true);
      return;
    }

    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          setVisible(true);
          io.unobserve(entry.target);
        }
      }
    }, REVEAL_OPTIONS);

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return { ref, visible };
}
