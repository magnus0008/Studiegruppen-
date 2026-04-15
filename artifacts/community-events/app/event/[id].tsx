import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { EventCategory } from "@/context/EventsContext";
import { useEvents } from "@/context/EventsContext";
import { useColors } from "@/hooks/useColors";

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
  food: "Food & Drinks",
  study: "Study Group",
  entertainment: "Entertainment",
  other: "Other",
};

function formatFullDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString([], {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }) + " at " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDeadlineFull(deadlineStr: string): string {
  const deadline = new Date(deadlineStr);
  const now = new Date();
  if (deadline < now) return "Deadline has passed";
  const diff = deadline.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) {
    const mins = Math.floor(diff / (1000 * 60));
    return `Closes in ${mins} minute${mins !== 1 ? "s" : ""}`;
  }
  if (hours < 24) return `Closes in ${hours} hour${hours !== 1 ? "s" : ""}`;
  const days = Math.floor(hours / 24);
  return `Closes in ${days} day${days !== 1 ? "s" : ""}`;
}

export default function EventDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { events, isJoined, isFull, isPastDeadline, joinEvent, leaveEvent } = useEvents();

  const event = events.find(e => e.id === id);

  const buttonScale = React.useRef(new Animated.Value(1)).current;

  function onBtnPressIn() {
    Animated.spring(buttonScale, { toValue: 0.96, useNativeDriver: true, speed: 50 }).start();
  }
  function onBtnPressOut() {
    Animated.spring(buttonScale, { toValue: 1, useNativeDriver: true, speed: 30 }).start();
  }

  if (!event) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>Event not found</Text>
      </View>
    );
  }

  const joined = isJoined(event.id);
  const full = isFull(event);
  const pastDeadline = isPastDeadline(event);
  const filledSpots = event.signedUpUserIds.length;
  const spotsLeft = event.totalSpots - filledSpots;
  const fillPercent = filledSpots / event.totalSpots;
  const categoryColor = (colors as Record<string, string>)[event.category] || "#6b7280";
  const icon = CATEGORY_ICONS[event.category];

  const canJoin = !joined && !full && !pastDeadline;
  const canLeave = joined && !pastDeadline;

  function handleJoin() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    joinEvent(event!.id);
  }

  function handleLeave() {
    Alert.alert(
      "Cancel sign-up",
      "Are you sure you want to leave this event?",
      [
        { text: "Keep my spot", style: "cancel" },
        {
          text: "Leave event",
          style: "destructive",
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            leaveEvent(event!.id);
          },
        },
      ]
    );
  }

  const spotsColor = full ? colors.destructive : spotsLeft <= 3 ? colors.warning : colors.success;
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    navBar: {
      paddingTop: topPad + 8,
      paddingHorizontal: 16,
      paddingBottom: 8,
      flexDirection: "row",
      alignItems: "center",
    },
    backBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.secondary,
      alignItems: "center",
      justifyContent: "center",
    },
    scroll: {
      flex: 1,
    },
    heroSection: {
      paddingHorizontal: 20,
      paddingTop: 8,
      paddingBottom: 24,
    },
    categoryRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginBottom: 12,
    },
    categoryDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: categoryColor,
    },
    categoryLabel: {
      fontSize: 13,
      color: categoryColor,
      fontFamily: "Inter_500Medium",
      fontWeight: "500" as const,
    },
    title: {
      fontSize: 24,
      fontWeight: "700" as const,
      color: colors.foreground,
      fontFamily: "Inter_700Bold",
      lineHeight: 30,
      marginBottom: 16,
    },
    spotsCard: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    spotsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10,
    },
    spotsCount: {
      fontSize: 16,
      fontWeight: "600" as const,
      fontFamily: "Inter_600SemiBold",
    },
    spotsAvailable: {
      fontSize: 13,
      fontFamily: "Inter_400Regular",
    },
    progressBg: {
      height: 6,
      backgroundColor: colors.border,
      borderRadius: 3,
      overflow: "hidden",
      marginBottom: 10,
    },
    progressFill: {
      height: 6,
      borderRadius: 3,
    },
    deadlineRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },
    deadlineText: {
      fontSize: 13,
      fontFamily: "Inter_400Regular",
    },
    section: {
      paddingHorizontal: 20,
      paddingBottom: 20,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: "500" as const,
      color: colors.mutedForeground,
      fontFamily: "Inter_500Medium",
      marginBottom: 12,
      letterSpacing: 0.5,
    },
    infoCard: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
    },
    infoRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12,
      padding: 14,
    },
    infoIconWrap: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: categoryColor + "18",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    infoContent: {
      flex: 1,
    },
    infoLabel: {
      fontSize: 11,
      color: colors.mutedForeground,
      fontFamily: "Inter_500Medium",
      fontWeight: "500" as const,
      marginBottom: 2,
      textTransform: "uppercase" as const,
      letterSpacing: 0.5,
    },
    infoValue: {
      fontSize: 15,
      color: colors.foreground,
      fontFamily: "Inter_400Regular",
    },
    infoDivider: {
      height: 1,
      backgroundColor: colors.border,
      marginLeft: 58,
    },
    descriptionText: {
      fontSize: 15,
      color: colors.foreground,
      fontFamily: "Inter_400Regular",
      lineHeight: 22,
    },
    footer: {
      padding: 20,
      paddingBottom: bottomPad + 20,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.background,
    },
    joinBtn: {
      borderRadius: colors.radius,
      padding: 16,
      alignItems: "center",
    },
    joinBtnText: {
      fontSize: 16,
      fontWeight: "600" as const,
      fontFamily: "Inter_600SemiBold",
    },
    disabledInfo: {
      textAlign: "center",
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      marginTop: 8,
    },
  });

  let btnBg = colors.primary;
  let btnText = "Join Event";
  let btnTextColor = colors.primaryForeground;
  let btnDisabled = false;

  if (joined) {
    if (canLeave) {
      btnBg = colors.destructive + "15";
      btnText = "Leave Event";
      btnTextColor = colors.destructive;
    } else {
      btnBg = colors.muted;
      btnText = "You're going!";
      btnTextColor = colors.mutedForeground;
      btnDisabled = true;
    }
  } else if (full) {
    btnBg = colors.muted;
    btnText = "Fully Booked";
    btnTextColor = colors.mutedForeground;
    btnDisabled = true;
  } else if (pastDeadline) {
    btnBg = colors.muted;
    btnText = "Sign-up Closed";
    btnTextColor = colors.mutedForeground;
    btnDisabled = true;
  }

  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={18} color={colors.foreground} />
        </Pressable>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <View style={styles.categoryRow}>
            <View style={styles.categoryDot} />
            <Feather name={icon as "star"} size={13} color={categoryColor} />
            <Text style={styles.categoryLabel}>{CATEGORY_LABELS[event.category]}</Text>
          </View>

          <Text style={styles.title}>{event.title}</Text>

          <View style={styles.spotsCard}>
            <View style={styles.spotsRow}>
              <Text style={[styles.spotsCount, { color: spotsColor }]}>
                {filledSpots} of {event.totalSpots} spots filled
              </Text>
              {!full && (
                <Text style={[styles.spotsAvailable, { color: spotsColor }]}>
                  {spotsLeft} left
                </Text>
              )}
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
            <View style={styles.deadlineRow}>
              <Feather
                name="clock"
                size={13}
                color={pastDeadline ? colors.destructive : colors.mutedForeground}
              />
              <Text style={[styles.deadlineText, { color: pastDeadline ? colors.destructive : colors.mutedForeground }]}>
                {formatDeadlineFull(event.signUpDeadline)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DETAILS</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoIconWrap}>
                <Feather name="calendar" size={16} color={categoryColor} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Date & Time</Text>
                <Text style={styles.infoValue}>{formatFullDate(event.date)}</Text>
              </View>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoRow}>
              <View style={styles.infoIconWrap}>
                <Feather name="map-pin" size={16} color={categoryColor} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Location</Text>
                <Text style={styles.infoValue}>{event.location}</Text>
              </View>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoRow}>
              <View style={styles.infoIconWrap}>
                <Feather name="users" size={16} color={categoryColor} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Capacity</Text>
                <Text style={styles.infoValue}>{event.totalSpots} spots total</Text>
              </View>
            </View>
          </View>
        </View>

        {!!event.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ABOUT THIS EVENT</Text>
            <Text style={styles.descriptionText}>{event.description}</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <Pressable
            style={[styles.joinBtn, { backgroundColor: btnBg }]}
            disabled={btnDisabled}
            onPress={joined && canLeave ? handleLeave : canJoin ? handleJoin : undefined}
            onPressIn={!btnDisabled ? onBtnPressIn : undefined}
            onPressOut={!btnDisabled ? onBtnPressOut : undefined}
          >
            <Text style={[styles.joinBtnText, { color: btnTextColor }]}>{btnText}</Text>
          </Pressable>
        </Animated.View>
        {(pastDeadline && joined) && (
          <Text style={styles.disabledInfo}>Sign-up deadline has passed — your spot is confirmed</Text>
        )}
        {(pastDeadline && !joined && !full) && (
          <Text style={styles.disabledInfo}>Sign-up deadline has passed for this event</Text>
        )}
      </View>
    </View>
  );
}
