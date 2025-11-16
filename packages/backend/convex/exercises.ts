import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { authComponent } from "./auth";

export const list = query({
  args: {
    category: v.optional(
      v.union(
        v.literal("Chest"),
        v.literal("Back"),
        v.literal("Legs"),
        v.literal("Shoulders"),
        v.literal("Arms"),
        v.literal("Core"),
      ),
    ),
    search: v.optional(v.string()),
  },
  handler: async (ctx, { category, search }) => {
    let exercises = await ctx.db.query("exercises").collect();

    if (category) {
      exercises = exercises.filter((ex) => ex.category === category);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      exercises = exercises.filter((ex) =>
        ex.name.toLowerCase().includes(searchLower),
      );
    }

    return exercises;
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    category: v.union(
      v.literal("Chest"),
      v.literal("Back"),
      v.literal("Legs"),
      v.literal("Shoulders"),
      v.literal("Arms"),
      v.literal("Core"),
    ),
    muscleGroup: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) {
      throw new Error("Not signed in");
    }

    return await ctx.db.insert("exercises", {
      ...args,
      userId: user._id,
    });
  },
});

export const update = mutation({
  args: {
    exerciseId: v.id("exercises"),
    name: v.optional(v.string()),
    category: v.optional(
      v.union(
        v.literal("Chest"),
        v.literal("Back"),
        v.literal("Legs"),
        v.literal("Shoulders"),
        v.literal("Arms"),
        v.literal("Core"),
      ),
    ),
    muscleGroup: v.optional(v.string()),
  },
  handler: async (ctx, { exerciseId, ...updates }) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) {
      throw new Error("Not signed in");
    }

    const exercise = await ctx.db.get(exerciseId);
    if (!exercise || exercise.userId !== user._id) {
      throw new Error("Unauthorized or not a custom exercise");
    }

    await ctx.db.patch(exerciseId, updates);
  },
});

export const remove = mutation({
  args: { exerciseId: v.id("exercises") },
  handler: async (ctx, { exerciseId }) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) {
      throw new Error("Not signed in");
    }

    const exercise = await ctx.db.get(exerciseId);
    if (!exercise || exercise.userId !== user._id) {
      throw new Error("Unauthorized or not a custom exercise");
    }

    await ctx.db.delete(exerciseId);
  },
});

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) {
      throw new Error("Not signed in");
    }

    const existingExercises = await ctx.db.query("exercises").collect();
    if (existingExercises.length > 0) {
      return { message: "Exercises already seeded", count: 0 };
    }

    const exercises = [
      {
        name: "Barbell Bench Press",
        category: "Chest" as const,
        muscleGroup: "Pectorals",
      },
      {
        name: "Incline Dumbbell Press",
        category: "Chest" as const,
        muscleGroup: "Upper Pectorals",
      },
      {
        name: "Dumbbell Flyes",
        category: "Chest" as const,
        muscleGroup: "Pectorals",
      },
      {
        name: "Cable Flyes",
        category: "Chest" as const,
        muscleGroup: "Pectorals",
      },
      {
        name: "Push-ups",
        category: "Chest" as const,
        muscleGroup: "Pectorals",
      },

      {
        name: "Deadlift",
        category: "Back" as const,
        muscleGroup: "Erector Spinae",
      },
      {
        name: "Pull-ups",
        category: "Back" as const,
        muscleGroup: "Latissimus Dorsi",
      },
      {
        name: "Barbell Rows",
        category: "Back" as const,
        muscleGroup: "Latissimus Dorsi",
      },
      {
        name: "Lat Pulldown",
        category: "Back" as const,
        muscleGroup: "Latissimus Dorsi",
      },
      {
        name: "Seated Cable Rows",
        category: "Back" as const,
        muscleGroup: "Rhomboids",
      },
      {
        name: "Face Pulls",
        category: "Back" as const,
        muscleGroup: "Rear Deltoids",
      },

      {
        name: "Barbell Squat",
        category: "Legs" as const,
        muscleGroup: "Quadriceps",
      },
      {
        name: "Leg Press",
        category: "Legs" as const,
        muscleGroup: "Quadriceps",
      },
      {
        name: "Romanian Deadlift",
        category: "Legs" as const,
        muscleGroup: "Hamstrings",
      },
      { name: "Lunges", category: "Legs" as const, muscleGroup: "Quadriceps" },
      {
        name: "Leg Curls",
        category: "Legs" as const,
        muscleGroup: "Hamstrings",
      },
      {
        name: "Leg Extension",
        category: "Legs" as const,
        muscleGroup: "Quadriceps",
      },
      { name: "Calf Raises", category: "Legs" as const, muscleGroup: "Calves" },

      {
        name: "Overhead Press",
        category: "Shoulders" as const,
        muscleGroup: "Deltoids",
      },
      {
        name: "Lateral Raises",
        category: "Shoulders" as const,
        muscleGroup: "Lateral Deltoids",
      },
      {
        name: "Front Raises",
        category: "Shoulders" as const,
        muscleGroup: "Anterior Deltoids",
      },
      {
        name: "Rear Delt Flyes",
        category: "Shoulders" as const,
        muscleGroup: "Posterior Deltoids",
      },
      {
        name: "Shrugs",
        category: "Shoulders" as const,
        muscleGroup: "Trapezius",
      },

      {
        name: "Barbell Curl",
        category: "Arms" as const,
        muscleGroup: "Biceps",
      },
      {
        name: "Hammer Curls",
        category: "Arms" as const,
        muscleGroup: "Biceps",
      },
      {
        name: "Tricep Dips",
        category: "Arms" as const,
        muscleGroup: "Triceps",
      },
      {
        name: "Skull Crushers",
        category: "Arms" as const,
        muscleGroup: "Triceps",
      },
      {
        name: "Cable Tricep Pushdown",
        category: "Arms" as const,
        muscleGroup: "Triceps",
      },
      {
        name: "Preacher Curl",
        category: "Arms" as const,
        muscleGroup: "Biceps",
      },

      { name: "Plank", category: "Core" as const, muscleGroup: "Abdominals" },
      {
        name: "Crunches",
        category: "Core" as const,
        muscleGroup: "Abdominals",
      },
      {
        name: "Leg Raises",
        category: "Core" as const,
        muscleGroup: "Lower Abdominals",
      },
      {
        name: "Cable Woodchoppers",
        category: "Core" as const,
        muscleGroup: "Obliques",
      },
      {
        name: "Ab Wheel Rollout",
        category: "Core" as const,
        muscleGroup: "Abdominals",
      },
    ];

    for (const exercise of exercises) {
      await ctx.db.insert("exercises", exercise);
    }

    return {
      message: "Exercises seeded successfully",
      count: exercises.length,
    };
  },
});
