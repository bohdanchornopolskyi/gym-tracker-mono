import { cn } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { withUniwind } from "uniwind";

const StyledIonicons = withUniwind(Ionicons);

type IconProps = {
  name: ComponentProps<typeof Ionicons>["name"];
  size?: number;
  color?: string;
  className?: string;
};

function Icon({ name, size = 24, color, className }: IconProps) {
  return (
    <StyledIonicons
      name={name}
      size={size}
      color={color}
      className={cn("text-foreground", className)}
    />
  );
}

export { Icon };
