"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getDefaultsForMode } from "@/lib/effectParamsSchema";
import { getParamsForMode } from "@/lib/effectParamsStorage";
import EffectRenderer from "./EffectRenderer";
import type { GameMode } from "@/lib/constants";

interface ModePageClientProps {
  modeId: number;
  mode: GameMode;
}

export default function ModePageClient({ modeId, mode }: ModePageClientProps) {
  const [params, setParams] = useState<Record<string, number | string> | null>(null);

  useEffect(() => {
    const defaults = getDefaultsForMode(modeId);
    const merged = getParamsForMode(modeId, defaults);
    setParams(merged);
  }, [modeId]);

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-slate-900">
      {params !== null && (
        <EffectRenderer modeId={modeId} params={params} />
      )}
      <Link
        href="/"
        className="absolute left-3 top-3 z-10 rounded-full border-2 border-amber-400 bg-amber-50/95 px-3 py-2 text-sm font-bold text-stone-800 shadow-md backdrop-blur-sm transition hover:bg-amber-100 hover:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400 sm:left-4 sm:top-4 sm:px-4"
      >
        ← 返回選單
      </Link>
      <span className="absolute right-3 top-3 z-10 max-w-[50%] truncate rounded-full bg-black/30 px-3 py-1.5 text-sm text-white/90 sm:right-4 sm:top-4">
        {mode.name}
      </span>
    </main>
  );
}
