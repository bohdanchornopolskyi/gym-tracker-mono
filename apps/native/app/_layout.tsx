import "@/global.css";

import { ConvexReactClient } from "convex/react";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { authClient } from "@/lib/auth-client";

import { Stack } from "expo-router";
import { HeroUINativeProvider } from "heroui-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppThemeProvider } from "@/contexts/app-theme-context";
import { PortalHost } from "@rn-primitives/portal";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL || "";
const convex = new ConvexReactClient(convexUrl, {
  unsavedChangesWarning: false,
});

function StackLayout() {
  return (
    <Stack screenOptions={{}}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="modal"
        options={{ title: "Modal", presentation: "modal" }}
      />
      <Stack.Screen
        name="exercises-create-modal"
        options={{ title: "Create Exercise", presentation: "modal" }}
      />
      <Stack.Screen
        name="workout-create-modal"
        options={{ title: "New Workout", presentation: "modal" }}
      />
      <Stack.Screen name="gym" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function Layout() {
  return (
    <ConvexBetterAuthProvider client={convex} authClient={authClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <KeyboardProvider>
          <AppThemeProvider>
            <SafeAreaProvider>
              <HeroUINativeProvider>
                <StackLayout />
                <PortalHost />
              </HeroUINativeProvider>
            </SafeAreaProvider>
          </AppThemeProvider>
        </KeyboardProvider>
      </GestureHandlerRootView>
    </ConvexBetterAuthProvider>
  );
}
