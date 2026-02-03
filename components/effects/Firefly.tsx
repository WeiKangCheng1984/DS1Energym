"use client";

import { useRef, useEffect, useCallback } from "react";
import { getCanvasPoint, randomBetween } from "@/lib/utils";

interface Firefly {
  x: number;
  y: number;
  vx: number;
  vy: number;
  phase: number;
  size: number;
  brightness: number;
}

const DEFAULT_FIREFLIES_PER_TAP = 5;
const DEFAULT_MAX_FIREFLIES = 35;
const DEFAULT_SIZE_MIN = 3;
const DEFAULT_SIZE_MAX = 7;
const DEFAULT_BLINK_SPEED = 0.08;

interface FireflyProps {
  params?: Record<string, number | string>;
}

export default function Firefly({ params }: FireflyProps) {
  const firefliesPerTap = Number(params?.firefliesPerTap ?? DEFAULT_FIREFLIES_PER_TAP);
  const maxFireflies = Number(params?.maxFireflies ?? DEFAULT_MAX_FIREFLIES);
  const effectScale = Number(params?.effectScale ?? 1);
  const sizeMin = Number(params?.sizeMin ?? DEFAULT_SIZE_MIN) * effectScale;
  const sizeMax = Number(params?.sizeMax ?? DEFAULT_SIZE_MAX) * effectScale;
  const blinkSpeed = Number(params?.blinkSpeed ?? DEFAULT_BLINK_SPEED);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const firefliesRef = useRef<Firefly[]>([]);
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

    for (const f of firefliesRef.current) {
      f.x += f.vx;
      f.y += f.vy;
      f.phase += blinkSpeed;
      if (f.x < 0 || f.x > w) f.vx *= -1;
      if (f.y < 0 || f.y > h) f.vy *= -1;
      const blink = Math.sin(f.phase) * 0.5 + 0.5;
      const alpha = f.brightness * (0.3 + blink * 0.7);
      const gradient = ctx.createRadialGradient(
        f.x, f.y, 0,
        f.x, f.y, f.size * 3
      );
      gradient.addColorStop(0, `rgba(200, 255, 150, ${alpha})`);
      gradient.addColorStop(0.5, `rgba(150, 255, 100, ${alpha * 0.3})`);
      gradient.addColorStop(1, "transparent");
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.size * 3, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 200, ${alpha})`;
      ctx.fill();
    }
  }, [blinkSpeed]);

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

      for (let i = 0; i < firefliesPerTap; i++) {
        if (firefliesRef.current.length >= maxFireflies) firefliesRef.current.shift();
        firefliesRef.current.push({
          x,
          y,
          vx: randomBetween(-0.8, 0.8),
          vy: randomBetween(-0.8, 0.8),
          phase: randomBetween(0, Math.PI * 2),
          size: randomBetween(sizeMin, sizeMax),
          brightness: randomBetween(0.6, 1),
        });
      }
    },
    [firefliesPerTap, maxFireflies, sizeMin, sizeMax]
  );

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full cursor-pointer bg-green-950"
      onMouseDown={handlePointer}
      onTouchEnd={handlePointer}
      style={{ touchAction: "none" }}
    />
  );
}
