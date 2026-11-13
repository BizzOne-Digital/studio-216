"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/client";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    try {
      await api("/api/auth/login", { method: "POST", json: { email: fd.get("email"), password: fd.get("password") } });
      const next = params.get("next");
      router.replace(next && next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin");
      router.refresh();
    } catch (err) {
      toast.error((err as Error).message);
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="metal-border space-y-5 rounded-2xl p-7">
      <div>
        <label htmlFor="email" className="field-label">
          Email
        </label>
        <input id="email" name="email" type="email" required autoComplete="username" className="field" />
      </div>
      <div>
        <label htmlFor="password" className="field-label">
          Password
        </label>
        <input id="password" name="password" type="password" required autoComplete="current-password" className="field" />
      </div>
      <button disabled={busy} className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-white font-bold text-ink disabled:opacity-60">
        <Lock className="h-4 w-4" aria-hidden /> {busy ? "Signing in..." : "Sign In"}
      </button>
      <p className="text-center text-xs text-white/40">Authorized staff only. Admin accounts are created with the setup script.</p>
    </form>
  );
}
