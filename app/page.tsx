import { AboutBook } from "@/components/about-book";
import { AuthorSection } from "@/components/author-section";
import { Hero } from "@/components/hero";
import { InsideBook } from "@/components/inside-book";
import { PreorderSection } from "@/components/preorder-section";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Testimonials } from "@/components/testimonials";

export default function Page() {
  return (
    <main className="min-h-screen bg-background">
      <SiteHeader />
      <Hero />
      <AboutBook />
      <InsideBook />
      <PreorderSection />
      <AuthorSection />
      <Testimonials />
      <SiteFooter />
    </main>
  );
}
