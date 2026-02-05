"use client";

export default function WaterTurbineVictory() {
  return (
    <svg
      viewBox="0 0 200 200"
      className="h-48 w-48 sm:h-56 sm:w-56"
      aria-hidden
    >
      <defs>
        <radialGradient id="waterTurbineGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.9" />
          <stop offset="70%" stopColor="#3b82f6" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#1e40af" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="bladeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#64748b" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="55" fill="url(#waterTurbineGlow)" className="animate-pulse" />
      <g className="origin-center animate-spin" style={{ animationDuration: "3s" }}>
        {/* 水輪機葉片 x6 */}
        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <ellipse
            key={deg}
            cx="100"
            cy="100"
            rx="8"
            ry="42"
            fill="url(#bladeGrad)"
            stroke="#475569"
            strokeWidth="1"
            transform={`rotate(${deg} 100 100)`}
          />
        ))}
      </g>
      <circle cx="100" cy="100" r="12" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="2" />
      <circle cx="100" cy="100" r="6" fill="#93c5fd" opacity="0.8" />
    </svg>
  );
}
