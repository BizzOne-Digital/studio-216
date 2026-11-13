import { ContentEditor } from "@/components/admin/ContentEditor";

export const metadata = { title: "Hero & Banners" };

export default function Page() {
  return (
    <ContentEditor
      page="home"
      title="Hero & Banners"
      description="Homepage hero images, headline, CTA buttons, and the final call-to-action banner."
      sections={["hero", "finalCta"]}
      previewHref="/"
    />
  );
}
