"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@gym-tracker-mono/backend/convex/_generated/api";
import { Id } from "@gym-tracker-mono/backend/convex/_generated/dataModel";
import { Exercise, SetInput } from "@/types";
import { useMutation, useQuery } from "convex/react";
import { Plus, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ExerciseSelector from "@/app/gym/workout/edit/[id]/ExerciseSelector";
import ExerciseCard from "@/app/gym/workout/edit/[id]/ExerciseCard";

type PresetExercise = {
  exercise: Exercise;
  sets: Array<{
    reps: number;
    weight: number;
    restTime?: number;
  }>;
};

interface EditPresetClientProps {
  presetId: Id<"workoutPresets">;
}

export default function EditPresetClient({
  presetId,
}: EditPresetClientProps) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [presetExercises, setPresetExercises] = useState<PresetExercise[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const preset = useQuery(api.workoutPresets.get, { presetId });
  const exercises = useQuery(api.exercises.list, {});
  const updatePreset = useMutation(api.workoutPresets.update);

  useEffect(() => {
    if (preset) {
      setName(preset.name);
      setNotes(preset.notes || "");

      const presetExercisesData: PresetExercise[] = [];
      for (const presetExercise of preset.exercises) {
        const exercise = preset.exerciseDetails?.find(
          (e) => e._id === presetExercise.exerciseId,
        );
        if (exercise) {
          presetExercisesData.push({
            exercise,
            sets: presetExercise.sets.map((set) => ({
              reps: set.reps,
              weight: set.weight,
              restTime: set.restTime,
            })),
          });
        }
      }

      setPresetExercises(presetExercisesData);
    }
  }, [preset]);

  const addExercise = (exercise: Exercise) => {
    if (presetExercises.find((pe) => pe.exercise._id === exercise._id)) {
      return;
    }

    setPresetExercises([
      ...presetExercises,
      {
        exercise,
        sets: [
          {
            reps: 10,
            weight: 0,
          },
        ],
      },
    ]);
    setDialogOpen(false);
  };

  const addSet = (exerciseId: Id<"exercises">) => {
    setPresetExercises(
      presetExercises.map((pe) => {
        if (pe.exercise._id === exerciseId) {
          const lastSet = pe.sets[pe.sets.length - 1];
          return {
            ...pe,
            sets: [
              ...pe.sets,
              {
                reps: lastSet?.reps || 10,
                weight: lastSet?.weight || 0,
              },
            ],
          };
        }
        return pe;
      }),
    );
  };

  const removeSet = (exerciseId: Id<"exercises">, setIndex: number) => {
    setPresetExercises(
      presetExercises.map((pe) => {
        if (pe.exercise._id === exerciseId) {
          return {
            ...pe,
            sets: pe.sets.filter((_, idx) => idx !== setIndex),
          };
        }
        return pe;
      }),
    );
  };

  const removeExercise = (exerciseId: Id<"exercises">) => {
    setPresetExercises(
      presetExercises.filter((pe) => pe.exercise._id !== exerciseId),
    );
  };

  const updateSetField = (
    exerciseId: Id<"exercises">,
    setIndex: number,
    field: "reps" | "weight" | "restTime",
    value: number,
  ) => {
    setPresetExercises(
      presetExercises.map((pe) => {
        if (pe.exercise._id === exerciseId) {
          return {
            ...pe,
            sets: pe.sets.map((s, idx) =>
              idx === setIndex ? { ...s, [field]: value } : s,
            ),
          };
        }
        return pe;
      }),
    );
  };

  const incrementValue = (
    exerciseId: Id<"exercises">,
    setIndex: number,
    field: "reps" | "weight",
    increment: number,
  ) => {
    setPresetExercises(
      presetExercises.map((pe) => {
        if (pe.exercise._id === exerciseId) {
          return {
            ...pe,
            sets: pe.sets.map((s, idx) =>
              idx === setIndex
                ? { ...s, [field]: Math.max(0, s[field] + increment) }
                : s,
            ),
          };
        }
        return pe;
      }),
    );
  };

  const savePreset = async () => {
    if (presetExercises.length === 0) {
      return;
    }

    setIsSaving(true);
    try {
      await updatePreset({
        presetId,
        name,
        notes: notes || undefined,
        exercises: presetExercises.map((pe) => ({
          exerciseId: pe.exercise._id,
          sets: pe.sets,
        })),
      });

      router.push("/gym/presets");
    } finally {
      setIsSaving(false);
    }
  };

  if (!preset) {
    return <div className="text-center text-muted-foreground">Loading...</div>;
  }

  const workoutExercises: Array<{
    exercise: Exercise;
    sets: SetInput[];
  }> = presetExercises.map((pe) => ({
    exercise: pe.exercise,
    sets: pe.sets.map((set, idx) => ({
      exerciseId: pe.exercise._id,
      setNumber: idx + 1,
      reps: set.reps,
      weight: set.weight,
      restTime: set.restTime,
    })),
  }));

  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Edit Preset</h1>
            <p className="text-sm text-muted-foreground">
              Modify your workout preset
            </p>
          </div>
          <Button onClick={savePreset} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="mx-auto max-w-4xl space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Preset Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Preset name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Input
                  id="notes"
                  placeholder="Default notes for this preset"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

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

          {presetExercises.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              No exercises added. Click &quot;Add Exercise&quot; to get started.
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

