import Link from "next/link";

export default function NotFound() {
  return (
    <main className="brushed grain flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="font-brush text-metal-brush text-[7rem] leading-none sm:text-[10rem]">404</p>
      <h1 className="display mt-4 text-4xl sm:text-5xl">Page Not Found</h1>
      <p className="mt-3 max-w-md text-white/70">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="rounded-lg bg-white px-6 py-3 text-sm font-bold text-ink">
          Back to Home
        </Link>
        <Link href="/request-quote" className="rounded-lg border border-white/40 px-6 py-3 text-sm font-bold">
          Request a Quote
        </Link>
      </div>
    </main>
  );
}
