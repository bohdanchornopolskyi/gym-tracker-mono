import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Uniwind, useUniwind } from "uniwind";

export const ThemeSwitcher = () => {
  const { theme, hasAdaptiveThemes } = useUniwind();

  const themes = [
    { name: "light", label: "Light", icon: "sunny" },
    { name: "dark", label: "Dark", icon: "moon" },
    { name: "system", label: "System", icon: "options" },
  ] as const;
  const activeTheme = hasAdaptiveThemes ? "system" : theme;
  const currentTheme = themes.find((t) => t.name === activeTheme) || themes[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Icon name={currentTheme.icon} className="size-4" />
          <Text>{currentTheme.label}</Text>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuRadioGroup
          value={activeTheme}
          onValueChange={(value) => {
            if (value === "light" || value === "dark" || value === "system") {
              Uniwind.setTheme(value);
            }
          }}>
          {themes.map((t) => (
            <DropdownMenuRadioItem key={t.name} value={t.name}>
              <Icon name={t.icon} className="size-4 mr-2" />
              <Text>{t.label}</Text>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
