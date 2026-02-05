"use client";

export default function GeothermalSteamVictory() {
  return (
    <svg viewBox="0 0 200 200" className="h-48 w-48 sm:h-56 sm:w-56" aria-hidden>
      <defs>
        <linearGradient id="lavaGrad" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#7f1d1d" />
          <stop offset="50%" stopColor="#b91c1c" />
          <stop offset="100%" stopColor="#dc2626" />
        </linearGradient>
        <filter id="steamBlur">
          <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" />
        </filter>
      </defs>
      <rect x="0" y="120" width="200" height="80" fill="url(#lavaGrad)" />
      <path d="M60 200 L100 80 L140 200 Z" fill="#422006" stroke="#78350f" strokeWidth="2" />
      <path d="M70 190 L100 100 L130 190 Z" fill="#713f12" />
      <path d="M80 180 L100 120 L120 180 Z" fill="#a16207" />
      <path d="M90 170 L100 140 L110 170 Z" fill="#eab308" />
      <ellipse cx="100" cy="65" rx="18" ry="12" fill="rgba(255,255,255,0.7)" filter="url(#steamBlur)" className="animate-pulse" />
      <ellipse cx="95" cy="55" rx="12" ry="8" fill="rgba(255,255,255,0.5)" className="animate-pulse" style={{ animationDelay: "0.3s" }} />
    </svg>
  );
}
