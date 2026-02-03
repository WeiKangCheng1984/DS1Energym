"use client";

import { useRef, useEffect, useCallback } from "react";
import { getCanvasPoint, randomBetween } from "@/lib/utils";

interface Bubble {
  x: number;
  y: number;
  r: number;
  vy: number;
  alpha: number;
}

const DEFAULT_BUBBLES_PER_TAP = 6;
const DEFAULT_MAX_BUBBLES = 40;
const DEFAULT_SIZE_MIN = 8;
const DEFAULT_SIZE_MAX = 22;
const DEFAULT_RISE_SPEED = 2;

interface BubbleRiseProps {
  params?: Record<string, number | string>;
}

export default function BubbleRise({ params }: BubbleRiseProps) {
  const bubblesPerTap = Number(params?.bubblesPerTap ?? DEFAULT_BUBBLES_PER_TAP);
  const maxBubbles = Number(params?.maxBubbles ?? DEFAULT_MAX_BUBBLES);
  const effectScale = Number(params?.effectScale ?? 1);
  const stayDuration = Number(params?.stayDuration ?? 1);
  const sizeMin = Number(params?.sizeMin ?? DEFAULT_SIZE_MIN) * effectScale;
  const sizeMax = Number(params?.sizeMax ?? DEFAULT_SIZE_MAX) * effectScale;
  const riseSpeed = Number(params?.riseSpeed ?? DEFAULT_RISE_SPEED);
  const alphaDecay = 0.008 / Math.max(0.5, stayDuration);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bubblesRef = useRef<Bubble[]>([]);
  const rafRef = useRef<number>(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const alive: Bubble[] = [];
    for (const b of bubblesRef.current) {
      b.y += b.vy;
      b.alpha -= alphaDecay;
      if (b.y < -b.r * 2 || b.alpha <= 0) continue;
      alive.push(b);
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 255, 255, ${b.alpha * 0.8})`;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = `rgba(255, 255, 255, ${b.alpha * 0.2})`;
      ctx.fill();
    }
    bubblesRef.current = alive;
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

      for (let i = 0; i < bubblesPerTap; i++) {
        if (bubblesRef.current.length >= maxBubbles) bubblesRef.current.shift();
        bubblesRef.current.push({
          x: x + randomBetween(-20, 20),
          y,
          r: randomBetween(sizeMin, sizeMax),
          vy: randomBetween(-riseSpeed * 1.25, -riseSpeed * 0.5),
          alpha: 1,
        });
      }
    },
    [bubblesPerTap, maxBubbles, sizeMin, sizeMax, riseSpeed]
  );

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full cursor-pointer bg-cyan-900"
      onMouseDown={handlePointer}
      onTouchEnd={handlePointer}
      style={{ touchAction: "none" }}
    />
  );
}
