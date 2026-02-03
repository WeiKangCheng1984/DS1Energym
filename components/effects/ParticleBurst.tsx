"use client";

import { useRef, useEffect, useCallback } from "react";
import { getCanvasPoint, randomBetween } from "@/lib/utils";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  hue: number;
  size: number;
}

const DEFAULT_PARTICLE_COUNT = 60;
const DEFAULT_GRAVITY = 0.25;
const DEFAULT_MAX_LIFE = 120;

interface ParticleBurstProps {
  params?: Record<string, number | string>;
}

export default function ParticleBurst({ params }: ParticleBurstProps) {
  const particleCount = Number(params?.particleCount ?? DEFAULT_PARTICLE_COUNT);
  const gravity = Number(params?.gravity ?? DEFAULT_GRAVITY);
  const stayDuration = Number(params?.stayDuration ?? 1);
  const maxLife = Math.round(Number(params?.maxLife ?? DEFAULT_MAX_LIFE) * stayDuration);
  const particleSizeMin = Number(params?.particleSizeMin ?? 2) * Number(params?.effectScale ?? 1);
  const particleSizeMax = Number(params?.particleSizeMax ?? 5) * Number(params?.effectScale ?? 1);
  const hueCenter = Number(params?.hueCenter ?? 35);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const alive: Particle[] = [];
    for (const p of particlesRef.current) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += gravity;
      p.life++;
      if (p.life >= p.maxLife) continue;
      alive.push(p);
      const t = 1 - p.life / p.maxLife;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * t, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, 85%, 55%, ${t})`;
      ctx.fill();
    }
    particlesRef.current = alive;
  }, [gravity]);

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

      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5;
        const speed = randomBetween(4, 12);
        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 4,
          life: 0,
          maxLife: randomBetween(maxLife * 0.5, maxLife),
          hue: randomBetween(Math.max(0, hueCenter - 20), Math.min(360, hueCenter + 20)),
          size: randomBetween(particleSizeMin, particleSizeMax),
        });
      }
      if (particlesRef.current.length > 400) {
        particlesRef.current = particlesRef.current.slice(-300);
      }
    },
    [particleCount, maxLife, particleSizeMin, particleSizeMax, hueCenter]
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
