export type ApprovalInput = {
  channelApprovalRate: number;
  channelBlockRate: number;
  durationSeconds: number;
  title: string;
  description: string;
  category: string;
};

const categorySafetyScore: Record<string, number> = {
  Education: 12,
  Science: 10,
  Technology: 8,
  Music: 6,
  News: 3,
  Entertainment: 2,
  Gaming: 0,
  Politics: -8,
  Other: 0,
};

const riskKeywords = ['violence', 'explicit', 'gambling', 'drugs', 'political', 'war'];

const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, value));

const scoreDuration = (durationSeconds: number) => {
  if (durationSeconds <= 300) return 10;
  if (durationSeconds <= 900) return 5;
  if (durationSeconds <= 1800) return 0;
  return -8;
};

const keywordRiskPenalty = (title: string, description: string) => {
  const content = `${title} ${description}`.toLowerCase();
  return riskKeywords.reduce((penalty, keyword) => (content.includes(keyword) ? penalty - 9 : penalty), 0);
};

export function calculateApprovalProbability(input: ApprovalInput): number {
  const approvalRateContribution = input.channelApprovalRate * 0.45;
  const blockRateContribution = input.channelBlockRate * -0.35;
  const durationContribution = scoreDuration(input.durationSeconds);
  const categoryContribution = categorySafetyScore[input.category] ?? categorySafetyScore.Other;
  const keywordContribution = keywordRiskPenalty(input.title, input.description);

  const base = 45;

  return clamp(
    base +
      approvalRateContribution +
      blockRateContribution +
      durationContribution +
      categoryContribution +
      keywordContribution,
  );
}

export const approvalEngine = {
  version: 'v1-rule-engine',
  calculateApprovalProbability,
};
