import type { Metadata } from "next";
import { MessageSquareQuote } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { TestimonialList } from "@/components/home/TestimonialList";
import { LinkButton } from "@/components/ui/Button";
import { getSettings, getTestimonials } from "@/lib/data";

export const revalidate = 60;
export const metadata: Metadata = {
  title: "Testimonials",
  description: "What customers say about Studio 216 Print and Design.",
  alternates: { canonical: "/testimonials" },
};

export default async function TestimonialsPage() {
  const [items, settings] = await Promise.all([getTestimonials(), getSettings()]);
  return (
    <>
      <PageHero title="What Our Customers Say" subtitle="Feedback from the individuals, teams and businesses we work with." crumbs={[{ label: "Testimonials" }]} />
      <section className="brushed py-16 lg:py-20">
        <div className="container">
          {items.length ? (
            <TestimonialList items={items} />
          ) : (
            <div className="mx-auto max-w-2xl rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center">
              <MessageSquareQuote className="mx-auto h-12 w-12" strokeWidth={1.3} aria-hidden />
              <h2 className="display mt-5 text-4xl">Reviews Coming Soon</h2>
              <p className="mt-3 text-white/70">
                We&apos;re collecting feedback from recent customers. Worked with us? We&apos;d love to hear about your experience — email{" "}
                <a href={`mailto:${settings.email}`} className="break-all underline">
                  {settings.email}
                </a>
                .
              </p>
              <LinkButton href="/request-quote" arrow className="mt-7">
                Start Your Project
              </LinkButton>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
