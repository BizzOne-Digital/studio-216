import type { Metadata } from "next";
import { Images } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { LinkButton } from "@/components/ui/Button";
import { getGallery, getHomeContent } from "@/lib/data";

export const revalidate = 60;
export const metadata: Metadata = {
  title: "Gallery",
  description: "Our work: embroidery, apparel printing, DTF transfers, promotional items, signage and custom merchandise.",
  alternates: { canonical: "/gallery" },
};

export default async function GalleryPage() {
  const [images, home] = await Promise.all([getGallery(), getHomeContent()]);
  return (
    <>
      <PageHero title={home.gallery.heading} subtitle={home.gallery.description} crumbs={[{ label: "Gallery" }]} />
      <section className="brushed py-16 lg:py-20">
        <div className="container">
          {images.length ? (
            <GalleryGrid images={images} />
          ) : (
            <div className="mx-auto max-w-2xl rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center">
              <Images className="mx-auto h-12 w-12" strokeWidth={1.3} aria-hidden />
              <h2 className="display mt-5 text-4xl">Portfolio Being Updated</h2>
              <p className="mt-3 text-white/70">We&apos;re adding photos of recent projects. In the meantime, follow us on social media or reach out to see examples of our work.</p>
              <LinkButton href="/contact" arrow className="mt-7">
                Ask for Examples
              </LinkButton>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
