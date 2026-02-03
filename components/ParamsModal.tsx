"use client";

import { useEffect, useState } from "react";
import {
  getSchemaForMode,
  getDefaultsForMode,
} from "@/lib/effectParamsSchema";
import type { ParamDef } from "@/lib/effectParamsSchema";
import {
  getParamsForMode,
  setParamsForMode,
} from "@/lib/effectParamsStorage";
import type { ParamValue } from "@/lib/effectParamsStorage";

interface ParamsModalProps {
  open: boolean;
  onClose: () => void;
  modeId: number;
  modeName: string;
}

export default function ParamsModal({
  open,
  onClose,
  modeId,
  modeName,
}: ParamsModalProps) {
  const schema = getSchemaForMode(modeId);
  const defaults = getDefaultsForMode(modeId);
  const [values, setValues] = useState<Record<string, ParamValue>>(defaults);

  useEffect(() => {
    if (open && typeof window !== "undefined") {
      const defs = getDefaultsForMode(modeId);
      const merged = getParamsForMode(modeId, defs);
      setValues(merged);
    }
  }, [open, modeId]);

  const handleChange = (key: string, value: ParamValue) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setValues({ ...defaults });
  };

  const handleSave = () => {
    setParamsForMode(modeId, values);
    onClose();
  };

  const displayValue = (param: ParamDef, val: ParamValue) => {
    if (param.type === "number") {
      const n = Number(val ?? param.default);
      return param.step != null && param.step < 1 ? n.toFixed(2) : String(Math.round(n));
    }
    if (param.type === "select") {
      const opt = param.options.find((o) => o.value === val || String(o.value) === String(val));
      return opt?.label ?? String(param.default);
    }
    return "";
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
          {modeName} － 參數設定
        </h2>
        <div className="mt-4 space-y-4">
          {schema.map((param) => (
            <div key={param.key}>
              <label className="mb-1 flex justify-between text-sm text-slate-600 dark:text-slate-400">
                <span>{param.label}</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">
                  {displayValue(param, values[param.key])}
                </span>
              </label>
              {param.type === "number" && (
                <input
                  type="range"
                  min={param.min}
                  max={param.max}
                  step={param.step ?? 1}
                  value={Number(values[param.key] ?? param.default)}
                  onChange={(e) =>
                    handleChange(param.key, parseFloat(e.target.value))
                  }
                  className="w-full accent-cyan-500"
                />
              )}
              {param.type === "select" && (
                <select
                  value={String(values[param.key] ?? param.default)}
                  onChange={(e) => {
                    const v = e.target.value;
                    const num = Number(v);
                    handleChange(param.key, Number.isNaN(num) ? v : num);
                  }}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                >
                  {param.options.map((opt) => (
                    <option key={String(opt.value)} value={String(opt.value)}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ))}
        </div>
        {schema.length === 0 && (
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            此模式暫無可調參數。
          </p>
        )}
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="rounded-full bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500"
          >
            重設為預設
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-full bg-cyan-500 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-600"
          >
            儲存
          </button>
          <button
            type="button"
            onClick={onClose}
            className="ml-auto rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
}
