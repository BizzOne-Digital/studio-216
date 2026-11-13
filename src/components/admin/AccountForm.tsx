"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/client";
import { AdminPageHeader } from "./AdminShell";
import { inputCls, labelCls } from "./fields";

export function AccountForm() {
  const router = useRouter();
  const [me, setMe] = useState<{ name: string; email: string; role: string } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api<{ name: string; email: string; role: string }>("/api/admin/account").then(setMe).catch(() => {});
  }, []);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    try {
      await api("/api/admin/account", { method: "PUT", json: Object.fromEntries(fd) });
      toast.success("Password updated. Please sign in again.");
      router.replace("/admin/login");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <AdminPageHeader title="Admin Account" description="Your sign-in details. New admin accounts are created with the setup script — there is no public registration." />
      {me && (
        <div className="mb-5 rounded-xl border border-white/10 bg-ink p-5 text-sm">
          <p className="font-bold">{me.name}</p>
          <p className="text-white/60">{me.email}</p>
          <p className="mt-1 text-xs uppercase tracking-wider text-white/40">Role: {me.role}</p>
        </div>
      )}
      <form onSubmit={submit} className="space-y-4 rounded-xl border border-white/10 bg-ink p-5 sm:p-6">
        <h2 className="display text-2xl">Change Password</h2>
        {[
          ["currentPassword", "Current password", "current-password"],
          ["newPassword", "New password (min. 10 characters)", "new-password"],
          ["confirmPassword", "Confirm new password", "new-password"],
        ].map(([n, l, ac]) => (
          <label key={n} className="block">
            <span className={labelCls}>{l}</span>
            <input name={n} type="password" required autoComplete={ac} className={inputCls} />
          </label>
        ))}
        <button disabled={busy} className="inline-flex h-11 items-center gap-2 rounded-lg bg-white px-5 text-sm font-bold text-ink disabled:opacity-60">
          {busy && <Loader2 className="h-4 w-4 animate-spin" />} Update Password
        </button>
        <p className="text-xs text-white/40">Changing your password signs you out of all devices.</p>
      </form>
    </div>
  );
}
