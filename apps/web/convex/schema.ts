import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  todos: defineTable({
    text: v.string(),
    completed: v.boolean(),
  }),
  exercises: defineTable({
    name: v.string(),
    category: v.union(
      v.literal("Chest"),
      v.literal("Back"),
      v.literal("Legs"),
      v.literal("Shoulders"),
      v.literal("Arms"),
      v.literal("Core")
    ),
    muscleGroup: v.optional(v.string()),
    userId: v.optional(v.string()),
  })
    .index("by_category", ["category"])
    .index("by_user", ["userId"]),
  workouts: defineTable({
    userId: v.string(),
    date: v.number(),
    notes: v.optional(v.string()),
    duration: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_date", ["userId", "date"]),
  sets: defineTable({
    workoutId: v.id("workouts"),
    exerciseId: v.id("exercises"),
    setNumber: v.number(),
    reps: v.number(),
    weight: v.number(),
    restTime: v.optional(v.number()),
  })
    .index("by_workout", ["workoutId"])
    .index("by_exercise", ["exerciseId"]),
  workoutPresets: defineTable({
    userId: v.string(),
    name: v.string(),
    notes: v.optional(v.string()),
    exercises: v.array(
      v.object({
        exerciseId: v.id("exercises"),
        sets: v.array(
          v.object({
            reps: v.number(),
            weight: v.number(),
            restTime: v.optional(v.number()),
          })
        ),
      })
    ),
  }).index("by_user", ["userId"]),
});
