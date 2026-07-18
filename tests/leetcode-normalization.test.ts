import { describe, expect, it } from "vitest";
import { normalizeDifficulty } from "../src/utils/submission";
import { slugify, titleFromSlug } from "../src/utils/slug";

describe("LeetCode metadata normalization", () => {
  it("normalizes slugs and titles", () => {
    expect(slugify("Two Sum!")).toBe("two-sum");
    expect(titleFromSlug("longest-substring-without-repeating-characters")).toBe(
      "Longest Substring Without Repeating Characters"
    );
  });

  it("normalizes LeetCode difficulty labels", () => {
    expect(normalizeDifficulty("Medium")).toBe("medium");
    expect(normalizeDifficulty("Hard")).toBe("hard");
    expect(normalizeDifficulty("Easy")).toBe("easy");
  });
});
