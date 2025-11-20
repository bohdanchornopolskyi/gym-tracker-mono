import type {
  Doc,
  Id,
} from "@gym-tracker-mono/backend/convex/_generated/dataModel";

export type Exercise = Doc<"exercises">;
export type Workout = Doc<"workouts">;
export type Set = Doc<"sets">;
export type WorkoutPreset = Doc<"workoutPresets">;

export type ExerciseCategory =
  | "Chest"
  | "Back"
  | "Legs"
  | "Shoulders"
  | "Arms"
  | "Core";

export type WorkoutWithDetails = Workout & {
  sets: Set[];
  exercises: Exercise[];
};

export type SetInput = {
  exerciseId: Id<"exercises">;
  setNumber: number;
  reps: number;
  weight: number;
  restTime?: number;
};
