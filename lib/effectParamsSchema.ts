/**
 * 遊戲可調參數 schema（電幻1號所 5 款遊戲目前無參數設定）
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

export function getSchemaForMode(modeId: number): ParamDef[] {
  if (modeId >= 1 && modeId <= 5) return [];
  return [];
}

export function getDefaultsForMode(modeId: number): Record<string, number | string> {
  const schema = getSchemaForMode(modeId);
  return Object.fromEntries(schema.map((p) => [p.key, p.default]));
}
