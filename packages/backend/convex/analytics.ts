import { v } from "convex/values";
import { query } from "./_generated/server";
import { authComponent } from "./auth";

export const exerciseProgress = query({
  args: {
    exerciseId: v.id("exercises"),
  },
  handler: async (ctx, { exerciseId }) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) {
      return [];
    }
    const userId = user._id;

    const workouts = await ctx.db
      .query("workouts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("asc")
      .collect();

    const workoutIds = workouts.map((w) => w._id);
    const allSets = await ctx.db
      .query("sets")
      .withIndex("by_exercise", (q) => q.eq("exerciseId", exerciseId))
      .collect();

    const relevantSets = allSets.filter((s) =>
      workoutIds.includes(s.workoutId),
    );

    const progressByWorkout = new Map<
      string,
      { date: number; maxWeight: number; totalVolume: number; sets: number }
    >();

    for (const set of relevantSets) {
      const workout = workouts.find((w) => w._id === set.workoutId);
      if (!workout) continue;

      const key = set.workoutId;
      const existing = progressByWorkout.get(key);
      const volume = set.reps * set.weight;

      if (existing) {
        progressByWorkout.set(key, {
          date: workout.date,
          maxWeight: Math.max(existing.maxWeight, set.weight),
          totalVolume: existing.totalVolume + volume,
          sets: existing.sets + 1,
        });
      } else {
        progressByWorkout.set(key, {
          date: workout.date,
          maxWeight: set.weight,
          totalVolume: volume,
          sets: 1,
        });
      }
    }

    return Array.from(progressByWorkout.values()).sort(
      (a, b) => a.date - b.date,
    );
  },
});

export const workoutFrequency = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, { startDate, endDate }) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) {
      return [];
    }
    const userId = user._id;

    let workouts = await ctx.db
      .query("workouts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    if (startDate !== undefined) {
      workouts = workouts.filter((w) => w.date >= startDate);
    }
    if (endDate !== undefined) {
      workouts = workouts.filter((w) => w.date <= endDate);
    }

    const frequencyMap: Record<string, number> = {};

    for (const workout of workouts) {
      const date = new Date(workout.date).toISOString().split("T")[0];
      frequencyMap[date] = (frequencyMap[date] || 0) + 1;
    }

    return Object.entries(frequencyMap).map(([date, count]) => ({
      date,
      count,
    }));
  },
});
