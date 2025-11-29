import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor, Chip } from "heroui-native";
import type { Exercise } from "./types";

type ExerciseCategory =
  | "Chest"
  | "Back"
  | "Legs"
  | "Shoulders"
  | "Arms"
  | "Core";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    ExerciseCategory | undefined
  >();

  const mutedColor = useThemeColor("muted");
  const accentColor = useThemeColor("accent");
  const foregroundColor = useThemeColor("foreground");
  const dividerColor = useThemeColor("divider");

  const isLoading = exercises === undefined;

  const filteredExercises = exercises?.filter((exercise) => {
    const matchesSearch =
      !searchTerm ||
      exercise.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      !selectedCategory || exercise.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <View className="flex-1">
      {/* Search */}
      <View className="mb-4">
        <View className="flex-row items-center gap-2 bg-surface border border-divider rounded-lg px-3 py-2">
          <Ionicons name="search" size={20} color={mutedColor} />
          <TextInput
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholder="Search exercises..."
            placeholderTextColor={mutedColor}
            className="flex-1 text-foreground"
            style={{ color: foregroundColor }}
          />
          {searchTerm.length > 0 && (
            <Pressable onPress={() => setSearchTerm("")}>
              <Ionicons name="close-circle" size={20} color={mutedColor} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Category Filter */}
      <View className="mb-4">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}>
          <Pressable
            onPress={() => setSelectedCategory(undefined)}
            className={`px-4 py-2 rounded-full ${
              selectedCategory === undefined
                ? "bg-accent"
                : "bg-surface border border-divider"
            }`}>
            <Text
              className={`font-medium ${
                selectedCategory === undefined
                  ? "text-accent-foreground"
                  : "text-foreground"
              }`}>
              All
            </Text>
          </Pressable>
          {categories.map((cat) => (
            <Pressable
              key={cat}
              onPress={() =>
                setSelectedCategory(selectedCategory === cat ? undefined : cat)
              }
              className={`px-4 py-2 rounded-full ${
                selectedCategory === cat
                  ? "bg-accent"
                  : "bg-surface border border-divider"
              }`}>
              <Text
                className={`font-medium ${
                  selectedCategory === cat
                    ? "text-accent-foreground"
                    : "text-foreground"
                }`}>
                {cat}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Exercise List */}
      {isLoading ? (
        <View className="items-center justify-center py-12">
          <ActivityIndicator size="large" color={accentColor} />
          <Text className="text-muted mt-4">Loading exercises...</Text>
        </View>
      ) : filteredExercises && filteredExercises.length > 0 ? (
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ gap: 12 }}>
          {filteredExercises.map((exercise) => (
            <Pressable
              key={exercise._id}
              onPress={() => onSelect(exercise)}
              className="bg-surface border border-divider rounded-xl p-4 active:opacity-70"
              style={{ borderColor: dividerColor }}>
              <View className="flex-row items-start justify-between">
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-foreground mb-2">
                    {exercise.name}
                  </Text>
                  <View className="self-start mb-2">
                    <Chip variant="secondary" size="sm">
                      <Chip.Label>{exercise.category}</Chip.Label>
                    </Chip>
                  </View>
                  {exercise.muscleGroup && (
                    <Text className="text-sm text-muted">
                      {exercise.muscleGroup}
                    </Text>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={20} color={mutedColor} />
              </View>
            </Pressable>
          ))}
        </ScrollView>
      ) : (
        <View className="items-center justify-center py-12">
          <Ionicons
            name="barbell-outline"
            size={64}
            color={mutedColor}
            style={{ marginBottom: 16 }}
          />
          <Text className="text-foreground text-lg font-semibold mb-2">
            No exercises found
          </Text>
          <Text className="text-muted text-center">
            Try adjusting your search or filter
          </Text>
        </View>
      )}
    </View>
  );
}
