import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "@/app/globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { StickyBookBar } from "@/components/layout/StickyBookBar";

const display = Cormorant_Garamond({ subsets: ["latin", "latin-ext"], weight: ["500", "600", "700"], variable: "--font-cormorant", display: "swap" });
const sans = DM_Sans({ subsets: ["latin", "latin-ext"], variable: "--font-dm-sans", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://kphotel.com"),
  title: { default: "Hotel KP & Restaurant, Comfortable Stay. Delicious Food. Memorable Events.", template: "%s · Hotel KP & Restaurant" },
  description: "Book comfortable rooms and suites, dine at our multi-cuisine restaurant, and host weddings and conferences at Hotel KP & Restaurant, Rasra, Ballia.",
  openGraph: { type: "website", siteName: "Hotel KP & Restaurant", locale: "en_IN" },
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = { themeColor: "#1F3D33", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${display.variable} ${sans.variable}`}>
      <body>
        <a href="#main" className="sr-only z-[100] rounded-full bg-white px-4 py-2 font-semibold text-green focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
          Skip to main content
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <StickyBookBar />
      </body>
    </html>
  );
}
