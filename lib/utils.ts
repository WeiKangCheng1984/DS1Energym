/**
 * 共用工具函數
 */

/**
 * 取得點擊／觸控在 Canvas 上的座標（與 getBoundingClientRect 對齊，適合已用 devicePixelRatio scale 的 context）
 */
export function getCanvasPoint(
  canvas: HTMLCanvasElement,
  clientX: number,
  clientY: number
): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect();
  return {
    x: clientX - rect.left,
    y: clientY - rect.top,
  };
}

/**
 * 限制數值在 min ~ max 之間
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * 隨機範圍
 */
export function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}
