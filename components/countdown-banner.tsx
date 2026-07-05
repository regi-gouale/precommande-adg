"use client";

import { IconFlame } from "@tabler/icons-react";
import { useEffect, useState } from "react";

const DEADLINE = new Date("2026-07-07T00:00:00");

function getTimeLeft() {
  const now = new Date();
  const diff = DEADLINE.getTime() - now.getTime();
  if (diff <= 0) return null;

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function CountdownBanner() {
  const [timeLeft, setTimeLeft] =
    useState<ReturnType<typeof getTimeLeft>>(null);

  useEffect(() => {
    setTimeLeft(getTimeLeft());
    const id = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!timeLeft) return null;

  return (
    <div className="border-b border-gold/30 bg-gold/10 px-4 py-2.5 text-center text-sm">
      <p className="flex flex-wrap items-center justify-center gap-2 font-medium text-foreground">
        <IconFlame className="size-4 shrink-0 text-gold" aria-hidden="true" />
        <span>
          Offre précommande se termine dans{" "}
          <span className="font-serif text-gold">
            {timeLeft.days}j {pad(timeLeft.hours)}h {pad(timeLeft.minutes)}m{" "}
            {pad(timeLeft.seconds)}s
          </span>
        </span>
        <span className="hidden text-muted-foreground sm:inline">—</span>
        <span className="hidden text-muted-foreground sm:inline">
          Exemplaire dédicacé + chapitre 1 offert
        </span>
        <a
          href="#precommande"
          className="ml-1 font-semibold text-gold underline underline-offset-2 hover:text-gold/80"
        >
          Je précommande →
        </a>
      </p>
    </div>
  );
}
