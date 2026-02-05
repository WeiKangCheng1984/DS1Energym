/**
 * 電幻1號所 Energym — 5 款遊戲的常數定義
 */

export interface GameMode {
  id: number;
  name: string;
  description: string;
  /** 卡片／主題色（Tailwind） */
  color: string;
  colorSecondary?: string;
}

export const GAME_MODES: GameMode[] = [
  { id: 1, name: "水力彈跳", description: "點擊圓點使水柱上升，三階段過關", color: "from-cyan-400 to-blue-600", colorSecondary: "#06b6d4" },
  { id: 2, name: "風力舞踏", description: "左右交替點擊，Logo 綠→黃→紅", color: "from-emerald-400 to-teal-600", colorSecondary: "#34d399" },
  { id: 3, name: "光伏運動", description: "投進 12 顆光子球至太陽能板", color: "from-amber-400 to-orange-500", colorSecondary: "#f59e0b" },
  { id: 4, name: "波浪戰繩", description: "壓住搖擺產生波痕，光條滿即過關", color: "from-sky-400 to-indigo-600", colorSecondary: "#0ea5e9" },
  { id: 5, name: "地熱飛輪", description: "飛輪踩踏，金字塔逐層亮燈至蒸汽噴發", color: "from-orange-500 to-rose-700", colorSecondary: "#f97316" },
];

export function getModeById(id: number): GameMode | undefined {
  return GAME_MODES.find((m) => m.id === id);
}

export function isValidModeId(id: number): boolean {
  return id >= 1 && id <= 5;
}
