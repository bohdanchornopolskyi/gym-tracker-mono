import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useMutation } from "convex/react";
import { api } from "@gym-tracker-mono/backend/convex/_generated/api";
import type { Id } from "@gym-tracker-mono/backend/convex/_generated/dataModel";
import { useThemeColor } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import WorkoutCard from "@/app/gym/history/WorkoutCard";

export default function HistoryPage() {
  const workouts = useQuery(api.workouts.list, {});
  const deleteWorkout = useMutation(api.workouts.remove);

  const accentColor = useThemeColor("accent");
  const mutedColor = useThemeColor("muted");
  const surfaceColor = useThemeColor("surface");

  const handleDelete = async (workoutId: Id<"workouts">) => {
    await deleteWorkout({ workoutId });
  };

  const groupedWorkouts = workouts?.reduce(
    (groups, workout) => {
      const date = new Date(workout.date).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(workout);
      return groups;
    },
    {} as Record<string, typeof workouts>
  );

  if (!workouts) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color={accentColor} />
        <Text className="text-muted mt-4">Loading workouts...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {/* Header */}
      <View className="border-b border-divider p-4">
        <Text className="text-2xl font-bold text-foreground">
          Workout History
        </Text>
        <Text className="text-sm text-muted mt-1">
          View and manage your past workouts
        </Text>
      </View>

      {/* Content */}
      {workouts.length === 0 ? (
        <View className="flex-1 items-center justify-center p-8">
          <View
            className="rounded-xl p-12 items-center"
            style={{ backgroundColor: surfaceColor }}>
            <Ionicons
              name="barbell-outline"
              size={64}
              color={mutedColor}
              style={{ marginBottom: 16 }}
            />
            <Text className="text-foreground text-lg font-semibold mb-2">
              No workouts yet
            </Text>
            <Text className="text-muted text-center">
              Start logging your workouts to see them here
            </Text>
          </View>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerClassName="p-4"
          showsVerticalScrollIndicator={false}>
          <View className="gap-6 pb-8">
            {Object.entries(groupedWorkouts || {}).map(
              ([date, dateWorkouts]) => (
                <View key={date}>
                  <Text className="text-lg font-semibold text-foreground mb-3">
                    {date}
                  </Text>
                  <View className="gap-3">
                    {dateWorkouts.map((workout) => (
                      <WorkoutCard
                        key={workout._id}
                        workoutId={workout._id}
                        notes={workout.notes}
                        onDelete={() => handleDelete(workout._id)}
                      />
                    ))}
                  </View>
                </View>
              )
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
