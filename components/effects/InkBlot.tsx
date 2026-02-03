"use client";

import { useRef, useEffect, useCallback } from "react";
import { getCanvasPoint, randomBetween } from "@/lib/utils";

interface Blot {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  hue: number;
}

const DEFAULT_MAX_BLOTS = 10;
const DEFAULT_GROW_SPEED = 2.5;
const DEFAULT_BLUR = 2;
const DEFAULT_HUE_MIN = 220;
const DEFAULT_HUE_MAX = 240;

interface InkBlotProps {
  params?: Record<string, number | string>;
}

export default function InkBlot({ params }: InkBlotProps) {
  const maxBlots = Number(params?.maxBlots ?? DEFAULT_MAX_BLOTS);
  const growSpeed = Number(params?.growSpeed ?? DEFAULT_GROW_SPEED);
  const blur = Number(params?.blur ?? DEFAULT_BLUR) * Number(params?.effectScale ?? 1);
  const hueMin = Number(params?.hueMin ?? DEFAULT_HUE_MIN);
  const hueMax = Number(params?.hueMax ?? DEFAULT_HUE_MAX);
  const stayDuration = Number(params?.stayDuration ?? 1);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const blotsRef = useRef<Blot[]>([]);
  const rafRef = useRef<number>(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const alive: Blot[] = [];
    for (const b of blotsRef.current) {
      b.radius += growSpeed;
      b.alpha = Math.max(0, 1 - b.radius / b.maxRadius) * 0.7;
      if (b.alpha > 0.02) alive.push(b);
      const gradient = ctx.createRadialGradient(
        b.x, b.y, 0,
        b.x, b.y, b.radius
      );
      gradient.addColorStop(0, `hsla(${b.hue}, 30%, 25%, ${b.alpha})`);
      gradient.addColorStop(0.5, `hsla(${b.hue}, 25%, 20%, ${b.alpha * 0.5})`);
      gradient.addColorStop(1, `hsla(${b.hue}, 20%, 15%, 0)`);
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.filter = `blur(${blur}px)`;
      ctx.fill();
      ctx.filter = "none";
    }
    blotsRef.current = alive;
  }, [growSpeed, blur]);

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
      const dpr = window.devicePixelRatio || 1;
      const maxR = Math.max(canvas.width / dpr, canvas.height / dpr) * 0.5 * stayDuration;
      if (blotsRef.current.length >= maxBlots) blotsRef.current.shift();
      blotsRef.current.push({
        x,
        y,
        radius: 5,
        maxRadius: maxR,
        alpha: 0.8,
        hue: randomBetween(hueMin, hueMax),
      });
    },
    [maxBlots, hueMin, hueMax, stayDuration]
  );

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full cursor-pointer bg-slate-100"
      onMouseDown={handlePointer}
      onTouchEnd={handlePointer}
      style={{ touchAction: "none" }}
    />
  );
}
