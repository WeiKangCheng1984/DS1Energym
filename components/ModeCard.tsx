"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import type { GameMode } from "@/lib/constants";
import ParamsModal from "./ParamsModal";

interface ModeCardProps {
  mode: GameMode;
  /** 用於錯落進場動畫的延遲索引 */
  staggerIndex?: number;
}

function GearIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}

export default function ModeCard({ mode, staggerIndex = 0 }: ModeCardProps) {
  const [showParamsModal, setShowParamsModal] = useState(false);
  const [ripple, setRipple] = useState<{ x: number; y: number } | null>(null);
  const rippleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (rippleTimeoutRef.current) clearTimeout(rippleTimeoutRef.current);
  }, []);

  const handleSettingsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowParamsModal(true);
  };

  const handleClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (rippleTimeoutRef.current) clearTimeout(rippleTimeoutRef.current);
    setRipple({ x, y });
    rippleTimeoutRef.current = setTimeout(() => {
      setRipple(null);
      rippleTimeoutRef.current = null;
    }, 560);
  }, []);

  const delayMs = staggerIndex * 50;

  return (
    <>
      <div
        className="animate-card-enter rounded-2xl bg-gradient-to-br from-slate-300/70 via-slate-200/80 to-sky-300/70 p-[3px] shadow-[0_18px_40px_rgba(15,23,42,0.45)] transition-shadow duration-300 hover:shadow-[0_24px_55px_rgba(15,23,42,0.65)]"
        style={{ animationDelay: `${delayMs}ms` }}
      >
        <Link
          href={`/mode/${mode.id}`}
          onClick={handleClick}
          className={`group relative flex overflow-hidden rounded-[13px] bg-gradient-to-br ${mode.color} p-4 text-slate-900 dark:text-slate-50 shadow-inner transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2 focus:ring-offset-rose-50 dark:focus:ring-offset-stone-900 sm:p-5`}
        >
          {ripple && (
            <span
              className="ripple-effect absolute h-[100px] w-[100px] rounded-full bg-white/50"
              style={{ left: ripple.x, top: ripple.y }}
              aria-hidden
            />
          )}
          <span className="pointer-events-none absolute inset-0 rounded-[13px] bg-white/20" aria-hidden />
          <span className="absolute right-2 top-2 z-20 sm:right-3 sm:top-3">
            <button
              type="button"
              onClick={handleSettingsClick}
              className="flex items-center justify-center rounded-full border-2 border-slate-600 bg-white/85 px-2 py-2 text-slate-800 shadow-md transition hover:bg-white hover:border-slate-800 hover:shadow-lg dark:border-slate-400 dark:bg-slate-900/90 dark:text-slate-100"
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
              <span className="text-xs font-semibold text-slate-900/80 dark:text-slate-100/80">#{mode.id}</span>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 sm:text-xl">{mode.name}</h2>
              <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-200">{mode.description}</p>
            </div>
          </div>
        </Link>
      </div>
      <ParamsModal
        open={showParamsModal}
        onClose={() => setShowParamsModal(false)}
        modeId={mode.id}
        modeName={mode.name}
      />
    </>
  );
}
