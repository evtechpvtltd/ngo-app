import { describe, expect, it } from "vitest";
import manifest from "@/app/manifest";

describe("app/manifest", () => {
  const result = manifest();

  it("declares standalone display for native-feeling install", () => {
    expect(result.display).toBe("standalone");
  });

  it("includes at least one maskable and one standard icon at 192 and 512", () => {
    const sizes = result.icons?.map((icon) => icon.sizes) ?? [];
    expect(sizes).toContain("192x192");
    expect(sizes).toContain("512x512");
    expect(result.icons?.some((icon) => icon.purpose === "maskable")).toBe(true);
  });

  it("has required manifest fields populated", () => {
    expect(result.name).toBeTruthy();
    expect(result.short_name).toBeTruthy();
    expect(result.start_url).toBe("/");
    expect(result.scope).toBe("/");
    expect(result.theme_color).toBeTruthy();
    expect(result.background_color).toBeTruthy();
  });
});
