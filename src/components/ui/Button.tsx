import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "silver" | "outline" | "dark" | "ghost";
const base =
  "group inline-flex items-center justify-center gap-2.5 rounded-lg font-sans text-sm font-bold tracking-wide transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-silver-light focus-visible:ring-offset-2 focus-visible:ring-offset-ink disabled:pointer-events-none disabled:opacity-50";
const variants: Record<Variant, string> = {
  silver:
    "bg-[linear-gradient(180deg,#ffffff_0%,#e9e9e9_55%,#cfcfcf_100%)] text-ink shadow-[0_8px_24px_-10px_rgba(255,255,255,0.45),inset_0_1px_0_#fff] hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-10px_rgba(255,255,255,0.55)]",
  outline: "border-[1.5px] border-white/90 text-white hover:bg-white hover:text-ink hover:-translate-y-0.5",
  dark: "bg-ink text-white border border-white/15 hover:border-white/50 hover:-translate-y-0.5",
  ghost: "text-silver-light hover:text-white",
};
const sizes = { md: "h-11 px-5", lg: "h-[52px] px-7 text-[15px]", sm: "h-9 px-4 text-xs" };

export function buttonClass(variant: Variant = "silver", size: keyof typeof sizes = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

interface LinkButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
  size?: keyof typeof sizes;
  arrow?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export function LinkButton({ href, children, variant = "silver", size = "md", arrow, icon, className }: LinkButtonProps) {
  return (
    <Link href={href} className={buttonClass(variant, size, className)}>
      {icon}
      <span>{children}</span>
      {arrow && <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />}
    </Link>
  );
}
