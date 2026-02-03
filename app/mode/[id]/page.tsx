import { notFound } from "next/navigation";
import { getModeById, isValidModeId } from "@/lib/constants";
import ModePageClient from "./ModePageClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ModePage({ params }: PageProps) {
  const { id } = await params;
  const modeId = parseInt(id, 10);
  if (!id || isNaN(modeId) || !isValidModeId(modeId)) {
    notFound();
  }
  const mode = getModeById(modeId);
  if (!mode) notFound();

  return <ModePageClient modeId={modeId} mode={mode} />;
}
