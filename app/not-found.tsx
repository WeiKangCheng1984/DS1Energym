import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
        找不到頁面
      </h1>
      <p className="text-slate-600 dark:text-slate-400">
        請檢查網址，或返回首頁選擇 1～16 號模式。
      </p>
      <Link
        href="/"
        className="rounded-full bg-slate-200 px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
      >
        返回首頁
      </Link>
    </main>
  );
}
