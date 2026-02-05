"use client";

import dynamic from "next/dynamic";
import type { GameMode } from "@/lib/constants";

const HydroJumpGame = dynamic(() => import("@/components/games/HydroJumpGame"), { ssr: false });
const WindDancingGame = dynamic(() => import("@/components/games/WindDancingGame"), { ssr: false });
const SolarShootingGame = dynamic(() => import("@/components/games/SolarShootingGame"), { ssr: false });
const WaveBattlingGame = dynamic(() => import("@/components/games/WaveBattlingGame"), { ssr: false });
const GeothermalTurningGame = dynamic(() => import("@/components/games/GeothermalTurningGame"), { ssr: false });

interface ModePageClientProps {
  modeId: number;
  mode: GameMode;
}

const GAME_COMPONENTS: Record<number, React.ComponentType<{ mode: GameMode }>> = {
  1: HydroJumpGame,
  2: WindDancingGame,
  3: SolarShootingGame,
  4: WaveBattlingGame,
  5: GeothermalTurningGame,
};

export default function ModePageClient({ modeId, mode }: ModePageClientProps) {
  const GameComponent = GAME_COMPONENTS[modeId];
  if (!GameComponent) return null;
  return <GameComponent mode={mode} />;
}
