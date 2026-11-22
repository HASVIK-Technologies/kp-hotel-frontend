"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { imageUrl } from "@/config/images";

interface PhotoProps {
  /** Path from `IMAGES` in config/images.ts, a room image URL, or any absolute URL. */
  src: string;
  alt: string;
  sizes?: string;
  className?: string;
  priority?: boolean;
}

/**
 * The one image component. Renders over a brand-gradient placeholder (no layout shift) and quietly falls back
 * to the gradient if the file is missing, so a mistyped file name never breaks a page.
 */
export function Photo({ src, alt, sizes = "(min-width:1024px) 33vw, 100vw", className, priority }: PhotoProps) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={cn("relative overflow-hidden bg-gradient-to-br from-green-700 via-green to-brass/60", className)}>
      {!failed && <Image src={imageUrl(src)} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" onError={() => setFailed(true)} />}
    </div>
  );
}
