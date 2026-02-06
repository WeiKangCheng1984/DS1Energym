"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { GameMode } from "@/lib/constants";
import GameLayout from "./GameLayout";
import VictoryModal from "./VictoryModal";
import WindTurbineVictory from "./victory/WindTurbineVictory";
import { useCountdown } from "@/lib/useCountdown";
import { playTap, playSuccess } from "@/lib/useSound";

const TAPS_TO_COMPLETE = 60;
const SYNC_WINDOW_MS = 200;

/** 可愛風力象徵 SVG（三葉＋中心圓） */
function WindLogoIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="32" cy="32" r="5" fill="currentColor" />
      {/* 三葉從中心向外 */}
      <line x1="32" y1="32" x2="32" y2="10" />
      <line x1="32" y1="32" x2="51" y2="42" />
      <line x1="32" y1="32" x2="13" y2="42" />
      {/* 葉端小圓點 */}
      <circle cx="32" cy="10" r="3" fill="currentColor" />
      <circle cx="51" cy="42" r="3" fill="currentColor" />
      <circle cx="13" cy="42" r="3" fill="currentColor" />
      {/* 微風弧線 */}
      <path d="M18 22 Q 32 18 46 26" strokeWidth="1.5" opacity="0.85" />
      <path d="M46 42 Q 32 46 18 38" strokeWidth="1.5" opacity="0.85" />
    </svg>
  );
}

interface WindDancingGameProps {
  mode: GameMode;
}

export default function WindDancingGame({ mode }: WindDancingGameProps) {
  const [started, setStarted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [lastSide, setLastSide] = useState<"L" | "R" | null>(null);
  const [windTrail, setWindTrail] = useState<"L" | "R" | null>(null);
  const lastTapRef = useRef(0);
  const [winner, setWinner] = useState<1 | 2 | null>(null);

  const { secondsLeft, start, reset } = useCountdown(60, () => setStarted(false), started);

  const addTap = useCallback(
    (side: "L" | "R") => {
      if (!started) return;
      playTap();
      const now = Date.now();
      const correctAlternate = lastSide === null || lastSide !== side;
      const syncBonus = lastSide !== null && now - lastTapRef.current < SYNC_WINDOW_MS && correctAlternate ? 1.5 : 1;
      setLastSide(side);
      lastTapRef.current = now;
      setWindTrail(side);
      setTimeout(() => setWindTrail(null), 300);
      setProgress((p) => {
        const next = Math.min(1, p + (1 / TAPS_TO_COMPLETE) * syncBonus);
        if (next >= 1) {
          playSuccess();
          setWinner(1);
        }
        return next;
      });
    },
    [started, lastSide]
  );

  const handleStart = useCallback(() => {
    setStarted(true);
    setProgress(0);
    setLastSide(null);
    setWinner(null);
    start();
  }, [start]);

  const handleRetry = useCallback(() => {
    reset();
    setProgress(0);
    setWinner(null);
    setStarted(false);
    setTimeout(handleStart, 100);
  }, [reset, handleStart]);

  const hue = Math.round(120 - progress * 120);

  return (
    <GameLayout
      modeName={mode.name}
      topRight={started ? <span className="rounded-full bg-amber-500/90 px-3 py-1 text-sm font-bold text-stone-900">{secondsLeft}s</span> : null}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/80 to-teal-900" />
      {!started && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-slate-900/90 p-4">
          <button type="button" onClick={handleStart} className="rounded-full bg-emerald-500 px-8 py-3 text-lg font-bold text-white shadow-lg hover:bg-emerald-400">
            開始遊戲
          </button>
          <p className="text-center text-xs text-emerald-200/90">按下後開始 60 秒倒數</p>
          <p className="text-center text-sm text-slate-400">左右交替點擊圓點，讓風力由綠→黃→紅</p>
          {mode.scienceNote && (
            <p className="max-w-sm text-center text-xs text-slate-500">
              <span className="font-medium text-emerald-300/90">能源小知識：</span> {mode.scienceNote}
            </p>
          )}
        </div>
      )}

      <div className="relative flex flex-1 flex-col items-center justify-center gap-6 p-4">
        <div className="flex w-full max-w-sm items-center justify-center gap-8">
          {windTrail === "L" && <div className="h-2 w-16 animate-pulse rounded-full bg-cyan-400/80" style={{ transform: "skewX(-15deg)" }} />}
          <div className="flex-1" />
          {windTrail === "R" && <div className="h-2 w-16 animate-pulse rounded-full bg-cyan-400/80" style={{ transform: "skewX(15deg)" }} />}
        </div>
        <div
          className="flex h-28 w-28 items-center justify-center rounded-full shadow-xl transition-all duration-200 text-white/95"
          style={{
            backgroundColor: `hsl(${hue}, 70%, 45%)`,
            boxShadow: progress >= 0.9 ? "0 0 20px rgba(239,68,68,0.6)" : undefined,
            transform: progress >= 0.9 ? "scale(1.02)" : "scale(1)",
          }}
        >
          <WindLogoIcon className="h-16 w-16" />
        </div>
        <div className="flex gap-8">
          <button
            type="button"
            className="h-20 w-20 touch-manipulation rounded-full bg-emerald-500 shadow-lg active:scale-95"
            onClick={() => addTap("L")}
          >
            左
          </button>
          <button
            type="button"
            className="h-20 w-20 touch-manipulation rounded-full bg-teal-500 shadow-lg active:scale-95"
            onClick={() => addTap("R")}
          >
            右
          </button>
        </div>
      </div>

      <VictoryModal open={winner !== null} onClose={() => setWinner(null)} onRetry={handleRetry} title="過關！">
        <WindTurbineVictory />
      </VictoryModal>
    </GameLayout>
  );
}
