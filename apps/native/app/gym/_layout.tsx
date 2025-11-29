import { Stack } from "expo-router";

export default function GymLayout() {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen
        name="history/index"
        options={{
          title: "History",
          headerBackTitle: "Back",
        }}
      />
      <Stack.Screen
        name="workout/edit/[id]"
        options={{
          title: "Edit Workout",
          headerBackTitle: "Back",
        }}
      />
    </Stack>
  );
}
