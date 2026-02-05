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
  const [isDual, setIsDual] = useState(false);
  const [started, setStarted] = useState(false);
  const [energy, setEnergy] = useState(0);
  const [p2Energy, setP2Energy] = useState(0);
  const [winner, setWinner] = useState<1 | 2 | null>(null);
  const [sway, setSway] = useState(0);
  const [p2Sway, setP2Sway] = useState(0);
  const lastSwayTimeRef = useRef(0);
  const p2LastSwayTimeRef = useRef(0);
  const lastDeltaXRef = useRef(0);
  const p2LastDeltaXRef = useRef(0);
  const lastClientXRef = useRef(0);
  const p2LastClientXRef = useRef(0);
  const draggingRef = useRef<1 | 2 | null>(null);

  const { secondsLeft, start, reset } = useCountdown(60, () => setStarted(false), started);

  useEffect(() => {
    if (!started) return;
    const id = setInterval(() => {
      setEnergy((e) => Math.max(0, e - ENERGY_DECAY));
      if (isDual) setP2Energy((e) => Math.max(0, e - ENERGY_DECAY));
    }, 50);
    return () => clearInterval(id);
  }, [started, isDual]);

  const applySway = useCallback(
    (player: 1 | 2, deltaX: number) => {
      if (!started) return;
      const now = Date.now();
      if (player === 1) {
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
      } else {
        setP2Sway((s) => Math.max(-1, Math.min(1, s + deltaX * SWAY_SENSITIVITY)));
        const dt = (now - p2LastSwayTimeRef.current) / 1000;
        const dir = Math.sign(deltaX);
        if (dir !== 0 && dir !== Math.sign(p2LastDeltaXRef.current) && p2LastDeltaXRef.current !== 0 && dt > 0 && dt < 0.5) {
          p2LastSwayTimeRef.current = now;
          const freq = 1 / dt;
          const sync = Math.abs(freq - TARGET_FREQ) < 1 ? 1.5 : 1;
          setP2Energy((e) => {
            const next = Math.min(ENERGY_TARGET, e + ENERGY_PER_SYNC * sync);
            if (next >= ENERGY_TARGET) {
              playSuccess();
              setWinner(2);
            }
            return next;
          });
        } else if (Math.abs(deltaX) > 2) {
          setP2Energy((e) => {
            const next = Math.min(ENERGY_TARGET, e + ENERGY_PER_SYNC * 0.5);
            if (next >= ENERGY_TARGET) {
              playSuccess();
              setWinner(2);
            }
            return next;
          });
        }
        p2LastDeltaXRef.current = deltaX;
      }
    },
    [started]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent, player: 1 | 2) => {
      if (!started) return;
      e.preventDefault();
      draggingRef.current = player;
      lastDeltaXRef.current = 0;
      lastClientXRef.current = e.clientX;
      p2LastClientXRef.current = e.clientX;
      if (player === 2) p2LastDeltaXRef.current = 0;
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    },
    [started]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const player = draggingRef.current;
      if (!started || player === null) return;
      e.preventDefault();
      const deltaX = typeof e.movementX === "number" ? e.movementX : e.clientX - (player === 1 ? lastClientXRef.current : p2LastClientXRef.current);
      if (player === 1) lastClientXRef.current = e.clientX;
      else p2LastClientXRef.current = e.clientX;
      applySway(player, deltaX);
    },
    [started, applySway]
  );

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    draggingRef.current = null;
    setSway((s) => s * 0.6);
    setP2Sway((s) => s * 0.6);
  }, []);

  const handleStart = useCallback(() => {
    setStarted(true);
    setEnergy(0);
    setP2Energy(0);
    setSway(0);
    setP2Sway(0);
    setWinner(null);
    lastSwayTimeRef.current = Date.now();
    p2LastSwayTimeRef.current = Date.now();
    lastDeltaXRef.current = 0;
    p2LastDeltaXRef.current = 0;
    start();
  }, [start]);

  const handleRetry = useCallback(() => {
    reset();
    setEnergy(0);
    setP2Energy(0);
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

  return (
    <GameLayout
      modeName={mode.name}
      topRight={started ? <span className="rounded-full bg-amber-500/90 px-3 py-1 text-sm font-bold text-stone-900">{secondsLeft}s</span> : null}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-sky-900 to-indigo-950" />
      {!started && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-slate-900/90 p-4">
          <button type="button" onClick={() => setIsDual((d) => !d)} className="rounded-full border-2 border-sky-400 px-4 py-2 text-sm font-medium text-white">
            {isDual ? "雙人競賽" : "單人"} （點擊切換）
          </button>
          <button type="button" onClick={handleStart} className="rounded-full bg-sky-500 px-8 py-3 text-lg font-bold text-white shadow-lg hover:bg-sky-400">
            開始遊戲
          </button>
          <p className="text-center text-xs text-sky-200/90">按下後開始 60 秒倒數</p>
          <p className="text-center text-sm text-slate-400">壓住圓點並左右晃動產生波痕</p>
        </div>
      )}

      <div className={`relative flex flex-1 flex-col items-center gap-4 p-4 ${isDual ? "md:flex-row" : ""}`}>
        {started && (
          <div className="absolute left-4 right-4 top-20 flex justify-center">
            <span className="rounded bg-slate-700/90 px-2 py-1 text-xs text-white">目標頻率 ~{TARGET_FREQ} Hz</span>
          </div>
        )}

        {!isDual && (
          <>
            <div className="mt-8 w-full max-w-md">
              <div className="h-3 w-full overflow-hidden rounded-full bg-slate-700">
                <div className="h-full rounded-full bg-blue-500 transition-all duration-150" style={{ width: `${Math.min(100, (energy / ENERGY_TARGET) * 100)}%` }} />
              </div>
              <p className="mt-1 text-center text-xs text-white">能量條</p>
            </div>
            <svg viewBox="0 0 200 100" className="h-32 w-full max-w-md" preserveAspectRatio="none">
              <polyline points={ropePoints(sway)} fill="none" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
            </svg>
            <div
              className="touch-none select-none rounded-full bg-sky-500 px-12 py-12 text-white shadow-lg"
              onPointerDown={(e) => handlePointerDown(e, 1)}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              onPointerCancel={handlePointerUp}
            >
              <span className="text-sm font-medium">壓住左右晃</span>
            </div>
          </>
        )}

        {isDual && (
          <>
            <div className="flex min-h-0 w-full flex-1 flex-col items-center gap-2 rounded-lg border-2 border-sky-500/30 bg-sky-950/30 p-3 md:w-auto">
              <span className="text-sm font-bold text-sky-200">玩家 1</span>
              <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-700">
                <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${Math.min(100, (energy / ENERGY_TARGET) * 100)}%` }} />
              </div>
              <svg viewBox="0 0 200 80" className="h-24 w-40">
                <polyline points={ropePoints(sway)} fill="none" stroke="#38bdf8" strokeWidth="2" />
              </svg>
              <div
                className="min-h-[44px] min-w-[44px] touch-none rounded-full bg-sky-500 px-10 py-10"
                onPointerDown={(e) => handlePointerDown(e, 1)}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
                onPointerCancel={handlePointerUp}
              >
                <span className="text-xs text-white">壓住晃</span>
              </div>
            </div>
            <div className="h-px w-full shrink-0 bg-white/30 md:h-full md:w-px" aria-hidden />
            <div className="flex min-h-0 w-full flex-1 flex-col items-center gap-2 rounded-lg border-2 border-sky-500/30 bg-sky-950/30 p-3 md:w-auto">
              <span className="text-sm font-bold text-sky-200">玩家 2</span>
              <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-700">
                <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${Math.min(100, (p2Energy / ENERGY_TARGET) * 100)}%` }} />
              </div>
              <svg viewBox="0 0 200 80" className="h-24 w-40">
                <polyline points={ropePoints(p2Sway)} fill="none" stroke="#38bdf8" strokeWidth="2" />
              </svg>
              <div
                className="min-h-[44px] min-w-[44px] touch-none rounded-full bg-sky-500 px-10 py-10"
                onPointerDown={(e) => handlePointerDown(e, 2)}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
                onPointerCancel={handlePointerUp}
              >
                <span className="text-xs text-white">壓住晃</span>
              </div>
            </div>
          </>
        )}
      </div>

      <VictoryModal open={winner !== null} onClose={() => setWinner(null)} onRetry={handleRetry} title="過關！" winnerLabel={isDual && winner ? `玩家 ${winner} 獲勝` : undefined}>
        <WaveRingsVictory />
      </VictoryModal>
    </GameLayout>
  );
}
