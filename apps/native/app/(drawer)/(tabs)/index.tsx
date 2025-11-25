import { Container } from "@/components/container";
import { Text, View, Pressable } from "react-native";
import { Card, useThemeColor } from "heroui-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function Home() {
  const accentForegroundColor = useThemeColor("accent-foreground");
  const accentColor = useThemeColor("accent");

  const handleStartWorkout = () => {
    router.push("/workout-create-modal");
  };

  return (
    <Container className="p-6">
      <View className="flex-1 justify-center items-center gap-6">
        <Card variant="secondary" className="p-8 items-center">
          <Card.Title className="text-3xl mb-2">Tab One</Card.Title>
        </Card>
        <Pressable
          onPress={handleStartWorkout}
          className="bg-accent p-4 rounded-lg active:opacity-70 flex-row items-center gap-2">
          <Ionicons name="fitness" size={24} color={accentForegroundColor} />
          <Text className="text-accent-foreground font-semibold text-lg">
            Start Workout
          </Text>
        </Pressable>
      </View>
    </Container>
  );
}
