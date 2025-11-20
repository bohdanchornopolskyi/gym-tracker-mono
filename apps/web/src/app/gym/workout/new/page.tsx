"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { api } from "@gym-tracker-mono/backend/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { Calendar, Dumbbell, Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import React from "react";

export default function NewWorkoutPage({
  searchParams,
}: {
  searchParams: Promise<{ preset?: string }>
}) {
  const router = useRouter();
  const [date, setDate] = useState<Date>(new Date());
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const presets = useQuery(api.workoutPresets.list, {});

  const { preset } = React.use(searchParams);

  useEffect(() => {
    if (preset && presets) {
      const presetExists = presets.some((p) => p._id === preset);
      if (presetExists) {
        setSelectedPresetId(preset);
      }
    }
  }, [preset, presets]);
  const createWorkout = useMutation(api.workouts.create);
  const createSet = useMutation(api.sets.create);

  const handleStartWorkout = async () => {
    setIsSaving(true);
    try {
      const workoutId = await createWorkout({
        date: date.getTime(),
        presetId:
          selectedPresetId && selectedPresetId !== "empty"
            ? (selectedPresetId as any)
            : undefined,
      });

      if (selectedPresetId && selectedPresetId !== "empty" && presets) {
        const selectedPreset = presets.find((p) => p._id === selectedPresetId);
        if (selectedPreset) {
          for (const exercise of selectedPreset.exercises) {
            for (const [idx, set] of exercise.sets.entries()) {
              await createSet({
                workoutId,
                exerciseId: exercise.exerciseId,
                setNumber: idx + 1,
                reps: set.reps,
                weight: set.weight,
                restTime: set.restTime,
              });
            }
          }
        }
      }

      router.push(`/gym/workout/edit/${workoutId}`);
    } catch (error) {
      console.error("Failed to create workout:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="border-b p-4">
        <h1 className="text-2xl font-bold">New Workout</h1>
        <p className="text-sm text-muted-foreground">
          Select a date and a preset to get started
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-3xl space-y-8 p-4">
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Calendar className="h-4 w-4" />
              </div>
              <h2 className="text-lg font-semibold">When?</h2>
            </div>
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <Label className="w-24">
                    Date
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "max-w-xs justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={date}
                        onSelect={(newDate) => newDate && setDate(newDate)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </CardContent>
            </Card>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Dumbbell className="h-4 w-4" />
              </div>
              <h2 className="text-lg font-semibold">What are we doing?</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Card
                className={cn(
                  "cursor-pointer transition-all hover:border-primary hover:bg-accent/50",
                  selectedPresetId === "empty" && "border-primary bg-primary/5 ring-1 ring-primary"
                )}
                onClick={() => setSelectedPresetId("empty")}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Plus className="h-4 w-4" />
                    Empty Workout
                  </CardTitle>
                  <CardDescription>
                    Start from scratch without any exercises
                  </CardDescription>
                </CardHeader>
              </Card>

              {presets?.map((preset) => (
                <Card
                  key={preset._id}
                  className={cn(
                    "cursor-pointer transition-all hover:border-primary hover:bg-accent/50",
                    selectedPresetId === preset._id && "border-primary bg-primary/5 ring-1 ring-primary"
                  )}
                  onClick={() => setSelectedPresetId(preset._id)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base truncate pr-2">
                        {preset.name}
                      </CardTitle>
                      {preset.exercises.length > 0 && (
                        <Badge variant="secondary" className="shrink-0">
                          {preset.exercises.length} Exercises
                        </Badge>
                      )}
                    </div>
                    {preset.notes && (
                      <CardDescription className="line-clamp-2">
                        {preset.notes}
                      </CardDescription>
                    )}
                    {!preset.notes && (
                      <CardDescription>
                         {preset.exercises.reduce((acc, ex) => acc + ex.sets.length, 0)} Sets Total
                      </CardDescription>
                    )}
                  </CardHeader>
                </Card>
              ))}
            </div>

            {!presets && (
               <div className="flex justify-center py-8">
                 <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
               </div>
            )}
          </section>
        </div>
      </ScrollArea>

      <div className="border-t bg-background p-4">
        <div className="mx-auto max-w-3xl">
          <Button
            size="lg"
            className="w-full sm:w-auto"
            disabled={!selectedPresetId || isSaving}
            onClick={handleStartWorkout}
          >
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSaving ? "Creating..." : "Start Workout"}
          </Button>
        </div>
      </div>
    </div>
  );
}
