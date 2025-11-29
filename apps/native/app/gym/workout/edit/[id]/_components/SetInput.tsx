import { View, Text, TextInput, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "heroui-native";
import type { Id } from "@gym-tracker-mono/backend/convex/_generated/dataModel";

interface SetInputProps {
  exerciseId: Id<"exercises">;
  setIndex: number;
  setNumber: number;
  reps: number;
  weight: number;
  onUpdateField: (
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

export default function SetInput({
  exerciseId,
  setIndex,
  setNumber,
  reps,
  weight,
  onUpdateField,
  onIncrementValue,
}: SetInputProps) {
  const mutedColor = useThemeColor("muted");
  const foregroundColor = useThemeColor("foreground");
  const dividerColor = useThemeColor("divider");
  const surfaceColor = useThemeColor("surface");

  const handleRepsChange = (text: string) => {
    const value = text === "" ? 0 : parseInt(text, 10);
    if (!isNaN(value)) {
      onUpdateField(exerciseId, setIndex, "reps", value);
    }
  };

  const handleWeightChange = (text: string) => {
    const value = text === "" ? 0 : parseFloat(text);
    if (!isNaN(value)) {
      onUpdateField(exerciseId, setIndex, "weight", value);
    }
  };

  return (
    <View
      className="flex-row items-center gap-3 p-3 bg-surface border border-divider rounded-lg"
      style={{ borderColor: dividerColor }}>
      {/* Set Number */}
      <View className="w-8 items-center">
        <Text className="text-sm font-semibold text-muted">{setNumber}</Text>
      </View>

      {/* Reps Input */}
      <View className="flex-1 gap-1">
        <Text className="text-xs text-muted">Reps</Text>
        <View className="flex-row items-center gap-1">
          <Pressable
            onPress={() => onIncrementValue(exerciseId, setIndex, "reps", -1)}
            className="w-8 h-8 items-center justify-center rounded bg-background">
            <Ionicons name="remove" size={16} color={foregroundColor} />
          </Pressable>
          <TextInput
            value={reps.toString()}
            onChangeText={handleRepsChange}
            keyboardType="numeric"
            className="flex-1 text-center p-2 bg-background rounded text-foreground"
            style={{ color: foregroundColor }}
          />
          <Pressable
            onPress={() => onIncrementValue(exerciseId, setIndex, "reps", 1)}
            className="w-8 h-8 items-center justify-center rounded bg-background">
            <Ionicons name="add" size={16} color={foregroundColor} />
          </Pressable>
        </View>
      </View>

      {/* Weight Input */}
      <View className="flex-1 gap-1">
        <Text className="text-xs text-muted">Weight (kg)</Text>
        <View className="flex-row items-center gap-1">
          <Pressable
            onPress={() =>
              onIncrementValue(exerciseId, setIndex, "weight", -2.5)
            }
            className="w-8 h-8 items-center justify-center rounded bg-background">
            <Ionicons name="remove" size={16} color={foregroundColor} />
          </Pressable>
          <TextInput
            value={weight.toString()}
            onChangeText={handleWeightChange}
            keyboardType="decimal-pad"
            className="flex-1 text-center p-2 bg-background rounded text-foreground"
            style={{ color: foregroundColor }}
          />
          <Pressable
            onPress={() =>
              onIncrementValue(exerciseId, setIndex, "weight", 2.5)
            }
            className="w-8 h-8 items-center justify-center rounded bg-background">
            <Ionicons name="add" size={16} color={foregroundColor} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
