import { Id } from "@gym-tracker-mono/backend/convex/_generated/dataModel";
import EditPresetClient from "@/app/gym/presets/edit/[id]/EditPresetClient";

export default async function EditPresetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const presetId = id as Id<"workoutPresets">;

  return <EditPresetClient presetId={presetId} />;
}

