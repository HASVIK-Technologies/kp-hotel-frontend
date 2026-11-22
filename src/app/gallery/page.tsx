import type { Metadata } from "next";
import { IMAGES } from "@/config/images";
import { PageHero, Section } from "@/components/ui/Section";
import { GalleryGrid } from "@/features/gallery/GalleryGrid";

export const metadata: Metadata = { title: "Gallery", description: "A look inside Hotel KP: rooms, dining, events and the grounds." };

export default function GalleryPage() {
  return (
    <>
      <PageHero eyebrow="Property Gallery" title="A Look Inside Hotel KP" sub="Rooms, dining, events and the grounds in between." image={IMAGES.home.hotelExterior} />
      <Section><GalleryGrid /></Section>
    </>
  );
}
