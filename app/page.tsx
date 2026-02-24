'use client';

import { DashboardShell } from '@/components/DashboardShell';
import { VideoTable } from '@/components/VideoTable';
import { scanTerm } from '@/services/mockScanner';
import { VideoRecord } from '@/lib/types';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

const STORAGE_KEY = 'netfree-client-scan';

export default function HomePage() {
  const [term, setTerm] = useState('');
  const [videos, setVideos] = useState<VideoRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as VideoRecord[];
      setVideos(parsed);
    }
  }, []);

  const persist = (nextVideos: VideoRecord[]) => {
    setVideos(nextVideos);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextVideos));
  };

  const onScan = async () => {
    if (!term.trim()) return toast.error('Enter a term to scan.');
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    const scanned = scanTerm(term);
    persist(scanned);
    setLoading(false);
    toast.success(`Scan completed for "${term}" (${scanned.length} videos)`);
  };

  const onUpdateVideo = (videoId: string, patch: Partial<VideoRecord>) => {
    persist(videos.map((v) => (v.id === videoId ? { ...v, ...patch } : v)));
  };

  const stats = useMemo(() => {
    if (!videos.length) return { open: 0, blocked: 0, avgProbability: 0 };
    const open = videos.filter((v) => v.status === 'OPEN').length;
    const blocked = videos.filter((v) => v.status === 'BLOCKED').length;
    const avgProbability = videos.reduce((sum, v) => sum + v.approvalProbability, 0) / videos.length;
    return { open, blocked, avgProbability };
  }, [videos]);

  return (
    <DashboardShell>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Client-only NetFree Analyzer</h2>
        <p className="text-sm text-slate-400">Each term triggers a new local scan and analysis run. No database is used.</p>
      </div>

      <div className="mb-6 grid gap-3 rounded-xl border border-slate-800 p-4 md:grid-cols-4">
        <input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Enter term (e.g. javascript basics)" className="rounded bg-slate-900 p-2 md:col-span-3" />
        <button onClick={onScan} disabled={loading} className="rounded bg-indigo-600 px-4 py-2 font-medium disabled:opacity-60">{loading ? 'Scanning...' : 'Scan & Analyze'}</button>
      </div>

      <div className="mb-6 grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-slate-800 p-4">Open: <span className="font-semibold">{stats.open}</span></div>
        <div className="rounded-xl border border-slate-800 p-4">Blocked: <span className="font-semibold">{stats.blocked}</span></div>
        <div className="rounded-xl border border-slate-800 p-4">Avg approval probability: <span className="font-semibold">{stats.avgProbability.toFixed(1)}%</span></div>
      </div>

      <VideoTable videos={videos} onUpdateVideo={onUpdateVideo} />
    </DashboardShell>
  );
}
