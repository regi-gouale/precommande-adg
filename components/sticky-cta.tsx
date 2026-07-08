"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function StickyCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = document.querySelector<HTMLElement>("#precommande");
    if (!hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(!entry.isIntersecting);
      },
      { rootMargin: "0px" },
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gold/30 bg-background/95 px-4 py-3 backdrop-blur-md md:hidden">
      <Link
        href="#precommande"
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gold py-3.5 text-sm font-semibold text-gold-foreground shadow-lg hover:bg-gold/90"
      >
        Je précommande mon exemplaire dédicacé — 20 €
      </Link>
    </div>
  );
}
