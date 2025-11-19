import { SeedExercises } from "@/components/seed-exercises";
import { UserMenu } from "@/components/UserMenu";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@gym-tracker-mono/backend/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import { Activity, Dumbbell, History, TrendingUp } from "lucide-react";
import Link from "next/link";
import { getToken } from "@/lib/auth-server";
import type { Doc } from "@gym-tracker-mono/backend/convex/_generated/dataModel";

export default async function ProductPage() {
  const token = await getToken();

  console.log("token", token);

  const workouts: Doc<"workouts">[] = [];

  const totalWorkouts = workouts?.length || 0;
  const lastWorkoutDate = workouts?.[0]
    ? new Date(workouts[0].date).toLocaleDateString()
    : "No workouts yet";

  return (
    <main className="flex max-h-screen grow flex-col overflow-hidden">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between border-b p-4">
        <div>
          <h1 className="text-2xl font-bold">Gym Tracker</h1>
          <p className="text-sm text-muted-foreground">
            Track your fitness journey
          </p>
        </div>
        <UserMenu />
      </div>

      <div className="flex-1 overflow-auto p-6">
        <SeedExercises />

        <div className="mb-6 grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Total Workouts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totalWorkouts}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Last Workout</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-medium">{lastWorkoutDate}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link href="/gym/workout/new">
            <Card className="cursor-pointer transition-colors hover:bg-accent">
              <CardHeader>
                <Activity className="mb-2 h-8 w-8" />
                <CardTitle>Start New Workout</CardTitle>
                <CardDescription>Log your exercises and sets</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/gym/exercises">
            <Card className="cursor-pointer transition-colors hover:bg-accent">
              <CardHeader>
                <Dumbbell className="mb-2 h-8 w-8" />
                <CardTitle>Exercise Library</CardTitle>
                <CardDescription>Browse and manage exercises</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/gym/history">
            <Card className="cursor-pointer transition-colors hover:bg-accent">
              <CardHeader>
                <History className="mb-2 h-8 w-8" />
                <CardTitle>Workout History</CardTitle>
                <CardDescription>View past workouts</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/gym/analytics">
            <Card className="cursor-pointer transition-colors hover:bg-accent">
              <CardHeader>
                <TrendingUp className="mb-2 h-8 w-8" />
                <CardTitle>Analytics</CardTitle>
                <CardDescription>Track your progress</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>

        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Start</CardTitle>
              <CardDescription>
                Get started with your gym tracking
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm">
                1. Browse the <strong>Exercise Library</strong> to see available
                exercises
              </p>
              <p className="text-sm">
                2. Click <strong>Start New Workout</strong> to log your first
                session
              </p>
              <p className="text-sm">
                3. View your <strong>Analytics</strong> to track progress over
                time
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
