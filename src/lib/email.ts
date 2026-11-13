import "server-only";

/**
 * Optional admin notifications via Resend (https://resend.com).
 * If EMAIL_PROVIDER_API_KEY / EMAIL_FROM / ADMIN_NOTIFICATION_EMAIL are not set, this is a no-op.
 * Failures are logged and never block the customer's submission (it is already saved in MongoDB).
 */
export async function notifyAdmin(subject: string, lines: Record<string, unknown>) {
  const key = process.env.EMAIL_PROVIDER_API_KEY;
  const from = process.env.EMAIL_FROM;
  const to = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (!key || !from || !to) return { sent: false, reason: "not_configured" as const };

  const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
  const rows = Object.entries(lines)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#666"><b>${esc(k)}</b></td><td>${esc(String(v))}</td></tr>`)
    .join("");
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [to], subject, html: `<h2>${esc(subject)}</h2><table>${rows}</table>` }),
    });
    if (!res.ok) console.error("[email] provider error", res.status, await res.text());
    return { sent: res.ok };
  } catch (e) {
    console.error("[email] failed", e);
    return { sent: false };
  }
}
