/**
 * 16 種紓壓模式的常數定義
 */

export interface GameMode {
  id: number;
  name: string;
  description: string;
  /** 卡片／主題色（Tailwind 或 hex） */
  color: string;
  /** 用於漸層的次要色 */
  colorSecondary?: string;
}

export const GAME_MODES: GameMode[] = [
  { id: 1, name: "漣漪／水波", description: "點擊產生水波擴散", color: "from-cyan-400 to-blue-600", colorSecondary: "#06b6d4" },
  { id: 2, name: "粒子爆炸／煙火", description: "點擊處粒子爆發", color: "from-amber-400 to-orange-600", colorSecondary: "#f59e0b" },
  { id: 3, name: "泡泡破裂", description: "點擊泡泡破裂動畫", color: "from-sky-300 to-indigo-500", colorSecondary: "#0ea5e9" },
  { id: 4, name: "星空／流星", description: "點擊觸發流星或星點", color: "from-indigo-900 to-purple-950", colorSecondary: "#6366f1" },
  { id: 5, name: "墨水暈染", description: "點擊處墨水擴散", color: "from-slate-700 to-slate-900", colorSecondary: "#475569" },
  { id: 6, name: "碎玻璃／裂紋", description: "點擊產生裂紋效果", color: "from-slate-400 to-slate-600", colorSecondary: "#94a3b8" },
  { id: 7, name: "花瓣／葉子飄落", description: "點擊觸發飄落", color: "from-rose-300 to-pink-500", colorSecondary: "#fb7185" },
  { id: 8, name: "彩虹光暈", description: "點擊處彩虹擴散", color: "from-violet-400 via-fuchsia-400 to-pink-400", colorSecondary: "#a855f7" },
  { id: 9, name: "幾何圖形擴散", description: "點擊處幾何形擴散", color: "from-emerald-400 to-teal-600", colorSecondary: "#34d399" },
  { id: 10, name: "螢火蟲／光點", description: "點擊召喚光點", color: "from-lime-300 to-green-600", colorSecondary: "#84cc16" },
  { id: 11, name: "雪花", description: "點擊觸發雪花", color: "from-sky-100 to-blue-200", colorSecondary: "#bae6fd" },
  { id: 12, name: "按壓變形", description: "如果凍般變形", color: "from-purple-300 to-violet-600", colorSecondary: "#c084fc" },
  { id: 13, name: "音波／聲波圈", description: "點擊處同心圓擴散", color: "from-cyan-300 to-blue-500", colorSecondary: "#22d3ee" },
  { id: 14, name: "塗鴉／畫筆軌跡", description: "拖曳畫出軌跡", color: "from-amber-200 to-orange-400", colorSecondary: "#fbbf24" },
  { id: 15, name: "氣泡上升", description: "點擊產生氣泡上浮", color: "from-cyan-200 to-blue-400", colorSecondary: "#67e8f9" },
  { id: 16, name: "自訂", description: "結合多種效果或創意", color: "from-fuchsia-300 to-purple-600", colorSecondary: "#e879f9" },
];

export function getModeById(id: number): GameMode | undefined {
  return GAME_MODES.find((m) => m.id === id);
}

export function isValidModeId(id: number): boolean {
  return id >= 1 && id <= 16;
}
