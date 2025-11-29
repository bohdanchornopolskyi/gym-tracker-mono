import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { api } from "@gym-tracker-mono/backend/convex/_generated/api";
import { router } from "expo-router";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Card, Chip, useThemeColor } from "heroui-native";

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

export default function ExercisesScreen() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    ExerciseCategory | undefined
  >();
  const [isScrolled, setIsScrolled] = useState(false);
  const scrollY = useSharedValue(0);

  const exercises = useQuery(api.exercises.list, {
    category: selectedCategory,
    search: searchTerm,
  });

  const mutedColor = useThemeColor("muted");
  const accentColor = useThemeColor("accent");
  const foregroundColor = useThemeColor("foreground");
  const accentForegroundColor = useThemeColor("accent-foreground");
  const dividerColor = useThemeColor("divider");

  const isLoading = exercises === undefined;
  const filteredExercises = exercises || [];

  const handleCreatePress = () => {
    router.push("/exercises-create-modal");
  };

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    scrollY.value = offsetY;
    setIsScrolled(offsetY > 20);
  };

  const searchAnimatedStyle = useAnimatedStyle(() => {
    const isScrolled = scrollY.value > 20;
    return {
      height: withTiming(isScrolled ? 40 : 48, { duration: 200 }),
      paddingVertical: withTiming(isScrolled ? 8 : 12, { duration: 200 }),
    };
  });

  const searchIconSize = useAnimatedStyle(() => {
    const scrolled = scrollY.value > 20;
    return {
      transform: [{ scale: withTiming(scrolled ? 0.8 : 1, { duration: 200 }) }],
    };
  });

  // ...

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View
        className="bg-background border-b border-divider"
        style={{ zIndex: 10 }}>
        <View className="p-4 pb-3">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-1">
              <Text className="text-2xl font-bold text-foreground">
                Exercise Library
              </Text>
              <Text className="text-sm text-muted mt-1">
                Browse and manage your exercises
              </Text>
            </View>
            <Pressable
              onPress={handleCreatePress}
              className="bg-accent p-3 rounded-lg active:opacity-70 flex-row items-center gap-2">
              <Ionicons name="add" size={20} color={accentForegroundColor} />
              <Text className="text-accent-foreground font-semibold">
                Create
              </Text>
            </Pressable>
          </View>

          <View className="flex-row gap-2 mb-3">
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
                    setSelectedCategory(
                      selectedCategory === cat ? undefined : cat
                    )
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

          <Animated.View
            className="flex-row items-center gap-2 bg-surface border border-divider rounded-lg px-3"
            style={searchAnimatedStyle}>
            <Animated.View style={searchIconSize}>
              <Ionicons name="search" size={20} color={mutedColor} />
            </Animated.View>
            <TextInput
              value={searchTerm}
              onChangeText={setSearchTerm}
              placeholder="Search exercises..."
              placeholderTextColor={mutedColor}
              className="flex-1 text-foreground"
              style={{
                fontSize: isScrolled ? 14 : 16,
                color: foregroundColor,
              }}
            />
            {searchTerm.length > 0 && (
              <Pressable onPress={() => setSearchTerm("")}>
                <Ionicons name="close-circle" size={20} color={mutedColor} />
              </Pressable>
            )}
          </Animated.View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4"
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}>
        {isLoading && (
          <View className="items-center justify-center py-12">
            <ActivityIndicator size="large" color={accentColor} />
            <Text className="text-muted mt-4">Loading exercises...</Text>
          </View>
        )}

        {!isLoading && filteredExercises.length === 0 && (
          <Card className="items-center justify-center py-12">
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
              {searchTerm || selectedCategory
                ? "Try adjusting your search or filter"
                : "Add a custom exercise to get started"}
            </Text>
          </Card>
        )}

        {!isLoading && filteredExercises.length > 0 && (
          <View className="gap-3">
            {filteredExercises.map((exercise) => (
              <View
                key={exercise._id}
                className="bg-surface border border-divider rounded-xl p-4"
                style={{
                  borderWidth: 1,
                  borderColor: dividerColor,
                }}>
                <View className="flex-row items-start justify-between">
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-foreground mb-2">
                      {exercise.name}
                    </Text>
                    <View className="self-start mb-2">
                      <Chip className="px-2 py-1" variant="secondary" size="sm">
                        <Chip.Label>{exercise.category}</Chip.Label>
                      </Chip>
                    </View>
                    {exercise.muscleGroup && (
                      <Text className="text-sm text-muted">
                        {exercise.muscleGroup}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
