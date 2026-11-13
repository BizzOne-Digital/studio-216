"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { SafeImage } from "@/components/ui/SafeImage";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/lib/utils";
import type { ProductDTO } from "@/types";

export function ProductCard({ product, brandName }: { product: ProductDTO; brandName?: string }) {
  const { add } = useCart();
  const price = formatPrice(product.price);
  const compare = formatPrice(product.compareAtPrice);
  const outOfStock = product.availability === "out_of_stock";
  // Quick add only when no choices are required; otherwise go to details.
  const needsChoice = product.sizes.length > 1 || product.colors.length > 1;

  const quickAdd = () => {
    add({
      productId: product._id,
      slug: product.slug,
      name: product.name,
      image: product.images[0] ?? "",
      price: product.price ?? null,
      size: product.sizes[0] ?? "",
      color: product.colors[0] ?? "",
      quantity: 1,
      customization: "",
      attachments: [],
    });
    toast.success(`${product.name} added to cart`);
  };

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl bg-charcoal ring-1 ring-white/10 transition duration-500 hover:ring-white/35">
      <Link href={`/shop/${product.slug}`} className="relative block aspect-[5/6] overflow-hidden bg-graphite">
        <SafeImage src={product.images[0]} alt={product.name} fill sizes="(min-width:1024px) 25vw, 50vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
        {outOfStock && <span className="absolute left-3 top-3 rounded bg-ink/90 px-2 py-1 text-[10px] font-bold uppercase tracking-wider">Out of stock</span>}
        {product.price === null || product.price === undefined ? (
          <span className="absolute right-3 top-3 rounded bg-white/90 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-ink">Quote</span>
        ) : null}
      </Link>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        {brandName && <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-silver/80">{brandName}</p>}
        <h3 className="mt-1 font-sans text-[15px] font-bold leading-snug">
          <Link href={`/shop/${product.slug}`} className="hover:underline">
            {product.name}
          </Link>
        </h3>
        <div className="mt-2 space-y-1 text-[11px] text-white/55">
          {product.sizes.length > 0 && <p>Sizes: {product.sizes.join(", ")}</p>}
          {product.colors.length > 0 && <p>Colors: {product.colors.join(", ")}</p>}
        </div>
        <div className="mt-auto pt-4">
          <p className="text-base font-bold">
            {price ? (
              <>
                {price} {compare && product.compareAtPrice! > product.price! && <span className="ml-1 text-xs font-medium text-white/40 line-through">{compare}</span>}
              </>
            ) : (
              <span className="text-sm text-silver">Request Pricing</span>
            )}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Link href={`/shop/${product.slug}`} className="flex h-10 items-center justify-center rounded-md border border-white/25 text-xs font-bold transition hover:border-white hover:bg-white hover:text-ink">
              View Details
            </Link>
            {needsChoice || outOfStock ? (
              <Link
                href={outOfStock ? `/request-quote?product=${encodeURIComponent(product.name)}` : `/shop/${product.slug}`}
                className="flex h-10 items-center justify-center gap-1.5 rounded-md bg-white text-xs font-bold text-ink transition hover:bg-silver-light"
              >
                {outOfStock ? "Ask About It" : "Choose Options"}
              </Link>
            ) : (
              <button type="button" onClick={quickAdd} className="flex h-10 items-center justify-center gap-1.5 rounded-md bg-white text-xs font-bold text-ink transition hover:bg-silver-light">
                <ShoppingBag className="h-3.5 w-3.5" aria-hidden />
                {product.price === null || product.price === undefined ? "Add to Request" : "Add to Cart"}
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
