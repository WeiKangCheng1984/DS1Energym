"use client";

import { useRef, useEffect, useCallback } from "react";
import { getCanvasPoint } from "@/lib/utils";

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
}

const DEFAULT_MAX_RIPPLES = 12;
const DEFAULT_RIPPLE_SPEED = 3;

const DEFAULT_LINE_WIDTH = 2;
const DEFAULT_ALPHA_DECAY = 1;

interface RippleEffectProps {
  params?: Record<string, number | string>;
}

export default function RippleEffect({ params }: RippleEffectProps) {
  const maxRipples = Number(params?.maxRipples ?? DEFAULT_MAX_RIPPLES);
  const rippleSpeed = Number(params?.rippleSpeed ?? DEFAULT_RIPPLE_SPEED);
  const lineWidth = Number(params?.lineWidth ?? DEFAULT_LINE_WIDTH) * Number(params?.effectScale ?? 1);
  const alphaDecay = Number(params?.alphaDecay ?? DEFAULT_ALPHA_DECAY);
  const stayDuration = Number(params?.stayDuration ?? 1);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ripplesRef = useRef<Ripple[]>([]);
  const rafRef = useRef<number>(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const stillAlive: Ripple[] = [];
    for (const r of ripplesRef.current) {
      r.radius += rippleSpeed;
      r.alpha = Math.max(0, 1 - r.radius / r.maxRadius);
      if (r.alpha > 0.01) stillAlive.push(r);
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(34, 211, 238, ${Math.min(1, r.alpha * 0.8 * alphaDecay)})`;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    }
    ripplesRef.current = stillAlive;
  }, [rippleSpeed, lineWidth, alphaDecay]);

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

    let last = 0;
    const loop = (t: number) => {
      rafRef.current = requestAnimationFrame(loop);
      if (t - last >= 16) {
        last = t;
        draw();
      }
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
      const sx = canvas.width / dpr;
      const sy = canvas.height / dpr;
      const maxR = Math.max(sx, sy) * 0.8 * stayDuration;
      if (ripplesRef.current.length >= maxRipples) ripplesRef.current.shift();
      ripplesRef.current.push({
        x,
        y,
        radius: 0,
        maxRadius: maxR,
        alpha: 1,
      });
    },
    [maxRipples, stayDuration]
  );

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full cursor-pointer"
      onMouseDown={handlePointer}
      onTouchEnd={handlePointer}
      style={{ touchAction: "none" }}
    />
  );
}
