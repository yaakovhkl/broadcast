import { approvalEngine } from './approvalEngine';
import { NetfreeStatus, VideoRecord } from '@/lib/types';

const channels = ['TorahLab', 'TechFlow IL', 'LearnHub', 'WorldNews 24', 'Daily Insights', 'CodeSprint'];
const categories = ['Education', 'Science', 'Technology', 'News', 'Entertainment', 'Music'];
const statuses: NetfreeStatus[] = ['OPEN', 'BLOCKED', 'NOT_CHECKED', 'PENDING_REVIEW', 'APPROVED_AFTER_REQUEST'];

const seeded = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

export function scanTerm(term: string): VideoRecord[] {
  const normalized = term.trim().toLowerCase();
  if (!normalized) return [];

  return Array.from({ length: 18 }).map((_, index) => {
    const seed = normalized.length * 31 + index * 17;
    const channel = channels[Math.floor(seeded(seed) * channels.length)];
    const category = categories[Math.floor(seeded(seed + 1) * categories.length)];
    const durationSeconds = 120 + Math.floor(seeded(seed + 2) * 3000);
    const channelApprovalRate = Math.round((30 + seeded(seed + 3) * 65) * 10) / 10;
    const channelBlockRate = Math.round((100 - channelApprovalRate - seeded(seed + 4) * 20) * 10) / 10;
    const description = `${term} deep dive #${index + 1} with practical guidance and curated examples.`;

    const approvalProbability = approvalEngine.calculateApprovalProbability({
      channelApprovalRate,
      channelBlockRate,
      durationSeconds,
      title: `${term} tutorial part ${index + 1}`,
      description,
      category,
    });

    return {
      id: `${normalized.replace(/\s+/g, '-')}-${index + 1}`,
      videoId: `yt_${normalized.slice(0, 3)}_${(1000 + index).toString(36)}`,
      title: `${term} tutorial part ${index + 1}`,
      channel,
      duration: `${Math.floor(durationSeconds / 60)}:${String(durationSeconds % 60).padStart(2, '0')}`,
      durationSeconds,
      uploadDate: new Date(Date.now() - index * 86400000).toISOString(),
      tags: [term, category.toLowerCase(), 'netfree-analysis'],
      description,
      category,
      views: Math.floor(500 + seeded(seed + 5) * 240000),
      status: statuses[Math.floor(seeded(seed + 6) * statuses.length)],
      requestSent: false,
      approvalProbability,
      lastChecked: new Date().toISOString(),
      netfreePointsCost: Math.floor(1 + seeded(seed + 7) * 10),
      channelApprovalRate,
      channelBlockRate,
    };
  });
}
