const languageExtensions: Record<string, string> = {
  java: "java",
  python: "py",
  python3: "py",
  javascript: "js",
  "java script": "js",
  typescript: "ts",
  "c++": "cpp",
  cpp: "cpp",
  c: "c",
  "c#": "cs",
  csharp: "cs",
  go: "go",
  golang: "go",
  rust: "rs",
  kotlin: "kt",
  swift: "swift",
  php: "php",
  ruby: "rb",
  scala: "scala"
};

const displayNames: Record<string, string> = {
  java: "Java",
  python: "Python",
  python3: "Python",
  javascript: "JavaScript",
  typescript: "TypeScript",
  cpp: "C++",
  "c++": "C++",
  c: "C",
  csharp: "C#",
  "c#": "C#",
  go: "Go",
  golang: "Go",
  rust: "Rust",
  kotlin: "Kotlin",
  swift: "Swift",
  php: "PHP",
  ruby: "Ruby",
  scala: "Scala"
};

export function normalizeLanguage(language: string): string {
  const key = language.trim().toLowerCase();
  return displayNames[key] ?? titleCase(language.trim());
}

export function getLanguageExtension(language: string): string {
  const key = language.trim().toLowerCase();
  return languageExtensions[key] ?? "txt";
}

export function languageKey(language: string): string {
  return normalizeLanguage(language).toLowerCase().replace(/[^a-z0-9#+]+/g, "-");
}

function titleCase(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}
