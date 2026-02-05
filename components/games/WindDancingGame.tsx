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

interface WindDancingGameProps {
  mode: GameMode;
}

export default function WindDancingGame({ mode }: WindDancingGameProps) {
  const [isDual, setIsDual] = useState(false);
  const [started, setStarted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [p2Progress, setP2Progress] = useState(0);
  const [lastSide, setLastSide] = useState<"L" | "R" | null>(null);
  const [p2LastSide, setP2LastSide] = useState<"L" | "R" | null>(null);
  const [windTrail, setWindTrail] = useState<"L" | "R" | null>(null);
  const [p2WindTrail, setP2WindTrail] = useState<"L" | "R" | null>(null);
  const lastTapRef = useRef(0);
  const p2LastTapRef = useRef(0);
  const [winner, setWinner] = useState<1 | 2 | null>(null);

  const { secondsLeft, start, reset } = useCountdown(60, () => setStarted(false), started);

  const addTap = useCallback(
    (player: 1 | 2, side: "L" | "R") => {
      if (!started) return;
      playTap();
      const now = Date.now();
      if (player === 1) {
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
      } else {
        const correctAlternate = p2LastSide === null || p2LastSide !== side;
        const syncBonus = p2LastSide !== null && now - p2LastTapRef.current < SYNC_WINDOW_MS && correctAlternate ? 1.5 : 1;
        setP2LastSide(side);
        p2LastTapRef.current = now;
        setP2WindTrail(side);
        setTimeout(() => setP2WindTrail(null), 300);
        setP2Progress((p) => {
          const next = Math.min(1, p + (1 / TAPS_TO_COMPLETE) * syncBonus);
          if (next >= 1) {
            playSuccess();
            setWinner(2);
          }
          return next;
        });
      }
    },
    [started, lastSide, p2LastSide]
  );

  const handleStart = useCallback(() => {
    setStarted(true);
    setProgress(0);
    setP2Progress(0);
    setLastSide(null);
    setP2LastSide(null);
    setWinner(null);
    start();
  }, [start]);

  const handleRetry = useCallback(() => {
    reset();
    setProgress(0);
    setP2Progress(0);
    setWinner(null);
    setStarted(false);
    setTimeout(handleStart, 100);
  }, [reset, handleStart]);

  const hue = Math.round(120 - progress * 120);
  const p2Hue = Math.round(120 - p2Progress * 120);

  return (
    <GameLayout
      modeName={mode.name}
      topRight={started ? <span className="rounded-full bg-amber-500/90 px-3 py-1 text-sm font-bold text-stone-900">{secondsLeft}s</span> : null}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/80 to-teal-900" />
      {!started && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-slate-900/90 p-4">
          <button type="button" onClick={() => setIsDual((d) => !d)} className="rounded-full border-2 border-emerald-400 px-4 py-2 text-sm font-medium text-white">
            {isDual ? "雙人競賽" : "單人"} （點擊切換）
          </button>
          <button type="button" onClick={handleStart} className="rounded-full bg-emerald-500 px-8 py-3 text-lg font-bold text-white shadow-lg hover:bg-emerald-400">
            開始遊戲
          </button>
          <p className="text-center text-xs text-emerald-200/90">按下後開始 60 秒倒數</p>
          <p className="text-center text-sm text-slate-400">左右交替點擊圓點，讓 Logo 由綠→黃→紅</p>
        </div>
      )}

      <div className={`relative flex flex-1 flex-col ${isDual ? "md:flex-row" : ""} items-center justify-center gap-6 p-4`}>
        {!isDual && (
          <>
            <div className="flex w-full max-w-sm items-center justify-center gap-8">
              {windTrail === "L" && <div className="h-2 w-16 animate-pulse rounded-full bg-cyan-400/80" style={{ transform: "skewX(-15deg)" }} />}
              <div className="flex-1" />
              {windTrail === "R" && <div className="h-2 w-16 animate-pulse rounded-full bg-cyan-400/80" style={{ transform: "skewX(15deg)" }} />}
            </div>
            <div
              className="flex h-28 w-28 items-center justify-center rounded-full shadow-xl transition-all duration-200"
              style={{
                backgroundColor: `hsl(${hue}, 70%, 45%)`,
                boxShadow: progress >= 0.9 ? "0 0 20px rgba(239,68,68,0.6)" : undefined,
                transform: progress >= 0.9 ? "scale(1.02)" : "scale(1)",
              }}
            >
              <span className="text-sm font-bold text-white/90">Logo</span>
            </div>
            <div className="flex gap-8">
              <button
                type="button"
                className="h-20 w-20 touch-manipulation rounded-full bg-emerald-500 shadow-lg active:scale-95"
                onClick={() => addTap(1, "L")}
              >
                左
              </button>
              <button
                type="button"
                className="h-20 w-20 touch-manipulation rounded-full bg-teal-500 shadow-lg active:scale-95"
                onClick={() => addTap(1, "R")}
              >
                右
              </button>
            </div>
          </>
        )}

        {isDual && (
          <>
            <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-center gap-4 rounded-lg border-2 border-emerald-500/30 bg-emerald-950/30 p-3 md:w-auto">
              <span className="text-sm font-bold text-emerald-200">玩家 1</span>
              {windTrail && <div className="h-1 w-12 rounded-full bg-cyan-400/80" />}
              <div className="h-20 w-20 rounded-full shadow-lg" style={{ backgroundColor: `hsl(${hue}, 70%, 45%)` }} />
              <div className="flex gap-4">
                <button type="button" className="h-14 w-14 min-h-[44px] min-w-[44px] touch-manipulation rounded-full bg-emerald-500" onClick={() => addTap(1, "L")}>左</button>
                <button type="button" className="h-14 w-14 min-h-[44px] min-w-[44px] touch-manipulation rounded-full bg-teal-500" onClick={() => addTap(1, "R")}>右</button>
              </div>
            </div>
            <div className="h-px w-full shrink-0 bg-white/30 md:h-full md:w-px" aria-hidden />
            <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-center gap-4 rounded-lg border-2 border-emerald-500/30 bg-emerald-950/30 p-3 md:w-auto">
              <span className="text-sm font-bold text-emerald-200">玩家 2</span>
              {p2WindTrail && <div className="h-1 w-12 rounded-full bg-cyan-400/80" />}
              <div className="h-20 w-20 rounded-full shadow-lg" style={{ backgroundColor: `hsl(${p2Hue}, 70%, 45%)` }} />
              <div className="flex gap-4">
                <button type="button" className="h-14 w-14 min-h-[44px] min-w-[44px] touch-manipulation rounded-full bg-emerald-500" onClick={() => addTap(2, "L")}>左</button>
                <button type="button" className="h-14 w-14 min-h-[44px] min-w-[44px] touch-manipulation rounded-full bg-teal-500" onClick={() => addTap(2, "R")}>右</button>
              </div>
            </div>
          </>
        )}
      </div>

      <VictoryModal open={winner !== null} onClose={() => setWinner(null)} onRetry={handleRetry} title="過關！" winnerLabel={isDual && winner ? `玩家 ${winner} 獲勝` : undefined}>
        <WindTurbineVictory />
      </VictoryModal>
    </GameLayout>
  );
}
