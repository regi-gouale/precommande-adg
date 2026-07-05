import type { Metadata } from "next";
import { AboutBook } from "@/components/about-book";
import { AuthorSection } from "@/components/author-section";
import { CountdownBanner } from "@/components/countdown-banner";
import { Hero } from "@/components/hero";
import { InsideBook } from "@/components/inside-book";
import { PreorderSection } from "@/components/preorder-section";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { StickyCta } from "@/components/sticky-cta";
import { Testimonials } from "@/components/testimonials";

export const metadata: Metadata = {
  title: "Impacter & Diriger — Volume 1 | Précommande",
  description:
    "Précommandez votre exemplaire dédicacé du volume 1 de la collection Royauté par l'apôtre Yves Castanou. Offre exclusive jusqu'au 07/07/2026 — exemplaire dédicacé + chapitre 1 offert.",
};

export default function Page() {
  return (
    <main className="min-h-screen bg-background">
      <CountdownBanner />
      <SiteHeader />
      <Hero />
      <AboutBook />
      <InsideBook />
      <PreorderSection />
      <AuthorSection />
      <Testimonials />
      <SiteFooter />
      <StickyCta />
    </main>
  );
}
