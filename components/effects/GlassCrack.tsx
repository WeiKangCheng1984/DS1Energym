"use client";

import { useRef, useEffect, useCallback } from "react";
import { getCanvasPoint, randomBetween } from "@/lib/utils";

interface Crack {
  lines: { x1: number; y1: number; x2: number; y2: number }[];
  alpha: number;
  progress: number;
}

const DEFAULT_CRACK_LINES = 12;
const DEFAULT_MAX_CRACKS = 5;
const DEFAULT_LINE_WIDTH = 2.2;

interface GlassCrackProps {
  params?: Record<string, number | string>;
}

export default function GlassCrack({ params }: GlassCrackProps) {
  const crackLines = Number(params?.crackLines ?? DEFAULT_CRACK_LINES);
  const maxCracks = Number(params?.maxCracks ?? DEFAULT_MAX_CRACKS);
  const effectScale = Number(params?.effectScale ?? 1);
  const lineWidth = Number(params?.lineWidth ?? DEFAULT_LINE_WIDTH) * effectScale;
  const stayDuration = Number(params?.stayDuration ?? 1);
  const progressStep = 0.02 / Math.max(0.5, stayDuration);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cracksRef = useRef<Crack[]>([]);
  const rafRef = useRef<number>(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const alive: Crack[] = [];
    for (const c of cracksRef.current) {
      c.progress += progressStep;
      c.alpha = Math.max(0, 1 - c.progress);
      if (c.alpha > 0.02) alive.push(c);
      ctx.strokeStyle = `rgba(148, 163, 184, ${c.alpha * 0.9})`;
      ctx.lineWidth = lineWidth;
      for (const line of c.lines) {
        const t = Math.min(1, c.progress * 1.2);
        const x2 = line.x1 + (line.x2 - line.x1) * t;
        const y2 = line.y1 + (line.y2 - line.y1) * t;
        ctx.beginPath();
        ctx.moveTo(line.x1, line.y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
    }
    cracksRef.current = alive;
  }, [lineWidth, progressStep]);

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

      const lines: Crack["lines"] = [];
      const radius = randomBetween(80, 160) * effectScale;
      for (let i = 0; i < crackLines; i++) {
        const a = (i / crackLines) * Math.PI * 2 + randomBetween(-0.2, 0.2);
        const r = radius * randomBetween(0.5, 1);
        lines.push({
          x1: x,
          y1: y,
          x2: x + Math.cos(a) * r,
          y2: y + Math.sin(a) * r,
        });
      }
      if (cracksRef.current.length >= maxCracks) cracksRef.current.shift();
      cracksRef.current.push({ lines, alpha: 1, progress: 0 });
    },
    [crackLines, maxCracks, effectScale]
  );

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full cursor-pointer bg-slate-200"
      onMouseDown={handlePointer}
      onTouchEnd={handlePointer}
      style={{ touchAction: "none" }}
    />
  );
}
