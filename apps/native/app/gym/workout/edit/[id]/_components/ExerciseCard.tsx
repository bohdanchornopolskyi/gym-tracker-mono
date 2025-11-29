import { View, Text, Pressable, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card, useThemeColor } from "heroui-native";
import type { Id } from "@gym-tracker-mono/backend/convex/_generated/dataModel";
import type { WorkoutExercise } from "./types";
import SetInput from "./SetInput";

interface ExerciseCardProps {
  workoutExercise: WorkoutExercise;
  onAddSet: (exerciseId: Id<"exercises">) => void;
  onRemoveSet: (exerciseId: Id<"exercises">, setIndex: number) => void;
  onRemoveExercise: (exerciseId: Id<"exercises">) => void;
  onUpdateSetField: (
    exerciseId: Id<"exercises">,
    setIndex: number,
    field: "reps" | "weight" | "restTime",
    value: number
  ) => void;
  onIncrementValue: (
    exerciseId: Id<"exercises">,
    setIndex: number,
    field: "reps" | "weight",
    increment: number
  ) => void;
}

export default function ExerciseCard({
  workoutExercise,
  onAddSet,
  onRemoveSet,
  onRemoveExercise,
  onUpdateSetField,
  onIncrementValue,
}: ExerciseCardProps) {
  const { exercise, sets } = workoutExercise;

  const mutedColor = useThemeColor("muted");
  const foregroundColor = useThemeColor("foreground");
  const accentColor = useThemeColor("accent");
  const dangerColor = "#ef4444"; // red-500 for destructive actions

  const handleRemoveExercise = () => {
    Alert.alert(
      "Remove Exercise",
      `Are you sure you want to remove ${exercise.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => onRemoveExercise(exercise._id),
        },
      ]
    );
  };

  const handleRemoveSet = (setIndex: number) => {
    if (sets.length === 1) {
      Alert.alert(
        "Cannot Remove",
        "An exercise must have at least one set. Remove the exercise instead.",
        [{ text: "OK" }]
      );
      return;
    }

    Alert.alert("Remove Set", `Remove set ${setIndex + 1}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => onRemoveSet(exercise._id, setIndex),
      },
    ]);
  };

  return (
    <Card variant="secondary" className="w-full">
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-1">
          <Card.Title className="text-lg">{exercise.name}</Card.Title>
          {exercise.category && (
            <Text className="text-sm text-muted mt-1">{exercise.category}</Text>
          )}
        </View>
        <Pressable
          onPress={handleRemoveExercise}
          className="p-2 rounded-lg"
          style={{ backgroundColor: `${dangerColor}20` }}>
          <Ionicons name="trash-outline" size={20} color={dangerColor} />
        </Pressable>
      </View>

      <View className="gap-2 mb-4">
        {sets.map((set, index) => (
          <View key={index} className="flex-row items-center gap-2">
            <View className="flex-1">
              <SetInput
                exerciseId={exercise._id}
                setIndex={index}
                setNumber={set.setNumber}
                reps={set.reps}
                weight={set.weight}
                onUpdateField={onUpdateSetField}
                onIncrementValue={onIncrementValue}
              />
            </View>
            {sets.length > 1 && (
              <Pressable
                onPress={() => handleRemoveSet(index)}
                className="w-8 h-8 items-center justify-center">
                <Ionicons
                  name="close-circle-outline"
                  size={24}
                  color={dangerColor}
                />
              </Pressable>
            )}
          </View>
        ))}
      </View>

      <Pressable
        onPress={() => onAddSet(exercise._id)}
        className="flex-row items-center justify-center gap-2 p-3 border-2 border-dashed border-divider rounded-lg">
        <Ionicons name="add-circle-outline" size={20} color={accentColor} />
        <Text className="text-accent font-semibold">Add Set</Text>
      </Pressable>
    </Card>
  );
}
