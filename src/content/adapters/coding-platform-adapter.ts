import type { AcceptedSubmission } from "../../types";

export interface CodingPlatformAdapter {
  isSupportedPage(): boolean;
  observeSubmission(callback: (submission: AcceptedSubmission) => void): () => void;
  extractSubmission(): Promise<AcceptedSubmission | null>;
}
