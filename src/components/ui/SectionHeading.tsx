import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  tone = "dark",
  className,
  as: H = "h2",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  tone?: "dark" | "light";
  className?: string;
  as?: "h1" | "h2";
}) {
  return (
    <div className={cn(align === "center" && "mx-auto text-center", "max-w-3xl", className)}>
      {eyebrow && <p className={cn("eyebrow mb-3", tone === "light" && "text-graphite/70")}>{eyebrow}</p>}
      <H className={cn("display text-[2.6rem] sm:text-5xl lg:text-6xl", tone === "light" ? "text-ink" : "text-white")}>
        {title}
        <span
          aria-hidden
          className={cn(
            "ml-3 inline-block h-[0.14em] w-14 -skew-x-[30deg] align-middle sm:w-20",
            tone === "light" ? "bg-ink/80" : "bg-[linear-gradient(90deg,#fff,#7a7a7a)]",
            align === "center" && "hidden"
          )}
        />
      </H>
      {description && <p className={cn("mt-4 text-base leading-relaxed sm:text-lg", tone === "light" ? "text-graphite/80" : "text-white/70")}>{description}</p>}
    </div>
  );
}
