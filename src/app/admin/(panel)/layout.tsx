import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { getAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: { default: "Admin", template: "%s | Studio 216 Admin" }, robots: { index: false, follow: false } };

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return <AdminShell admin={{ name: admin.name, email: admin.email }}>{children}</AdminShell>;
}
