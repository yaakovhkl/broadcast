'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { ConfirmModal } from './ConfirmModal';
import { NetfreeStatus, VideoRecord } from '@/lib/types';

type Props = {
  videos: VideoRecord[];
  onUpdateVideo: (videoId: string, patch: Partial<VideoRecord>) => void;
};

export function VideoTable({ videos, onUpdateVideo }: Props) {
  const [channelFilter, setChannelFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<NetfreeStatus | ''>('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'approvalProbability' | 'channelApprovalRate'>('approvalProbability');
  const [confirmVideoId, setConfirmVideoId] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      videos
        .filter((v) => (channelFilter ? v.channel.toLowerCase().includes(channelFilter.toLowerCase()) : true))
        .filter((v) => (statusFilter ? v.status === statusFilter : true))
        .filter((v) => `${v.title} ${v.videoId} ${v.description}`.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => b[sortBy] - a[sortBy]),
    [videos, channelFilter, statusFilter, search, sortBy],
  );

  const onCheckStatus = (video: VideoRecord) => {
    const options: NetfreeStatus[] = ['OPEN', 'BLOCKED', 'PENDING_REVIEW', 'NOT_CHECKED'];
    const nextStatus = options[Math.floor(Math.random() * options.length)];
    onUpdateVideo(video.id, { status: nextStatus, lastChecked: new Date().toISOString() });
    toast.success(`Status updated to ${nextStatus}`);
  };

  const onRequest = (video: VideoRecord) => {
    onUpdateVideo(video.id, { requestSent: true, status: 'PENDING_REVIEW' });
    toast.success('Open request tracked');
    setConfirmVideoId(null);
  };

  const onRecalculate = (video: VideoRecord) => {
    const swing = (Math.random() * 14) - 7;
    const next = Math.max(0, Math.min(100, video.approvalProbability + swing));
    onUpdateVideo(video.id, { approvalProbability: Math.round(next * 10) / 10 });
    toast.success('Probability recalculated');
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-4">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Global search" className="rounded bg-slate-900 p-2" />
        <input value={channelFilter} onChange={(e) => setChannelFilter(e.target.value)} placeholder="Filter by channel" className="rounded bg-slate-900 p-2" />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as NetfreeStatus | '')} className="rounded bg-slate-900 p-2">
          <option value="">All statuses</option>
          {['OPEN', 'BLOCKED', 'NOT_CHECKED', 'PENDING_REVIEW', 'APPROVED_AFTER_REQUEST'].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'approvalProbability' | 'channelApprovalRate')} className="rounded bg-slate-900 p-2">
          <option value="approvalProbability">Sort by approval probability</option>
          <option value="channelApprovalRate">Sort by approval rate</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-900">
            <tr>
              <th className="p-3">Title</th><th className="p-3">Channel</th><th className="p-3">Status</th><th className="p-3">Approval %</th><th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((v) => (
              <tr key={v.id} className="border-t border-slate-800">
                <td className="p-3"><Link href={`/videos/${v.id}`} className="hover:underline">{v.title}</Link></td>
                <td className="p-3">{v.channel}</td>
                <td className="p-3">{v.status}</td>
                <td className="p-3">{v.approvalProbability.toFixed(1)}</td>
                <td className="space-x-2 p-3">
                  <button onClick={() => onCheckStatus(v)} className="rounded bg-slate-700 px-2 py-1">Check Status</button>
                  <button onClick={() => setConfirmVideoId(v.id)} className="rounded bg-indigo-700 px-2 py-1">Send Open Request</button>
                  <button onClick={() => onRecalculate(v)} className="rounded bg-emerald-700 px-2 py-1">Recalculate Probability</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ConfirmModal
        open={Boolean(confirmVideoId)}
        title="Send NetFree open request?"
        description="This system only helps you track request decisions and does not bypass NetFree filtering."
        onCancel={() => setConfirmVideoId(null)}
        onConfirm={() => {
          const target = videos.find((v) => v.id === confirmVideoId);
          if (target) onRequest(target);
        }}
      />
    </div>
  );
}
