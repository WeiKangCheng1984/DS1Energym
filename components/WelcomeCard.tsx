"use client";

import { useState } from "react";

interface WelcomeCardProps {
  staggerIndex?: number;
  className?: string;
}

const DS_ONE_INFO = {
  title: "電幻1號所",
  subtitle: "TAIPOWER D/S ONE",
  intro: "位於新北市板橋區縣民大道二段1號（板橋車站旁），是台電打造的免費綠能主題展示館，主打互動體驗與能源健身房。開館時間為週二至週日 10:00–18:00，週一休館（除夕至初二通常也休館）。",
  address: "新北市板橋區縣民大道二段1號（新民多目標大樓）",
  transport: "捷運板南線板橋站2號出口，步行約2分鐘",
  hours: "週二至週日 10:00–18:00（週一及部分節日休館）",
  fee: "免費參觀",
  features: [
    "2樓能源健身房：免費體驗水力彈跳、風力舞踏等互動裝置。",
    "1樓VR六軸機器人：需注意場次，平日16:00，假日11:00、14:00、16:00（現場額滿為止，建議先查官網）。",
  ],
};

export default function WelcomeCard({ staggerIndex = 0, className }: WelcomeCardProps) {
  const [open, setOpen] = useState(false);
  const delayMs = staggerIndex * 50;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`animate-card-enter w-full rounded-2xl bg-gradient-to-br from-slate-300/70 via-slate-200/80 to-sky-300/70 p-[3px] text-left shadow-[0_18px_40px_rgba(15,23,42,0.45)] transition-shadow duration-300 hover:shadow-[0_24px_55px_rgba(15,23,42,0.65)] focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-stone-100 dark:focus:ring-offset-stone-900${className ? ` ${className}` : ""}`}
        style={{ animationDelay: `${delayMs}ms` }}
      >
        <div className="flex flex-col items-center justify-center rounded-[13px] bg-gradient-to-br from-slate-100 to-slate-200/90 p-6 shadow-inner dark:from-slate-700 dark:to-slate-800 sm:p-8">
          <span className="text-2xl font-bold text-slate-700 dark:text-slate-200 sm:text-3xl">電幻1號所</span>
          <span className="mt-1 text-xs text-slate-500 dark:text-slate-400">點擊查看地址與開館時間</span>
        </div>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="ds-one-modal-title">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} aria-hidden />
          <div className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-800 dark:text-slate-100">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 id="ds-one-modal-title" className="text-xl font-bold text-slate-800 dark:text-slate-100">電幻1號所</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">TAIPOWER D/S ONE — 相關資訊</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="shrink-0 rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                aria-label="關閉"
              >
                <span className="text-xl leading-none">×</span>
              </button>
            </div>
            <p className="mb-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{DS_ONE_INFO.intro}</p>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="font-semibold text-slate-700 dark:text-slate-200">地址</dt>
                <dd className="text-slate-600 dark:text-slate-400">{DS_ONE_INFO.address}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-700 dark:text-slate-200">交通</dt>
                <dd className="text-slate-600 dark:text-slate-400">{DS_ONE_INFO.transport}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-700 dark:text-slate-200">時間</dt>
                <dd className="text-slate-600 dark:text-slate-400">{DS_ONE_INFO.hours}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-700 dark:text-slate-200">費用</dt>
                <dd className="text-slate-600 dark:text-slate-400">{DS_ONE_INFO.fee}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-700 dark:text-slate-200">特色</dt>
                <dd className="mt-1 space-y-1 text-slate-600 dark:text-slate-400">
                  {DS_ONE_INFO.features.map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      )}
    </>
  );
}
