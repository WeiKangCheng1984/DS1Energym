"use client";

import { useState, useCallback, useRef } from "react";
import type { GameMode } from "@/lib/constants";
import GameLayout from "./GameLayout";
import VictoryModal from "./VictoryModal";
import GeothermalSteamVictory from "./victory/GeothermalSteamVictory";
import { useCountdown } from "@/lib/useCountdown";
import { playTap, playSuccess } from "@/lib/useSound";

const PEDALS_PER_LAYER = 25;
const LAYERS = 5;
const DELTA_Y_THRESHOLD = 8;

interface GeothermalTurningGameProps {
  mode: GameMode;
}

export default function GeothermalTurningGame({ mode }: GeothermalTurningGameProps) {
  const [isDual, setIsDual] = useState(false);
  const [started, setStarted] = useState(false);
  const [layer, setLayer] = useState(0);
  const [p2Layer, setP2Layer] = useState(0);
  const [pedalCount, setPedalCount] = useState(0);
  const [p2PedalCount, setP2PedalCount] = useState(0);
  const [winner, setWinner] = useState<1 | 2 | null>(null);
  const lastDirRef = useRef<number>(0);
  const p2LastDirRef = useRef<number>(0);
  const lastClientYRef = useRef(0);
  const p2LastClientYRef = useRef(0);
  const draggingRef = useRef<1 | 2 | null>(null);

  const { secondsLeft, start, reset } = useCountdown(60, () => setStarted(false), started);

  const addPedal = useCallback(
    (player: 1 | 2, direction: number) => {
      if (!started) return;
      if (player === 1) {
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
      } else {
        if (direction !== p2LastDirRef.current) {
          p2LastDirRef.current = direction;
          playTap();
          setP2PedalCount((c) => {
            const next = c + 1;
            const need = (p2Layer + 1) * PEDALS_PER_LAYER;
            if (next >= need) {
              if (p2Layer >= LAYERS - 1) {
                playSuccess();
                setWinner(2);
              } else setP2Layer((l) => l + 1);
            }
            return next;
          });
        }
      }
    },
    [started, layer, p2Layer]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent, player: 1 | 2) => {
      if (!started) return;
      e.preventDefault();
      draggingRef.current = player;
      lastClientYRef.current = e.clientY;
      p2LastClientYRef.current = e.clientY;
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    },
    [started]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const player = draggingRef.current;
      if (!started || player === null) return;
      const prevY = player === 1 ? lastClientYRef.current : p2LastClientYRef.current;
      const deltaY = e.clientY - prevY;
      if (player === 1) lastClientYRef.current = e.clientY;
      else p2LastClientYRef.current = e.clientY;
      if (Math.abs(deltaY) < DELTA_Y_THRESHOLD) return;
      const dir = deltaY < 0 ? 1 : -1;
      addPedal(player, dir);
    },
    [started, addPedal]
  );

  const handlePointerUp = useCallback(() => {
    draggingRef.current = null;
  }, []);

  const handleStart = useCallback(() => {
    setStarted(true);
    setLayer(0);
    setP2Layer(0);
    setPedalCount(0);
    setP2PedalCount(0);
    setWinner(null);
    lastDirRef.current = 0;
    p2LastDirRef.current = 0;
    start();
  }, [start]);

  const handleRetry = useCallback(() => {
    reset();
    setLayer(0);
    setP2Layer(0);
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
          <button type="button" onClick={() => setIsDual((d) => !d)} className="rounded-full border-2 border-orange-400 px-4 py-2 text-sm font-medium text-white">
            {isDual ? "雙人競賽" : "單人"} （點擊切換）
          </button>
          <button type="button" onClick={handleStart} className="rounded-full bg-orange-500 px-8 py-3 text-lg font-bold text-white shadow-lg hover:bg-orange-400">
            開始遊戲
          </button>
          <p className="text-center text-xs text-orange-200/90">按下後開始 60 秒倒數</p>
          <p className="text-center text-sm text-slate-400">壓住圓點並前後晃動完成飛輪</p>
        </div>
      )}

      <div className={`relative flex flex-1 flex-col ${isDual ? "md:flex-row" : ""} items-center justify-center gap-6 p-4`}>
        {!isDual && (
          <>
            <div className="flex flex-col items-center gap-1">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-6 w-24 border border-amber-900/80 transition-all duration-300"
                  style={{
                    width: 80 + i * 24,
                    backgroundColor: layer > i ? "#eab308" : i % 2 === 0 ? "#78350f" : "#422006",
                  }}
                />
              ))}
              <span className="text-xs text-white">金字塔</span>
            </div>
            <div
              className="touch-manipulation select-none rounded-full bg-orange-600 px-12 py-12 text-white shadow-lg"
              onPointerDown={(e) => handlePointerDown(e, 1)}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              onPointerCancel={handlePointerUp}
            >
              <span className="text-sm font-medium">壓住前後晃</span>
            </div>
            {layer >= LAYERS - 1 && pedalCount >= LAYERS * PEDALS_PER_LAYER && (
              <div className="rounded bg-white/20 px-4 py-2 text-sm text-white">蒸汽噴發！</div>
            )}
          </>
        )}

        {isDual && (
          <>
            <div className="flex min-h-0 w-full flex-1 flex-col items-center gap-2 rounded-lg border-2 border-orange-500/30 bg-orange-950/30 p-3 md:w-auto">
              <span className="text-sm font-bold text-orange-200">玩家 1</span>
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="h-3 border border-amber-900/80" style={{ width: 40 + i * 16, backgroundColor: layer > i ? "#eab308" : "#78350f" }} />
              ))}
              <div
                className="min-h-[44px] min-w-[44px] touch-manipulation rounded-full bg-orange-600 px-10 py-10"
                onPointerDown={(e) => handlePointerDown(e, 1)}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
                onPointerCancel={handlePointerUp}
              >
                <span className="text-xs text-white">壓住前後晃</span>
              </div>
            </div>
            <div className="h-px w-full shrink-0 bg-white/30 md:h-full md:w-px" aria-hidden />
            <div className="flex min-h-0 w-full flex-1 flex-col items-center gap-2 rounded-lg border-2 border-orange-500/30 bg-orange-950/30 p-3 md:w-auto">
              <span className="text-sm font-bold text-orange-200">玩家 2</span>
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="h-3 border border-amber-900/80" style={{ width: 40 + i * 16, backgroundColor: p2Layer > i ? "#eab308" : "#78350f" }} />
              ))}
              <div
                className="min-h-[44px] min-w-[44px] touch-manipulation rounded-full bg-orange-600 px-10 py-10"
                onPointerDown={(e) => handlePointerDown(e, 2)}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
                onPointerCancel={handlePointerUp}
              >
                <span className="text-xs text-white">壓住前後晃</span>
              </div>
            </div>
          </>
        )}
      </div>

      <VictoryModal open={winner !== null} onClose={() => setWinner(null)} onRetry={handleRetry} title="過關！" winnerLabel={isDual && winner ? `玩家 ${winner} 獲勝` : undefined}>
        <GeothermalSteamVictory />
      </VictoryModal>
    </GameLayout>
  );
}
