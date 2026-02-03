"use client";

import dynamic from "next/dynamic";

const RippleEffect = dynamic(() => import("@/components/effects/RippleEffect"), { ssr: false });
const ParticleBurst = dynamic(() => import("@/components/effects/ParticleBurst"), { ssr: false });
const BubblePop = dynamic(() => import("@/components/effects/BubblePop"), { ssr: false });
const StarField = dynamic(() => import("@/components/effects/StarField"), { ssr: false });
const InkBlot = dynamic(() => import("@/components/effects/InkBlot"), { ssr: false });
const GlassCrack = dynamic(() => import("@/components/effects/GlassCrack"), { ssr: false });
const PetalFall = dynamic(() => import("@/components/effects/PetalFall"), { ssr: false });
const RainbowHalo = dynamic(() => import("@/components/effects/RainbowHalo"), { ssr: false });
const GeometrySpread = dynamic(() => import("@/components/effects/GeometrySpread"), { ssr: false });
const Firefly = dynamic(() => import("@/components/effects/Firefly"), { ssr: false });
const Snowflake = dynamic(() => import("@/components/effects/Snowflake"), { ssr: false });
const JellyDeform = dynamic(() => import("@/components/effects/JellyDeform"), { ssr: false });
const SoundWave = dynamic(() => import("@/components/effects/SoundWave"), { ssr: false });
const Doodle = dynamic(() => import("@/components/effects/Doodle"), { ssr: false });
const BubbleRise = dynamic(() => import("@/components/effects/BubbleRise"), { ssr: false });
const CustomEffect = dynamic(() => import("@/components/effects/CustomEffect"), { ssr: false });

export interface EffectParams {
  params?: Record<string, number | string>;
}

const EFFECTS: Record<number, React.ComponentType<EffectParams>> = {
  1: RippleEffect,
  2: ParticleBurst,
  3: BubblePop,
  4: StarField,
  5: InkBlot,
  6: GlassCrack,
  7: PetalFall,
  8: RainbowHalo,
  9: GeometrySpread,
  10: Firefly,
  11: Snowflake,
  12: JellyDeform,
  13: SoundWave,
  14: Doodle,
  15: BubbleRise,
  16: CustomEffect,
};

interface EffectRendererProps {
  modeId: number;
  params?: Record<string, number | string>;
}

export default function EffectRenderer({ modeId, params }: EffectRendererProps) {
  const Effect = EFFECTS[modeId];
  if (!Effect) return null;
  return <Effect params={params} />;
}
