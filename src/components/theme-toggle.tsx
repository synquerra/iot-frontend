"use client";

import { Moon, Sun } from "lucide-react";
import { ActionIcon, useMantineColorScheme } from "@mantine/core";

export function ThemeToggle() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <ActionIcon
      variant="default"
      color="gray"
      size="lg"
      radius="md"
      onClick={() => setColorScheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </ActionIcon>
  );
}
