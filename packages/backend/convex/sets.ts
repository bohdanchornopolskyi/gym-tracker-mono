import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { authComponent } from "./auth";

export const listByWorkout = query({
  args: { workoutId: v.id("workouts") },
  handler: async (ctx, { workoutId }) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) {
      return [];
    }

    const workout = await ctx.db.get(workoutId);
    if (!workout || workout.userId !== user._id) {
      return [];
    }

    const sets = await ctx.db
      .query("sets")
      .withIndex("by_workout", (q) => q.eq("workoutId", workoutId))
      .collect();

    return sets;
  },
});

export const create = mutation({
  args: {
    workoutId: v.id("workouts"),
    exerciseId: v.id("exercises"),
    setNumber: v.number(),
    reps: v.number(),
    weight: v.number(),
    restTime: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) {
      throw new Error("Not signed in");
    }

    const workout = await ctx.db.get(args.workoutId);
    if (!workout || workout.userId !== user._id) {
      throw new Error("Workout not found or unauthorized");
    }

    return await ctx.db.insert("sets", args);
  },
});

export const update = mutation({
  args: {
    setId: v.id("sets"),
    reps: v.optional(v.number()),
    weight: v.optional(v.number()),
    restTime: v.optional(v.number()),
  },
  handler: async (ctx, { setId, ...updates }) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) {
      throw new Error("Not signed in");
    }

    const set = await ctx.db.get(setId);
    if (!set) {
      throw new Error("Set not found");
    }

    const workout = await ctx.db.get(set.workoutId);
    if (!workout || workout.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(setId, updates);
  },
});

export const remove = mutation({
  args: { setId: v.id("sets") },
  handler: async (ctx, { setId }) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) {
      throw new Error("Not signed in");
    }

    const set = await ctx.db.get(setId);
    if (!set) {
      throw new Error("Set not found");
    }

    const workout = await ctx.db.get(set.workoutId);
    if (!workout || workout.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(setId);
  },
});
