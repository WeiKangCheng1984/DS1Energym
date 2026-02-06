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
  const [started, setStarted] = useState(false);
  const [stage, setStage] = useState(0);
  const [fill, setFill] = useState(0);
  const [reservoirLevel, setReservoirLevel] = useState(50);
  const [ripple, setRipple] = useState<{ x: number; y: number } | null>(null);
  const [winner, setWinner] = useState<1 | 2 | null>(null);
  const [displayFill, setDisplayFill] = useState(0);
  const tapCountRef = useRef(0);

  const onTimeUp = useCallback(() => {
    setStarted(false);
  }, []);

  const { secondsLeft, start, reset } = useCountdown(60, onTimeUp, started);

  const addTap = useCallback(
    () => {
      if (!started) return;
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
      const effectiveStage = Math.min(2, Math.floor(tapCountRef.current / TAPS_PER_STAGE));
      const stageTaps = tapCountRef.current - effectiveStage * TAPS_PER_STAGE;
      setFill((stageTaps / TAPS_PER_STAGE) * ((effectiveStage + 1) / 3));
      setReservoirLevel((L) => Math.min(RESERVOIR_LEVEL_MAX, L + 2 + Math.random() * 4));
    },
    [started, stage]
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
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [started, fill]);

  const handleCircleClick = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
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
      setRipple({ x, y });
      playTap();
      addTap();
    },
    [addTap]
  );

  const handleStart = useCallback(() => {
    setStarted(true);
    setStage(0);
    setFill(0);
    setDisplayFill(0);
    setWinner(null);
    tapCountRef.current = 0;
    setReservoirLevel(50);
    start();
  }, [start]);

  const handleRetry = useCallback(() => {
    reset();
    setStage(0);
    setFill(0);
    setDisplayFill(0);
    setWinner(null);
    setReservoirLevel(50);
    setStarted(false);
    setTimeout(handleStart, 100);
  }, [reset, handleStart]);

  const pipeColor = stage === 0 ? "from-sky-300 to-blue-400" : stage === 1 ? "from-blue-400 to-blue-600" : "from-blue-500 to-cyan-400";
  const pipeFlow = stage === 0 ? "animate-[flow_2s_linear_infinite]" : stage === 1 ? "animate-[flow_1s_linear_infinite]" : "animate-[flow_0.5s_linear_infinite]";

  /** 直立長條型水位牆：多排橫向波線（類波浪戰繩），由下而上隨水位點亮 */
  const HYDRO_ROWS = 8;
  const hydroBarPaths = (filledRatio: number, rows = HYDRO_ROWS, viewH = 240, viewW = 60) => {
    const step = viewH / rows;
    const halfW = viewW / 2;
    return Array.from({ length: rows }, (_, i) => {
      const rowIndex = rows - 1 - i;
      const threshold = (rowIndex + 1) / rows;
      const lit = filledRatio >= threshold;
      const y = step * (i + 0.5);
      const curve = 2 * Math.sin((i * 0.7) % 3);
      const d = `M 0 ${y} q ${halfW / 2} ${curve} ${halfW} 0 q ${halfW / 2} ${-curve} ${halfW} 0`;
      return { d, lit };
    });
  };
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
            onClick={handleStart}
            className="rounded-full bg-cyan-500 px-8 py-3 text-lg font-bold text-white shadow-lg hover:bg-cyan-400"
          >
            開始遊戲
          </button>
          <p className="text-center text-xs text-cyan-200/90">按下後開始 60 秒倒數</p>
          <p className="text-center text-sm text-slate-400">
            水柱由下往上累積；達 1/3 與 2/3 會歸零，最後滿水位過關
          </p>
          {mode.scienceNote && (
            <p className="max-w-sm text-center text-xs text-slate-500">
              <span className="font-medium text-cyan-300/90">能源小知識：</span> {mode.scienceNote}
            </p>
          )}
        </div>
      )}

      <div className="relative flex flex-1 flex-col items-center justify-center gap-4 p-4">
        {/* 直立長條型：類波浪戰繩的多排波線，由下而上點亮 */}
        <div className={`rounded-xl border-4 border-slate-600 bg-slate-800/90 shadow-inner ${stage === 2 ? "ring-2 ring-amber-400 ring-offset-2 animate-pulse" : ""}`} style={{ width: 56, height: 280 }}>
          <svg viewBox="0 0 60 240" className="h-full w-full" preserveAspectRatio="none">
            <defs>
              <filter id="hydro-bar-glow">
                <feGaussianBlur stdDeviation="0.6" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            {hydroBarPaths(displayFill).map(({ d, lit }, i) => (
              <path
                key={i}
                d={d}
                fill="none"
                stroke={lit ? "#22d3ee" : "#334155"}
                strokeWidth={lit ? 2.2 : 0.8}
                strokeLinecap="round"
                strokeDasharray={lit ? "4 3" : "3 4"}
                opacity={lit ? 1 : 0.5}
                filter={lit ? "url(#hydro-bar-glow)" : undefined}
                className="transition-all duration-200"
              />
            ))}
          </svg>
        </div>
        <button
          type="button"
          className="relative h-20 w-20 touch-manipulation select-none rounded-full bg-cyan-500 shadow-lg active:scale-95"
          onClick={(e) => handleCircleClick(e)}
          onTouchEnd={(e) => {
            e.preventDefault();
            handleCircleClick(e);
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
      </div>

      <VictoryModal open={winner !== null} onClose={() => setWinner(null)} onRetry={handleRetry} title="過關！">
        <WaterTurbineVictory />
      </VictoryModal>
    </GameLayout>
  );
}
