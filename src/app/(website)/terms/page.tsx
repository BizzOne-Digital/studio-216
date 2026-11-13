import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage";
import { getLegalContent } from "@/lib/data";

export const revalidate = 300;
export const metadata: Metadata = { title: "Terms & Conditions", alternates: { canonical: "/terms" } };

export default async function TermsPage() {
  return <LegalPage content={await getLegalContent("terms")} />;
}
