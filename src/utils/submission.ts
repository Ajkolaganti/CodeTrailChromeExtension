import { z } from "zod";
import type { AcceptedSubmission, Difficulty } from "../types";
import { normalizeLanguage } from "./language";
import { slugify } from "./slug";
import { toIsoDate } from "./time";

const difficultySchema = z.enum(["easy", "medium", "hard"]);

export const acceptedSubmissionSchema = z.object({
  platform: z.literal("leetcode"),
  problemTitle: z.string().min(1),
  problemSlug: z.string().min(1),
  problemUrl: z.string().url(),
  difficulty: difficultySchema,
  language: z.string().min(1),
  code: z.string().min(1),
  runtime: z.string().optional(),
  memory: z.string().optional(),
  submittedAt: z.string().datetime()
});

export function normalizeDifficulty(value: string | undefined): Difficulty {
  const normalized = value?.trim().toLowerCase();
  if (normalized === "medium" || normalized === "hard") {
    return normalized;
  }
  return "easy";
}

export function normalizeSubmission(submission: AcceptedSubmission): AcceptedSubmission {
  const problemSlug = slugify(submission.problemSlug || submission.problemTitle);
  const problemUrl = submission.problemUrl || `https://leetcode.com/problems/${problemSlug}/`;

  return {
    platform: "leetcode",
    problemTitle: submission.problemTitle.trim(),
    problemSlug,
    problemUrl,
    difficulty: normalizeDifficulty(submission.difficulty),
    language: normalizeLanguage(submission.language),
    code: submission.code.trimEnd(),
    runtime: cleanMetric(submission.runtime),
    memory: cleanMetric(submission.memory),
    submittedAt: toIsoDate(submission.submittedAt)
  };
}

export function validateSubmission(submission: AcceptedSubmission): AcceptedSubmission {
  return acceptedSubmissionSchema.parse(normalizeSubmission(submission));
}

export function createSubmissionKey(submission: AcceptedSubmission): string {
  const normalized = normalizeSubmission(submission);
  return `${normalized.platform}:${normalized.problemSlug}:${normalized.language.toLowerCase()}`;
}

function cleanMetric(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}
