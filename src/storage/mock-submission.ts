import type { AcceptedSubmission } from "../types";

export const mockAcceptedSubmission: AcceptedSubmission = {
  platform: "leetcode",
  problemTitle: "Two Sum",
  problemSlug: "two-sum",
  problemUrl: "https://leetcode.com/problems/two-sum/",
  difficulty: "easy",
  language: "Java",
  code: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> seen = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (seen.containsKey(complement)) {
                return new int[] { seen.get(complement), i };
            }
            seen.put(nums[i], i);
        }
        return new int[0];
    }
}`,
  runtime: "2 ms",
  memory: "44.8 MB",
  submittedAt: new Date("2026-07-17T12:00:00.000Z").toISOString()
};
