import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Activity, Dumbbell, History, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="container flex grow flex-col justify-center py-12">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-5xl font-extrabold tracking-tight lg:text-6xl">
          Gym Tracker
        </h1>
        <p className="mb-8 text-xl text-muted-foreground">
          Track your fitness journey, monitor progress, and achieve your goals
        </p>
        <Button asChild size="lg">
          <Link href="/gym">Get Started</Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/gym/workout/new">
          <Card className="cursor-pointer transition-all hover:scale-105 hover:shadow-lg">
            <CardHeader>
              <Activity className="mb-2 h-10 w-10 text-primary" />
              <CardTitle>Start Workout</CardTitle>
              <CardDescription>
                Begin a new workout session and log your exercises
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/gym/exercises">
          <Card className="cursor-pointer transition-all hover:scale-105 hover:shadow-lg">
            <CardHeader>
              <Dumbbell className="mb-2 h-10 w-10 text-primary" />
              <CardTitle>Exercises</CardTitle>
              <CardDescription>
                Browse and manage your exercise library
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/gym/history">
          <Card className="cursor-pointer transition-all hover:scale-105 hover:shadow-lg">
            <CardHeader>
              <History className="mb-2 h-10 w-10 text-primary" />
              <CardTitle>History</CardTitle>
              <CardDescription>
                Review your past workouts and sessions
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/gym/analytics">
          <Card className="cursor-pointer transition-all hover:scale-105 hover:shadow-lg">
            <CardHeader>
              <TrendingUp className="mb-2 h-10 w-10 text-primary" />
              <CardTitle>Analytics</CardTitle>
              <CardDescription>
                Track progress and visualize your gains
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>

      <div className="mt-12">
        <Card>
          <CardHeader>
            <CardTitle>Why Gym Tracker?</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-3">
            <div>
              <h3 className="mb-2 font-semibold">Track Everything</h3>
              <p className="text-sm text-muted-foreground">
                Log all your exercises, sets, reps, and weights in one place
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold">Monitor Progress</h3>
              <p className="text-sm text-muted-foreground">
                Visualize your strength gains and workout consistency over time
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold">Stay Motivated</h3>
              <p className="text-sm text-muted-foreground">
                See your improvements and stay committed to your fitness goals
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
