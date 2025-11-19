"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Exercise, ExerciseCategory } from "@/types";
import { useState } from "react";

const categories: ExerciseCategory[] = [
  "Chest",
  "Back",
  "Legs",
  "Shoulders",
  "Arms",
  "Core",
];

interface ExerciseSelectorProps {
  exercises: Exercise[] | undefined;
  onSelect: (exercise: Exercise) => void;
}

export default function ExerciseSelector({
  exercises,
  onSelect,
}: ExerciseSelectorProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    ExerciseCategory | "All"
  >("All");

  const filteredExercises = exercises?.filter((ex) => {
    const matchesCategory =
      selectedCategory === "All" || ex.category === selectedCategory;
    const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search exercises..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="md:hidden">
        <Select
          value={selectedCategory}
          onValueChange={(v) =>
            setSelectedCategory(v as ExerciseCategory | "All")
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Tabs
        value={selectedCategory}
        onValueChange={(v) =>
          setSelectedCategory(v as ExerciseCategory | "All")
        }
      >
        <TabsList className="hidden md:grid w-full grid-cols-7">
          <TabsTrigger value="All">All</TabsTrigger>
          {categories.map((cat) => (
            <TabsTrigger key={cat} value={cat}>
              {cat}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value={selectedCategory}>
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {filteredExercises?.map((exercise) => (
                <Card
                  key={exercise._id}
                  className="cursor-pointer transition-colors hover:bg-accent"
                  onClick={() => onSelect(exercise)}
                >
                  <CardHeader className="py-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        {exercise.name}
                      </CardTitle>
                      <Badge variant="secondary">{exercise.category}</Badge>
                    </div>
                    {exercise.muscleGroup && (
                      <CardDescription className="text-xs">
                        {exercise.muscleGroup}
                      </CardDescription>
                    )}
                  </CardHeader>
                </Card>
              ))}
              {filteredExercises?.length === 0 && (
                <p className="py-8 text-center text-muted-foreground">
                  No exercises found
                </p>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
