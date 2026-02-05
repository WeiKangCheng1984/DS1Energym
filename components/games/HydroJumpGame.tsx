"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { GameMode } from "@/lib/constants";
import GameLayout from "./GameLayout";
import VictoryModal from "./VictoryModal";
import WaterTurbineVictory from "./victory/WaterTurbineVictory";
import { useCountdown } from "@/lib/useCountdown";
import { playTap } from "@/lib/useSound";

const TAPS_PER_STAGE = 45;
const RESERVOIR_LEVEL_MAX = 100;

interface HydroJumpGameProps {
  mode: GameMode;
}

export default function HydroJumpGame({ mode }: HydroJumpGameProps) {
  const [isDual, setIsDual] = useState(false);
  const [started, setStarted] = useState(false);
  const [stage, setStage] = useState(0);
  const [fill, setFill] = useState(0);
  const [reservoirLevel, setReservoirLevel] = useState(50);
  const [ripple, setRipple] = useState<{ x: number; y: number } | null>(null);
  const [winner, setWinner] = useState<1 | 2 | null>(null);
  const [p2Stage, setP2Stage] = useState(0);
  const [p2Fill, setP2Fill] = useState(0);
  const [displayFill, setDisplayFill] = useState(0);
  const [displayP2Fill, setDisplayP2Fill] = useState(0);
  const tapCountRef = useRef(0);
  const p2TapCountRef = useRef(0);

  const onTimeUp = useCallback(() => {
    setStarted(false);
  }, []);

  const { secondsLeft, start, reset } = useCountdown(60, onTimeUp, started);

  const addTap = useCallback(
    (player: 1 | 2) => {
      if (!started) return;
      if (player === 1) {
        tapCountRef.current += 1;
        const needNext = (stage + 1) * TAPS_PER_STAGE;
        if (tapCountRef.current >= needNext) {
          if (stage === 2) {
            setWinner(1);
            if (typeof window !== "undefined") import("@/lib/useSound").then(({ playSuccess }) => playSuccess());
            return;
          }
          setStage((s) => s + 1);
        }
        const stageTaps = tapCountRef.current - stage * TAPS_PER_STAGE;
        setFill((stage / 3) + (Math.min(stageTaps, TAPS_PER_STAGE) / TAPS_PER_STAGE) * (1 / 3));
        setReservoirLevel((L) => Math.min(RESERVOIR_LEVEL_MAX, L + 2 + Math.random() * 4));
      } else {
        p2TapCountRef.current += 1;
        const needNext = (p2Stage + 1) * TAPS_PER_STAGE;
        if (p2TapCountRef.current >= needNext) {
          if (p2Stage === 2) {
            setWinner(2);
            if (typeof window !== "undefined") import("@/lib/useSound").then(({ playSuccess }) => playSuccess());
            return;
          }
          setP2Stage((s) => s + 1);
        }
        const stageTaps = p2TapCountRef.current - p2Stage * TAPS_PER_STAGE;
        setP2Fill((p2Stage / 3) + (Math.min(stageTaps, TAPS_PER_STAGE) / TAPS_PER_STAGE) * (1 / 3));
      }
    },
    [started, stage, p2Stage]
  );

  useEffect(() => {
    if (!started) return;
    const id = setInterval(() => {
      setReservoirLevel((L) => Math.max(0, L - 0.3));
    }, 100);
    return () => clearInterval(id);
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let raf = 0;
    const LERP = 0.08;
    const tick = () => {
      setDisplayFill((d) => {
        const diff = fill - d;
        if (Math.abs(diff) < 0.002) return fill;
        return d + diff * LERP;
      });
      setDisplayP2Fill((d) => {
        const diff = p2Fill - d;
        if (Math.abs(diff) < 0.002) return p2Fill;
        return d + diff * LERP;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [started, fill, p2Fill]);

  const handleCircleClick = useCallback(
    (e: React.MouseEvent | React.TouchEvent, player: 1 | 2) => {
      e.preventDefault();
      const target = e.currentTarget as HTMLElement;
      const rect = target.getBoundingClientRect();
      let x: number;
      let y: number;
      if ("touches" in e) {
        const touch = e.touches[0] ?? (e as React.TouchEvent).changedTouches?.[0];
        if (!touch) return;
        x = touch.clientX - rect.left;
        y = touch.clientY - rect.top;
      } else {
        x = (e as React.MouseEvent).clientX - rect.left;
        y = (e as React.MouseEvent).clientY - rect.top;
      }
      if (player === 1) setRipple({ x, y });
      playTap();
      addTap(player);
    },
    [addTap]
  );

  const handleStart = useCallback(() => {
    setStarted(true);
    setStage(0);
    setFill(0);
    setP2Stage(0);
    setP2Fill(0);
    setDisplayFill(0);
    setDisplayP2Fill(0);
    setWinner(null);
    tapCountRef.current = 0;
    p2TapCountRef.current = 0;
    setReservoirLevel(50);
    start();
  }, [start]);

  const handleRetry = useCallback(() => {
    reset();
    setStage(0);
    setFill(0);
    setP2Stage(0);
    setP2Fill(0);
    setDisplayFill(0);
    setDisplayP2Fill(0);
    setWinner(null);
    setReservoirLevel(50);
    setStarted(false);
    setTimeout(handleStart, 100);
  }, [reset, handleStart]);

  const pipeColor = stage === 0 ? "from-sky-300 to-blue-400" : stage === 1 ? "from-blue-400 to-blue-600" : "from-blue-500 to-cyan-400";
  const pipeFlow = stage === 0 ? "animate-[flow_2s_linear_infinite]" : stage === 1 ? "animate-[flow_1s_linear_infinite]" : "animate-[flow_0.5s_linear_infinite]";

  return (
    <GameLayout
      modeName={mode.name}
      topRight={
        started ? (
          <span className="rounded-full bg-amber-500/90 px-3 py-1 text-sm font-bold text-stone-900">
            {secondsLeft}s
          </span>
        ) : null
      }
    >
      {/* 背景水庫水位震盪 */}
      <div
        className="absolute inset-0 opacity-30 transition-all duration-150"
        style={{
          background: `linear-gradient(to top, rgba(14,165,233,0.6) 0%, transparent ${100 - reservoirLevel}%)`,
        }}
      />
      {!started && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-slate-900/90 p-4">
          <button
            type="button"
            onClick={() => setIsDual((d) => !d)}
            className="rounded-full border-2 border-cyan-400 px-4 py-2 text-sm font-medium text-white"
          >
            {isDual ? "雙人競賽" : "單人"} （點擊切換）
          </button>
          <button
            type="button"
            onClick={handleStart}
            className="rounded-full bg-cyan-500 px-8 py-3 text-lg font-bold text-white shadow-lg hover:bg-cyan-400"
          >
            開始遊戲
          </button>
          <p className="text-center text-xs text-cyan-200/90">按下後開始 60 秒倒數</p>
          <p className="text-center text-sm text-slate-400">
            60 秒內連續點擊圓點，讓水柱升至 1/3 → 2/3 → 滿水位過關
          </p>
        </div>
      )}

      <div className={`relative flex flex-1 flex-col ${isDual ? "md:flex-row" : ""} items-center justify-center gap-4 p-4`}>
        {/* 單人：一個水柱 + 一個圓點 */}
        {!isDual && (
          <>
            <div className="flex flex-col items-center gap-2">
              <div className={`h-48 w-24 overflow-hidden rounded-lg border-4 border-slate-600 bg-slate-700 ${stage === 2 ? "ring-2 ring-amber-400 ring-offset-2 animate-pulse" : ""}`}>
                <div
                  className={`w-full ${pipeColor} ${pipeFlow}`}
                  style={{ height: `${displayFill * 100}%`, minHeight: displayFill > 0 ? "8px" : "0" }}
                />
              </div>
              <span className="text-xs text-white">
                階段 {stage + 1}/3 {stage === 0 && "(達 1/3)"} {stage === 1 && "(達 2/3)"} {stage === 2 && "(滿水位)"}
              </span>
            </div>
            {/* 累積光條：與 displayFill 同步，由左到右上升 */}
            <div className="w-48 max-w-full rounded-full bg-slate-600/80 p-1 shadow-inner ring-1 ring-slate-500/50">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-cyan-300 to-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.5)] transition-all duration-150"
                style={{ width: `${displayFill * 100}%`, minWidth: 0 }}
              />
            </div>
            <button
              type="button"
              className="relative h-20 w-20 touch-manipulation select-none rounded-full bg-cyan-500 shadow-lg active:scale-95"
              onClick={(e) => handleCircleClick(e, 1)}
              onTouchEnd={(e) => {
                e.preventDefault();
                handleCircleClick(e, 1);
              }}
            >
              {ripple && (
                <span
                  className="absolute inset-0 animate-ping rounded-full bg-white/60"
                  style={{ animationDuration: "0.6s" }}
                  aria-hidden
                />
              )}
              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">點我</span>
            </button>
          </>
        )}

        {/* 雙人：手機上下、平板以上左右 */}
        {isDual && (
          <>
            <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-center gap-2 rounded-lg border-2 border-cyan-500/30 bg-cyan-950/30 p-3 md:w-auto">
              <span className="text-sm font-bold text-cyan-200">玩家 1</span>
              <div className={`h-32 w-16 overflow-hidden rounded-lg border-2 border-slate-600 bg-slate-700 ${stage === 2 ? "ring-2 ring-amber-400" : ""}`}>
                <div className={`w-full ${pipeColor}`} style={{ height: `${displayFill * 100}%`, minHeight: "4px" }} />
              </div>
              {/* 累積光條 P1 */}
              <div className="h-1.5 w-20 rounded-full bg-slate-600/80 overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)] transition-all duration-150"
                  style={{ width: `${displayFill * 100}%`, minWidth: 0 }}
                />
              </div>
              <button
                type="button"
                className="h-16 w-16 min-h-[44px] min-w-[44px] touch-manipulation rounded-full bg-cyan-500"
                onClick={(e) => handleCircleClick(e, 1)}
                onTouchEnd={(e) => { e.preventDefault(); handleCircleClick(e, 1); }}
              >
                點
              </button>
            </div>
            <div className="h-px w-full shrink-0 bg-white/30 md:h-full md:w-px" aria-hidden />
            <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-center gap-2 rounded-lg border-2 border-cyan-500/30 bg-cyan-950/30 p-3 md:w-auto">
              <span className="text-sm font-bold text-cyan-200">玩家 2</span>
              <div className={`h-32 w-16 overflow-hidden rounded-lg border-2 border-slate-600 bg-slate-700 ${p2Stage === 2 ? "ring-2 ring-amber-400" : ""}`}>
                <div className={`w-full ${pipeColor}`} style={{ height: `${displayP2Fill * 100}%`, minHeight: "4px" }} />
              </div>
              {/* 累積光條 P2 */}
              <div className="h-1.5 w-20 rounded-full bg-slate-600/80 overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)] transition-all duration-150"
                  style={{ width: `${displayP2Fill * 100}%`, minWidth: 0 }}
                />
              </div>
              <button
                type="button"
                className="h-16 w-16 min-h-[44px] min-w-[44px] touch-manipulation rounded-full bg-cyan-500"
                onClick={(e) => handleCircleClick(e, 2)}
                onTouchEnd={(e) => { e.preventDefault(); handleCircleClick(e, 2); }}
              >
                點
              </button>
            </div>
          </>
        )}
      </div>

      <VictoryModal
        open={winner !== null}
        onClose={() => setWinner(null)}
        onRetry={handleRetry}
        title="過關！"
        winnerLabel={isDual && winner ? `玩家 ${winner} 獲勝` : undefined}
      >
        <WaterTurbineVictory />
      </VictoryModal>
    </GameLayout>
  );
}
