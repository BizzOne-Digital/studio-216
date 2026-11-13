import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/admin/LoginForm";
import { Logo } from "@/components/layout/Logo";

export const metadata: Metadata = { title: "Admin Login", robots: { index: false, follow: false } };

export default function LoginPage() {
  return (
    <main className="brushed grain flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Logo name="Studio 216 Print and Design" size="lg" className="mx-auto h-28 w-[180px]" />
          <p className="eyebrow mt-2">Admin Dashboard</p>
        </div>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
