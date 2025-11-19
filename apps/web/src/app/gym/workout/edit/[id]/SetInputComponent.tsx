import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Id } from "@gym-tracker-mono/backend/convex/_generated/dataModel";
import { SetInput } from "@/types";
import { ChevronDown, ChevronUp, Minus } from "lucide-react";

interface SetInputComponentProps {
  set: SetInput;
  setIndex: number;
  exerciseId: Id<"exercises">;
  totalSets: number;
  onUpdateField: (
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
  onRemoveSet: (exerciseId: Id<"exercises">, setIndex: number) => void;
}

export default function SetInputComponent({
  set,
  setIndex,
  exerciseId,
  totalSets,
  onUpdateField,
  onIncrementValue,
  onRemoveSet,
}: SetInputComponentProps) {
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="w-12 text-sm font-medium">Set {setIndex + 1}</span>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onIncrementValue(exerciseId, setIndex, "reps", -1)}
          >
            <ChevronDown className="h-3 w-3" />
          </Button>
          <Input
            type="number"
            className="h-8 w-14 sm:w-16 text-center"
            value={set.reps}
            onChange={(e) =>
              onUpdateField(
                exerciseId,
                setIndex,
                "reps",
                parseInt(e.target.value) || 0,
              )
            }
          />
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onIncrementValue(exerciseId, setIndex, "reps", 1)}
          >
            <ChevronUp className="h-3 w-3" />
          </Button>
          <span className="text-sm">reps</span>
        </div>

        <span className="text-muted-foreground">×</span>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() =>
              onIncrementValue(exerciseId, setIndex, "weight", -2.5)
            }
          >
            <ChevronDown className="h-3 w-3" />
          </Button>
          <Input
            type="number"
            step="0.5"
            className="h-8 w-16 sm:w-20 text-center"
            value={set.weight}
            onChange={(e) =>
              onUpdateField(
                exerciseId,
                setIndex,
                "weight",
                parseFloat(e.target.value) || 0,
              )
            }
          />
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() =>
              onIncrementValue(exerciseId, setIndex, "weight", 2.5)
            }
          >
            <ChevronUp className="h-3 w-3" />
          </Button>
          <span className="text-sm">kg</span>
        </div>

        {totalSets > 1 && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onRemoveSet(exerciseId, setIndex)}
          >
            <Minus className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
