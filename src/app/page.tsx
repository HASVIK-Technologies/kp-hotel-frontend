import { Hero } from "@/features/home/Hero";
import { RoomsSection } from "@/features/home/RoomsSection";
import {
  RestaurantBand, BanquetsSection, ConferenceBand, WhySection,
  GalleryStrip, OffersSection, Testimonials, PlanCta,
} from "@/features/home/Sections";

export default function HomePage() {
  return (
    <>
      <Hero />
      <RoomsSection />
      <RestaurantBand />
      <BanquetsSection />
      <ConferenceBand />
      <WhySection />
      <GalleryStrip />
      <OffersSection />
      <Testimonials />
      <PlanCta />
    </>
  );
}
