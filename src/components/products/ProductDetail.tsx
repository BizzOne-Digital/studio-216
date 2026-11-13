"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Minus, Plus, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { ArtworkUpload, type Attachment } from "@/components/forms/ArtworkUpload";
import { SafeImage } from "@/components/ui/SafeImage";
import { useCart } from "@/hooks/useCart";
import { cn, formatPrice } from "@/lib/utils";
import type { ProductDTO } from "@/types";

export function ProductDetail({ product, brandName, categoryName }: { product: ProductDTO; brandName?: string; categoryName?: string }) {
  const { add } = useCart();
  const [img, setImg] = useState(0);
  const [size, setSize] = useState(product.sizes.length === 1 ? product.sizes[0] : "");
  const [color, setColor] = useState(product.colors.length === 1 ? product.colors[0] : "");
  const [qty, setQty] = useState(1);
  const [custom, setCustom] = useState("");
  const [files, setFiles] = useState<Attachment[]>([]);
  const price = formatPrice(product.price);
  const hasPrice = typeof product.price === "number";
  const outOfStock = product.availability === "out_of_stock";
  const images = product.images.length ? product.images : [""];

  const addToCart = () => {
    if (product.sizes.length && !size) return toast.error("Please choose a size");
    if (product.colors.length && !color) return toast.error("Please choose a color");
    add({
      productId: product._id,
      slug: product.slug,
      name: product.name,
      image: product.images[0] ?? "",
      price: product.price ?? null,
      size,
      color,
      quantity: qty,
      customization: custom.trim(),
      attachments: files.map((f) => ({ ref: f.ref, name: f.name })),
    });
    toast.success(`${product.name} added to cart`, { action: { label: "View cart", onClick: () => (window.location.href = "/cart") } });
    setFiles([]);
  };

  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
      <div>
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-charcoal ring-1 ring-white/10">
          <SafeImage src={images[img]} alt={product.name} fill priority sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />
        </div>
        {images.length > 1 && (
          <div className="mt-3 grid grid-cols-5 gap-2">
            {images.map((src, i) => (
              <button key={src + i} onClick={() => setImg(i)} aria-label={`View image ${i + 1}`} className={cn("relative aspect-square overflow-hidden rounded-lg ring-2 transition", i === img ? "ring-white" : "ring-transparent opacity-60 hover:opacity-100")}>
                <SafeImage src={src} alt="" fill sizes="100px" className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <p className="eyebrow">{[brandName, categoryName].filter(Boolean).join(" · ") || "Studio 216"}</p>
        <h1 className="display mt-3 text-5xl sm:text-6xl">{product.name}</h1>
        <p className="mt-4 text-2xl font-bold">{price ?? <span className="text-lg text-silver">Request Pricing</span>}</p>
        {!hasPrice && <p className="mt-1 text-xs text-white/55">This item is quoted after review. Add it to your request and we&apos;ll confirm pricing before anything is charged.</p>}
        {product.shortDescription && <p className="mt-5 text-[16px] leading-relaxed text-white/75">{product.shortDescription}</p>}

        {product.sizes.length > 0 && (
          <fieldset className="mt-7">
            <legend className="field-label">Size {size && <span className="text-white">— {size}</span>}</legend>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <button key={s} type="button" onClick={() => setSize(s)} aria-pressed={size === s} className={cn("h-11 min-w-12 rounded-md border px-3 text-sm font-semibold transition", size === s ? "border-white bg-white text-ink" : "border-white/20 hover:border-white/60")}>
                  {s}
                </button>
              ))}
            </div>
          </fieldset>
        )}
        {product.colors.length > 0 && (
          <fieldset className="mt-5">
            <legend className="field-label">Color {color && <span className="text-white">— {color}</span>}</legend>
            <div className="flex flex-wrap gap-2">
              {product.colors.map((c) => (
                <button key={c} type="button" onClick={() => setColor(c)} aria-pressed={color === c} className={cn("flex h-11 items-center gap-2 rounded-md border px-3.5 text-sm font-semibold transition", color === c ? "border-white bg-white text-ink" : "border-white/20 hover:border-white/60")}>
                  {color === c && <Check className="h-3.5 w-3.5" aria-hidden />}
                  {c}
                </button>
              ))}
            </div>
          </fieldset>
        )}

        {product.customizationOptions.length > 0 && (
          <div className="mt-6">
            <p className="field-label">Customization available</p>
            <ul className="flex flex-wrap gap-2">
              {product.customizationOptions.map((o) => (
                <li key={o} className="rounded-full bg-white/[0.06] px-3 py-1.5 text-xs">
                  {o}
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="mt-5">
          <label htmlFor="custom" className="field-label">
            Customization notes (optional)
          </label>
          <textarea id="custom" rows={3} maxLength={1000} value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="Names, numbers, placement or other details" className="field resize-y" />
        </div>
        <div className="mt-5">
          <ArtworkUpload value={files} onChange={setFiles} max={2} label="Your artwork (optional)" />
        </div>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <div className="flex h-[52px] items-center rounded-lg border border-white/20">
            <button type="button" onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease quantity" className="flex h-full w-12 items-center justify-center hover:bg-white/5">
              <Minus className="h-4 w-4" />
            </button>
            <input aria-label="Quantity" inputMode="numeric" value={qty} onChange={(e) => setQty(Math.max(1, Math.min(10000, Number(e.target.value.replace(/\D/g, "")) || 1)))} className="h-full w-14 bg-transparent text-center font-bold outline-none" />
            <button type="button" onClick={() => setQty(Math.min(10000, qty + 1))} aria-label="Increase quantity" className="flex h-full w-12 items-center justify-center hover:bg-white/5">
              <Plus className="h-4 w-4" />
            </button>
          </div>
          {outOfStock ? (
            <Link href={`/request-quote?product=${encodeURIComponent(product.name)}`} className="flex h-[52px] flex-1 items-center justify-center rounded-lg bg-white font-bold text-ink">
              Out of stock — Request a Quote
            </Link>
          ) : (
            <button type="button" onClick={addToCart} className="flex h-[52px] flex-1 items-center justify-center gap-2 rounded-lg bg-[linear-gradient(180deg,#fff,#dcdcdc)] font-bold text-ink transition hover:-translate-y-0.5">
              <ShoppingBag className="h-5 w-5" aria-hidden />
              {hasPrice ? "Add to Cart" : "Add to Order Request"}
            </button>
          )}
        </div>
        <Link href={`/request-quote?product=${encodeURIComponent(product.name)}`} className="mt-3 block text-center text-sm font-semibold text-white/70 underline-offset-4 hover:text-white hover:underline">
          Need a bulk or custom version? Request a quote
        </Link>

        <dl className="mt-10 divide-y divide-white/10 border-y border-white/10 text-sm">
          {product.material && (
            <div className="flex justify-between gap-6 py-3">
              <dt className="text-white/55">Material</dt>
              <dd className="text-right">{product.material}</dd>
            </div>
          )}
          {product.sku && (
            <div className="flex justify-between gap-6 py-3">
              <dt className="text-white/55">SKU</dt>
              <dd>{product.sku}</dd>
            </div>
          )}
          <div className="flex justify-between gap-6 py-3">
            <dt className="text-white/55">Availability</dt>
            <dd>{product.availability === "in_stock" ? "In stock" : product.availability === "made_to_order" ? "Made to order" : "Out of stock"}</dd>
          </div>
        </dl>
        {product.description && <div className="mt-8 whitespace-pre-line text-[15px] leading-relaxed text-white/75">{product.description}</div>}
      </div>
    </div>
  );
}
