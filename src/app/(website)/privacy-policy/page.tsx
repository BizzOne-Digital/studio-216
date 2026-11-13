import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage";
import { getLegalContent } from "@/lib/data";

export const revalidate = 300;
export const metadata: Metadata = { title: "Privacy Policy", alternates: { canonical: "/privacy-policy" } };

export default async function PrivacyPage() {
  return <LegalPage content={await getLegalContent("privacy")} />;
}
