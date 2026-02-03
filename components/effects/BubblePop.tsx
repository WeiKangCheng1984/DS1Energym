"use client";

import { useRef, useEffect, useCallback } from "react";
import { getCanvasPoint, randomBetween } from "@/lib/utils";

interface Bubble {
  x: number;
  y: number;
  r: number;
  phase: number; // 0=完整 1=破裂完成
}

interface Fragment {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  alpha: number;
}

const DEFAULT_BUBBLE_R = 40;
const DEFAULT_FRAGMENTS_PER_BUBBLE = 14;
const DEFAULT_MAX_BUBBLES = 8;

interface BubblePopProps {
  params?: Record<string, number | string>;
}

export default function BubblePop({ params }: BubblePopProps) {
  const effectScale = Number(params?.effectScale ?? 1);
  const stayDuration = Number(params?.stayDuration ?? 1);
  const bubbleR = Number(params?.bubbleR ?? 40) * effectScale;
  const maxBubbles = Number(params?.maxBubbles ?? DEFAULT_MAX_BUBBLES);
  const fragmentsPerBubble = Number(params?.fragmentsPerBubble ?? DEFAULT_FRAGMENTS_PER_BUBBLE);
  const fragmentAlphaDecay = 0.02 / Math.max(0.5, stayDuration);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bubblesRef = useRef<Bubble[]>([]);
  const fragmentsRef = useRef<Fragment[]>([]);
  const rafRef = useRef<number>(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const aliveBubbles: Bubble[] = [];
    for (const b of bubblesRef.current) {
      b.phase = Math.min(1, b.phase + 0.04);
      if (b.phase < 1) {
        aliveBubbles.push(b);
        const scale = 1 + b.phase * 0.3;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r * scale, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(14, 165, 233, ${1 - b.phase})`;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = `rgba(56, 189, 248, ${0.3 * (1 - b.phase)})`;
        ctx.fill();
      } else {
        for (let i = 0; i < fragmentsPerBubble; i++) {
          const a = (i / fragmentsPerBubble) * Math.PI * 2 + Math.random();
          const speed = randomBetween(2, 6);
          fragmentsRef.current.push({
            x: b.x,
            y: b.y,
            vx: Math.cos(a) * speed,
            vy: Math.sin(a) * speed,
            r: b.r * 0.2,
            alpha: 1,
          });
        }
      }
    }
    bubblesRef.current = aliveBubbles;

    const aliveFragments: Fragment[] = [];
    for (const f of fragmentsRef.current) {
      f.x += f.vx;
      f.y += f.vy;
      f.vy += 0.15;
      f.alpha -= fragmentAlphaDecay;
      if (f.alpha > 0) {
        aliveFragments.push(f);
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(14, 165, 233, ${f.alpha})`;
        ctx.fill();
      }
    }
    fragmentsRef.current = aliveFragments;
  }, [fragmentsPerBubble, fragmentAlphaDecay]);

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
      if (bubblesRef.current.length >= maxBubbles) bubblesRef.current.shift();
      bubblesRef.current.push({ x, y, r: bubbleR, phase: 0 });
    },
    [bubbleR, maxBubbles]
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
