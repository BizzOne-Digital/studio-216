import type { Metadata } from "next";
import { Users } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { LinkButton } from "@/components/ui/Button";
import { RevealItem, Stagger } from "@/components/ui/Reveal";
import { SafeImage } from "@/components/ui/SafeImage";
import { getAboutContent, getTeam } from "@/lib/data";

export const revalidate = 60;
export const metadata: Metadata = {
  title: "Our Team",
  description: "Meet the people behind Studio 216 Print and Design.",
  alternates: { canonical: "/team" },
};

export default async function TeamPage() {
  const [team, about] = await Promise.all([getTeam(), getAboutContent()]);
  return (
    <>
      <PageHero title="Our Team" subtitle="The people who bring your ideas to reality." crumbs={[{ label: "Our Team" }]} />
      <section className="brushed py-16 lg:py-20">
        <div className="container">
          {team.length ? (
            <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {team.map((m) => (
                <RevealItem key={m._id}>
                  <article className="group overflow-hidden rounded-2xl bg-charcoal ring-1 ring-white/10">
                    <div className="relative aspect-[4/5] overflow-hidden">
                      <SafeImage src={m.photo} alt={m.name} fill sizes="(min-width:1024px) 33vw, 50vw" className="mono-img object-cover transition duration-700 group-hover:scale-105 group-hover:[filter:none]" />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent" />
                    </div>
                    <div className="p-6">
                      <h2 className="display text-3xl">{m.name}</h2>
                      {m.role && <p className="eyebrow mt-1 text-[10px]">{m.role}</p>}
                      {m.bio && <p className="mt-3 text-sm leading-relaxed text-white/70">{m.bio}</p>}
                      <div className="mt-4 flex gap-4 text-xs font-semibold">
                        {m.instagram && (
                          <a href={m.instagram} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            Instagram
                          </a>
                        )}
                        {m.facebook && (
                          <a href={m.facebook} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            Facebook
                          </a>
                        )}
                        {m.linkedin && (
                          <a href={m.linkedin} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            LinkedIn
                          </a>
                        )}
                      </div>
                    </div>
                  </article>
                </RevealItem>
              ))}
            </Stagger>
          ) : (
            <div className="mx-auto max-w-3xl text-center">
              <Users className="mx-auto h-12 w-12" strokeWidth={1.3} aria-hidden />
              <h2 className="display mt-5 text-4xl sm:text-5xl">A Local Studio Built on Craft</h2>
              <p className="mt-5 text-[17px] leading-relaxed text-white/75">{about.story}</p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <LinkButton href="/about">About Studio 216</LinkButton>
                <LinkButton href="/contact" variant="outline" arrow>
                  Get in Touch
                </LinkButton>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
