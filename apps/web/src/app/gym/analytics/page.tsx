"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@gym-tracker-mono/backend/convex/_generated/api";
import type { Id } from "@gym-tracker-mono/backend/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { Activity, Dumbbell, Target } from "lucide-react";
import { useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function AnalyticsPage() {
  const [selectedExercise, setSelectedExercise] =
    useState<Id<"exercises"> | null>(null);
  const exercises = useQuery(api.exercises.list, {});
  const stats = useQuery(api.workouts.stats);
  const workoutFrequency = useQuery(api.analytics.workoutFrequency, {});
  const exerciseProgress = useQuery(
    api.analytics.exerciseProgress,
    selectedExercise ? { exerciseId: selectedExercise } : "skip",
  );

  const selectedExerciseData = exercises?.find(
    (e) => e._id === selectedExercise,
  );

  const chartData = exerciseProgress?.map((p) => ({
    date: new Date(p.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    weight: p.maxWeight,
    volume: p.totalVolume,
    sets: p.sets,
  }));

  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return date.toISOString().split("T")[0];
  });

  const heatmapData = last30Days.map((date) => {
    const count = workoutFrequency?.find((w) => w.date === date)?.count || 0;
    return { date, count };
  });

  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Track your progress and performance
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Workouts
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.totalWorkouts || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Sets
                </CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.totalSets || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Favorite Exercises
                </CardTitle>
                <Dumbbell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {stats?.favoriteExercises.slice(0, 3).map((ex) => (
                    <Badge key={ex._id} variant="secondary" className="text-xs">
                      {"name" in ex ? ex.name : "Unknown"}
                    </Badge>
                  )) || (
                    <span className="text-sm text-muted-foreground">
                      No data yet
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Exercise Progress</CardTitle>
              <CardDescription>
                Track weight and volume over time
              </CardDescription>
              <div className="pt-4">
                <Select
                  value={selectedExercise || ""}
                  onValueChange={(value) =>
                    setSelectedExercise(value as Id<"exercises">)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an exercise" />
                  </SelectTrigger>
                  <SelectContent>
                    {exercises?.map((exercise) => (
                      <SelectItem key={exercise._id} value={exercise._id}>
                        {exercise.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {!selectedExercise ? (
                <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                  Select an exercise to view progress
                </div>
              ) : chartData && chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="weight"
                      stroke="#8884d8"
                      name="Max Weight (kg)"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="volume"
                      stroke="#82ca9d"
                      name="Volume (kg)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                  No data available for {selectedExerciseData?.name}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Workout Frequency (Last 30 Days)</CardTitle>
              <CardDescription>Daily workout activity heatmap</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 sm:grid-cols-10 gap-2">
                {heatmapData.map(({ date, count }) => {
                  const intensity = count === 0 ? 0 : Math.min(count * 33, 100);
                  return (
                    <div
                      key={date}
                      className="group relative aspect-square rounded"
                      style={{
                        backgroundColor:
                          count === 0
                            ? "hsl(var(--muted))"
                            : `hsl(142, 76%, ${100 - intensity}%)`,
                      }}
                      title={`${new Date(date).toLocaleDateString()}: ${count} workout${count !== 1 ? "s" : ""}`}
                    >
                      <div className="absolute -top-12 left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md group-hover:block">
                        {new Date(date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                        : {count}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <span>Less</span>
                <div className="h-4 w-4 rounded bg-muted" />
                <div
                  className="h-4 w-4 rounded"
                  style={{ backgroundColor: "hsl(142, 76%, 67%)" }}
                />
                <div
                  className="h-4 w-4 rounded"
                  style={{ backgroundColor: "hsl(142, 76%, 33%)" }}
                />
                <div
                  className="h-4 w-4 rounded"
                  style={{ backgroundColor: "hsl(142, 76%, 0%)" }}
                />
                <span>More</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
