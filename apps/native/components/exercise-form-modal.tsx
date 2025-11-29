import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "convex/react";
import { api } from "@gym-tracker-mono/backend/convex/_generated/api";
import { Container } from "@/components/container";
import { Card, useThemeColor } from "heroui-native";

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

interface ExerciseFormModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ExerciseFormModal({
  onClose,
  onSuccess,
}: ExerciseFormModalProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<ExerciseCategory>("Chest");
  const [muscleGroup, setMuscleGroup] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createExercise = useMutation(api.exercises.create);

  const accentForegroundColor = useThemeColor("accent-foreground");
  const mutedColor = useThemeColor("muted");
  const foregroundColor = useThemeColor("foreground");
  const dangerColor = useThemeColor("danger");

  const handleSubmit = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert("Validation Error", "Exercise name is required");
      return;
    }

    if (trimmedName.length < 2) {
      Alert.alert(
        "Validation Error",
        "Exercise name must be at least 2 characters"
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await createExercise({
        name: trimmedName,
        category,
        muscleGroup: muscleGroup.trim() || undefined,
      });

      setName("");
      setMuscleGroup("");
      setCategory("Chest");
      onSuccess?.();
      onClose();
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to create exercise"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container>
      <ScrollView
        className="flex-1"
        contentContainerClassName="justify-center p-6"
        keyboardShouldPersistTaps="handled">
        <Card variant="secondary" className="w-full max-w-md mx-auto">
          <View className="flex-row items-center justify-between mb-4">
            <Card.Title className="text-xl">Create Exercise</Card.Title>
            <Pressable onPress={onClose} className="p-2">
              <Ionicons name="close" size={24} color={foregroundColor} />
            </Pressable>
          </View>

          <Card.Description className="mb-6">
            Create a custom exercise for your workout library
          </Card.Description>

          <View className="gap-4">
            <View>
              <Text className="text-sm font-medium text-foreground mb-2">
                Exercise Name *
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="e.g., Cable Crossover"
                placeholderTextColor={mutedColor}
                className="py-3 px-4 border border-divider rounded-lg bg-surface text-foreground text-base"
                autoFocus
              />
            </View>

            <View>
              <Text className="text-sm font-medium text-foreground mb-2">
                Category *
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8 }}>
                {categories.map((cat) => (
                  <Pressable
                    key={cat}
                    onPress={() => setCategory(cat)}
                    className={`px-4 py-2 rounded-full ${
                      category === cat
                        ? "bg-accent"
                        : "bg-surface border border-divider"
                    }`}>
                    <Text
                      className={`font-medium ${
                        category === cat
                          ? "text-accent-foreground"
                          : "text-foreground"
                      }`}>
                      {cat}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            <View>
              <Text className="text-sm font-medium text-foreground mb-2">
                Muscle Group (Optional)
              </Text>
              <TextInput
                value={muscleGroup}
                onChangeText={setMuscleGroup}
                placeholder="e.g., Pectorals"
                placeholderTextColor={mutedColor}
                className="py-3 px-4 border border-divider rounded-lg bg-surface text-foreground text-base"
              />
            </View>
          </View>

          <Card.Footer className="mt-6 flex-row gap-3">
            <Pressable
              onPress={onClose}
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 border border-divider rounded-lg bg-surface active:opacity-70">
              <Text className="text-center text-foreground font-semibold">
                Cancel
              </Text>
            </Pressable>
            <Pressable
              onPress={handleSubmit}
              disabled={isSubmitting || !name.trim()}
              className={`flex-1 py-3 px-4 rounded-lg active:opacity-70 ${
                name.trim() && !isSubmitting
                  ? "bg-accent"
                  : "bg-surface opacity-50"
              }`}>
              <Text
                className={`text-center font-semibold ${
                  name.trim() && !isSubmitting
                    ? "text-accent-foreground"
                    : "text-muted"
                }`}>
                {isSubmitting ? "Creating..." : "Create"}
              </Text>
            </Pressable>
          </Card.Footer>
        </Card>
      </ScrollView>
    </Container>
  );
}
