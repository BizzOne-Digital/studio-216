"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { PLACEHOLDER_IMAGE, resolveImageSrc } from "@/lib/uploads/shared";

/** next/image wrapper with a branded fallback for missing, legacy or failed images. */
export function SafeImage({ src, alt, ...rest }: Omit<ImageProps, "src"> & { src?: string | null }) {
  const [failed, setFailed] = useState(false);
  const resolved = failed ? PLACEHOLDER_IMAGE : resolveImageSrc(src);
  const isData = resolved.startsWith("data:");
  return <Image {...rest} src={resolved} alt={alt} unoptimized={isData || rest.unoptimized} onError={() => setFailed(true)} />;
}
