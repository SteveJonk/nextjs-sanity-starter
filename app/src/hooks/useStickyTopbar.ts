"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { TOPBAR_STUCK_OFFSET } from "@/lib/chrome";

export function useStickyTopbar() {
  const [stuck, setStuck] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Pages that open on a light background (no photo hero) mark themselves
    // with data-solid-header: the bar stays solid from the top so the nav reads.
    const alwaysSolid = Boolean(document.querySelector("[data-solid-header]"));
    const onScroll = () => {
      setStuck(alwaysSolid || window.scrollY > TOPBAR_STUCK_OFFSET);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  return stuck;
}
