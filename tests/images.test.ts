import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { IMAGES, imageUrl, roomImageUrl } from "@/config/images";

describe("image registry", () => {
  it("resolves paths, room names and absolute URLs", () => {
    expect(imageUrl("home/hero.jpg")).toBe("/images/home/hero.jpg");
    expect(imageUrl("https://cdn.example.com/a.jpg")).toBe("https://cdn.example.com/a.jpg");
    expect(roomImageUrl("deluxe-room-1.jpg")).toBe("/images/rooms/deluxe-room-1.jpg");
    expect(roomImageUrl("/custom/x.jpg")).toBe("/custom/x.jpg");
  });

  it("every image listed in the registry exists in public/images (so a typo is caught here, not in the browser)", () => {
    const paths = Object.values(IMAGES).flatMap((group) => Object.values(group));
    const missing = paths.filter((p) => !existsSync(join(__dirname, "..", "public", "images", p)));
    expect(missing).toEqual([]);
  });
});
