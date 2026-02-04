"use client";

import { useRef, useEffect, useCallback } from "react";
import { getCanvasPoint, randomBetween } from "@/lib/utils";

interface Star {
  x: number;
  y: number;
  length: number;
  angle: number;
  progress: number;
  maxProgress: number;
  brightness: number;
}

const DEFAULT_STARS_PER_TAP = 3;
const DEFAULT_MAX_STARS = 30;

const DEFAULT_STAR_LENGTH_MIN = 90;
const DEFAULT_STAR_LENGTH_MAX = 200;

interface StarFieldProps {
  params?: Record<string, number | string>;
}

export default function StarField({ params }: StarFieldProps) {
  const starsPerTap = Number(params?.starsPerTap ?? DEFAULT_STARS_PER_TAP);
  const maxStars = Number(params?.maxStars ?? DEFAULT_MAX_STARS);
  const effectScale = Number(params?.effectScale ?? 1);
  const stayDuration = Number(params?.stayDuration ?? 1);
  const starLengthMin = Number(params?.starLengthMin ?? DEFAULT_STAR_LENGTH_MIN) * effectScale;
  const starLengthMax = Number(params?.starLengthMax ?? DEFAULT_STAR_LENGTH_MAX) * effectScale;
  const maxProgress = Math.round(80 * stayDuration);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const rafRef = useRef<number>(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const alive: Star[] = [];
    for (const s of starsRef.current) {
      s.progress += 1.4;
      if (s.progress >= s.maxProgress) continue;
      alive.push(s);
      const t = s.progress / s.maxProgress;
      const x2 = s.x + Math.cos(s.angle) * s.length * t;
      const y2 = s.y + Math.sin(s.angle) * s.length * t;
      const alpha = (1 - t) * s.brightness;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.lineWidth = Math.max(1, 2 * effectScale);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x2, y2, Math.max(1, 2 * effectScale), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.fill();
    }
    starsRef.current = alive;
  }, [effectScale]);

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

      for (let i = 0; i < starsPerTap; i++) {
        if (starsRef.current.length >= maxStars) starsRef.current.shift();
        starsRef.current.push({
          x,
          y,
          length: randomBetween(starLengthMin, starLengthMax),
          angle: randomBetween(0, Math.PI * 2),
          progress: 0,
          maxProgress,
          brightness: randomBetween(0.6, 1),
        });
      }
    },
    [starsPerTap, maxStars, starLengthMin, starLengthMax, maxProgress]
  );

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full cursor-pointer bg-indigo-950"
      onMouseDown={handlePointer}
      onTouchEnd={handlePointer}
      style={{ touchAction: "none" }}
    />
  );
}
