"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { GameMode } from "@/lib/constants";
import GameLayout from "./GameLayout";
import VictoryModal from "./VictoryModal";
import SolarPanelVictory from "./victory/SolarPanelVictory";
import { useCountdown } from "@/lib/useCountdown";
import { playTap, playSuccess } from "@/lib/useSound";

const GOALS_TO_WIN = 12;
const HOLE_CENTER_X = 0.5;
const HOLE_CENTER_Y = 0.35;
const HOLE_R = 0.08;
const CLOUD_INTERVAL_MS = 8000;
const GRAVITY = 0.00035;
const PULL_SPEED_SCALE = 0.032;
const MAX_VELOCITY = 0.028;
const WOBBLE = 0.0006;

interface Ball {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  player: 1 | 2;
}

interface SolarShootingGameProps {
  mode: GameMode;
}

export default function SolarShootingGame({ mode }: SolarShootingGameProps) {
  const [started, setStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [balls, setBalls] = useState<Ball[]>([]);
  const [cloud, setCloud] = useState(false);
  const [winner, setWinner] = useState<1 | 2 | null>(null);
  const [drag, setDrag] = useState<{ startX: number; startY: number; currentX: number; currentY: number } | null>(null);
  const ballIdRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const { secondsLeft, start, reset } = useCountdown(60, () => setStarted(false), started);

  useEffect(() => {
    if (!started) return;
    const t = setInterval(() => setCloud((c) => !c), CLOUD_INTERVAL_MS);
    return () => clearInterval(t);
  }, [started]);

  const launchPos = { x: 0.5, y: 0.82 };

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!started || !containerRef.current) return;
      e.preventDefault();
      const rect = containerRef.current.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const x = (e.clientX - rect.left) / w;
      const y = (e.clientY - rect.top) / h;
      setDrag({ startX: launchPos.x, startY: launchPos.y, currentX: x, currentY: y });
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    },
    [started]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!drag || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const x = (e.clientX - rect.left) / w;
      const y = (e.clientY - rect.top) / h;
      setDrag((d) => (d ? { ...d, currentX: x, currentY: y } : null));
    },
    [drag]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!drag || !started) return;
      e.preventDefault();
      const { startX, startY, currentX, currentY } = drag;
      const dx = startX - currentX;
      const dy = startY - currentY;
      const len = Math.hypot(dx, dy) || 0.001;
      const scale = Math.min(1, len * 8) * PULL_SPEED_SCALE;
      let vx = (dx / len) * scale;
      let vy = (dy / len) * scale;
      const vlen = Math.hypot(vx, vy);
      if (vlen > MAX_VELOCITY) {
        vx = (vx / vlen) * MAX_VELOCITY;
        vy = (vy / vlen) * MAX_VELOCITY;
      }
      const jitter = 1 + (Math.random() - 0.5) * 0.08;
      vx *= jitter;
      vy *= jitter;
      const id = ++ballIdRef.current;
      playTap();
      setBalls((b) => [...b, { id, x: startX, y: startY, vx, vy, player: 1 }]);
      setDrag(null);
    },
    [drag, started]
  );

  useEffect(() => {
    if (!started) return;
    let raf = 0;
    const tick = () => {
      setBalls((prev) => {
        if (prev.length === 0) return prev;
        const next = prev
          .map((ball) => {
            const driftX = (Math.random() - 0.5) * WOBBLE;
            const driftY = (Math.random() - 0.5) * WOBBLE * 0.5;
            return {
              ...ball,
              x: ball.x + ball.vx,
              y: ball.y + ball.vy,
              vx: ball.vx + driftX,
              vy: ball.vy + GRAVITY + driftY,
            };
          })
          .filter((ball) => {
            const dx = ball.x - HOLE_CENTER_X;
            const dy = ball.y - HOLE_CENTER_Y;
            if (dx * dx + dy * dy < HOLE_R * HOLE_R) {
              setScore((s) => {
                const next = s + 1;
                if (next >= GOALS_TO_WIN) {
                  setWinner(1);
                  playSuccess();
                }
                return next;
              });
              return false;
            }
            if (ball.y > 1.15 || ball.x < -0.15 || ball.x > 1.15) return false;
            return true;
          });
        return next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [started]);

  const handleStart = useCallback(() => {
    setStarted(true);
    setScore(0);
    setBalls([]);
    setDrag(null);
    setWinner(null);
    setCloud(false);
    start();
  }, [start]);

  const handleRetry = useCallback(() => {
    reset();
    setScore(0);
    setBalls([]);
    setWinner(null);
    setStarted(false);
    setTimeout(handleStart, 100);
  }, [reset, handleStart]);

  return (
    <GameLayout
      modeName={mode.name}
      topRight={
        started ? (
          <span className="rounded-full bg-amber-500/90 px-3 py-1 text-sm font-bold text-stone-900">
            {secondsLeft}s {score}/{GOALS_TO_WIN}
          </span>
        ) : null
      }
    >
      <div className="absolute inset-0 bg-gradient-to-b from-amber-100 to-orange-900" />
      {!started && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-slate-900/90 p-4">
          <button type="button" onClick={handleStart} className="rounded-full bg-amber-500 px-8 py-3 text-lg font-bold text-white shadow-lg hover:bg-amber-400">
            開始遊戲
          </button>
          <p className="text-center text-xs text-amber-200/90">按下後開始 60 秒倒數</p>
          <p className="text-center text-sm text-slate-400">向後拉動光子球再放開發射，受重力影響可能沒進</p>
          {mode.scienceNote && (
            <p className="max-w-sm text-center text-xs text-slate-500">
              <span className="font-medium text-amber-300/90">能源小知識：</span> {mode.scienceNote}
            </p>
          )}
        </div>
      )}

      <div ref={containerRef} className="relative flex flex-1 touch-none flex-col items-center justify-end pb-8 pt-16">
        <div className="absolute left-1/2 top-[18%] flex h-32 w-56 -translate-x-1/2 flex-wrap items-center justify-center gap-1 rounded-lg bg-slate-800 p-2 shadow-xl sm:h-36 sm:w-64">
          <div className="absolute h-10 w-10 rounded-full bg-slate-900 ring-4 ring-amber-400/60" style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />
          <div className="absolute h-6 w-6 rounded-full bg-amber-200/90" style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />
        </div>

        {cloud && (
          <div className="pointer-events-none absolute inset-0 z-10 bg-white/40 transition-opacity duration-1000" aria-hidden />
        )}

        {balls.map((ball) => (
          <div
            key={ball.id}
            className="absolute h-6 w-6 rounded-full bg-amber-300 shadow-lg"
            style={{
              left: `${ball.x * 100}%`,
              top: `${ball.y * 100}%`,
              transform: "translate(-50%, -50%)",
              boxShadow: "0 0 12px rgba(253,230,138,0.8)",
            }}
          />
        ))}

        {/* 拖曳時顯示拉弓球與彈弓線（在容器內以 normalized 座標定位） */}
        {drag && (
          <>
            <div
              className="pointer-events-none absolute h-8 w-8 rounded-full bg-amber-300 shadow-lg"
              style={{
                left: `${drag.currentX * 100}%`,
                top: `${drag.currentY * 100}%`,
                transform: "translate(-50%, -50%)",
                boxShadow: "0 0 10px rgba(253,230,138,0.9)",
              }}
            />
            <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <line
                x1={drag.startX * 100}
                y1={drag.startY * 100}
                x2={drag.currentX * 100}
                y2={drag.currentY * 100}
                stroke="rgba(253,230,138,0.6)"
                strokeWidth="1"
              />
            </svg>
          </>
        )}

        <div className="flex w-full flex-1 flex-col items-center justify-center gap-4 pb-6">
          <div
            className="flex min-h-[120px] w-full max-w-[180px] flex-col items-center justify-end rounded-xl border-2 border-dashed border-amber-400/50 bg-amber-950/20 md:h-36 md:w-28"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            <span className="mb-2 text-xs font-medium text-amber-200/90">向後拉再放開發射</span>
          </div>
        </div>
      </div>

      <VictoryModal open={winner !== null} onClose={() => setWinner(null)} onRetry={handleRetry} title="過關！">
        <SolarPanelVictory />
      </VictoryModal>
    </GameLayout>
  );
}
