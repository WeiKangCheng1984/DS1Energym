"use client";

export default function WindTurbineVictory() {
  return (
    <svg viewBox="0 0 200 200" className="h-48 w-48 sm:h-56 sm:w-56" aria-hidden>
      <defs>
        <linearGradient id="towerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#64748b" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>
        <linearGradient id="bladeGradW" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>
      </defs>
      {/* 塔架 */}
      <path
        d="M85 200 L85 70 L100 55 L115 70 L115 200 Z"
        fill="url(#towerGrad)"
        stroke="#334155"
        strokeWidth="1"
      />
      {/* 光點 */}
      <circle cx="70" cy="90" r="4" fill="#22c55e" className="animate-pulse" />
      <circle cx="130" cy="100" r="4" fill="#ef4444" className="animate-pulse" style={{ animationDelay: "0.5s" }} />
      {/* 三片葉片 */}
      <g className="origin-[100px_62px] animate-spin" style={{ animationDuration: "4s" }}>
        {[0, 120, 240].map((deg) => (
          <ellipse
            key={deg}
            cx="100"
            cy="62"
            rx="6"
            ry="38"
            fill="url(#bladeGradW)"
            stroke="#166534"
            strokeWidth="1"
            transform={`rotate(${deg} 100 62)`}
          />
        ))}
      </g>
      <circle cx="100" cy="62" r="8" fill="#334155" stroke="#64748b" strokeWidth="2" />
    </svg>
  );
}
