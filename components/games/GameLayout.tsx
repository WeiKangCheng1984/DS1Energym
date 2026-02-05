"use client";

import Link from "next/link";

interface GameLayoutProps {
  modeName: string;
  children: React.ReactNode;
  /** 頂部右側額外區塊（例如計時器） */
  topRight?: React.ReactNode;
}

export default function GameLayout({ modeName, children, topRight }: GameLayoutProps) {
  return (
    <main className="relative flex h-screen w-screen flex-col overflow-hidden bg-slate-900">
      <Link
        href="/"
        className="absolute left-3 top-3 z-10 rounded-full border-2 border-amber-400 bg-amber-50/95 px-3 py-2 text-sm font-bold text-stone-800 shadow-md hover:bg-amber-100 sm:left-4 sm:top-4 sm:px-4"
      >
        ← 返回選單
      </Link>
      <div className="absolute right-3 top-3 z-10 flex items-center gap-2 sm:right-4 sm:top-4">
        {topRight}
        <span className="max-w-[120px] truncate rounded-full bg-black/40 px-3 py-1.5 text-sm text-white/90 sm:max-w-[180px]">
          {modeName}
        </span>
      </div>
      {children}
    </main>
  );
}
