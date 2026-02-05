"use client";

import Link from "next/link";

interface VictoryModalProps {
  open: boolean;
  onClose: () => void;
  onRetry?: () => void;
  title?: string;
  /** 雙人模式時顯示贏家 */
  winnerLabel?: string;
  children: React.ReactNode;
}

export default function VictoryModal({
  open,
  onClose,
  onRetry,
  title = "過關！",
  winnerLabel,
  children,
}: VictoryModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" aria-modal="true" role="dialog">
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-auto rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-6 shadow-xl">
        <h2 className="text-center text-xl font-bold text-white sm:text-2xl">{title}</h2>
        {winnerLabel && (
          <p className="mt-2 text-center text-amber-300">{winnerLabel}</p>
        )}
        <div className="mt-4 flex justify-center">{children}</div>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="rounded-full bg-amber-500 px-5 py-2.5 text-sm font-bold text-stone-900 shadow-md hover:bg-amber-400"
            >
              再玩一次
            </button>
          )}
          <Link
            href="/"
            className="rounded-full border-2 border-white/60 bg-white/10 px-5 py-2.5 text-sm font-bold text-white hover:bg-white/20"
          >
            返回選單
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-500 px-5 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-700"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
}
