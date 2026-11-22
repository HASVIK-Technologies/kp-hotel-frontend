import type { NextConfig } from "next";

/**
 * Static export → hosted on S3 + CloudFront (no Node server to pay for).
 * Dynamic data (rooms, prices, bookings) comes from the API at runtime; pages whose address depends on data read it from
 * the query string (e.g. /rooms/details?slug=…). Pictures are local files in public/images, so the Next image optimiser is not needed.
 */
const config: NextConfig = {
  output: "export",
  trailingSlash: true,
  reactStrictMode: true,
  // dev only: let the site hydrate when opened via 127.0.0.1 or a LAN address (phone testing)
  allowedDevOrigins: ["127.0.0.1", "localhost", "192.168.*.*", "10.*.*.*"],
  poweredByHeader: false,
  images: { unoptimized: true },
};

export default config;
