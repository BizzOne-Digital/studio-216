import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, Kaushan_Script, Montserrat } from "next/font/google";
import { Toaster } from "sonner";
import { getSettings } from "@/lib/data";
import "./globals.css";

const display = Barlow_Condensed({ subsets: ["latin"], weight: ["600", "700", "800", "900"], style: ["normal", "italic"], variable: "--font-display", display: "swap" });
const sans = Montserrat({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], style: ["normal", "italic"], variable: "--font-sans", display: "swap" });
// Brush script for the "Reality" headline (closer to the reference than Permanent Marker's block capitals).
const brush = Kaushan_Script({ subsets: ["latin"], weight: "400", variable: "--font-brush", display: "swap" });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    metadataBase: new URL(siteUrl),
    title: { default: s.seo.title, template: `%s | ${s.companyName}` },
    description: s.seo.description,
    applicationName: s.companyName,
    openGraph: { type: "website", siteName: s.companyName, title: s.seo.title, description: s.seo.description, images: s.seo.ogImage ? [s.seo.ogImage] : undefined },
    twitter: { card: "summary_large_image", title: s.seo.title, description: s.seo.description },
    icons: s.favicon ? { icon: s.favicon } : undefined,
    alternates: { canonical: "/" },
  };
}

export const viewport: Viewport = { themeColor: "#090909", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${brush.variable}`}>
      <body>
        {children}
        <Toaster theme="dark" position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
