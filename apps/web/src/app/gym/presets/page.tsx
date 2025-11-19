"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { api } from "@gym-tracker-mono/backend/convex/_generated/api";
import { Id } from "@gym-tracker-mono/backend/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { ChevronDown, ChevronUp, Edit, Trash2, Play } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PresetsPage() {
  const router = useRouter();
  const [expandedPreset, setExpandedPreset] =
    useState<Id<"workoutPresets"> | null>(null);
  const presets = useQuery(api.workoutPresets.list, {});
  const deletePreset = useMutation(api.workoutPresets.remove);

  const handleDelete = async (presetId: Id<"workoutPresets">) => {
    if (confirm("Are you sure you want to delete this preset?")) {
      await deletePreset({ presetId });
      if (expandedPreset === presetId) {
        setExpandedPreset(null);
      }
    }
  };

  const handleUsePreset = (presetId: Id<"workoutPresets">) => {
    router.push(`/gym/workout/new?preset=${presetId}`);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Workout Presets</h1>
          <p className="text-sm text-muted-foreground">
            Save and reuse your favorite workout templates
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="mx-auto max-w-4xl">
          {!presets || presets.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No presets yet. Save a workout as a preset to get started.
              </CardContent>
            </Card>
          ) : (
            <ScrollArea className="h-[calc(100vh-10rem)]">
              <div className="space-y-3">
                {presets.map((preset) => (
                  <PresetCard
                    key={preset._id}
                    presetId={preset._id}
                    name={preset.name}
                    notes={preset.notes}
                    exerciseCount={preset.exercises.length}
                    totalSets={preset.exercises.reduce(
                      (sum, ex) => sum + ex.sets.length,
                      0,
                    )}
                    isExpanded={expandedPreset === preset._id}
                    onToggle={() =>
                      setExpandedPreset(
                        expandedPreset === preset._id ? null : preset._id,
                      )
                    }
                    onDelete={() => handleDelete(preset._id)}
                    onUse={() => handleUsePreset(preset._id)}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </div>
    </div>
  );
}

function PresetCard({
  presetId,
  name,
  notes,
  exerciseCount,
  totalSets,
  isExpanded,
  onToggle,
  onDelete,
  onUse,
}: {
  presetId: Id<"workoutPresets">;
  name: string;
  notes?: string;
  exerciseCount: number;
  totalSets: number;
  isExpanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onUse: () => void;
}) {
  const presetDetails = useQuery(
    api.workoutPresets.get,
    isExpanded ? { presetId } : "skip",
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base">{name}</CardTitle>
            <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
              <span>
                {exerciseCount} Exercise{exerciseCount !== 1 ? "s" : ""} •{" "}
                {totalSets} Set{totalSets !== 1 ? "s" : ""}
              </span>
            </div>
            {notes && (
              <CardDescription className="mt-1">{notes}</CardDescription>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={onUse}>
              <Play className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <a href={`/gym/presets/edit/${presetId}`}>
                <Edit className="h-4 w-4" />
              </a>
            </Button>
            <Button variant="ghost" size="icon" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onToggle}>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && presetDetails && (
        <CardContent>
          <Separator className="mb-4" />
          <div className="space-y-4">
            {presetDetails.exercises.map((presetExercise) => {
              const exercise = presetDetails.exerciseDetails?.find(
                (e) => e._id === presetExercise.exerciseId,
              );
              if (!exercise) return null;

              return (
                <div key={presetExercise.exerciseId}>
                  <div className="mb-2 flex items-center gap-2">
                    <h3 className="font-semibold">{exercise.name}</h3>
                    <Badge variant="secondary">{exercise.category}</Badge>
                  </div>
                  <div className="space-y-1">
                    {presetExercise.sets.map((set, setIdx) => (
                      <div
                        key={setIdx}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <span className="w-12">Set {setIdx + 1}</span>
                        <span>
                          {set.reps} reps × {set.weight} kg
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
