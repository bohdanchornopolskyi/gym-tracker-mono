import { Container } from "@/components/container";
import { Text, View, Pressable } from "react-native";
import { Card, useThemeColor } from "heroui-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@gym-tracker-mono/backend/convex/_generated/api";
import { SignIn } from "@/components/sign-in";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

type NavButton = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  route: string;
  color?: "accent" | "primary" | "secondary";
};

export default function Home() {
  const { isAuthenticated } = useConvexAuth();
  const user = useQuery(api.auth.getCurrentUser, isAuthenticated ? {} : "skip");
  const accentForegroundColor = useThemeColor("accent-foreground");
  const accentColor = useThemeColor("accent");
  const foregroundColor = useThemeColor("foreground");
  const surfaceColor = useThemeColor("surface");
  const dividerColor = useThemeColor("divider");

  if (!isAuthenticated) {
    return (
      <Container className="p-6">
        <SignIn />
      </Container>
    );
  }

  const navButtons: NavButton[] = [
    {
      icon: "fitness",
      label: "Start Workout",
      route: "/workout-create-modal",
      color: "accent",
    },
    {
      icon: "time",
      label: "Workout History",
      route: "/(tabs)/history",
    },
    {
      icon: "barbell",
      label: "Browse Exercises",
      route: "/(tabs)/exercises",
    },
    {
      icon: "bookmark",
      label: "Manage Presets",
      route: "/(tabs)/presets",
    },
    {
      icon: "checkbox-outline",
      label: "View Todos",
      route: "/todos",
    },
  ];

  const handleNavPress = (route: string) => {
    router.push(route as any);
  };

  return (
    <Container className="p-6">
      <View className="flex-1 gap-6">
        {/* Welcome Section */}
        <Card variant="secondary" className="p-6">
          <Text className="text-3xl font-bold text-foreground mb-2">
            Welcome Back!
          </Text>
          <Text className="text-muted text-base mb-4">{user?.email}</Text>
          <Pressable
            onPress={() => authClient.signOut()}
            className="self-start mt-2">
            <Text className="text-accent font-medium">Sign Out</Text>
          </Pressable>
          <Button variant="default" onPress={() => authClient.signOut()}>
            <Text>Sign Out</Text>
          </Button>
        </Card>

        {/* Quick Actions */}
        <View className="flex-1 gap-4">
          <Text className="text-xl font-semibold text-foreground">
            Quick Actions
          </Text>

          {/* Primary Action - Start Workout */}
          <Pressable
            onPress={() => handleNavPress(navButtons[0].route)}
            className="bg-accent p-6 rounded-xl active:opacity-70 flex-row items-center justify-between"
            style={{
              shadowColor: accentColor,
              shadowOpacity: 0.3,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 4 },
              elevation: 5,
            }}>
            <View className="flex-row items-center gap-3">
              <View className="bg-accent-foreground/20 p-3 rounded-full">
                <Ionicons
                  name={navButtons[0].icon}
                  size={28}
                  color={accentForegroundColor}
                />
              </View>
              <Text className="text-accent-foreground font-bold text-lg">
                {navButtons[0].label}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={24}
              color={accentForegroundColor}
            />
          </Pressable>

          {/* Other Actions */}
          <View className="gap-3">
            {navButtons.slice(1).map((button, index) => (
              <Pressable
                key={index}
                onPress={() => handleNavPress(button.route)}
                className="bg-surface border border-divider p-4 rounded-xl active:opacity-70 flex-row items-center justify-between"
                style={{ borderColor: dividerColor }}>
                <View className="flex-row items-center gap-3">
                  <Ionicons
                    name={button.icon}
                    size={24}
                    color={foregroundColor}
                  />
                  <Text className="text-foreground font-semibold text-base">
                    {button.label}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={foregroundColor}
                />
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </Container>
  );
}
