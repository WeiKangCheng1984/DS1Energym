"use client";

import { useState, useCallback, useRef } from "react";
import type { GameMode } from "@/lib/constants";
import GameLayout from "./GameLayout";
import VictoryModal from "./VictoryModal";
import GeothermalSteamVictory from "./victory/GeothermalSteamVictory";
import { useCountdown } from "@/lib/useCountdown";
import { playTap, playSuccess } from "@/lib/useSound";

const PEDALS_PER_LAYER = 20;
const LAYERS = 8;
const DELTA_Y_THRESHOLD = 8;

interface GeothermalTurningGameProps {
  mode: GameMode;
}

export default function GeothermalTurningGame({ mode }: GeothermalTurningGameProps) {
  const [started, setStarted] = useState(false);
  const [layer, setLayer] = useState(0);
  const [pedalCount, setPedalCount] = useState(0);
  const [winner, setWinner] = useState<1 | 2 | null>(null);
  const lastDirRef = useRef<number>(0);
  const lastClientYRef = useRef(0);
  const draggingRef = useRef(false);

  const { secondsLeft, start, reset } = useCountdown(60, () => setStarted(false), started);

  const addPedal = useCallback(
    (direction: number) => {
      if (!started) return;
      if (direction !== lastDirRef.current) {
        lastDirRef.current = direction;
        playTap();
        setPedalCount((c) => {
          const next = c + 1;
          const need = (layer + 1) * PEDALS_PER_LAYER;
          if (next >= need) {
            if (layer >= LAYERS - 1) {
              playSuccess();
              setWinner(1);
            } else setLayer((l) => l + 1);
          }
          return next;
        });
      }
    },
    [started, layer]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!started) return;
      e.preventDefault();
      draggingRef.current = true;
      lastClientYRef.current = e.clientY;
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    },
    [started]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!started || !draggingRef.current) return;
      e.preventDefault();
      const deltaY = e.clientY - lastClientYRef.current;
      lastClientYRef.current = e.clientY;
      if (Math.abs(deltaY) < DELTA_Y_THRESHOLD) return;
      const dir = deltaY < 0 ? 1 : -1;
      addPedal(dir);
    },
    [started, addPedal]
  );

  const handlePointerUp = useCallback(() => {
    draggingRef.current = false;
  }, []);

  const handleStart = useCallback(() => {
    setStarted(true);
    setLayer(0);
    setPedalCount(0);
    setWinner(null);
    lastDirRef.current = 0;
    start();
  }, [start]);

  const handleRetry = useCallback(() => {
    reset();
    setLayer(0);
    setWinner(null);
    setStarted(false);
    setTimeout(handleStart, 100);
  }, [reset, handleStart]);

  return (
    <GameLayout
      modeName={mode.name}
      topRight={started ? <span className="rounded-full bg-amber-500/90 px-3 py-1 text-sm font-bold text-stone-900">{secondsLeft}s</span> : null}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-orange-950/90 to-rose-950" />
      <div className="pointer-events-none absolute inset-0 border-4 border-orange-400/20" style={{ filter: "blur(1px)" }} aria-hidden />

      {!started && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-slate-900/90 p-4">
          <button type="button" onClick={handleStart} className="rounded-full bg-orange-500 px-8 py-3 text-lg font-bold text-white shadow-lg hover:bg-orange-400">
            開始遊戲
          </button>
          <p className="text-center text-xs text-orange-200/90">按下後開始 60 秒倒數</p>
          <p className="text-center text-sm text-slate-400">壓住飛輪並前後晃動完成金字塔</p>
          {mode.scienceNote && (
            <p className="max-w-sm text-center text-xs text-slate-500">
              <span className="font-medium text-orange-300/90">能源小知識：</span> {mode.scienceNote}
            </p>
          )}
        </div>
      )}

      <div className="relative flex flex-1 flex-col items-center justify-center gap-6 p-4">
        {/* 金字塔：由上而下累積，頂綠→底紅，水平分段 */}
        <div className="flex flex-col items-center gap-0.5">
          {Array.from({ length: LAYERS }, (_, i) => {
            const filled = layer > i;
            const fillColors = ["#a3e635", "#84cc16", "#eab308", "#facc15", "#f59e0b", "#ea580c", "#dc2626", "#b91c1c"];
            return (
              <div
                key={i}
                className="h-4 border border-amber-900/60 transition-all duration-300"
                style={{
                  width: 32 + i * 14,
                  backgroundColor: filled ? fillColors[i] : "#422006",
                  boxShadow: filled ? `0 0 6px ${fillColors[i]}40` : undefined,
                }}
              />
            );
          })}
        </div>
        <div
          className="touch-none select-none cursor-grab active:cursor-grabbing"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onPointerCancel={handlePointerUp}
          aria-label="壓住飛輪前後晃動"
        >
          <svg width={120} height={120} viewBox="0 0 120 120" className="drop-shadow-lg" aria-hidden>
            <circle cx="60" cy="60" r="54" fill="#1c1917" stroke="#78716c" strokeWidth="3" />
            <circle cx="60" cy="60" r="38" fill="none" stroke="#a8a29e" strokeWidth="2" />
            {[0, 1, 2, 3, 4, 5].map((k) => {
              const a = (k * 60 * Math.PI) / 180;
              return <line key={k} x1="60" y1="60" x2={60 + 38 * Math.cos(a)} y2={60 + 38 * Math.sin(a)} stroke="#78716c" strokeWidth="1.5" />;
            })}
            <circle cx="60" cy="60" r="18" fill="#dc2626" stroke="#fafaf9" strokeWidth="4" />
          </svg>
        </div>
        {layer >= LAYERS - 1 && pedalCount >= LAYERS * PEDALS_PER_LAYER && (
          <div className="rounded bg-white/20 px-4 py-2 text-sm text-white">蒸汽噴發！</div>
        )}
      </div>

      <VictoryModal open={winner !== null} onClose={() => setWinner(null)} onRetry={handleRetry} title="過關！">
        <GeothermalSteamVictory />
      </VictoryModal>
    </GameLayout>
  );
}
