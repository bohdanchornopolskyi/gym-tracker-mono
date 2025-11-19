"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { api } from "@gym-tracker-mono/backend/convex/_generated/api";
import { Id } from "@gym-tracker-mono/backend/convex/_generated/dataModel";
import { Exercise, SetInput } from "@/types";
import { useMutation, useQuery } from "convex/react";
import { Plus, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ExerciseSelector from "@/app/gym/workout/edit/[id]/ExerciseSelector";
import ExerciseCard from "@/app/gym/workout/edit/[id]/ExerciseCard";
import WorkoutDetailsCard from "@/app/gym/workout/edit/[id]/WorkoutDetailsCard";

type WorkoutExercise = {
  exercise: Exercise;
  sets: SetInput[];
};

interface EditWorkoutClientProps {
  workoutId: Id<"workouts">;
}

export default function EditWorkoutClient({
  workoutId,
}: EditWorkoutClientProps) {
  const router = useRouter();

  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>(
    [],
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const workout = useQuery(api.workouts.get, { workoutId });
  const exercises = useQuery(api.exercises.list, {});
  const updateWorkout = useMutation(api.workouts.update);
  const createSet = useMutation(api.sets.create);
  const updateSet = useMutation(api.sets.update);
  const removeSetMutation = useMutation(api.sets.remove);

  useEffect(() => {
    if (workout) {
      setDate(new Date(workout.date).toISOString().split("T")[0]);
      setNotes(workout.notes || "");

      const exerciseGroups = workout.sets.reduce(
        (groups, set) => {
          const exerciseId = set.exerciseId;
          if (!groups[exerciseId]) {
            groups[exerciseId] = [];
          }
          groups[exerciseId].push(set);
          return groups;
        },
        {} as Record<string, typeof workout.sets>,
      );

      const workoutExercisesData: WorkoutExercise[] = [];
      for (const [exerciseId, sets] of Object.entries(exerciseGroups)) {
        const exercise = workout.exercises.find((e) => e._id === exerciseId);
        if (exercise) {
          workoutExercisesData.push({
            exercise,
            sets: sets.map((set) => ({
              exerciseId: set.exerciseId,
              setNumber: set.setNumber,
              reps: set.reps,
              weight: set.weight,
              restTime: set.restTime,
            })),
          });
        }
      }

      setWorkoutExercises(workoutExercisesData);
    }
  }, [workout]);

  const addExercise = (exercise: Exercise) => {
    if (workoutExercises.find((we) => we.exercise._id === exercise._id)) {
      return;
    }

    setWorkoutExercises([
      ...workoutExercises,
      {
        exercise,
        sets: [
          {
            exerciseId: exercise._id,
            setNumber: 1,
            reps: 10,
            weight: 0,
          },
        ],
      },
    ]);
    setDialogOpen(false);
  };

  const addSet = (exerciseId: Id<"exercises">) => {
    setWorkoutExercises(
      workoutExercises.map((we) => {
        if (we.exercise._id === exerciseId) {
          const lastSet = we.sets[we.sets.length - 1];
          return {
            ...we,
            sets: [
              ...we.sets,
              {
                exerciseId,
                setNumber: we.sets.length + 1,
                reps: lastSet?.reps || 10,
                weight: lastSet?.weight || 0,
              },
            ],
          };
        }
        return we;
      }),
    );
  };

  const removeSet = (exerciseId: Id<"exercises">, setIndex: number) => {
    setWorkoutExercises(
      workoutExercises.map((we) => {
        if (we.exercise._id === exerciseId) {
          const newSets = we.sets.filter((_, idx) => idx !== setIndex);
          return {
            ...we,
            sets: newSets.map((s, idx) => ({ ...s, setNumber: idx + 1 })),
          };
        }
        return we;
      }),
    );
  };

  const removeExercise = (exerciseId: Id<"exercises">) => {
    setWorkoutExercises(
      workoutExercises.filter((we) => we.exercise._id !== exerciseId),
    );
  };

  const updateSetField = (
    exerciseId: Id<"exercises">,
    setIndex: number,
    field: "reps" | "weight" | "restTime",
    value: number,
  ) => {
    setWorkoutExercises(
      workoutExercises.map((we) => {
        if (we.exercise._id === exerciseId) {
          return {
            ...we,
            sets: we.sets.map((s, idx) =>
              idx === setIndex ? { ...s, [field]: value } : s,
            ),
          };
        }
        return we;
      }),
    );
  };

  const incrementValue = (
    exerciseId: Id<"exercises">,
    setIndex: number,
    field: "reps" | "weight",
    increment: number,
  ) => {
    setWorkoutExercises(
      workoutExercises.map((we) => {
        if (we.exercise._id === exerciseId) {
          return {
            ...we,
            sets: we.sets.map((s, idx) =>
              idx === setIndex
                ? { ...s, [field]: Math.max(0, s[field] + increment) }
                : s,
            ),
          };
        }
        return we;
      }),
    );
  };

  const saveWorkout = async () => {
    setIsSaving(true);
    try {
      await updateWorkout({
        workoutId,
        date: new Date(date).getTime(),
        notes: notes || undefined,
      });

      const existingSets = workout?.sets || [];
      const newSets: SetInput[] = [];

      for (const we of workoutExercises) {
        for (const set of we.sets) {
          newSets.push(set);
        }
      }

      for (const existingSet of existingSets) {
        const matchingNewSet = newSets.find(
          (ns) =>
            ns.exerciseId === existingSet.exerciseId &&
            ns.setNumber === existingSet.setNumber,
        );

        if (matchingNewSet) {
          await updateSet({
            setId: existingSet._id,
            reps: matchingNewSet.reps,
            weight: matchingNewSet.weight,
            restTime: matchingNewSet.restTime,
          });
        } else {
          await removeSetMutation({ setId: existingSet._id });
        }
      }

      for (const newSet of newSets) {
        const existingSet = existingSets.find(
          (es) =>
            es.exerciseId === newSet.exerciseId &&
            es.setNumber === newSet.setNumber,
        );

        if (!existingSet) {
          await createSet({
            workoutId,
            ...newSet,
          });
        }
      }

      router.push("/gym/history");
    } finally {
      setIsSaving(false);
    }
  };

  if (!workout) {
    return <div className="text-center text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Edit Workout</h1>
            <p className="text-sm text-muted-foreground">
              Modify your workout details
            </p>
          </div>
          <Button onClick={saveWorkout} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="mx-auto max-w-4xl space-y-4">
          <WorkoutDetailsCard
            date={date}
            notes={notes}
            onDateChange={setDate}
            onNotesChange={setNotes}
          />

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold">Exercises</h2>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Exercise
                </Button>
              </DialogTrigger>
              <DialogContent className="w-full sm:max-w-3xl h-full sm:h-auto">
                <DialogHeader>
                  <DialogTitle>Select Exercise</DialogTitle>
                </DialogHeader>
                <ExerciseSelector
                  exercises={exercises}
                  onSelect={addExercise}
                />
              </DialogContent>
            </Dialog>
          </div>

          {workoutExercises.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              No exercises added. Click &quotAdd Exercise&quot to get started.
            </div>
          ) : (
            <div className="space-y-4">
              {workoutExercises.map((we) => (
                <ExerciseCard
                  key={we.exercise._id}
                  workoutExercise={we}
                  onAddSet={addSet}
                  onRemoveSet={removeSet}
                  onRemoveExercise={removeExercise}
                  onUpdateSetField={updateSetField}
                  onIncrementValue={incrementValue}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
