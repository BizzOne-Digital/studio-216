import type { Metadata } from "next";
import { Eye, Target } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { FinalCta } from "@/components/home/FinalCta";
import { ProcessSteps } from "@/components/home/ProcessSteps";
import { ServiceCard } from "@/components/home/ServicesPreview";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal, RevealItem, Stagger } from "@/components/ui/Reveal";
import { SafeImage } from "@/components/ui/SafeImage";
import { getAboutContent, getHomeContent, getServices } from "@/lib/data";

export const revalidate = 60;
export const metadata: Metadata = {
  title: "About Us",
  description: "Studio 216 Print and Design is a custom apparel, embroidery, printing and promotional products studio serving Tucker, Decatur and Metro Atlanta.",
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const [about, home, services] = await Promise.all([getAboutContent(), getHomeContent(), getServices()]);
  return (
    <>
      <PageHero title={about.heroTitle} subtitle={about.heroSubtitle} image={about.heroImage} crumbs={[{ label: "About Us" }]} />

      <section className="brushed py-20 lg:py-28">
        <div className="container grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <SectionHeading eyebrow="Our Story" title="Built on Craft" />
            <p className="mt-6 whitespace-pre-line text-[17px] leading-relaxed text-white/75">{about.story}</p>
          </Reveal>
          <Reveal className="grid grid-cols-2 gap-3">
            {about.workshopImages.slice(0, 3).map((src, i) => (
              <div key={src + i} className={i === 0 ? "relative col-span-2 aspect-[16/9] overflow-hidden rounded-xl" : "relative aspect-square overflow-hidden rounded-xl"}>
                <SafeImage src={src} alt="Studio 216 work" fill sizes="(min-width:1024px) 40vw, 90vw" className="mono-img object-cover" />
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="paper py-20 text-ink">
        <Stagger className="container grid gap-5 md:grid-cols-2">
          {[
            { icon: Target, title: "Our Mission", text: about.mission },
            { icon: Eye, title: "Our Vision", text: about.vision },
          ].map(({ icon: I, title, text }) => (
            <RevealItem key={title}>
              <div className="h-full rounded-2xl bg-ink p-8 text-white sm:p-10">
                <I className="h-10 w-10" strokeWidth={1.4} aria-hidden />
                <h2 className="display mt-6 text-4xl">{title}</h2>
                <p className="mt-4 text-[16px] leading-relaxed text-white/75">{text}</p>
              </div>
            </RevealItem>
          ))}
        </Stagger>
      </section>

      <section className="bg-ink py-20 lg:py-28">
        <div className="container">
          <Reveal className="mb-12">
            <SectionHeading eyebrow="Services" title="What We Do" />
          </Reveal>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {services.slice(0, 6).map((s) => (
              <ServiceCard key={s._id} title={s.title} description={s.shortDescription} icon={s.icon} image={s.heroImage} href={`/services/${s.slug}`} />
            ))}
          </div>
        </div>
      </section>

      <section className="brushed border-y border-white/5 py-20 lg:py-28">
        <div className="container">
          <Reveal className="mb-12">
            <SectionHeading eyebrow="Why Studio 216" title="Why Choose Us" align="center" />
          </Reveal>
          <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {about.whyChoose.map((w, i) => (
              <RevealItem key={w.title}>
                <div className="metal-border h-full rounded-2xl p-7">
                  <span className="font-display text-5xl font-black italic text-white/15">0{i + 1}</span>
                  <h3 className="mt-3 text-lg font-bold">{w.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/65">{w.description}</p>
                </div>
              </RevealItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="bg-charcoal py-20 lg:py-28">
        <div className="container">
          <SectionHeading eyebrow="Our Process" title={home.process.heading} align="center" />
          <ProcessSteps steps={home.process.steps} note={home.process.note} />
        </div>
      </section>

      <FinalCta cta={home.finalCta} />
    </>
  );
}
