/**
 * 各模式可調參數的 schema，供 ParamsModal 動態產生表單並與 effect 元件對應
 */

export type ParamDef =
  | {
      key: string;
      label: string;
      type: "number";
      min: number;
      max: number;
      default: number;
      step?: number;
    }
  | {
      key: string;
      label: string;
      type: "select";
      options: { value: number | string; label: string }[];
      default: number | string;
    };

const SCHEMA: Record<number, ParamDef[]> = {
  1: [
    { key: "maxRipples", label: "最大漣漪數", type: "number", min: 4, max: 24, default: 12 },
    { key: "rippleSpeed", label: "漣漪擴散速度", type: "number", min: 1, max: 8, default: 3, step: 0.5 },
    { key: "lineWidth", label: "漣漪線寬", type: "number", min: 1, max: 6, default: 2 },
    { key: "alphaDecay", label: "透明度衰減", type: "number", min: 0.5, max: 2, default: 1, step: 0.1 },
    { key: "stayDuration", label: "畫面停留時間倍率", type: "number", min: 0.5, max: 2.5, default: 1, step: 0.1 },
    { key: "effectScale", label: "視覺強度（放大）", type: "number", min: 0.7, max: 1.5, default: 1.1, step: 0.1 },
  ],
  2: [
    { key: "particleCount", label: "每次粒子數", type: "number", min: 20, max: 120, default: 60 },
    { key: "gravity", label: "重力", type: "number", min: 0.05, max: 0.8, default: 0.25, step: 0.05 },
    { key: "maxLife", label: "粒子存活幀數", type: "number", min: 40, max: 200, default: 120 },
    { key: "particleSizeMin", label: "粒子最小尺寸", type: "number", min: 2, max: 8, default: 2 },
    { key: "particleSizeMax", label: "粒子最大尺寸", type: "number", min: 3, max: 10, default: 5 },
    { key: "hueCenter", label: "煙火主色（色相）", type: "number", min: 0, max: 360, default: 35 },
    { key: "stayDuration", label: "畫面停留時間倍率", type: "number", min: 0.5, max: 2.5, default: 1, step: 0.1 },
    { key: "effectScale", label: "視覺強度（放大）", type: "number", min: 0.7, max: 1.5, default: 1.1, step: 0.1 },
  ],
  3: [
    { key: "bubbleR", label: "泡泡半徑", type: "number", min: 20, max: 60, default: 40 },
    { key: "maxBubbles", label: "同時泡泡數", type: "number", min: 3, max: 15, default: 8 },
    { key: "fragmentsPerBubble", label: "破裂碎片數", type: "number", min: 8, max: 24, default: 14 },
    { key: "stayDuration", label: "畫面停留時間倍率", type: "number", min: 0.5, max: 2.5, default: 1, step: 0.1 },
    { key: "effectScale", label: "視覺強度（放大）", type: "number", min: 0.7, max: 1.5, default: 1.1, step: 0.1 },
  ],
  4: [
    { key: "starsPerTap", label: "每次流星數", type: "number", min: 1, max: 8, default: 3 },
    { key: "maxStars", label: "同時流星數", type: "number", min: 10, max: 50, default: 30 },
    { key: "starLengthMin", label: "流星長度下限", type: "number", min: 40, max: 80, default: 60 },
    { key: "starLengthMax", label: "流星長度上限", type: "number", min: 100, max: 200, default: 150 },
  ],
  5: [
    { key: "maxBlots", label: "最大墨跡數", type: "number", min: 4, max: 20, default: 10 },
    { key: "growSpeed", label: "暈染擴散速度", type: "number", min: 1, max: 5, default: 2.5, step: 0.5 },
    { key: "blur", label: "模糊程度", type: "number", min: 0, max: 6, default: 2 },
    { key: "hueMin", label: "墨色色相下限", type: "number", min: 200, max: 260, default: 220 },
    { key: "hueMax", label: "墨色色相上限", type: "number", min: 220, max: 260, default: 240 },
    { key: "stayDuration", label: "畫面停留時間倍率", type: "number", min: 0.5, max: 2.5, default: 1, step: 0.1 },
    { key: "effectScale", label: "視覺強度（放大）", type: "number", min: 0.7, max: 1.5, default: 1.1, step: 0.1 },
  ],
  6: [
    { key: "crackLines", label: "裂紋線條數", type: "number", min: 6, max: 24, default: 12 },
    { key: "maxCracks", label: "同時裂紋組數", type: "number", min: 2, max: 10, default: 5 },
    { key: "lineWidth", label: "裂紋線寬", type: "number", min: 1, max: 3, default: 1.5, step: 0.5 },
    { key: "stayDuration", label: "畫面停留時間倍率", type: "number", min: 0.5, max: 2.5, default: 1, step: 0.1 },
    { key: "effectScale", label: "視覺強度（放大）", type: "number", min: 0.7, max: 1.5, default: 1.1, step: 0.1 },
  ],
  7: [
    { key: "petalsPerTap", label: "每次花瓣數", type: "number", min: 3, max: 16, default: 8 },
    { key: "maxPetals", label: "同時花瓣數", type: "number", min: 20, max: 80, default: 50 },
    { key: "sizeMin", label: "花瓣最小尺寸", type: "number", min: 6, max: 12, default: 8 },
    { key: "sizeMax", label: "花瓣最大尺寸", type: "number", min: 14, max: 24, default: 18 },
    { key: "rotSpeed", label: "旋轉速度", type: "number", min: -0.1, max: 0.1, default: 0, step: 0.01 },
    { key: "stayDuration", label: "畫面停留時間倍率", type: "number", min: 0.5, max: 2.5, default: 1, step: 0.1 },
    { key: "effectScale", label: "視覺強度（放大）", type: "number", min: 0.7, max: 1.5, default: 1.1, step: 0.1 },
  ],
  8: [
    { key: "haloSpeed", label: "光暈擴散速度", type: "number", min: 2, max: 10, default: 4 },
    { key: "maxHalos", label: "同時光暈數", type: "number", min: 3, max: 15, default: 8 },
    { key: "lineWidth", label: "光暈線寬", type: "number", min: 2, max: 6, default: 4 },
    { key: "ringStep", label: "同心圓密度", type: "number", min: 8, max: 25, default: 15 },
    { key: "stayDuration", label: "畫面停留時間倍率", type: "number", min: 0.5, max: 2.5, default: 1, step: 0.1 },
    { key: "effectScale", label: "視覺強度（放大）", type: "number", min: 0.7, max: 1.5, default: 1.1, step: 0.1 },
  ],
  9: [
    { key: "shapesPerTap", label: "每次幾何形數", type: "number", min: 3, max: 12, default: 6 },
    { key: "maxShapes", label: "同時幾何形數", type: "number", min: 8, max: 40, default: 20 },
    { key: "growSpeed", label: "擴散速度", type: "number", min: 1, max: 6, default: 3 },
    { key: "lineWidth", label: "邊框線寬", type: "number", min: 1, max: 4, default: 2 },
    { key: "stayDuration", label: "畫面停留時間倍率", type: "number", min: 0.5, max: 2.5, default: 1, step: 0.1 },
    { key: "effectScale", label: "視覺強度（放大）", type: "number", min: 0.7, max: 1.5, default: 1.1, step: 0.1 },
  ],
  10: [
    { key: "firefliesPerTap", label: "每次螢火蟲數", type: "number", min: 2, max: 12, default: 5 },
    { key: "maxFireflies", label: "同時螢火蟲數", type: "number", min: 15, max: 60, default: 35 },
    { key: "sizeMin", label: "光點最小尺寸", type: "number", min: 2, max: 5, default: 3 },
    { key: "sizeMax", label: "光點最大尺寸", type: "number", min: 5, max: 12, default: 7 },
    { key: "blinkSpeed", label: "閃爍速度", type: "number", min: 0.04, max: 0.15, default: 0.08, step: 0.01 },
    { key: "stayDuration", label: "畫面停留時間倍率", type: "number", min: 0.5, max: 2.5, default: 1, step: 0.1 },
    { key: "effectScale", label: "視覺強度（放大）", type: "number", min: 0.7, max: 1.5, default: 1.1, step: 0.1 },
  ],
  11: [
    { key: "flakesPerTap", label: "每次雪花數", type: "number", min: 4, max: 24, default: 12 },
    { key: "maxFlakes", label: "同時雪花數", type: "number", min: 30, max: 120, default: 80 },
    { key: "sizeMin", label: "雪花最小尺寸", type: "number", min: 1, max: 4, default: 2 },
    { key: "sizeMax", label: "雪花最大尺寸", type: "number", min: 4, max: 10, default: 6 },
    { key: "fallSpeed", label: "飄落速度", type: "number", min: 0.5, max: 2.5, default: 1.2, step: 0.1 },
    { key: "stayDuration", label: "畫面停留時間倍率", type: "number", min: 0.5, max: 2.5, default: 1, step: 0.1 },
    { key: "effectScale", label: "視覺強度（放大）", type: "number", min: 0.7, max: 1.5, default: 1.1, step: 0.1 },
  ],
  12: [
    { key: "maxBlobs", label: "同時果凍數", type: "number", min: 2, max: 12, default: 6 },
    { key: "pulseSpeed", label: "脈動速度", type: "number", min: 0.02, max: 0.15, default: 0.08, step: 0.01 },
    { key: "targetRadius", label: "果凍目標半徑", type: "number", min: 50, max: 120, default: 80 },
    { key: "recoverSpeed", label: "恢復速度", type: "number", min: 0.01, max: 0.06, default: 0.03, step: 0.005 },
    { key: "effectScale", label: "視覺強度（放大）", type: "number", min: 0.7, max: 1.5, default: 1.1, step: 0.1 },
  ],
  13: [
    { key: "waveSpeed", label: "聲波擴散速度", type: "number", min: 2, max: 12, default: 5 },
    { key: "maxWaves", label: "同時聲波數", type: "number", min: 4, max: 20, default: 10 },
    { key: "lineWidth", label: "聲波線寬", type: "number", min: 1, max: 5, default: 3 },
    { key: "stayDuration", label: "畫面停留時間倍率", type: "number", min: 0.5, max: 2.5, default: 1, step: 0.1 },
    { key: "effectScale", label: "視覺強度（放大）", type: "number", min: 0.7, max: 1.5, default: 1.1, step: 0.1 },
  ],
  14: [
    { key: "maxPoints", label: "軌跡最大點數", type: "number", min: 500, max: 6000, default: 3000, step: 500 },
    { key: "lineWidth", label: "筆刷線寬", type: "number", min: 2, max: 10, default: 4 },
    {
      key: "colorPreset",
      label: "色盤預設",
      type: "select",
      options: [
        { value: 0, label: "暖色" },
        { value: 1, label: "冷色" },
        { value: 2, label: "彩虹" },
        { value: 3, label: "柔和" },
        { value: 4, label: "高對比" },
      ],
      default: 0,
    },
    { key: "stayDuration", label: "軌跡保留倍率", type: "number", min: 0.5, max: 2.5, default: 1, step: 0.1 },
    { key: "effectScale", label: "視覺強度（放大）", type: "number", min: 0.7, max: 1.5, default: 1.1, step: 0.1 },
  ],
  15: [
    { key: "bubblesPerTap", label: "每次氣泡數", type: "number", min: 3, max: 12, default: 6 },
    { key: "maxBubbles", label: "同時氣泡數", type: "number", min: 20, max: 60, default: 40 },
    { key: "sizeMin", label: "氣泡最小半徑", type: "number", min: 6, max: 14, default: 8 },
    { key: "sizeMax", label: "氣泡最大半徑", type: "number", min: 16, max: 28, default: 22 },
    { key: "riseSpeed", label: "上浮速度", type: "number", min: 1, max: 4, default: 2, step: 0.1 },
    { key: "stayDuration", label: "畫面停留時間倍率", type: "number", min: 0.5, max: 2.5, default: 1, step: 0.1 },
    { key: "effectScale", label: "視覺強度（放大）", type: "number", min: 0.7, max: 1.5, default: 1.1, step: 0.1 },
  ],
  16: [
    { key: "sparksPerTap", label: "每次光點數", type: "number", min: 5, max: 30, default: 15 },
    { key: "maxSparks", label: "同時光點數", type: "number", min: 30, max: 100, default: 60 },
    { key: "maxRipples", label: "同時漣漪數", type: "number", min: 2, max: 8, default: 4 },
    { key: "sparkSizeMin", label: "光點最小尺寸", type: "number", min: 1, max: 4, default: 2 },
    { key: "sparkSizeMax", label: "光點最大尺寸", type: "number", min: 4, max: 10, default: 6 },
    { key: "stayDuration", label: "畫面停留時間倍率", type: "number", min: 0.5, max: 2.5, default: 1, step: 0.1 },
    { key: "effectScale", label: "視覺強度（放大）", type: "number", min: 0.7, max: 1.5, default: 1.1, step: 0.1 },
  ],
};

export function getSchemaForMode(modeId: number): ParamDef[] {
  return SCHEMA[modeId] ?? [];
}

export function getDefaultsForMode(modeId: number): Record<string, number | string> {
  const schema = getSchemaForMode(modeId);
  return Object.fromEntries(schema.map((p) => [p.key, p.default]));
}
