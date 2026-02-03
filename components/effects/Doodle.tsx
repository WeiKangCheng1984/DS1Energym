"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { getCanvasPoint } from "@/lib/utils";

interface Point {
  x: number;
  y: number;
}

/** 色盤預設：0 暖色、1 冷色、2 彩虹、3 柔和、4 高對比 */
const COLOR_PRESETS: string[][] = [
  ["#f59e0b", "#ef4444", "#ea580c", "#dc2626", "#f97316"],
  ["#06b6d4", "#0ea5e9", "#3b82f6", "#6366f1", "#22d3ee"],
  ["#ef4444", "#f59e0b", "#22c55e", "#06b6d4", "#8b5cf6"],
  ["#fcd34d", "#a78bfa", "#67e8f9", "#86efac", "#f9a8d4"],
  ["#1e293b", "#f43f5e", "#eab308", "#22c55e", "#ffffff"],
];
const DEFAULT_MAX_POINTS = 3000;
const DEFAULT_LINE_WIDTH = 4;

interface DoodleProps {
  params?: Record<string, number | string>;
}

export default function Doodle({ params }: DoodleProps) {
  const stayDuration = Number(params?.stayDuration ?? 1);
  const maxPoints = Math.round(Number(params?.maxPoints ?? DEFAULT_MAX_POINTS) * stayDuration);
  const lineWidth = Number(params?.lineWidth ?? DEFAULT_LINE_WIDTH) * Number(params?.effectScale ?? 1);
  const colorPreset = Number(params?.colorPreset ?? 0);
  const palette = COLOR_PRESETS[Math.min(Math.max(0, colorPreset), COLOR_PRESETS.length - 1)];
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pathsRef = useRef<Point[][]>([]);
  const currentPathRef = useRef<Point[]>([]);
  const [colorIndex, setColorIndex] = useState(0);
  const isDrawingRef = useRef(false);
  const rafRef = useRef<number>(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const color = palette[colorIndex % palette.length];
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = lineWidth;
    for (const path of pathsRef.current) {
      if (path.length < 2) continue;
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.moveTo(path[0].x, path[0].y);
      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x, path[i].y);
      }
      ctx.stroke();
    }
    const current = currentPathRef.current;
    if (current.length >= 2) {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.moveTo(current[0].x, current[0].y);
      for (let i = 1; i < current.length; i++) {
        ctx.lineTo(current[i].x, current[i].y);
      }
      ctx.stroke();
    }
  }, [colorIndex, palette, lineWidth]);

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

  const getPoint = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const clientX = "touches" in e ? e.touches[0]?.clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0]?.clientY : e.clientY;
    if (clientX == null || clientY == null) return null;
    return getCanvasPoint(canvas, clientX, clientY);
  }, []);

  const handlePointerDown = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      const p = getPoint(e);
      if (p) {
        isDrawingRef.current = true;
        currentPathRef.current = [p];
      }
    },
    [getPoint]
  );

  const handlePointerMove = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDrawingRef.current) return;
      const p = getPoint(e);
      if (p) {
        currentPathRef.current.push(p);
        if (currentPathRef.current.length > 80) {
          currentPathRef.current.shift();
        }
      }
    },
    [getPoint]
  );

  const handlePointerUp = useCallback(() => {
    if (isDrawingRef.current && currentPathRef.current.length > 0) {
      pathsRef.current.push([...currentPathRef.current]);
      if (pathsRef.current.reduce((a, p) => a + p.length, 0) > maxPoints) {
        pathsRef.current = pathsRef.current.slice(-5);
      }
      currentPathRef.current = [];
    }
    isDrawingRef.current = false;
  }, [maxPoints]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full cursor-crosshair bg-amber-50"
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
        style={{ touchAction: "none" }}
      />
      <button
        type="button"
        onClick={() => setColorIndex((i) => i + 1)}
        className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 rounded-full bg-amber-200/90 px-4 py-2 text-sm font-medium text-amber-900 shadow"
      >
        換顏色
      </button>
    </>
  );
}
