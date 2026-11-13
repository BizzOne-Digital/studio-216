import { ContentEditor } from "@/components/admin/ContentEditor";

export const metadata = { title: "Website Content" };

export default function Page() {
  return (
    <ContentEditor
      page="home"
      title="Website Content"
      description="Edit every homepage section: hero, service cards, about, process, offers, gallery, FAQ and CTA banners."
      previewHref="/"
    />
  );
}
