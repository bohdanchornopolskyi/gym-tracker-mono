import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Pressable,
  Modal,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { api } from "@gym-tracker-mono/backend/convex/_generated/api";
import { router, useLocalSearchParams } from "expo-router";
import { Card, Chip, useThemeColor } from "heroui-native";
import DateTimePicker from "@react-native-community/datetimepicker";

interface WorkoutFormModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export function WorkoutFormModal({
  onClose,
  onSuccess,
}: WorkoutFormModalProps) {
  const { preset } = useLocalSearchParams<{ preset?: string }>();
  const [date, setDate] = useState<Date>(new Date());
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const presets = useQuery(api.workoutPresets.list, {});
  const createWorkout = useMutation(api.workouts.create);
  const createSet = useMutation(api.sets.create);

  const mutedColor = useThemeColor("muted");
  const accentColor = useThemeColor("accent");
  const foregroundColor = useThemeColor("foreground");
  const accentForegroundColor = useThemeColor("accent-foreground");
  const dividerColor = useThemeColor("divider");
  const surfaceColor = useThemeColor("surface");

  useEffect(() => {
    if (preset && presets) {
      const presetExists = presets.some((p) => p._id === preset);
      if (presetExists) {
        setSelectedPresetId(preset);
      }
    }
  }, [preset, presets]);

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setDate(selectedDate);
    }
    if (Platform.OS === "ios") {
      setShowDatePicker(false);
    }
  };

  const handleStartWorkout = async () => {
    if (!selectedPresetId) {
      Alert.alert("Error", "Please select a preset or empty workout");
      return;
    }

    setIsSaving(true);
    try {
      const workoutId = await createWorkout({
        date: date.getTime(),
        presetId:
          selectedPresetId && selectedPresetId !== "empty"
            ? (selectedPresetId as any)
            : undefined,
      });

      if (selectedPresetId && selectedPresetId !== "empty" && presets) {
        const selectedPreset = presets.find((p) => p._id === selectedPresetId);
        if (selectedPreset) {
          for (const exercise of selectedPreset.exercises) {
            for (const [idx, set] of exercise.sets.entries()) {
              await createSet({
                workoutId,
                exerciseId: exercise.exerciseId,
                setNumber: idx + 1,
                reps: set.reps,
                weight: set.weight,
                restTime: set.restTime,
              });
            }
          }
        }
      }

      onSuccess?.();
      onClose();
      router.push(`/gym/workout/edit/${workoutId}`);
    } catch (error) {
      console.error("Failed to create workout:", error);
      Alert.alert("Error", "Failed to create workout. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const isLoading = presets === undefined;

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-6"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <Card variant="secondary" className="w-full">
          <View className="flex-row items-center justify-between mb-4">
            <Card.Title className="text-xl">New Workout</Card.Title>
            <Pressable onPress={onClose} className="p-2">
              <Ionicons name="close" size={24} color={foregroundColor} />
            </Pressable>
          </View>

          <Card.Description className="mb-6">
            Select a date and a preset to get started
          </Card.Description>

          <View className="gap-6">
            <View className="gap-4">
              <View className="flex-row items-center gap-2">
                <View
                  className="h-8 w-8 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${accentColor}20` }}>
                  <Ionicons name="calendar" size={16} color={accentColor} />
                </View>
                <Text className="text-lg font-semibold text-foreground">
                  When?
                </Text>
              </View>

              <Pressable
                onPress={() => setShowDatePicker(true)}
                className="flex-row items-center justify-between p-3 bg-surface border border-divider rounded-lg">
                <View className="flex-row items-center gap-2">
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color={foregroundColor}
                  />
                  <Text className="text-foreground text-base">
                    {formatDate(date)}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={mutedColor} />
              </Pressable>

              {showDatePicker && (
                <Modal
                  visible={showDatePicker}
                  transparent
                  animationType="slide"
                  onRequestClose={() => setShowDatePicker(false)}>
                  <View className="flex-1 justify-end bg-black/50">
                    <View
                      className="bg-surface rounded-t-3xl p-4"
                      style={{ backgroundColor: surfaceColor }}>
                      <View className="flex-row items-center justify-between mb-4">
                        <Text className="text-lg font-semibold text-foreground">
                          Select Date
                        </Text>
                        <Pressable onPress={() => setShowDatePicker(false)}>
                          <Ionicons
                            name="close"
                            size={24}
                            color={foregroundColor}
                          />
                        </Pressable>
                      </View>
                      <DateTimePicker
                        value={date}
                        mode="date"
                        display={Platform.OS === "ios" ? "spinner" : "default"}
                        onChange={handleDateChange}
                        maximumDate={new Date()}
                      />
                      {Platform.OS === "ios" && (
                        <Pressable
                          onPress={() => setShowDatePicker(false)}
                          className="mt-4 bg-accent p-3 rounded-lg">
                          <Text className="text-center text-accent-foreground font-semibold">
                            Done
                          </Text>
                        </Pressable>
                      )}
                    </View>
                  </View>
                </Modal>
              )}
            </View>

            <View className="gap-4">
              <View className="flex-row items-center gap-2">
                <View
                  className="h-8 w-8 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${accentColor}20` }}>
                  <Ionicons name="barbell" size={16} color={accentColor} />
                </View>
                <Text className="text-lg font-semibold text-foreground">
                  What are we doing?
                </Text>
              </View>

              {isLoading ? (
                <View className="items-center justify-center py-8">
                  <ActivityIndicator size="large" color={accentColor} />
                  <Text className="text-muted mt-4">Loading presets...</Text>
                </View>
              ) : (
                <View className="gap-3">
                  <Pressable
                    onPress={() => setSelectedPresetId("empty")}
                    className={`p-4 rounded-xl border-2 ${
                      selectedPresetId === "empty"
                        ? "border-accent bg-accent/10"
                        : "border-divider bg-surface"
                    }`}>
                    <View className="flex-row items-center gap-2 mb-2">
                      <Ionicons
                        name="add-circle"
                        size={20}
                        color={
                          selectedPresetId === "empty"
                            ? accentColor
                            : foregroundColor
                        }
                      />
                      <Text
                        className={`text-base font-semibold ${
                          selectedPresetId === "empty"
                            ? "text-accent"
                            : "text-foreground"
                        }`}>
                        Empty Workout
                      </Text>
                    </View>
                    <Text className="text-sm text-muted">
                      Start from scratch without any exercises
                    </Text>
                  </Pressable>

                  {presets?.map((preset) => (
                    <Pressable
                      key={preset._id}
                      onPress={() => setSelectedPresetId(preset._id)}
                      className={`p-4 rounded-xl border-2 ${
                        selectedPresetId === preset._id
                          ? "border-accent bg-accent/10"
                          : "border-divider bg-surface"
                      }`}>
                      <View className="flex-row items-start justify-between mb-2">
                        <Text
                          className={`flex-1 text-base font-semibold mr-2 ${
                            selectedPresetId === preset._id
                              ? "text-accent"
                              : "text-foreground"
                          }`}>
                          {preset.name}
                        </Text>
                        {preset.exercises.length > 0 && (
                          <Chip variant="secondary" size="sm">
                            <Chip.Label>
                              {preset.exercises.length} Exercises
                            </Chip.Label>
                          </Chip>
                        )}
                      </View>
                      {preset.notes ? (
                        <Text
                          className="text-sm text-muted mb-1"
                          numberOfLines={2}>
                          {preset.notes}
                        </Text>
                      ) : (
                        <Text className="text-sm text-muted">
                          {preset.exercises.reduce(
                            (acc, ex) => acc + ex.sets.length,
                            0
                          )}{" "}
                          Sets Total
                        </Text>
                      )}
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          </View>

          <Card.Footer className="mt-6">
            <Pressable
              onPress={handleStartWorkout}
              disabled={!selectedPresetId || isSaving}
              className={`w-full p-4 rounded-lg ${
                selectedPresetId && !isSaving
                  ? "bg-accent"
                  : "bg-surface opacity-50"
              }`}>
              {isSaving ? (
                <View className="flex-row items-center justify-center gap-2">
                  <ActivityIndicator
                    size="small"
                    color={accentForegroundColor}
                  />
                  <Text className="text-accent-foreground font-semibold">
                    Creating...
                  </Text>
                </View>
              ) : (
                <Text className="text-center text-accent-foreground font-semibold">
                  Start Workout
                </Text>
              )}
            </Pressable>
          </Card.Footer>
        </Card>
      </ScrollView>
    </View>
  );
}
