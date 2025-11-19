"use client";

import { Button } from "@/components/ui/button";
import { api } from "@gym-tracker-mono/backend/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { Database } from "lucide-react";
import { useState } from "react";

export function SeedExercises() {
  const exercises = useQuery(api.exercises.list, {});
  const seedExercises = useMutation(api.exercises.seed);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSeed = async () => {
    setLoading(true);
    setMessage("");
    try {
      const result = await seedExercises({});
      setMessage(result.message);
    } catch (error) {
      console.error(error);
      setMessage("Error seeding exercises");
    } finally {
      setLoading(false);
    }
  };

  if (exercises === undefined) {
    return null;
  }

  if (exercises.length > 0) {
    return null;
  }

  return (
    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-950">
      <div className="flex items-start gap-3">
        <Database className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
        <div className="flex-1">
          <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">
            No Exercises Found
          </h3>
          <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
            Your exercise library is empty. Click the button below to load 35+
            pre-configured exercises.
          </p>
          <Button
            onClick={handleSeed}
            disabled={loading}
            className="mt-3"
            variant="outline">
            {loading ? "Loading..." : "Load Default Exercises"}
          </Button>
          {message && (
            <p className="mt-2 text-sm font-medium text-yellow-900 dark:text-yellow-100">
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
