import { PackageOpen } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { LinkButton } from "@/components/ui/Button";
import type { ProductDTO } from "@/types";

export function ProductGrid({ products, brandNames, emptyTitle = "New Merch Coming Soon" }: { products: ProductDTO[]; brandNames: Record<string, string>; emptyTitle?: string }) {
  if (!products.length) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center">
        <PackageOpen className="mx-auto h-12 w-12" strokeWidth={1.3} aria-hidden />
        <h2 className="display mt-5 text-4xl">{emptyTitle}</h2>
        <p className="mt-3 text-white/70">No products match right now. Want something specific? We can make it for you.</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <LinkButton href="/custom-order" arrow>
            Start a Custom Order
          </LinkButton>
          <LinkButton href="/request-quote" variant="outline">
            Request a Quote
          </LinkButton>
        </div>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p._id} product={p} brandName={brandNames[p.brand]} />
      ))}
    </div>
  );
}
