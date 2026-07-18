import { describe, expect, it } from "vitest";
import { getLanguageExtension, normalizeLanguage } from "../src/utils/language";

describe("language mapping", () => {
  it("maps supported languages to file extensions", () => {
    expect(getLanguageExtension("Java")).toBe("java");
    expect(getLanguageExtension("Python")).toBe("py");
    expect(getLanguageExtension("JavaScript")).toBe("js");
    expect(getLanguageExtension("TypeScript")).toBe("ts");
    expect(getLanguageExtension("C++")).toBe("cpp");
    expect(getLanguageExtension("C")).toBe("c");
    expect(getLanguageExtension("C#")).toBe("cs");
    expect(getLanguageExtension("Go")).toBe("go");
    expect(getLanguageExtension("Rust")).toBe("rs");
    expect(getLanguageExtension("Kotlin")).toBe("kt");
    expect(getLanguageExtension("Swift")).toBe("swift");
    expect(getLanguageExtension("PHP")).toBe("php");
    expect(getLanguageExtension("Ruby")).toBe("rb");
    expect(getLanguageExtension("Scala")).toBe("scala");
  });

  it("normalizes display names", () => {
    expect(normalizeLanguage("python3")).toBe("Python");
    expect(normalizeLanguage("cpp")).toBe("C++");
  });
});
