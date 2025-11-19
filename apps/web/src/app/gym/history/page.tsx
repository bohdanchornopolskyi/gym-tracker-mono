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
import { useMutation, useQuery } from "convex/react";
import { ChevronDown, ChevronUp, Edit, Trash2, BookOpen } from "lucide-react";
import { useState } from "react";

export default function HistoryPage() {
  const [expandedWorkout, setExpandedWorkout] = useState<Id<"workouts"> | null>(
    null,
  );
  const workouts = useQuery(api.workouts.list, {});
  const deleteWorkout = useMutation(api.workouts.remove);

  const handleDelete = async (workoutId: Id<"workouts">) => {
    if (confirm("Are you sure you want to delete this workout?")) {
      await deleteWorkout({ workoutId });
      if (expandedWorkout === workoutId) {
        setExpandedWorkout(null);
      }
    }
  };

  const groupedWorkouts = workouts?.reduce(
    (groups, workout) => {
      const date = new Date(workout.date).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(workout);
      return groups;
    },
    {} as Record<string, typeof workouts>,
  );

  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Workout History</h1>
          <p className="text-sm text-muted-foreground">
            View and manage your past workouts
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="mx-auto max-w-4xl">
          {!workouts || workouts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No workouts yet. Start logging your workouts to see them here.
              </CardContent>
            </Card>
          ) : (
            <ScrollArea className="h-[calc(100vh-10rem)]">
              <div className="space-y-6">
                {Object.entries(groupedWorkouts || {}).map(
                  ([date, dateWorkouts]) => (
                    <div key={date}>
                      <h2 className="mb-3 text-lg font-semibold">{date}</h2>
                      <div className="space-y-3">
                        {dateWorkouts.map((workout) => (
                          <WorkoutCard
                            key={workout._id}
                            workoutId={workout._id}
                            notes={workout.notes}
                            isExpanded={expandedWorkout === workout._id}
                            onToggle={() =>
                              setExpandedWorkout(
                                expandedWorkout === workout._id
                                  ? null
                                  : workout._id,
                              )
                            }
                            onDelete={() => handleDelete(workout._id)}
                          />
                        ))}
                      </div>
                    </div>
                  ),
                )}
              </div>
            </ScrollArea>
          )}
        </div>
      </div>
    </div>
  );
}

function WorkoutCard({
  workoutId,
  notes,
  isExpanded,
  onToggle,
  onDelete,
}: {
  workoutId: Id<"workouts">;
  notes?: string;
  isExpanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const [presetDialogOpen, setPresetDialogOpen] = useState(false);
  const [presetName, setPresetName] = useState("");
  const workoutStats = useQuery(api.workouts.getStats, { workoutId });
  const workoutDetails = useQuery(
    api.workouts.get,
    isExpanded ? { workoutId } : "skip",
  );
  const createPreset = useMutation(api.workoutPresets.createFromWorkout);

  const handleSaveAsPreset = async () => {
    if (!presetName.trim()) {
      return;
    }
    await createPreset({
      workoutId,
      name: presetName.trim(),
    });
    setPresetName("");
    setPresetDialogOpen(false);
  };

  const exerciseGroups = workoutDetails?.sets.reduce(
    (groups, set) => {
      const exerciseId = set.exerciseId;
      if (!groups[exerciseId]) {
        groups[exerciseId] = [];
      }
      groups[exerciseId].push(set);
      return groups;
    },
    {} as Record<string, typeof workoutDetails.sets>,
  );

  const uniqueExercises = workoutStats?.exerciseCount || 0;
  const totalSets = workoutStats?.setCount || 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">
                {uniqueExercises} Exercise{uniqueExercises !== 1 ? "s" : ""} •{" "}
                {totalSets} Set
                {totalSets !== 1 ? "s" : ""}
              </CardTitle>
            </div>
            {notes && (
              <CardDescription className="mt-1">{notes}</CardDescription>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" asChild>
              <a href={`/gym/workout/edit/${workoutId}`}>
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

      {isExpanded && workoutDetails && (
        <CardContent>
          <Separator className="mb-4" />
          <div className="mb-4 flex justify-end">
            <Dialog open={presetDialogOpen} onOpenChange={setPresetDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Save as Preset
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Save Workout as Preset</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="preset-name">Preset Name</Label>
                    <Input
                      id="preset-name"
                      placeholder="Enter preset name"
                      value={presetName}
                      onChange={(e) => setPresetName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSaveAsPreset();
                        }
                      }}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setPresetDialogOpen(false);
                        setPresetName("");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveAsPreset}
                      disabled={!presetName.trim()}
                    >
                      Save Preset
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="space-y-4">
            {Object.entries(exerciseGroups || {}).map(([exerciseId, sets]) => {
              const exercise = workoutDetails.exercises.find(
                (e) => e._id === exerciseId,
              );
              if (!exercise) return null;

              return (
                <div key={exerciseId}>
                  <div className="mb-2 flex items-center gap-2">
                    <h3 className="font-semibold">{exercise.name}</h3>
                    <Badge variant="secondary">{exercise.category}</Badge>
                  </div>
                  <div className="space-y-1">
                    {sets
                      .sort((a, b) => a.setNumber - b.setNumber)
                      .map((set) => (
                        <div
                          key={set._id}
                          className="flex items-center gap-2 text-sm text-muted-foreground"
                        >
                          <span className="w-12">Set {set.setNumber}</span>
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
