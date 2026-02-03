"use client";

import { useRef, useEffect, useCallback } from "react";
import { getCanvasPoint } from "@/lib/utils";

interface Wave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
}

const DEFAULT_WAVE_SPEED = 5;
const DEFAULT_MAX_WAVES = 10;
const DEFAULT_LINE_WIDTH = 3;

interface SoundWaveProps {
  params?: Record<string, number | string>;
}

export default function SoundWave({ params }: SoundWaveProps) {
  const waveSpeed = Number(params?.waveSpeed ?? DEFAULT_WAVE_SPEED);
  const maxWaves = Number(params?.maxWaves ?? DEFAULT_MAX_WAVES);
  const lineWidth = Number(params?.lineWidth ?? DEFAULT_LINE_WIDTH) * Number(params?.effectScale ?? 1);
  const stayDuration = Number(params?.stayDuration ?? 1);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wavesRef = useRef<Wave[]>([]);
  const rafRef = useRef<number>(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const alive: Wave[] = [];
    for (const ww of wavesRef.current) {
      ww.radius += waveSpeed;
      ww.alpha = Math.max(0, 1 - ww.radius / ww.maxRadius) * 0.9;
      if (ww.alpha > 0.02) alive.push(ww);
      ctx.beginPath();
      ctx.arc(ww.x, ww.y, ww.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(34, 211, 238, ${ww.alpha})`;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    }
    wavesRef.current = alive;
  }, [waveSpeed, lineWidth]);

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
      const maxR = Math.max(canvas.width / dpr, canvas.height / dpr) * 0.7 * stayDuration;
      if (wavesRef.current.length >= maxWaves) wavesRef.current.shift();
      wavesRef.current.push({
        x,
        y,
        radius: 0,
        maxRadius: maxR,
        alpha: 1,
      });
    },
    [maxWaves, stayDuration]
  );

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full cursor-pointer bg-slate-800"
      onMouseDown={handlePointer}
      onTouchEnd={handlePointer}
      style={{ touchAction: "none" }}
    />
  );
}
