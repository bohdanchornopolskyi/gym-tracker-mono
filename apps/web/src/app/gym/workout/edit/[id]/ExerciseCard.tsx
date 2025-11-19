import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Id } from "@gym-tracker-mono/backend/convex/_generated/dataModel";
import { Exercise, SetInput } from "@/types";
import { Plus, Trash2 } from "lucide-react";
import SetInputComponent from "./SetInputComponent";

type WorkoutExercise = {
  exercise: Exercise;
  sets: SetInput[];
};

interface ExerciseCardProps {
  workoutExercise: WorkoutExercise;
  onAddSet: (exerciseId: Id<"exercises">) => void;
  onRemoveSet: (exerciseId: Id<"exercises">, setIndex: number) => void;
  onRemoveExercise: (exerciseId: Id<"exercises">) => void;
  onUpdateSetField: (
    exerciseId: Id<"exercises">,
    setIndex: number,
    field: "reps" | "weight" | "restTime",
    value: number,
  ) => void;
  onIncrementValue: (
    exerciseId: Id<"exercises">,
    setIndex: number,
    field: "reps" | "weight",
    increment: number,
  ) => void;
}

export default function ExerciseCard({
  workoutExercise,
  onAddSet,
  onRemoveSet,
  onRemoveExercise,
  onUpdateSetField,
  onIncrementValue,
}: ExerciseCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{workoutExercise.exercise.name}</CardTitle>
            <CardDescription>
              <Badge variant="secondary" className="mt-1">
                {workoutExercise.exercise.category}
              </Badge>
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemoveExercise(workoutExercise.exercise._id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {workoutExercise.sets.map((set, idx) => (
            <SetInputComponent
              key={idx}
              set={set}
              setIndex={idx}
              exerciseId={workoutExercise.exercise._id}
              totalSets={workoutExercise.sets.length}
              onUpdateField={onUpdateSetField}
              onIncrementValue={onIncrementValue}
              onRemoveSet={onRemoveSet}
            />
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAddSet(workoutExercise.exercise._id)}
            className="w-full"
          >
            <Plus className="mr-2 h-3 w-3" />
            Add Set
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
