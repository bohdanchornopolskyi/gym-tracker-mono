import type {
  Doc,
  Id,
} from "@gym-tracker-mono/backend/convex/_generated/dataModel";

export type Exercise = Doc<"exercises">;
export type Set = Doc<"sets">;

export type SetInput = {
  exerciseId: Id<"exercises">;
  setNumber: number;
  reps: number;
  weight: number;
  restTime?: number;
};

export type WorkoutExercise = {
  exercise: Exercise;
  sets: SetInput[];
};
