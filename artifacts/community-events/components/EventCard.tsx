import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import type { Event, EventCategory } from "@/context/EventsContext";
import { useEvents } from "@/context/EventsContext";

const CATEGORY_ICONS: Record<EventCategory, string> = {
  social: "users",
  fitness: "activity",
  food: "coffee",
  study: "book",
  entertainment: "film",
  other: "star",
};

const CATEGORY_LABELS: Record<EventCategory, string> = {
  social: "Social",
  fitness: "Fitness",
  food: "Food",
  study: "Study",
  entertainment: "Fun",
  other: "Other",
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(diff / (1000 * 60 * 60));

  if (days === 0 && hours <= 24) {
    if (hours <= 0) return "Today";
    return `Today, ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  }
  if (days === 1) return `Tomorrow, ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  return date.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" }) +
    ` · ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
}

function formatDeadline(deadlineStr: string): string {
  const deadline = new Date(deadlineStr);
  const now = new Date();
  const diff = deadline.getTime() - now.getTime();

  if (diff < 0) return "Deadline passed";

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours < 1) return `${minutes}m left to sign up`;
  if (hours < 24) return `${hours}h left to sign up`;
  const days = Math.floor(hours / 24);
  return `${days}d left to sign up`;
}

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const colors = useColors();
  const router = useRouter();
  const { isJoined, isFull, isPastDeadline } = useEvents();

  const scale = React.useRef(new Animated.Value(1)).current;

  const joined = isJoined(event.id);
  const full = isFull(event);
  const pastDeadline = isPastDeadline(event);
  const filledSpots = event.signedUpUserIds.length;
  const spotsLeft = event.totalSpots - filledSpots;
  const fillPercent = filledSpots / event.totalSpots;

  const categoryColor = (colors as Record<string, string>)[event.category] || colors.other;
  const icon = CATEGORY_ICONS[event.category];

  function onPressIn() {
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 50 }).start();
  }

  function onPressOut() {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30 }).start();
  }

  function onPress() {
    Haptics.selectionAsync();
    router.push(`/event/${event.id}`);
  }

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      marginHorizontal: 16,
      marginBottom: 12,
      padding: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
    header: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12,
    },
    categoryBadge: {
      width: 40,
      height: 40,
      borderRadius: 10,
      backgroundColor: categoryColor + "18",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    headerText: {
      flex: 1,
    },
    title: {
      fontSize: 16,
      fontWeight: "600" as const,
      color: colors.foreground,
      fontFamily: "Inter_600SemiBold",
      marginBottom: 2,
    },
    categoryLabel: {
      fontSize: 12,
      color: categoryColor,
      fontFamily: "Inter_500Medium",
      fontWeight: "500" as const,
    },
    joinedBadge: {
      backgroundColor: colors.primary + "15",
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 20,
      alignSelf: "flex-start",
    },
    joinedText: {
      fontSize: 11,
      color: colors.primary,
      fontFamily: "Inter_600SemiBold",
      fontWeight: "600" as const,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 12,
    },
    metaRow: {
      flexDirection: "row",
      gap: 16,
      marginBottom: 12,
    },
    metaItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    metaText: {
      fontSize: 13,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
    },
    spotsRow: {
      gap: 6,
    },
    spotsHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    spotsText: {
      fontSize: 13,
      fontFamily: "Inter_500Medium",
      fontWeight: "500" as const,
    },
    deadlineText: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
    },
    progressBg: {
      height: 4,
      backgroundColor: colors.border,
      borderRadius: 2,
      overflow: "hidden",
    },
    progressFill: {
      height: 4,
      borderRadius: 2,
    },
  });

  const spotsColor = full ? colors.destructive : spotsLeft <= 3 ? colors.warning : colors.success;
  const deadlineColor = pastDeadline ? colors.destructive : colors.mutedForeground;

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={styles.card}
      >
        <View style={styles.header}>
          <View style={styles.categoryBadge}>
            <Feather name={icon as "star"} size={18} color={categoryColor} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title} numberOfLines={1}>{event.title}</Text>
            <Text style={styles.categoryLabel}>{CATEGORY_LABELS[event.category]}</Text>
          </View>
          {joined && (
            <View style={styles.joinedBadge}>
              <Text style={styles.joinedText}>Joined</Text>
            </View>
          )}
        </View>

        <View style={styles.divider} />

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Feather name="calendar" size={13} color={colors.mutedForeground} />
            <Text style={styles.metaText}>{formatDate(event.date)}</Text>
          </View>
          <View style={styles.metaItem}>
            <Feather name="map-pin" size={13} color={colors.mutedForeground} />
            <Text style={styles.metaText} numberOfLines={1}>{event.location}</Text>
          </View>
        </View>

        <View style={styles.spotsRow}>
          <View style={styles.spotsHeader}>
            <Text style={[styles.spotsText, { color: spotsColor }]}>
              {full ? "Fully booked" : `${filledSpots} of ${event.totalSpots} spots filled`}
            </Text>
            <Text style={[styles.deadlineText, { color: deadlineColor }]}>
              {formatDeadline(event.signUpDeadline)}
            </Text>
          </View>
          <View style={styles.progressBg}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(fillPercent * 100, 100)}%`,
                  backgroundColor: spotsColor,
                },
              ]}
            />
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}
