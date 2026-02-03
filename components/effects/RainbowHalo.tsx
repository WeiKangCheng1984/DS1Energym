"use client";

import { useRef, useEffect, useCallback } from "react";
import { getCanvasPoint } from "@/lib/utils";

interface Halo {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  rotation: number;
}

const DEFAULT_HALO_SPEED = 4;
const DEFAULT_MAX_HALOS = 8;
const DEFAULT_LINE_WIDTH = 4;
const DEFAULT_RING_STEP = 15;

interface RainbowHaloProps {
  params?: Record<string, number | string>;
}

export default function RainbowHalo({ params }: RainbowHaloProps) {
  const haloSpeed = Number(params?.haloSpeed ?? DEFAULT_HALO_SPEED);
  const maxHalos = Number(params?.maxHalos ?? DEFAULT_MAX_HALOS);
  const lineWidth = Number(params?.lineWidth ?? DEFAULT_LINE_WIDTH) * Number(params?.effectScale ?? 1);
  const ringStep = Number(params?.ringStep ?? DEFAULT_RING_STEP);
  const stayDuration = Number(params?.stayDuration ?? 1);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const halosRef = useRef<Halo[]>([]);
  const rafRef = useRef<number>(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const alive: Halo[] = [];
    for (const hh of halosRef.current) {
      hh.radius += haloSpeed;
      hh.rotation += 0.02;
      if (hh.radius < hh.maxRadius) alive.push(hh);
      const alpha = Math.max(0, 1 - hh.radius / hh.maxRadius) * 0.9;
      for (let r = 0; r < hh.radius; r += ringStep) {
        const hue = ((r / ringStep) * 25 + hh.rotation * 180) % 360;
        ctx.beginPath();
        ctx.arc(hh.x, hh.y, r, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(${hue}, 80%, 60%, ${alpha})`;
        ctx.lineWidth = lineWidth;
        ctx.stroke();
      }
    }
    halosRef.current = alive;
  }, [haloSpeed, lineWidth, ringStep]);

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
      const maxR = Math.max(canvas.width / dpr, canvas.height / dpr) * 0.6 * stayDuration;
      if (halosRef.current.length >= maxHalos) halosRef.current.shift();
      halosRef.current.push({
        x,
        y,
        radius: 0,
        maxRadius: maxR,
        rotation: Math.random() * Math.PI * 2,
      });
    },
    [maxHalos, stayDuration]
  );

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full cursor-pointer bg-slate-900"
      onMouseDown={handlePointer}
      onTouchEnd={handlePointer}
      style={{ touchAction: "none" }}
    />
  );
}
