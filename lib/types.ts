export type NetfreeStatus =
  | 'OPEN'
  | 'BLOCKED'
  | 'NOT_CHECKED'
  | 'PENDING_REVIEW'
  | 'APPROVED_AFTER_REQUEST';

export type VideoRecord = {
  id: string;
  videoId: string;
  title: string;
  channel: string;
  duration: string;
  durationSeconds: number;
  uploadDate: string;
  tags: string[];
  description: string;
  category: string;
  views: number;
  status: NetfreeStatus;
  requestSent: boolean;
  approvalProbability: number;
  lastChecked: string;
  netfreePointsCost: number;
  channelApprovalRate: number;
  channelBlockRate: number;
  actualOutcome?: 'APPROVED' | 'BLOCKED';
};
