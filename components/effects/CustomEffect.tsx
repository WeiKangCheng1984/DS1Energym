"use client";

import { useRef, useEffect, useCallback } from "react";
import { getCanvasPoint, randomBetween } from "@/lib/utils";

/** 自訂模式：結合小星星 + 漣漪 + 柔和光點 */
interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  hue: number;
}

interface Ripple {
  x: number;
  y: number;
  r: number;
  maxR: number;
  alpha: number;
}

const DEFAULT_SPARKS_PER_TAP = 15;
const DEFAULT_MAX_SPARKS = 60;
const DEFAULT_MAX_RIPPLES = 4;
const DEFAULT_SPARK_SIZE_MIN = 2;
const DEFAULT_SPARK_SIZE_MAX = 6;

interface CustomEffectProps {
  params?: Record<string, number | string>;
}

export default function CustomEffect({ params }: CustomEffectProps) {
  const sparksPerTap = Number(params?.sparksPerTap ?? DEFAULT_SPARKS_PER_TAP);
  const maxSparks = Number(params?.maxSparks ?? DEFAULT_MAX_SPARKS);
  const maxRipples = Number(params?.maxRipples ?? DEFAULT_MAX_RIPPLES);
  const effectScale = Number(params?.effectScale ?? 1);
  const stayDuration = Number(params?.stayDuration ?? 1);
  const sparkSizeMin = Number(params?.sparkSizeMin ?? DEFAULT_SPARK_SIZE_MIN) * effectScale;
  const sparkSizeMax = Number(params?.sparkSizeMax ?? DEFAULT_SPARK_SIZE_MAX) * effectScale;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sparksRef = useRef<Spark[]>([]);
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

    const aliveSparks: Spark[] = [];
    for (const s of sparksRef.current) {
      s.x += s.vx;
      s.y += s.vy;
      s.life++;
      if (s.life >= s.maxLife) continue;
      aliveSparks.push(s);
      const t = 1 - s.life / s.maxLife;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size * t, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${s.hue}, 90%, 70%, ${t})`;
      ctx.fill();
    }
    sparksRef.current = aliveSparks;

    const aliveRipples: Ripple[] = [];
    for (const r of ripplesRef.current) {
      r.r += 3;
      r.alpha = Math.max(0, 1 - r.r / r.maxR) * 0.6;
      if (r.alpha > 0.02) aliveRipples.push(r);
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
      ctx.strokeStyle = `hsla(280, 70%, 70%, ${r.alpha})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    ripplesRef.current = aliveRipples;
  }, []);

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

      for (let i = 0; i < sparksPerTap; i++) {
        if (sparksRef.current.length >= maxSparks) sparksRef.current.shift();
        const angle = randomBetween(0, Math.PI * 2);
        const speed = randomBetween(2, 8);
        sparksRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2,
          life: 0,
          maxLife: Math.round(randomBetween(40, 90) * stayDuration),
          size: randomBetween(sparkSizeMin, sparkSizeMax),
          hue: randomBetween(260, 320),
        });
      }
      const dpr = window.devicePixelRatio || 1;
      const maxR = Math.max(canvas.width / dpr, canvas.height / dpr) * 0.5 * stayDuration;
      if (ripplesRef.current.length >= maxRipples) ripplesRef.current.shift();
      ripplesRef.current.push({ x, y, r: 0, maxR, alpha: 1 });
    },
    [sparksPerTap, maxSparks, maxRipples, sparkSizeMin, sparkSizeMax, stayDuration]
  );

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full cursor-pointer bg-fuchsia-950"
      onMouseDown={handlePointer}
      onTouchEnd={handlePointer}
      style={{ touchAction: "none" }}
    />
  );
}
