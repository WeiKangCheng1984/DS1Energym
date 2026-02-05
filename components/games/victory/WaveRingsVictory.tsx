"use client";

export default function WaveRingsVictory() {
  return (
    <svg viewBox="0 0 200 200" className="h-48 w-48 sm:h-56 sm:w-56" aria-hidden>
      <defs>
        <radialGradient id="seaGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#0369a1" stopOpacity="0.8" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="90" fill="url(#seaGrad)" />
      {[30, 50, 70, 85].map((r, i) => (
        <circle
          key={r}
          cx="100"
          cy="100"
          r={r}
          fill="none"
          stroke="#38bdf8"
          strokeWidth="2"
          opacity={0.9 - i * 0.15}
          className="animate-ping"
          style={{ animationDuration: `${1.5 + i * 0.3}s`, animationIterationCount: "infinite" }}
        />
      ))}
    </svg>
  );
}
