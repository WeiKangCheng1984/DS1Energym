"use client";

import { useRef, useEffect, useCallback } from "react";
import { getCanvasPoint } from "@/lib/utils";

interface Blob {
  x: number;
  y: number;
  radius: number;
  targetRadius: number;
  phase: number;
}

const DEFAULT_MAX_BLOBS = 6;
const DEFAULT_PULSE_SPEED = 0.08;
const DEFAULT_TARGET_RADIUS = 80;
const DEFAULT_RECOVER_SPEED = 0.03;

interface JellyDeformProps {
  params?: Record<string, number | string>;
}

export default function JellyDeform({ params }: JellyDeformProps) {
  const maxBlobs = Number(params?.maxBlobs ?? DEFAULT_MAX_BLOBS);
  const pulseSpeed = Number(params?.pulseSpeed ?? DEFAULT_PULSE_SPEED);
  const effectScale = Number(params?.effectScale ?? 1);
  const targetRadius = Number(params?.targetRadius ?? DEFAULT_TARGET_RADIUS) * effectScale;
  const recoverSpeed = Number(params?.recoverSpeed ?? DEFAULT_RECOVER_SPEED);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const blobsRef = useRef<Blob[]>([]);
  const rafRef = useRef<number>(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    for (const b of blobsRef.current) {
      b.phase += pulseSpeed;
      const wave = Math.sin(b.phase) * 8;
      b.radius += (b.targetRadius + wave - b.radius) * recoverSpeed;
      const gradient = ctx.createRadialGradient(
        b.x, b.y, 0,
        b.x, b.y, b.radius
      );
      gradient.addColorStop(0, "rgba(192, 132, 252, 0.5)");
      gradient.addColorStop(0.6, "rgba(167, 139, 250, 0.25)");
      gradient.addColorStop(1, "rgba(139, 92, 246, 0)");
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.strokeStyle = "rgba(192, 132, 252, 0.6)";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }, [pulseSpeed, recoverSpeed]);

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
      if (blobsRef.current.length >= maxBlobs) blobsRef.current.shift();
      blobsRef.current.push({
        x,
        y,
        radius: 20,
        targetRadius,
        phase: 0,
      });
    },
    [maxBlobs, targetRadius]
  );

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full cursor-pointer bg-purple-950"
      onMouseDown={handlePointer}
      onTouchEnd={handlePointer}
      style={{ touchAction: "none" }}
    />
  );
}
