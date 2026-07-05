import { IconStar } from "@tabler/icons-react";
import Image from "next/image";
import { buttonVariants } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Subtle radial glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, oklch(0.35 0.14 265) 0%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 md:grid-cols-2 md:py-28">
        <div className="flex flex-col gap-6 text-center md:text-left">
          <span className="mx-auto inline-flex w-fit items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-gold md:mx-0">
            <IconStar className="size-3.5" aria-hidden="true" />
            Précommande ouverte — Volume 1
          </span>

          <h1 className="text-balance font-serif text-4xl font-semibold leading-tight text-foreground sm:text-5xl md:text-6xl">
            Impacter et Diriger en milieu hostile
          </h1>

          <p className="text-pretty font-serif text-xl italic text-gold sm:text-2xl">
            Comprendre la royauté selon Dieu
          </p>

          <p className="mx-auto max-w-md text-pretty leading-relaxed text-muted-foreground md:mx-0">
            Un manifeste spirituel pour ceux qui sont appelés à régner avec
            sagesse, à demeurer intègres et à exercer une influence divine, même
            au cœur de l&apos;adversité.
          </p>

          <div className="mt-2 flex flex-col items-center gap-4 sm:flex-row md:items-start">
            <a
              href="#precommande"
              className={buttonVariants({
                size: "lg",
                className:
                  "bg-gold px-8 text-base font-medium text-gold-foreground hover:bg-gold/90",
              })}
            >
              Précommander maintenant
            </a>
            <div className="text-sm text-muted-foreground">
              <span className="font-serif text-2xl text-foreground">
                24,90 €
              </span>
              <span className="ml-2 line-through opacity-60">32,00 €</span>
            </div>
          </div>
        </div>

        <div className="relative flex justify-center">
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 mx-auto h-4/5 w-4/5 self-center rounded-full bg-gold/10 blur-3xl"
          />
          <Image
            src="/image-presentation.jpeg"
            alt="Couverture du livre Impacter et Diriger en milieu hostile, Volume 1"
            width={520}
            height={680}
            priority
            className="w-full max-w-sm drop-shadow-2xl"
          />
        </div>
      </div>
    </section>
  );
}
