"use client";

import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Pressable,
  Modal,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { api } from "@gym-tracker-mono/backend/convex/_generated/api";
import { useLocalSearchParams, router } from "expo-router";
import { useThemeColor } from "heroui-native";
import type { Id } from "@gym-tracker-mono/backend/convex/_generated/dataModel";
import type { WorkoutExercise, Exercise } from "./_components/types";
import WorkoutDetailsCard from "./_components/WorkoutDetailsCard";
import ExerciseSelector from "./_components/ExerciseSelector";
import ExerciseCard from "./_components/ExerciseCard";

export default function WorkoutEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const workoutId = id as Id<"workouts">;

  const [date, setDate] = useState<Date | undefined>(undefined);
  const [notes, setNotes] = useState("");
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>(
    []
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showUpdatePresetDialog, setShowUpdatePresetDialog] = useState(false);
  const [isUpdatingPreset, setIsUpdatingPreset] = useState(false);

  const workout = useQuery(api.workouts.get, { workoutId });
  const exercises = useQuery(api.exercises.list, {});
  const updateWorkout = useMutation(api.workouts.update);
  const createSet = useMutation(api.sets.create);
  const updateSet = useMutation(api.sets.update);
  const removeSetMutation = useMutation(api.sets.remove);
  const updatePresetFromWorkout = useMutation(
    api.workoutPresets.updateFromWorkout
  );

  const accentColor = useThemeColor("accent");
  const foregroundColor = useThemeColor("foreground");
  const accentForegroundColor = useThemeColor("accent-foreground");
  const mutedColor = useThemeColor("muted");

  // Load workout data
  useEffect(() => {
    if (workout) {
      setDate(new Date(workout.date));
      setNotes(workout.notes || "");

      const exerciseGroups = workout.sets.reduce(
        (groups, set) => {
          const exerciseId = set.exerciseId;
          if (!groups[exerciseId]) {
            groups[exerciseId] = [];
          }
          groups[exerciseId].push(set);
          return groups;
        },
        {} as Record<string, typeof workout.sets>
      );

      const workoutExercisesData: WorkoutExercise[] = [];
      for (const [exerciseId, sets] of Object.entries(exerciseGroups)) {
        const exercise = workout.exercises.find((e) => e._id === exerciseId);
        if (exercise) {
          workoutExercisesData.push({
            exercise,
            sets: sets.map((set) => ({
              exerciseId: set.exerciseId,
              setNumber: set.setNumber,
              reps: set.reps,
              weight: set.weight,
              restTime: set.restTime,
            })),
          });
        }
      }

      setWorkoutExercises(workoutExercisesData);
    }
  }, [workout]);

  const addExercise = (exercise: Exercise) => {
    if (workoutExercises.find((we) => we.exercise._id === exercise._id)) {
      Alert.alert("Already Added", "This exercise is already in the workout");
      return;
    }

    setWorkoutExercises([
      ...workoutExercises,
      {
        exercise,
        sets: [
          {
            exerciseId: exercise._id,
            setNumber: 1,
            reps: 10,
            weight: 0,
          },
        ],
      },
    ]);
    setDialogOpen(false);
  };

  const addSet = (exerciseId: Id<"exercises">) => {
    setWorkoutExercises(
      workoutExercises.map((we) => {
        if (we.exercise._id === exerciseId) {
          const lastSet = we.sets[we.sets.length - 1];
          return {
            ...we,
            sets: [
              ...we.sets,
              {
                exerciseId,
                setNumber: we.sets.length + 1,
                reps: lastSet?.reps || 10,
                weight: lastSet?.weight || 0,
              },
            ],
          };
        }
        return we;
      })
    );
  };

  const removeSet = (exerciseId: Id<"exercises">, setIndex: number) => {
    setWorkoutExercises(
      workoutExercises.map((we) => {
        if (we.exercise._id === exerciseId) {
          const newSets = we.sets.filter((_, idx) => idx !== setIndex);
          return {
            ...we,
            sets: newSets.map((s, idx) => ({ ...s, setNumber: idx + 1 })),
          };
        }
        return we;
      })
    );
  };

  const removeExercise = (exerciseId: Id<"exercises">) => {
    setWorkoutExercises(
      workoutExercises.filter((we) => we.exercise._id !== exerciseId)
    );
  };

  const updateSetField = (
    exerciseId: Id<"exercises">,
    setIndex: number,
    field: "reps" | "weight" | "restTime",
    value: number
  ) => {
    setWorkoutExercises(
      workoutExercises.map((we) => {
        if (we.exercise._id === exerciseId) {
          return {
            ...we,
            sets: we.sets.map((s, idx) =>
              idx === setIndex ? { ...s, [field]: value } : s
            ),
          };
        }
        return we;
      })
    );
  };

  const incrementValue = (
    exerciseId: Id<"exercises">,
    setIndex: number,
    field: "reps" | "weight",
    increment: number
  ) => {
    setWorkoutExercises(
      workoutExercises.map((we) => {
        if (we.exercise._id === exerciseId) {
          return {
            ...we,
            sets: we.sets.map((s, idx) =>
              idx === setIndex
                ? { ...s, [field]: Math.max(0, s[field] + increment) }
                : s
            ),
          };
        }
        return we;
      })
    );
  };

  const saveWorkout = async () => {
    setIsSaving(true);
    try {
      await updateWorkout({
        workoutId,
        date: date?.getTime() ?? Date.now(),
        notes: notes || undefined,
      });

      const existingSets = workout?.sets || [];
      const newSets = workoutExercises.flatMap((we) => we.sets);

      // Update or remove existing sets
      for (const existingSet of existingSets) {
        const matchingNewSet = newSets.find(
          (ns) =>
            ns.exerciseId === existingSet.exerciseId &&
            ns.setNumber === existingSet.setNumber
        );

        if (matchingNewSet) {
          await updateSet({
            setId: existingSet._id,
            reps: matchingNewSet.reps,
            weight: matchingNewSet.weight,
            restTime: matchingNewSet.restTime,
          });
        } else {
          await removeSetMutation({ setId: existingSet._id });
        }
      }

      // Create new sets
      for (const newSet of newSets) {
        const existingSet = existingSets.find(
          (es) =>
            es.exerciseId === newSet.exerciseId &&
            es.setNumber === newSet.setNumber
        );

        if (!existingSet) {
          await createSet({
            workoutId,
            ...newSet,
          });
        }
      }
    } catch (error) {
      console.error("Failed to save workout:", error);
      Alert.alert("Error", "Failed to save workout. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePreset = async () => {
    if (!workout?.presetId) return;

    setIsUpdatingPreset(true);
    try {
      await updatePresetFromWorkout({
        presetId: workout.presetId,
        workoutId,
      });
      setShowUpdatePresetDialog(false);
    } catch (error) {
      console.error("Failed to update preset:", error);
      Alert.alert("Error", "Failed to update preset. Please try again.");
    } finally {
      setIsUpdatingPreset(false);
    }
  };

  if (!workout) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color={accentColor} />
        <Text className="text-muted mt-4">Loading workout...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4"
        showsVerticalScrollIndicator={false}>
        <WorkoutDetailsCard
          date={date}
          notes={notes}
          onDateChange={setDate}
          onNotesChange={setNotes}
        />

        <View className="flex-row items-center justify-between mt-6 mb-4">
          <Text className="text-xl font-semibold text-foreground">
            Exercises
          </Text>
          <Pressable
            onPress={() => setDialogOpen(true)}
            className="bg-accent px-4 py-2 rounded-lg flex-row items-center gap-2">
            <Ionicons name="add" size={20} color={accentForegroundColor} />
            <Text className="text-accent-foreground font-semibold">
              Add Exercise
            </Text>
          </Pressable>
        </View>

        {workoutExercises.length === 0 ? (
          <View className="items-center justify-center py-12 bg-surface rounded-xl">
            <Ionicons
              name="barbell-outline"
              size={64}
              color={mutedColor}
              style={{ marginBottom: 16 }}
            />
            <Text className="text-foreground text-lg font-semibold mb-2">
              No exercises added
            </Text>
            <Text className="text-muted text-center">
              Tap "Add Exercise" to get started
            </Text>
          </View>
        ) : (
          <View className="gap-4 mb-4">
            {workoutExercises.map((we) => (
              <ExerciseCard
                key={we.exercise._id}
                workoutExercise={we}
                onAddSet={addSet}
                onRemoveSet={removeSet}
                onRemoveExercise={removeExercise}
                onUpdateSetField={updateSetField}
                onIncrementValue={incrementValue}
              />
            ))}
          </View>
        )}

        {/* Action Buttons */}
        <View className="gap-3 mt-4 mb-8">
          {workout.presetId && (
            <Pressable
              onPress={() => setShowUpdatePresetDialog(true)}
              disabled={isUpdatingPreset}
              className="w-full p-4 border-2 border-accent rounded-lg flex-row items-center justify-center gap-2">
              <Ionicons name="refresh" size={20} color={accentColor} />
              <Text className="text-accent font-semibold">
                {isUpdatingPreset ? "Updating..." : "Update Preset"}
              </Text>
            </Pressable>
          )}

          <Pressable
            onPress={saveWorkout}
            disabled={isSaving}
            className={`w-full p-4 rounded-lg flex-row items-center justify-center gap-2 ${
              isSaving ? "opacity-50" : ""
            }`}
            style={{ backgroundColor: accentColor }}>
            {isSaving ? (
              <>
                <ActivityIndicator size="small" color={accentForegroundColor} />
                <Text
                  className="font-semibold"
                  style={{ color: accentForegroundColor }}>
                  Saving...
                </Text>
              </>
            ) : (
              <>
                <Ionicons name="save" size={20} color={accentForegroundColor} />
                <Text
                  className="font-semibold"
                  style={{ color: accentForegroundColor }}>
                  Save Changes
                </Text>
              </>
            )}
          </Pressable>
        </View>
      </ScrollView>

      {/* Exercise Selector Modal */}
      <Modal
        visible={dialogOpen}
        animationType="slide"
        onRequestClose={() => setDialogOpen(false)}>
        <View className="flex-1 bg-background">
          <View className="flex-row items-center justify-between p-4 border-b border-divider">
            <Text className="text-xl font-semibold text-foreground">
              Select Exercise
            </Text>
            <Pressable onPress={() => setDialogOpen(false)} className="p-2">
              <Ionicons name="close" size={24} color={foregroundColor} />
            </Pressable>
          </View>
          <View className="flex-1 p-4">
            <ExerciseSelector exercises={exercises} onSelect={addExercise} />
          </View>
        </View>
      </Modal>

      {/* Update Preset Confirmation Modal */}
      <Modal
        visible={showUpdatePresetDialog}
        transparent
        animationType="fade"
        onRequestClose={() => setShowUpdatePresetDialog(false)}>
        <View className="flex-1 justify-center items-center bg-black/50 p-4">
          <View className="bg-surface rounded-2xl p-6 w-full max-w-md">
            <Text className="text-xl font-semibold text-foreground mb-4">
              Update Preset?
            </Text>
            <Text className="text-muted mb-6">
              This will update the original preset with the current workout
              data, including all exercises, sets, reps, and weights. This
              action cannot be undone.
            </Text>
            <View className="flex-row gap-3">
              <Pressable
                onPress={() => setShowUpdatePresetDialog(false)}
                className="flex-1 p-3 border border-divider rounded-lg">
                <Text className="text-center text-foreground font-semibold">
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                onPress={handleUpdatePreset}
                className="flex-1 p-3 rounded-lg"
                style={{ backgroundColor: accentColor }}>
                <Text
                  className="text-center font-semibold"
                  style={{ color: accentForegroundColor }}>
                  Update Preset
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
