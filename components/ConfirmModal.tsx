'use client';

type Props = {
  open: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmModal({ open, title, description, onConfirm, onCancel }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl bg-slate-900 p-5 shadow-xl">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mt-2 text-sm text-slate-300">{description}</p>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onCancel} className="rounded bg-slate-700 px-3 py-2 text-sm">Cancel</button>
          <button onClick={onConfirm} className="rounded bg-indigo-600 px-3 py-2 text-sm">Confirm</button>
        </div>
      </div>
    </div>
  );
}
