"use client";

export default function SolarPanelVictory() {
  return (
    <svg viewBox="0 0 200 160" className="h-44 w-56 sm:h-52 sm:w-64" aria-hidden>
      <defs>
        <linearGradient id="panelGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="50%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="1" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* 太陽能板由點到面亮起 */}
      <rect x="20" y="20" width="160" height="80" rx="4" fill="url(#panelGrad)" filter="url(#glow)" className="animate-pulse" />
      <line x1="40" y1="60" x2="160" y2="60" stroke="#fbbf24" strokeWidth="2" opacity="0.9" />
      <line x1="100" y1="25" x2="100" y2="95" stroke="#fbbf24" strokeWidth="2" opacity="0.9" />
      {/* 光纖線路通往城市 */}
      <path d="M100 100 L100 140 L50 155 L150 155 L100 140" stroke="#fcd34d" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.8" />
      <rect x="40" y="148" width="20" height="12" fill="#78716c" />
      <rect x="90" y="148" width="20" height="12" fill="#78716c" />
      <rect x="140" y="148" width="20" height="12" fill="#78716c" />
    </svg>
  );
}
