import { cn } from "@/lib/utils";
import type { SiteSettingsData } from "@/types";

const PATHS = {
  facebook:
    "M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.9.3-1.5 1.5-1.5h1.5V4.4c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2.4H8v3h2.6V21h2.9Z",
  instagram:
    "M12 7.4A4.6 4.6 0 1 0 12 16.6 4.6 4.6 0 0 0 12 7.4Zm0 7.6a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm4.8-8.8a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0ZM12 3c-2.4 0-2.7 0-3.7.1-1 0-1.6.2-2.2.4a4.5 4.5 0 0 0-2.6 2.6c-.2.6-.4 1.2-.4 2.2C3 9.3 3 9.6 3 12s0 2.7.1 3.7c0 1 .2 1.6.4 2.2a4.5 4.5 0 0 0 2.6 2.6c.6.2 1.2.4 2.2.4 1 .1 1.3.1 3.7.1s2.7 0 3.7-.1c1 0 1.6-.2 2.2-.4a4.5 4.5 0 0 0 2.6-2.6c.2-.6.4-1.2.4-2.2.1-1 .1-1.3.1-3.7s0-2.7-.1-3.7c0-1-.2-1.6-.4-2.2a4.5 4.5 0 0 0-2.6-2.6c-.6-.2-1.2-.4-2.2-.4C14.7 3 14.4 3 12 3Zm0 1.6c2.4 0 2.6 0 3.6.1.9 0 1.4.2 1.7.3.4.2.7.4 1 .7.3.3.5.6.7 1 .1.3.3.8.3 1.7.1 1 .1 1.2.1 3.6s0 2.6-.1 3.6c0 .9-.2 1.4-.3 1.7a2.9 2.9 0 0 1-1.7 1.7c-.3.1-.8.3-1.7.3-1 .1-1.2.1-3.6.1s-2.6 0-3.6-.1c-.9 0-1.4-.2-1.7-.3a2.9 2.9 0 0 1-1.7-1.7c-.1-.3-.3-.8-.3-1.7-.1-1-.1-1.2-.1-3.6s0-2.6.1-3.6c0-.9.2-1.4.3-1.7.2-.4.4-.7.7-1 .3-.3.6-.5 1-.7.3-.1.8-.3 1.7-.3 1-.1 1.2-.1 3.6-.1Z",
  tiktok:
    "M16.6 5.8A4.3 4.3 0 0 1 15.5 3h-3.1v12.4a2.6 2.6 0 1 1-2.6-2.6c.3 0 .5 0 .8.1V9.8a5.7 5.7 0 1 0 4.9 5.6V9.1a7.4 7.4 0 0 0 4.3 1.4V7.4a4.3 4.3 0 0 1-3.2-1.6Z",
  threads:
    "M16.7 11.3c-.1 0-.2-.1-.3-.1-.2-3-1.8-4.7-4.6-4.7-1.7 0-3.1.7-4 2l1.5 1c.6-1 1.6-1.2 2.5-1.2 1 0 1.8.3 2.2.9.3.4.5 1 .6 1.7-.8-.1-1.7-.2-2.6-.1-2.6.1-4.3 1.7-4.2 3.8.1 1.1.6 2 1.5 2.6.8.5 1.8.8 2.9.7 1.4-.1 2.5-.6 3.3-1.6.6-.8 1-1.7 1.1-3 .7.4 1.2.9 1.4 1.6.5 1.1.5 2.9-1 4.4-1.3 1.3-2.9 1.9-5.3 1.9-2.7 0-4.7-.9-6-2.6-1.2-1.6-1.9-3.9-1.9-6.8s.6-5.2 1.9-6.8C5 4.9 7 4.1 9.7 4c2.7 0 4.8.9 6.1 2.6.7.8 1.2 1.9 1.5 3.1l1.8-.5c-.4-1.5-1-2.8-1.9-3.9C15.6 3.2 13.1 2.1 9.8 2h-.1C6.4 2.1 3.9 3.2 2.3 5.3.8 7.1.1 9.7 0 12c.1 3.3.8 5.9 2.3 7.7 1.6 2.1 4.1 3.2 7.4 3.2 2.9 0 4.9-.8 6.6-2.4 2.2-2.2 2.1-4.9 1.4-6.6-.5-1.2-1.6-2.2-3-2.6Zm-4.5 4.4c-1.1.1-2.3-.4-2.3-1.5 0-.8.6-1.7 2.4-1.8h.7c.6 0 1.2.1 1.8.2-.2 2.6-1.4 3-2.6 3.1Z",
};

const LABELS: Record<keyof typeof PATHS, string> = { facebook: "Facebook", instagram: "Instagram", tiktok: "TikTok", threads: "Threads" };

/** Social icons. Links render only when URLs are set in Website Settings (never invented). */
export function SocialIcons({ social, className, size = "md" }: { social: SiteSettingsData["social"]; className?: string; size?: "sm" | "md" }) {
  const entries = (Object.keys(PATHS) as (keyof typeof PATHS)[]).map((k) => ({ key: k, url: social[k] }));
  return (
    <ul className={cn("flex items-center gap-2.5", className)}>
      {entries.map(({ key, url }) => {
        const icon = (
          <svg viewBox="0 0 24 24" className={size === "md" ? "h-[18px] w-[18px]" : "h-4 w-4"} fill="currentColor" aria-hidden>
            <path d={PATHS[key]} />
          </svg>
        );
        const cls = cn(
          "flex items-center justify-center rounded-full border border-white/20 text-white transition-all duration-300",
          size === "md" ? "h-9 w-9" : "h-8 w-8",
          url ? "hover:border-white hover:bg-white hover:text-ink" : "opacity-40"
        );
        return (
          <li key={key}>
            {url ? (
              <a href={url} target="_blank" rel="noopener noreferrer" aria-label={`${LABELS[key]} (opens in new tab)`} className={cls}>
                {icon}
              </a>
            ) : (
              <span className={cls} title={`${LABELS[key]} link coming soon`} aria-label={`${LABELS[key]} (link not yet available)`}>
                {icon}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
