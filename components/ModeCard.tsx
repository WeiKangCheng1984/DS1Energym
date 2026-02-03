"use client";

import { useState } from "react";
import Link from "next/link";
import type { GameMode } from "@/lib/constants";
import ParamsModal from "./ParamsModal";

interface ModeCardProps {
  mode: GameMode;
}

function GearIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}

export default function ModeCard({ mode }: ModeCardProps) {
  const [showParamsModal, setShowParamsModal] = useState(false);

  const handleSettingsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowParamsModal(true);
  };

  return (
    <>
      <Link
        href={`/mode/${mode.id}`}
        className={`group relative flex overflow-hidden rounded-2xl border-2 border-orange-400 bg-gradient-to-br ${mode.color} p-4 text-black shadow-lg transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl hover:border-orange-500 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 focus:ring-offset-amber-50 dark:focus:ring-offset-stone-900 sm:p-5`}
      >
        <span className="pointer-events-none absolute inset-0 rounded-2xl bg-white/15" aria-hidden />
        <span className="absolute right-2 top-2 z-20 sm:right-3 sm:top-3">
          <button
            type="button"
            onClick={handleSettingsClick}
            className="flex items-center justify-center rounded-full border-2 border-stone-700 bg-white/90 p-2 text-stone-800 shadow-md transition hover:bg-white hover:border-stone-800 hover:shadow-lg"
            aria-label={`${mode.name} 參數設定`}
          >
            <GearIcon />
          </button>
        </span>
        <div className="relative z-10 flex w-full flex-col sm:flex-row sm:items-center sm:gap-4">
          <div className="flex shrink-0 items-center justify-center sm:w-20">
            <img
              src={`/icons/mode-${mode.id}.svg`}
              alt=""
              width={64}
              height={64}
              className="h-14 w-14 sm:h-16 sm:w-16 object-contain"
            />
          </div>
          <div className="min-w-0 flex-1 pt-2 sm:pt-0">
            <span className="text-xs font-medium text-black/80">#{mode.id}</span>
            <h2 className="text-lg font-bold text-black sm:text-xl">{mode.name}</h2>
            <p className="mt-1 text-sm font-medium text-black/90">{mode.description}</p>
          </div>
        </div>
      </Link>
      <ParamsModal
        open={showParamsModal}
        onClose={() => setShowParamsModal(false)}
        modeId={mode.id}
        modeName={mode.name}
      />
    </>
  );
}
