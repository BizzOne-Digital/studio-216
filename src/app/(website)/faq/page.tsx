import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { FaqAccordion } from "@/components/home/FaqAccordion";
import { LinkButton } from "@/components/ui/Button";
import { getFaqs } from "@/lib/data";

export const revalidate = 60;
export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers to common questions about custom quotes, bulk orders, artwork, embroidery, DTF printing and production timelines.",
  alternates: { canonical: "/faq" },
};

export default async function FaqPage() {
  const faqs = await getFaqs();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <PageHero title="Frequently Asked Questions" subtitle="Everything you need to know about working with Studio 216." crumbs={[{ label: "FAQ" }]} />
      <section className="brushed py-16 lg:py-20">
        <div className="container max-w-4xl">
          <FaqAccordion faqs={faqs} searchable grouped />
          <div className="mt-12 rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
            <h2 className="display text-3xl">Still have questions?</h2>
            <p className="mt-2 text-white/70">We&apos;re happy to help with your project.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <LinkButton href="/contact">Contact Us</LinkButton>
              <LinkButton href="/request-quote" variant="outline" arrow>
                Request a Quote
              </LinkButton>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
