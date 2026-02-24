'use client';

import { DashboardShell } from '@/components/DashboardShell';
import { VideoRecord } from '@/lib/types';
import { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'netfree-client-scan';

export default function AdminPage() {
  const [videos, setVideos] = useState<VideoRecord[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) setVideos(JSON.parse(raw));
  }, []);

  const byChannel = useMemo(() => Object.values(videos.reduce<Record<string, { count: number; total: number }>>((acc, v) => {
    acc[v.channel] ??= { count: 0, total: 0 };
    acc[v.channel].count += 1;
    acc[v.channel].total += v.approvalProbability;
    return acc;
  }, {})), [videos]);

  const byCategory = useMemo(() => Object.entries(videos.reduce<Record<string, { count: number; approved: number }>>((acc, v) => {
    acc[v.category] ??= { count: 0, approved: 0 };
    acc[v.category].count += 1;
    if (v.status === 'OPEN' || v.status === 'APPROVED_AFTER_REQUEST') acc[v.category].approved += 1;
    return acc;
  }, {})), [videos]);

  const totalSavedRequests = videos.filter((v) => v.requestSent && v.status === 'APPROVED_AFTER_REQUEST').length;
  const resolved = videos.filter((v) => v.actualOutcome);
  const accuracy = resolved.length
    ? (resolved.filter((v) => (v.approvalProbability >= 50) === (v.actualOutcome === 'APPROVED')).length / resolved.length) * 100
    : 0;

  return (
    <DashboardShell>
      <h2 className="mb-4 text-2xl font-semibold">Admin Analytics (Client Session)</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-xl border border-slate-800 p-4">
          <h3 className="mb-2 font-medium">Approval Rate by Channel</h3>
          {byChannel.map((item, idx) => (
            <p key={idx}>Channel #{idx + 1}: {(item.total / item.count).toFixed(1)}%</p>
          ))}
        </section>
        <section className="rounded-xl border border-slate-800 p-4">
          <h3 className="mb-2 font-medium">Approval Rate by Category</h3>
          {byCategory.map(([category, item]) => (
            <p key={category}>{category}: {((item.approved / item.count) * 100).toFixed(1)}%</p>
          ))}
        </section>
        <section className="rounded-xl border border-slate-800 p-4 md:col-span-2">
          <h3 className="mb-2 font-medium">Trends & Efficiency</h3>
          <p>Total Saved Requests: {totalSavedRequests}</p>
          <p>Predicted vs Actual Approval Accuracy: {accuracy.toFixed(1)}%</p>
          <p className="mt-2 text-sm text-slate-400">Metrics are calculated from the latest client-side scan session.</p>
        </section>
      </div>
    </DashboardShell>
  );
}
