import ModeCard from "@/components/ModeCard";
import DecorativeDots from "@/components/DecorativeDots";
import { GAME_MODES } from "@/lib/constants";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-gradient-to-br from-rose-50 via-amber-50 to-orange-100 p-4 sm:p-6 md:p-8 dark:from-stone-900 dark:via-rose-950/20 dark:to-amber-950/30">
      <DecorativeDots />
      <header className="relative z-10 mb-8 text-center">
        <h1 className="text-3xl font-bold text-stone-800 drop-shadow-sm sm:text-4xl md:text-5xl dark:text-stone-100">
          電幻1號所
        </h1>
        <p className="mt-1 text-base font-medium text-stone-500 sm:text-lg dark:text-stone-400">
          Energym
        </p>
        <p className="mt-2 text-lg font-medium text-stone-600 sm:text-lg dark:text-stone-300">
          點選下方卡片，進入遊戲 — 水力、風力、光伏、波浪、地熱
        </p>
      </header>
      <section className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {GAME_MODES.map((mode, index) => (
          <ModeCard key={mode.id} mode={mode} staggerIndex={index} />
        ))}
      </section>
    </main>
  );
}
