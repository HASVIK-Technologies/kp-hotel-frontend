"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Photo } from "@/components/ui/Photo";
import { TabPills } from "@/components/ui/TabPills";
import { GALLERY, type GalleryCat } from "@/content/gallery";
import { useDialog } from "@/hooks/useDialog";
import { cn } from "@/lib/cn";

type Cat = "All" | GalleryCat;
const TABS: { id: Cat; label: string }[] = [{ id: "All", label: "All" }, { id: "Rooms", label: "Rooms" }, { id: "Dining", label: "Dining" }, { id: "Events", label: "Events" }];

export function GalleryGrid() {
  const [cat, setCat] = useState<Cat>("All");
  const [idx, setIdx] = useState<number | null>(null);
  const items = GALLERY.filter((g) => cat === "All" || g.cat === cat);
  const closeRef = useRef<HTMLButtonElement>(null);
  const opener = useRef<HTMLElement | null>(null);

  const step = useCallback((d: number) => setIdx((i) => (i === null ? i : (i + d + items.length) % items.length)), [items.length]);
  const close = useCallback(() => {
    setIdx(null);
    opener.current?.focus();
  }, []);

  useDialog(idx !== null, close);
  useEffect(() => {
    if (idx === null) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [idx, step]);

  return (
    <>
      <TabPills tabs={TABS} value={cat} onChange={setCat} label="Gallery category" className="mb-8" />

      <ul className="columns-2 gap-3 sm:gap-4 lg:columns-3 [&>li]:mb-3 sm:[&>li]:mb-4">
        {items.map((g, i) => (
          <li key={g.id} className="break-inside-avoid">
            <button
              onClick={(e) => {
                opener.current = e.currentTarget;
                setIdx(i);
              }}
              className="group relative block w-full overflow-hidden rounded-2xl shadow-card"
              aria-label={`Open ${g.title}`}
            >
              <Photo src={g.photo} alt={g.title} sizes="(min-width:1024px) 33vw, 50vw" className={cn("w-full [&_img]:transition-transform [&_img]:duration-700 group-hover:[&_img]:scale-105", g.tall ? "aspect-[3/4]" : "aspect-[4/3]")} />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/75 to-transparent p-4 pt-10 text-left text-sm font-semibold text-white">
                {g.title}
                <span className="block text-xs font-normal text-white/70">{g.cat}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      {idx !== null && items[idx] && (
        <div role="dialog" aria-modal="true" aria-label={items[idx].title} className="fixed inset-0 z-[90] flex flex-col bg-ink/95 backdrop-blur-md">
          <div className="flex items-center justify-between p-4 text-white">
            <p className="font-display text-xl">
              {items[idx].title} <span className="ml-2 text-sm text-white/60">{idx + 1} / {items.length}</span>
            </p>
            <button ref={closeRef} onClick={close} aria-label="Close" className="grid size-12 place-items-center rounded-full bg-white/10 hover:bg-white/20"><X className="size-6" aria-hidden /></button>
          </div>
          <div className="relative mx-auto flex w-full max-w-5xl flex-1 items-center px-3 pb-6">
            <button onClick={() => step(-1)} aria-label="Previous photo" className="absolute left-4 z-10 grid size-12 place-items-center rounded-full bg-white/15 text-white backdrop-blur hover:bg-white/30"><ChevronLeft className="size-6" aria-hidden /></button>
            <Photo src={items[idx].photo} alt={items[idx].title} sizes="100vw" priority className="h-full min-h-[50vh] w-full rounded-2xl" />
            <button onClick={() => step(1)} aria-label="Next photo" className="absolute right-4 z-10 grid size-12 place-items-center rounded-full bg-white/15 text-white backdrop-blur hover:bg-white/30"><ChevronRight className="size-6" aria-hidden /></button>
          </div>
        </div>
      )}
    </>
  );
}
