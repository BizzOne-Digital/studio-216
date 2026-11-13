import { PageHero } from "./PageHero";
import type { LegalContent } from "@/types";

/** Renders plain-text legal content: blank-line separated blocks; a short single line becomes a heading. */
export function LegalPage({ content }: { content: LegalContent }) {
  const blocks = content.body.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  return (
    <>
      <PageHero title={content.title} subtitle={content.updated ? `Last updated: ${content.updated}` : undefined} crumbs={[{ label: content.title }]} />
      <section className="brushed py-16">
        <article className="container max-w-3xl space-y-5 text-[15px] leading-relaxed text-white/75">
          {blocks.map((b, i) => {
            const [first, ...rest] = b.split("\n");
            const isHeading = rest.length > 0 && first.length < 60 && !/[.:]$/.test(first);
            return isHeading ? (
              <div key={i}>
                <h2 className="mb-2 mt-4 font-display text-2xl font-bold uppercase italic text-white">{first}</h2>
                <p className="whitespace-pre-line">{rest.join("\n")}</p>
              </div>
            ) : (
              <p key={i} className="whitespace-pre-line">
                {b}
              </p>
            );
          })}
        </article>
      </section>
    </>
  );
}
