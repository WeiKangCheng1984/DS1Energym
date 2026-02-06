"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { GameMode } from "@/lib/constants";
import GameLayout from "./GameLayout";
import VictoryModal from "./VictoryModal";
import WaveRingsVictory from "./victory/WaveRingsVictory";
import { useCountdown } from "@/lib/useCountdown";
import { playSuccess } from "@/lib/useSound";

const TARGET_FREQ = 2.5;
const ENERGY_TARGET = 5;
const ENERGY_PER_SYNC = 0.02;
const ENERGY_DECAY = 0.002;
const SWAY_SENSITIVITY = 0.015;

interface WaveBattlingGameProps {
  mode: GameMode;
}

export default function WaveBattlingGame({ mode }: WaveBattlingGameProps) {
  const [started, setStarted] = useState(false);
  const [energy, setEnergy] = useState(0);
  const [winner, setWinner] = useState<1 | 2 | null>(null);
  const [sway, setSway] = useState(0);
  const lastSwayTimeRef = useRef(0);
  const lastDeltaXRef = useRef(0);
  const lastClientXRef = useRef(0);
  const draggingRef = useRef(false);

  const { secondsLeft, start, reset } = useCountdown(60, () => setStarted(false), started);

  useEffect(() => {
    if (!started) return;
    const id = setInterval(() => setEnergy((e) => Math.max(0, e - ENERGY_DECAY)), 50);
    return () => clearInterval(id);
  }, [started]);

  const applySway = useCallback(
    (deltaX: number) => {
      if (!started) return;
      const now = Date.now();
      setSway((s) => Math.max(-1, Math.min(1, s + deltaX * SWAY_SENSITIVITY)));
      const dt = (now - lastSwayTimeRef.current) / 1000;
      const dir = Math.sign(deltaX);
      if (dir !== 0 && dir !== Math.sign(lastDeltaXRef.current) && lastDeltaXRef.current !== 0 && dt > 0 && dt < 0.5) {
        lastSwayTimeRef.current = now;
        const freq = 1 / dt;
        const sync = Math.abs(freq - TARGET_FREQ) < 1 ? 1.5 : 1;
        setEnergy((e) => {
          const next = Math.min(ENERGY_TARGET, e + ENERGY_PER_SYNC * sync);
          if (next >= ENERGY_TARGET) {
            playSuccess();
            setWinner(1);
          }
          return next;
        });
      } else if (Math.abs(deltaX) > 2) {
        setEnergy((e) => {
          const next = Math.min(ENERGY_TARGET, e + ENERGY_PER_SYNC * 0.5);
          if (next >= ENERGY_TARGET) {
            playSuccess();
            setWinner(1);
          }
          return next;
        });
      }
      lastDeltaXRef.current = deltaX;
    },
    [started]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!started) return;
      e.preventDefault();
      draggingRef.current = true;
      lastDeltaXRef.current = 0;
      lastClientXRef.current = e.clientX;
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    },
    [started]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!started || !draggingRef.current) return;
      e.preventDefault();
      const deltaX = typeof e.movementX === "number" ? e.movementX : e.clientX - lastClientXRef.current;
      lastClientXRef.current = e.clientX;
      applySway(deltaX);
    },
    [started, applySway]
  );

  const handlePointerUp = useCallback(() => {
    draggingRef.current = false;
    setSway((s) => s * 0.6);
  }, []);

  const handleStart = useCallback(() => {
    setStarted(true);
    setEnergy(0);
    setSway(0);
    setWinner(null);
    lastSwayTimeRef.current = Date.now();
    lastDeltaXRef.current = 0;
    start();
  }, [start]);

  const handleRetry = useCallback(() => {
    reset();
    setEnergy(0);
    setWinner(null);
    setStarted(false);
    setTimeout(handleStart, 100);
  }, [reset, handleStart]);

  const ropePoints = (s: number) => {
    const pts: string[] = [];
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      const x = 50 + t * 100 + Math.sin(t * Math.PI * 2) * s * 25;
      const y = 20 + t * 60;
      pts.push(`${x},${y}`);
    }
    return pts.join(" ");
  };

  /** 能量牆：多排橫向藍色霓虹波線，由下而上隨能量點亮（參考展場意象） */
  const WAVE_ROWS = 8;
  const waveWallPaths = (filledRatio: number, rows = WAVE_ROWS) =>
    Array.from({ length: rows }, (_, i) => {
      const rowIndex = rows - 1 - i;
      const threshold = (rowIndex + 1) / rows;
      const lit = filledRatio >= threshold;
      const y = 10 + (i * 90) / (rows - 1 || 1);
      const curve = 3 * Math.sin((i * 0.7) % 3);
      const d = `M 0 ${y} q 50 ${-curve} 100 0 q 50 ${curve} 100 0 q 50 ${-curve} 100 0 q 50 ${curve} 100 0`;
      return { d, lit };
    });

  return (
    <GameLayout
      modeName={mode.name}
      topRight={started ? <span className="rounded-full bg-amber-500/90 px-3 py-1 text-sm font-bold text-stone-900">{secondsLeft}s</span> : null}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-sky-900 to-indigo-950" />
      {!started && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-slate-900/90 p-4">
          <button type="button" onClick={handleStart} className="rounded-full bg-sky-500 px-8 py-3 text-lg font-bold text-white shadow-lg hover:bg-sky-400">
            開始遊戲
          </button>
          <p className="text-center text-xs text-sky-200/90">按下後開始 60 秒倒數</p>
          <p className="text-center text-sm text-slate-400">壓住圓點並左右晃動產生波痕</p>
          {mode.scienceNote && (
            <p className="max-w-sm text-center text-xs text-slate-500">
              <span className="font-medium text-sky-300/90">能源小知識：</span> {mode.scienceNote}
            </p>
          )}
        </div>
      )}

      <div className="relative flex flex-1 flex-col items-center gap-4 p-4">
        {started && (
          <div className="absolute left-4 right-4 top-20 flex justify-center">
            <span className="rounded bg-slate-700/90 px-2 py-1 text-xs text-white">目標頻率 ~{TARGET_FREQ} Hz</span>
          </div>
        )}

        {/* 能量牆：多排橫向霓虹波線，由下而上隨能量點亮 */}
        <div className="mt-6 w-full max-w-md rounded-lg border border-sky-500/20 bg-slate-900/80 p-2">
          <svg viewBox="0 0 200 100" className="h-24 w-full" preserveAspectRatio="none">
            <defs>
              <filter id="wave-glow">
                <feGaussianBlur stdDeviation="0.8" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {waveWallPaths(energy / ENERGY_TARGET).map(({ d, lit }, i) => (
              <path
                key={i}
                d={d}
                fill="none"
                stroke={lit ? "#38bdf8" : "#334155"}
                strokeWidth={lit ? 2.5 : 1}
                strokeLinecap="round"
                strokeDasharray={lit ? "6 4" : "4 6"}
                opacity={lit ? 1 : 0.5}
                filter={lit ? "url(#wave-glow)" : undefined}
                className="transition-all duration-200"
              />
            ))}
          </svg>
        </div>
        <svg viewBox="0 0 200 100" className="h-32 w-full max-w-md" preserveAspectRatio="none">
          <polyline points={ropePoints(sway)} fill="none" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <div
          className="touch-none select-none rounded-full bg-sky-500 px-12 py-12 text-white shadow-lg"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <span className="text-sm font-medium">壓住左右晃</span>
        </div>
      </div>

      <VictoryModal open={winner !== null} onClose={() => setWinner(null)} onRetry={handleRetry} title="過關！">
        <WaveRingsVictory />
      </VictoryModal>
    </GameLayout>
  );
}
