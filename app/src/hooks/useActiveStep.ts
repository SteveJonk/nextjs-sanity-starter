"use client";

import { useEffect, useRef, useState } from "react";

/** Tracks which step list item is closest to ~42% viewport height. */
export function useActiveStep(count: number) {
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const update = () => {
      const mik = window.innerHeight * 0.42;
      let best = 0;
      let shortest = Infinity;

      itemRefs.current.forEach((li, index) => {
        if (!li) return;
        const rect = li.getBoundingClientRect();
        const distance = Math.abs(rect.top + rect.height / 2 - mik);
        if (distance < shortest) {
          shortest = distance;
          best = index;
        }
      });

      setActive((prev) => (prev === best ? prev : best));
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [count]);

  return { active, itemRefs };
}
