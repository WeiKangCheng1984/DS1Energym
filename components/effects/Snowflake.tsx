"use client";

import { useRef, useEffect, useCallback } from "react";
import { getCanvasPoint, randomBetween } from "@/lib/utils";

interface Snow {
  x: number;
  y: number;
  vy: number;
  vx: number;
  size: number;
  alpha: number;
}

const DEFAULT_FLAKES_PER_TAP = 12;
const DEFAULT_MAX_FLAKES = 80;
const DEFAULT_SIZE_MIN = 2;
const DEFAULT_SIZE_MAX = 6;
const DEFAULT_FALL_SPEED = 1.2;

interface SnowflakeProps {
  params?: Record<string, number | string>;
}

export default function Snowflake({ params }: SnowflakeProps) {
  const flakesPerTap = Number(params?.flakesPerTap ?? DEFAULT_FLAKES_PER_TAP);
  const maxFlakes = Number(params?.maxFlakes ?? DEFAULT_MAX_FLAKES);
  const effectScale = Number(params?.effectScale ?? 1);
  const stayDuration = Number(params?.stayDuration ?? 1);
  const sizeMin = Number(params?.sizeMin ?? DEFAULT_SIZE_MIN) * effectScale;
  const sizeMax = Number(params?.sizeMax ?? DEFAULT_SIZE_MAX) * effectScale;
  const fallSpeed = Number(params?.fallSpeed ?? DEFAULT_FALL_SPEED);
  const alphaDecay = 0.002 / Math.max(0.5, stayDuration);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const flakesRef = useRef<Snow[]>([]);
  const rafRef = useRef<number>(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const h = rect.height;
    ctx.clearRect(0, 0, rect.width, h);

    const alive: Snow[] = [];
    for (const f of flakesRef.current) {
      f.x += f.vx;
      f.y += f.vy;
      f.alpha -= alphaDecay;
      if (f.y > h + 20 || f.alpha <= 0) continue;
      alive.push(f);
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${f.alpha})`;
      ctx.fill();
    }
    flakesRef.current = alive;
  }, [alphaDecay]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    const loop = () => {
      rafRef.current = requestAnimationFrame(loop);
      draw();
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, [draw]);

  const handlePointer = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const clientX = "touches" in e ? e.changedTouches[0]?.clientX : e.clientX;
      const clientY = "touches" in e ? e.changedTouches[0]?.clientY : e.clientY;
      if (clientX == null || clientY == null) return;
      const { x, y } = getCanvasPoint(canvas, clientX, clientY);

      for (let i = 0; i < flakesPerTap; i++) {
        if (flakesRef.current.length >= maxFlakes) flakesRef.current.shift();
        flakesRef.current.push({
          x: x + randomBetween(-30, 30),
          y,
          vy: randomBetween(fallSpeed * 0.6, fallSpeed * 1.4),
          vx: randomBetween(-0.3, 0.3),
          size: randomBetween(sizeMin, sizeMax),
          alpha: 1,
        });
      }
    },
    [flakesPerTap, maxFlakes, sizeMin, sizeMax, fallSpeed]
  );

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full cursor-pointer bg-sky-100"
      onMouseDown={handlePointer}
      onTouchEnd={handlePointer}
      style={{ touchAction: "none" }}
    />
  );
}
