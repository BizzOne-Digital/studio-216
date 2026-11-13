import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

/** Default client logo (public/images/logo.png). An uploaded logo in Website Settings overrides it. */
export const DEFAULT_LOGO = "/images/logo.png";

const SIZES = {
  sm: "h-12 w-[77px]",
  md: "h-[64px] w-[102px] lg:h-[104px] lg:w-[166px]",
  lg: "h-24 w-[154px]",
};

export function Logo({ src, name, className, size = "md", href = "/" }: { src?: string; name: string; className?: string; size?: keyof typeof SIZES; href?: string }) {
  const logo = src && (src.startsWith("/api/uploads/") || src.startsWith("/images/")) ? src : DEFAULT_LOGO;
  return (
    <Link href={href} aria-label={`${name} — home`} className={cn("relative inline-block shrink-0 transition-opacity hover:opacity-90", SIZES[size], className)}>
      <Image src={logo} alt={name} fill priority sizes="160px" className="object-contain" />
    </Link>
  );
}
