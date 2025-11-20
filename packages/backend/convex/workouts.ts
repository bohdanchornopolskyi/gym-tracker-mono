import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { authComponent } from "./auth";

export const list = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, { startDate, endDate }) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) {
      return [];
    }

    let workouts = await ctx.db
      .query("workouts")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    if (startDate !== undefined) {
      workouts = workouts.filter((w) => w.date >= startDate);
    }
    if (endDate !== undefined) {
      workouts = workouts.filter((w) => w.date <= endDate);
    }

    return workouts;
  },
});

export const get = query({
  args: { workoutId: v.id("workouts") },
  handler: async (ctx, { workoutId }) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) {
      throw new Error("Not signed in");
    }

    const workout = await ctx.db.get(workoutId);
    if (!workout || workout.userId !== user._id) {
      return null;
    }

    const sets = await ctx.db
      .query("sets")
      .withIndex("by_workout", (q) => q.eq("workoutId", workoutId))
      .collect();

    const exerciseIds = [...new Set(sets.map((s) => s.exerciseId))];
    const exercises = await Promise.all(
      exerciseIds.map((id) => ctx.db.get(id)),
    );

    return {
      ...workout,
      sets,
      exercises: exercises.filter((e) => e !== null),
    };
  },
});

export const create = mutation({
  args: {
    date: v.number(),
    notes: v.optional(v.string()),
    duration: v.optional(v.number()),
    presetId: v.optional(v.id("workoutPresets")),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) {
      throw new Error("Not signed in");
    }

    return await ctx.db.insert("workouts", {
      ...args,
      userId: user._id,
    });
  },
});

export const remove = mutation({
  args: { workoutId: v.id("workouts") },
  handler: async (ctx, { workoutId }) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) {
      throw new Error("Not signed in");
    }

    const workout = await ctx.db.get(workoutId);
    if (!workout || workout.userId !== user._id) {
      throw new Error("Workout not found or unauthorized");
    }

    const sets = await ctx.db
      .query("sets")
      .withIndex("by_workout", (q) => q.eq("workoutId", workoutId))
      .collect();

    for (const set of sets) {
      await ctx.db.delete(set._id);
    }

    await ctx.db.delete(workoutId);
  },
});

export const getStats = query({
  args: { workoutId: v.id("workouts") },
  handler: async (ctx, { workoutId }) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) {
      throw new Error("Not signed in");
    }

    const workout = await ctx.db.get(workoutId);
    if (!workout || workout.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    const sets = await ctx.db
      .query("sets")
      .withIndex("by_workout", (q) => q.eq("workoutId", workoutId))
      .collect();

    const uniqueExercises = new Set(sets.map((s) => s.exerciseId));

    return {
      exerciseCount: uniqueExercises.size,
      setCount: sets.length,
    };
  },
});

export const update = mutation({
  args: {
    workoutId: v.id("workouts"),
    date: v.optional(v.number()),
    notes: v.optional(v.string()),
    duration: v.optional(v.number()),
  },
  handler: async (ctx, { workoutId, ...updates }) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) {
      throw new Error("Not signed in");
    }

    const workout = await ctx.db.get(workoutId);
    if (!workout || workout.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(workoutId, updates);
  },
});

export const stats = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) {
      return null;
    }

    const workouts = await ctx.db
      .query("workouts")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const allSets = await ctx.db.query("sets").collect();
    const workoutIds = new Set(workouts.map((w) => w._id));
    const userSets = allSets.filter((s) => workoutIds.has(s.workoutId));

    const exerciseFrequency: Record<string, number> = {};
    for (const set of userSets) {
      const key = set.exerciseId;
      exerciseFrequency[key] = (exerciseFrequency[key] || 0) + 1;
    }

    const sortedExercises = Object.entries(exerciseFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    const favoriteExerciseIds = sortedExercises.map(([id]) => id);
    const favoriteExercises = await Promise.all(
      favoriteExerciseIds.map((id) => ctx.db.get(id as any)),
    );

    return {
      totalWorkouts: workouts.length,
      totalSets: userSets.length,
      favoriteExercises: favoriteExercises.filter((e) => e !== null),
    };
  },
});
