import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it } from "vitest";
import { artworks, getArtworkUrl } from "./artworks";

const originalMediaBaseUrl = process.env.NEXT_PUBLIC_MEDIA_BASE_URL;

afterEach(() => {
  if (originalMediaBaseUrl === undefined) {
    delete process.env.NEXT_PUBLIC_MEDIA_BASE_URL;
  } else {
    process.env.NEXT_PUBLIC_MEDIA_BASE_URL = originalMediaBaseUrl;
  }
});

describe("public artwork media", () => {
  it("defines exactly 14 web-ready JPG keys with intrinsic dimensions and public metadata", () => {
    expect(artworks).toHaveLength(14);
    expect(new Set(artworks.map((artwork) => artwork.file))).toHaveLength(14);

    for (const artwork of artworks) {
      expect(artwork.file).toMatch(/\.jpg$/);
      expect(artwork.file).not.toMatch(/^\//);
      expect(artwork.width).toBeGreaterThan(0);
      expect(artwork.height).toBeGreaterThan(0);
      expect(artwork.alt.trim()).not.toBe("");
      expect(artwork.title).toMatch(/.+ \/ .+/);
      expect(artwork).not.toHaveProperty("photographer");
      expect(artwork).not.toHaveProperty("location");
      expect(artwork).not.toHaveProperty("year");
      expect(artwork).not.toHaveProperty("equipment");
    }
  });

  it("uses the identical artwork key for local and configured media bases", () => {
    const artwork = artworks[10];

    delete process.env.NEXT_PUBLIC_MEDIA_BASE_URL;
    expect(getArtworkUrl(artwork)).toBe(`/api/artwork/${artwork.file}`);

    process.env.NEXT_PUBLIC_MEDIA_BASE_URL = "https://images.example.com/exhibition/";
    expect(getArtworkUrl(artwork)).toBe(`https://images.example.com/exhibition/${artwork.file}`);
  });

  it("keeps private media ignored except for its delivery instructions", () => {
    const gitignore = readFileSync(".gitignore", "utf8");

    expect(gitignore).toContain("media/*");
    expect(gitignore).toContain("!media/README.md");
  });
});
