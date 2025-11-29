import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Pressable,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { api } from "@gym-tracker-mono/backend/convex/_generated/api";
import { Id } from "@gym-tracker-mono/backend/convex/_generated/dataModel";
import { router } from "expo-router";
import { Card, Chip, useThemeColor } from "heroui-native";

export default function PresetsScreen() {
  const [expandedPreset, setExpandedPreset] =
    useState<Id<"workoutPresets"> | null>(null);
  const presets = useQuery(api.workoutPresets.list, {});
  const deletePreset = useMutation(api.workoutPresets.remove);

  const mutedColor = useThemeColor("muted");
  const accentColor = useThemeColor("accent");
  const foregroundColor = useThemeColor("foreground");
  const accentForegroundColor = useThemeColor("accent-foreground");
  const dividerColor = useThemeColor("divider");
  const dangerColor = useThemeColor("danger");

  const handleDelete = async (presetId: Id<"workoutPresets">) => {
    Alert.alert(
      "Delete Preset",
      "Are you sure you want to delete this preset?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deletePreset({ presetId });
              if (expandedPreset === presetId) {
                setExpandedPreset(null);
              }
            } catch (error) {
              Alert.alert(
                "Error",
                "Failed to delete preset. Please try again."
              );
            }
          },
        },
      ]
    );
  };

  const handleUsePreset = (presetId: Id<"workoutPresets">) => {
    router.push(`/workout-create-modal?preset=${presetId}`);
  };

  const handleEditPreset = (presetId: Id<"workoutPresets">) => {
    // router.push(`/gym/presets/edit/${presetId}`);
  };

  const isLoading = presets === undefined;
  const hasPresets = presets && presets.length > 0;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="bg-background border-b border-divider p-4">
        <Text className="text-2xl font-bold text-foreground mb-1">
          Workout Presets
        </Text>
        <Text className="text-sm text-muted">
          Save and reuse your favorite workout templates
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4"
        showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View className="items-center justify-center py-12">
            <ActivityIndicator size="large" color={accentColor} />
            <Text className="text-muted mt-4">Loading presets...</Text>
          </View>
        ) : !hasPresets ? (
          <Card
            variant="secondary"
            className="items-center justify-center py-12">
            <Ionicons
              name="document-text-outline"
              size={64}
              color={mutedColor}
              style={{ marginBottom: 16 }}
            />
            <Text className="text-foreground text-lg font-semibold mb-2">
              No presets yet
            </Text>
            <Text className="text-muted text-center">
              Save a workout as a preset to get started
            </Text>
          </Card>
        ) : (
          <View className="gap-3">
            {presets.map((preset) => (
              <PresetCard
                key={preset._id}
                presetId={preset._id}
                name={preset.name}
                notes={preset.notes}
                exerciseCount={preset.exercises.length}
                totalSets={preset.exercises.reduce(
                  (sum, ex) => sum + ex.sets.length,
                  0
                )}
                isExpanded={expandedPreset === preset._id}
                onToggle={() =>
                  setExpandedPreset(
                    expandedPreset === preset._id ? null : preset._id
                  )
                }
                onDelete={() => handleDelete(preset._id)}
                onUse={() => handleUsePreset(preset._id)}
                onEdit={() => handleEditPreset(preset._id)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function PresetCard({
  presetId,
  name,
  notes,
  exerciseCount,
  totalSets,
  isExpanded,
  onToggle,
  onDelete,
  onUse,
  onEdit,
}: {
  presetId: Id<"workoutPresets">;
  name: string;
  notes?: string;
  exerciseCount: number;
  totalSets: number;
  isExpanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onUse: () => void;
  onEdit: () => void;
}) {
  const presetDetails = useQuery(
    api.workoutPresets.get,
    isExpanded ? { presetId } : "skip"
  );

  const mutedColor = useThemeColor("muted");
  const foregroundColor = useThemeColor("foreground");
  const accentColor = useThemeColor("accent");
  const dividerColor = useThemeColor("divider");
  const dangerColor = useThemeColor("danger");

  return (
    <Card variant="secondary" className="overflow-hidden">
      <View className="p-4">
        <View className="flex-row items-start justify-between mb-2">
          <View className="flex-1 mr-2">
            <Text className="text-base font-semibold text-foreground mb-1">
              {name}
            </Text>
            <Text className="text-sm text-muted mb-1">
              {exerciseCount} Exercise{exerciseCount !== 1 ? "s" : ""} •{" "}
              {totalSets} Set{totalSets !== 1 ? "s" : ""}
            </Text>
            {notes && (
              <Text className="text-sm text-muted mt-1" numberOfLines={2}>
                {notes}
              </Text>
            )}
          </View>
          <View className="flex-row gap-1">
            <Pressable
              onPress={onUse}
              className="p-2 rounded-lg active:opacity-70">
              <Ionicons name="play" size={20} color={accentColor} />
            </Pressable>
            <Pressable
              onPress={onEdit}
              className="p-2 rounded-lg active:opacity-70">
              <Ionicons
                name="create-outline"
                size={20}
                color={foregroundColor}
              />
            </Pressable>
            <Pressable
              onPress={onDelete}
              className="p-2 rounded-lg active:opacity-70">
              <Ionicons name="trash-outline" size={20} color={dangerColor} />
            </Pressable>
            <Pressable
              onPress={onToggle}
              className="p-2 rounded-lg active:opacity-70">
              <Ionicons
                name={isExpanded ? "chevron-up" : "chevron-down"}
                size={20}
                color={foregroundColor}
              />
            </Pressable>
          </View>
        </View>
      </View>

      {isExpanded && presetDetails && (
        <View
          className="border-t border-divider px-4 pb-4 pt-4"
          style={{ borderTopColor: dividerColor }}>
          <View className="gap-4">
            {presetDetails.exercises.map((presetExercise) => {
              const exercise = presetDetails.exerciseDetails?.find(
                (e) => e._id === presetExercise.exerciseId
              );
              if (!exercise) return null;

              return (
                <View key={presetExercise.exerciseId} className="gap-2">
                  <View className="flex-row items-center gap-2 mb-1">
                    <Text className="font-semibold text-foreground">
                      {exercise.name}
                    </Text>
                    <Chip variant="secondary" size="sm">
                      <Chip.Label>{exercise.category}</Chip.Label>
                    </Chip>
                  </View>
                  <View className="gap-1 pl-2">
                    {presetExercise.sets.map((set, setIdx) => (
                      <View
                        key={setIdx}
                        className="flex-row items-center gap-2">
                        <Text className="text-sm text-muted w-12">
                          Set {setIdx + 1}
                        </Text>
                        <Text className="text-sm text-muted">
                          {set.reps} reps × {set.weight} kg
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      )}
    </Card>
  );
}
