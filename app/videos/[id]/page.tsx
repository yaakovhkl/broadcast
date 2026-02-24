'use client';

import { DashboardShell } from '@/components/DashboardShell';
import { VideoRecord } from '@/lib/types';
import { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'netfree-client-scan';

export default function VideoDetails({ params }: { params: { id: string } }) {
  const [videos, setVideos] = useState<VideoRecord[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) setVideos(JSON.parse(raw));
  }, []);

  const video = useMemo(() => videos.find((v) => v.id === params.id), [videos, params.id]);

  if (!video) {
    return (
      <DashboardShell>
        <p>Video not found in current session. Run a scan first.</p>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">{video.title}</h2>
        <div className="grid gap-3 rounded-xl border border-slate-800 p-4 md:grid-cols-2">
          <p>Video ID: {video.videoId}</p>
          <p>Channel: {video.channel}</p>
          <p>Status: {video.status}</p>
          <p>Approval Probability: {video.approvalProbability.toFixed(1)}%</p>
          <p>Approval Rate: {video.channelApprovalRate.toFixed(1)}%</p>
          <p>Block Rate: {video.channelBlockRate.toFixed(1)}%</p>
          <p>Duration: {video.duration}</p>
          <p>Category: {video.category}</p>
          <p>Views: {video.views.toLocaleString()}</p>
          <p>Last Checked: {new Date(video.lastChecked).toLocaleString()}</p>
        </div>
        <p className="rounded-xl border border-slate-800 p-4 text-sm text-slate-300">{video.description}</p>
      </div>
    </DashboardShell>
  );
}
