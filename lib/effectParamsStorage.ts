/**
 * 各模式參數的 localStorage 讀寫
 */

const STORAGE_KEY = "relax-game-params";

export type ParamValue = number | string;
export type ParamsByMode = Record<number, Record<string, ParamValue>>;

function loadRaw(): ParamsByMode {
  if (typeof window === "undefined") return {};
  try {
    const s = window.localStorage.getItem(STORAGE_KEY);
    if (!s) return {};
    const parsed = JSON.parse(s) as ParamsByMode;
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

function saveRaw(data: ParamsByMode): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

/**
 * 取得指定模式的參數（與 schema 預設 merge，確保每個 key 都有值）
 */
export function getParamsForMode(
  modeId: number,
  defaults: Record<string, ParamValue>
): Record<string, ParamValue> {
  const raw = loadRaw();
  const saved = raw[modeId];
  const result = { ...defaults };
  if (saved && typeof saved === "object") {
    for (const [key, value] of Object.entries(saved)) {
      if ((typeof value === "number" || typeof value === "string") && key in result) {
        result[key] = value;
      }
    }
  }
  return result;
}

/**
 * 儲存指定模式的參數
 */
export function setParamsForMode(
  modeId: number,
  params: Record<string, ParamValue>
): void {
  const raw = loadRaw();
  raw[modeId] = { ...params };
  saveRaw(raw);
}
