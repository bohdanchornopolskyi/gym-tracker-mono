import type { Id } from "@gym-tracker-mono/backend/convex/_generated/dataModel";
import EditWorkoutClient from "@/app/gym/workout/edit/[id]/EditWorkoutClient";

export default async function EditWorkoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const workoutId = id as Id<"workouts">;

  return <EditWorkoutClient workoutId={workoutId} />;
}
