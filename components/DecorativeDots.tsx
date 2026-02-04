"use client";

import { useMemo } from "react";

const DOT_COUNT = 14;
const COLORS = [
  "bg-rose-300/40 dark:bg-rose-400/25",
  "bg-amber-300/40 dark:bg-amber-400/25",
  "bg-orange-300/40 dark:bg-orange-400/25",
];

function generateDots() {
  return Array.from({ length: DOT_COUNT }, (_, i) => {
    return {
      id: i,
      left: 5 + Math.random() * 90,
      top: 8 + Math.random() * 84,
      size: 4 + Math.random() * 10,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: Math.random() * 3,
    };
  });
}

export default function DecorativeDots() {
  const dots = useMemo(() => generateDots(), []);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      {dots.map((dot) => (
        <span
          key={dot.id}
          className={`absolute rounded-full ${dot.color} animate-dot-float`}
          style={{
            left: `${dot.left}%`,
            top: `${dot.top}%`,
            width: `${dot.size}px`,
            height: `${dot.size}px`,
            animationDelay: `${dot.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
