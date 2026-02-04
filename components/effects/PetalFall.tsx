"use client";

import { useRef, useEffect, useCallback } from "react";
import { getCanvasPoint, randomBetween } from "@/lib/utils";

interface Petal {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  rotSpeed: number;
  size: number;
  hue: number;
  alpha: number;
}

const DEFAULT_PETALS_PER_TAP = 8;
const DEFAULT_MAX_PETALS = 50;
const DEFAULT_SIZE_MIN = 14;
const DEFAULT_SIZE_MAX = 30;
const DEFAULT_ROT_SPEED = 0.05;

interface PetalFallProps {
  params?: Record<string, number | string>;
}

export default function PetalFall({ params }: PetalFallProps) {
  const petalsPerTap = Number(params?.petalsPerTap ?? DEFAULT_PETALS_PER_TAP);
  const maxPetals = Number(params?.maxPetals ?? DEFAULT_MAX_PETALS);
  const effectScale = Number(params?.effectScale ?? 1);
  const stayDuration = Number(params?.stayDuration ?? 1);
  const sizeMin = Number(params?.sizeMin ?? DEFAULT_SIZE_MIN) * effectScale;
  const sizeMax = Number(params?.sizeMax ?? DEFAULT_SIZE_MAX) * effectScale;
  const rotSpeedParam = Number(params?.rotSpeed ?? 0);
  const rotSpeedRange = Math.abs(rotSpeedParam) || DEFAULT_ROT_SPEED;
  const alphaDecay = 0.004 / Math.max(0.5, stayDuration);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const petalsRef = useRef<Petal[]>([]);
  const rafRef = useRef<number>(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    ctx.clearRect(0, 0, w, h);

    const alive: Petal[] = [];
    for (const p of petalsRef.current) {
      p.x += p.vx + Math.sin(p.y * 0.02) * 0.3;
      p.y += p.vy;
      p.rot += p.rotSpeed;
      p.vy += 0.08;
      p.vx *= 0.99;
      p.alpha -= alphaDecay;
      if (p.y > h + 20 || p.alpha <= 0) continue;
      alive.push(p);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = `hsla(${p.hue}, 70%, 75%, ${p.alpha})`;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size * 1.2, p.size * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    petalsRef.current = alive;
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

      for (let i = 0; i < petalsPerTap; i++) {
        if (petalsRef.current.length >= maxPetals) petalsRef.current.shift();
        petalsRef.current.push({
          x,
          y,
          vx: randomBetween(-2, 2),
          vy: randomBetween(-0.4, 1.4),
          rot: randomBetween(0, Math.PI * 2),
          rotSpeed: randomBetween(-rotSpeedRange, rotSpeedRange),
          size: randomBetween(sizeMin, sizeMax),
          hue: randomBetween(330, 360),
          alpha: 1,
        });
      }
    },
    [petalsPerTap, maxPetals, sizeMin, sizeMax, rotSpeedRange]
  );

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full cursor-pointer bg-rose-50"
      onMouseDown={handlePointer}
      onTouchEnd={handlePointer}
      style={{ touchAction: "none" }}
    />
  );
}
