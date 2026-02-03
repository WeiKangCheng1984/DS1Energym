import ModeCard from "@/components/ModeCard";
import { GAME_MODES } from "@/lib/constants";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-50 to-orange-50 p-4 sm:p-6 md:p-8 dark:from-stone-900 dark:via-amber-950/30 dark:to-stone-900">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-stone-800 drop-shadow-sm sm:text-4xl md:text-5xl dark:text-stone-100">
          觸感小宇宙
        </h1>
        <p className="mt-1 text-base font-medium text-stone-500 sm:text-lg dark:text-stone-400">
          Touch Cosmos
        </p>
        <p className="mt-2 text-lg font-medium text-stone-600 sm:text-lg dark:text-stone-300">
          點選下方卡片，進入模式後點擊或按壓畫面觸發特效
        </p>
      </header>
      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {GAME_MODES.map((mode) => (
          <ModeCard key={mode.id} mode={mode} />
        ))}
      </section>
    </main>
  );
}
