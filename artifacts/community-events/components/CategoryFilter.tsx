import { Feather } from "@expo/vector-icons";
import React from "react";
import { Animated, Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { useColors } from "@/hooks/useColors";
import type { EventCategory } from "@/context/EventsContext";

const CATEGORIES: { key: EventCategory | "all"; label: string; icon: string }[] = [
  { key: "all", label: "All", icon: "grid" },
  { key: "social", label: "Social", icon: "users" },
  { key: "fitness", label: "Fitness", icon: "activity" },
  { key: "food", label: "Food", icon: "coffee" },
  { key: "study", label: "Study", icon: "book" },
  { key: "entertainment", label: "Fun", icon: "film" },
  { key: "other", label: "Other", icon: "star" },
];

interface CategoryFilterProps {
  selected: EventCategory | "all";
  onSelect: (cat: EventCategory | "all") => void;
}

export function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  const colors = useColors();

  const categoryColors: Record<string, string> = {
    all: colors.primary,
    social: (colors as Record<string, string>).social || "#8b5cf6",
    fitness: (colors as Record<string, string>).fitness || "#10b981",
    food: (colors as Record<string, string>).food || "#f59e0b",
    study: (colors as Record<string, string>).study || "#3b82f6",
    entertainment: (colors as Record<string, string>).entertainment || "#ec4899",
    other: (colors as Record<string, string>).other || "#6b7280",
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {CATEGORIES.map(cat => {
        const isSelected = selected === cat.key;
        const color = categoryColors[cat.key];

        return (
          <CategoryChip
            key={cat.key}
            label={cat.label}
            icon={cat.icon}
            isSelected={isSelected}
            color={color}
            onPress={() => onSelect(cat.key)}
            colors={colors}
          />
        );
      })}
    </ScrollView>
  );
}

interface ChipProps {
  label: string;
  icon: string;
  isSelected: boolean;
  color: string;
  onPress: () => void;
  colors: ReturnType<typeof useColors>;
}

function CategoryChip({ label, icon, isSelected, color, onPress, colors }: ChipProps) {
  const scale = React.useRef(new Animated.Value(1)).current;

  function onPressIn() {
    Animated.spring(scale, { toValue: 0.93, useNativeDriver: true, speed: 50 }).start();
  }
  function onPressOut() {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30 }).start();
  }

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={[
          styles.chip,
          {
            backgroundColor: isSelected ? color : colors.card,
            borderColor: isSelected ? color : colors.border,
          },
        ]}
      >
        <Feather
          name={icon as "star"}
          size={13}
          color={isSelected ? "#fff" : color}
        />
        <Text
          style={[
            styles.chipLabel,
            { color: isSelected ? "#fff" : colors.foreground },
          ]}
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    flexDirection: "row",
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    fontWeight: "500" as const,
  },
});
