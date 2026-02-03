"use client";

import { useRef, useEffect, useCallback } from "react";
import { getCanvasPoint, randomBetween } from "@/lib/utils";

type ShapeType = "circle" | "triangle" | "square";

interface Shape {
  x: number;
  y: number;
  size: number;
  maxSize: number;
  type: ShapeType;
  rot: number;
  rotSpeed: number;
  alpha: number;
  hue: number;
}

const DEFAULT_SHAPES_PER_TAP = 6;
const DEFAULT_MAX_SHAPES = 20;
const DEFAULT_GROW_SPEED = 3;
const DEFAULT_LINE_WIDTH = 2;

interface GeometrySpreadProps {
  params?: Record<string, number | string>;
}

export default function GeometrySpread({ params }: GeometrySpreadProps) {
  const shapesPerTap = Number(params?.shapesPerTap ?? DEFAULT_SHAPES_PER_TAP);
  const maxShapes = Number(params?.maxShapes ?? DEFAULT_MAX_SHAPES);
  const growSpeed = Number(params?.growSpeed ?? DEFAULT_GROW_SPEED);
  const effectScale = Number(params?.effectScale ?? 1);
  const stayDuration = Number(params?.stayDuration ?? 1);
  const lineWidth = Number(params?.lineWidth ?? DEFAULT_LINE_WIDTH) * effectScale;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shapesRef = useRef<Shape[]>([]);
  const rafRef = useRef<number>(0);

  const drawShape = useCallback(
    (ctx: CanvasRenderingContext2D, s: Shape) => {
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.rot);
      ctx.globalAlpha = s.alpha;
      ctx.strokeStyle = `hsl(${s.hue}, 70%, 55%)`;
      ctx.lineWidth = lineWidth;
      const half = s.size / 2;
      if (s.type === "circle") {
        ctx.beginPath();
        ctx.arc(0, 0, half, 0, Math.PI * 2);
        ctx.stroke();
      } else if (s.type === "triangle") {
        ctx.beginPath();
        ctx.moveTo(0, -half);
        ctx.lineTo(half * 0.866, half * 0.5);
        ctx.lineTo(-half * 0.866, half * 0.5);
        ctx.closePath();
        ctx.stroke();
      } else {
        ctx.strokeRect(-half, -half, s.size, s.size);
      }
      ctx.restore();
    },
    [lineWidth]
  );

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const alive: Shape[] = [];
    const types: ShapeType[] = ["circle", "triangle", "square"];
    for (const s of shapesRef.current) {
      s.size += growSpeed;
      s.rot += s.rotSpeed;
      s.alpha = Math.max(0, 1 - s.size / s.maxSize);
      if (s.alpha > 0.02) alive.push(s);
      drawShape(ctx, s);
    }
    shapesRef.current = alive;
  }, [drawShape, growSpeed]);

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
      const maxS = Math.max(canvas.width / dpr, canvas.height / dpr) * 0.4 * stayDuration * effectScale;
      const types: ShapeType[] = ["circle", "triangle", "square"];
      for (let i = 0; i < shapesPerTap; i++) {
        if (shapesRef.current.length >= maxShapes) shapesRef.current.shift();
        shapesRef.current.push({
          x,
          y,
          size: 0,
          maxSize: maxS * randomBetween(0.4, 1),
          type: types[i % 3],
          rot: randomBetween(0, Math.PI * 2),
          rotSpeed: randomBetween(-0.03, 0.03),
          alpha: 1,
          hue: randomBetween(150, 180),
        });
      }
    },
    [shapesPerTap, maxShapes, stayDuration, effectScale]
  );

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full cursor-pointer bg-emerald-50"
      onMouseDown={handlePointer}
      onTouchEnd={handlePointer}
      style={{ touchAction: "none" }}
    />
  );
}
