import { useState } from "react";
import { View, Text, Pressable, Alert, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { api } from "@gym-tracker-mono/backend/convex/_generated/api";
import type { Id } from "@gym-tracker-mono/backend/convex/_generated/dataModel";
import { router } from "expo-router";
import { useThemeColor } from "heroui-native";

interface WorkoutCardProps {
  workoutId: Id<"workouts">;
  notes?: string;
  onDelete: () => void;
}

export default function WorkoutCard({
  workoutId,
  notes,
  onDelete,
}: WorkoutCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const workoutStats = useQuery(api.workouts.getStats, { workoutId });
  const workoutDetails = useQuery(
    api.workouts.get,
    isExpanded ? { workoutId } : "skip"
  );

  const accentColor = useThemeColor("accent");
  const foregroundColor = useThemeColor("foreground");
  const mutedColor = useThemeColor("muted");
  const surfaceColor = useThemeColor("surface");
  const dividerColor = useThemeColor("divider");

  const handleDelete = () => {
    Alert.alert(
      "Delete Workout",
      "Are you sure you want to delete this workout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: onDelete,
        },
      ]
    );
  };

  const handleEdit = () => {
    router.push(`/gym/workout/edit/${workoutId}`);
  };

  const exerciseGroups = workoutDetails?.sets.reduce(
    (groups, set) => {
      const exerciseId = set.exerciseId;
      if (!groups[exerciseId]) {
        groups[exerciseId] = [];
      }
      groups[exerciseId].push(set);
      return groups;
    },
    {} as Record<string, typeof workoutDetails.sets>
  );

  const uniqueExercises = workoutStats?.exerciseCount || 0;
  const totalSets = workoutStats?.setCount || 0;

  return (
    <View
      className="rounded-xl border border-divider overflow-hidden"
      style={{ backgroundColor: surfaceColor }}>
      {/* Card Header */}
      <View className="p-4">
        <View className="flex-row items-start justify-between">
          <View className="flex-1">
            <Text className="text-base font-semibold text-foreground">
              {uniqueExercises} Exercise{uniqueExercises !== 1 ? "s" : ""} •{" "}
              {totalSets} Set{totalSets !== 1 ? "s" : ""}
            </Text>
            {notes && (
              <Text className="text-sm text-muted mt-1" numberOfLines={2}>
                {notes}
              </Text>
            )}
          </View>
          <View className="flex-row gap-2">
            <Pressable
              onPress={handleEdit}
              className="p-2 rounded-lg"
              style={{ backgroundColor: surfaceColor }}>
              <Ionicons name="pencil" size={18} color={foregroundColor} />
            </Pressable>
            <Pressable
              onPress={handleDelete}
              className="p-2 rounded-lg"
              style={{ backgroundColor: surfaceColor }}>
              <Ionicons
                name="trash-outline"
                size={18}
                color={foregroundColor}
              />
            </Pressable>
            <Pressable
              onPress={() => setIsExpanded(!isExpanded)}
              className="p-2 rounded-lg"
              style={{ backgroundColor: surfaceColor }}>
              <Ionicons
                name={isExpanded ? "chevron-up" : "chevron-down"}
                size={18}
                color={foregroundColor}
              />
            </Pressable>
          </View>
        </View>
      </View>

      {/* Expanded Content */}
      {isExpanded && (
        <>
          <View
            className="h-px mx-4"
            style={{ backgroundColor: dividerColor }}
          />
          <View className="p-4">
            {!workoutDetails ? (
              <View className="items-center py-8">
                <ActivityIndicator size="small" color={accentColor} />
                <Text className="text-muted mt-2">Loading details...</Text>
              </View>
            ) : (
              <View className="gap-4">
                {Object.entries(exerciseGroups || {}).map(
                  ([exerciseId, sets]) => {
                    const exercise = workoutDetails.exercises.find(
                      (e) => e._id === exerciseId
                    );
                    if (!exercise) return null;

                    return (
                      <View key={exerciseId}>
                        <View className="flex-row items-center gap-2 mb-2">
                          <Text className="text-base font-semibold text-foreground">
                            {exercise.name}
                          </Text>
                          <View
                            className="px-2 py-1 rounded"
                            style={{ backgroundColor: accentColor + "20" }}>
                            <Text
                              className="text-xs font-medium"
                              style={{ color: accentColor }}>
                              {exercise.category}
                            </Text>
                          </View>
                        </View>
                        <View className="gap-1">
                          {sets
                            .sort((a, b) => a.setNumber - b.setNumber)
                            .map((set) => (
                              <View
                                key={set._id}
                                className="flex-row items-center gap-2">
                                <Text className="text-sm text-muted w-16">
                                  Set {set.setNumber}
                                </Text>
                                <Text className="text-sm text-muted">
                                  {set.reps} reps × {set.weight} kg
                                </Text>
                              </View>
                            ))}
                        </View>
                      </View>
                    );
                  }
                )}
              </View>
            )}
          </View>
        </>
      )}
    </View>
  );
}
