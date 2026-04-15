import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import type { EventCategory } from "@/context/EventsContext";
import { useEvents } from "@/context/EventsContext";

const CATEGORIES: { key: EventCategory; label: string; icon: string }[] = [
  { key: "social", label: "Social", icon: "users" },
  { key: "fitness", label: "Fitness", icon: "activity" },
  { key: "food", label: "Food", icon: "coffee" },
  { key: "study", label: "Study", icon: "book" },
  { key: "entertainment", label: "Fun", icon: "film" },
  { key: "other", label: "Other", icon: "star" },
];

interface CreateEventModalProps {
  visible: boolean;
  onClose: () => void;
}

function addDays(days: number): string {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().slice(0, 16);
}

export function CreateEventModal({ visible, onClose }: CreateEventModalProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addEvent } = useEvents();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState<EventCategory>("social");
  const [totalSpots, setTotalSpots] = useState("10");
  const [eventDate, setEventDate] = useState(addDays(3));
  const [deadline, setDeadline] = useState(addDays(2));

  const categoryColors: Record<string, string> = {
    social: (colors as Record<string, string>).social || "#8b5cf6",
    fitness: (colors as Record<string, string>).fitness || "#10b981",
    food: (colors as Record<string, string>).food || "#f59e0b",
    study: (colors as Record<string, string>).study || "#3b82f6",
    entertainment: (colors as Record<string, string>).entertainment || "#ec4899",
    other: (colors as Record<string, string>).other || "#6b7280",
  };

  function handleCreate() {
    if (!title.trim()) {
      Alert.alert("Missing title", "Please enter an event title.");
      return;
    }
    if (!location.trim()) {
      Alert.alert("Missing location", "Please enter a location.");
      return;
    }
    const spots = parseInt(totalSpots);
    if (isNaN(spots) || spots < 1 || spots > 200) {
      Alert.alert("Invalid spots", "Please enter a number of spots between 1 and 200.");
      return;
    }
    const eventDateObj = new Date(eventDate);
    const deadlineObj = new Date(deadline);
    if (isNaN(eventDateObj.getTime())) {
      Alert.alert("Invalid date", "Please enter a valid event date.");
      return;
    }
    if (isNaN(deadlineObj.getTime())) {
      Alert.alert("Invalid deadline", "Please enter a valid deadline.");
      return;
    }
    if (deadlineObj >= eventDateObj) {
      Alert.alert("Invalid deadline", "Deadline must be before the event date.");
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    addEvent({
      title: title.trim(),
      description: description.trim(),
      location: location.trim(),
      category,
      totalSpots: spots,
      date: eventDateObj.toISOString(),
      signUpDeadline: deadlineObj.toISOString(),
    });

    setTitle("");
    setDescription("");
    setLocation("");
    setCategory("social");
    setTotalSpots("10");
    setEventDate(addDays(3));
    setDeadline(addDays(2));
    onClose();
  }

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "flex-end",
    },
    sheet: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: "92%",
      paddingBottom: insets.bottom + 16,
    },
    handle: {
      width: 36,
      height: 4,
      backgroundColor: colors.border,
      borderRadius: 2,
      alignSelf: "center",
      marginTop: 12,
      marginBottom: 8,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "600" as const,
      color: colors.foreground,
      fontFamily: "Inter_600SemiBold",
    },
    closeBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.secondary,
      alignItems: "center",
      justifyContent: "center",
    },
    scrollContent: {
      padding: 20,
      gap: 16,
    },
    label: {
      fontSize: 13,
      fontWeight: "500" as const,
      color: colors.mutedForeground,
      fontFamily: "Inter_500Medium",
      marginBottom: 6,
    },
    input: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: colors.radius - 4,
      padding: 12,
      fontSize: 15,
      color: colors.foreground,
      fontFamily: "Inter_400Regular",
    },
    textArea: {
      minHeight: 72,
      textAlignVertical: "top",
    },
    row: {
      flexDirection: "row",
      gap: 12,
    },
    halfField: {
      flex: 1,
    },
    categoryGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    categoryChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
    },
    categoryChipText: {
      fontSize: 13,
      fontFamily: "Inter_500Medium",
      fontWeight: "500" as const,
    },
    createBtn: {
      backgroundColor: colors.primary,
      borderRadius: colors.radius,
      padding: 16,
      alignItems: "center",
      marginHorizontal: 20,
      marginTop: 8,
    },
    createBtnText: {
      color: colors.primaryForeground,
      fontSize: 16,
      fontWeight: "600" as const,
      fontFamily: "Inter_600SemiBold",
    },
  });

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Create Event</Text>
            <Pressable style={styles.closeBtn} onPress={onClose}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </Pressable>
          </View>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View>
              <Text style={styles.label}>EVENT TITLE</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="e.g. Movie Night, Morning Run..."
                placeholderTextColor={colors.mutedForeground}
                returnKeyType="next"
              />
            </View>

            <View>
              <Text style={styles.label}>DESCRIPTION</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="What's the event about?"
                placeholderTextColor={colors.mutedForeground}
                multiline
                numberOfLines={3}
              />
            </View>

            <View>
              <Text style={styles.label}>LOCATION</Text>
              <TextInput
                style={styles.input}
                value={location}
                onChangeText={setLocation}
                placeholder="e.g. Common Room B, Floor 3"
                placeholderTextColor={colors.mutedForeground}
              />
            </View>

            <View>
              <Text style={styles.label}>CATEGORY</Text>
              <View style={styles.categoryGrid}>
                {CATEGORIES.map(cat => {
                  const isSelected = category === cat.key;
                  const color = categoryColors[cat.key];
                  return (
                    <Pressable
                      key={cat.key}
                      style={[
                        styles.categoryChip,
                        {
                          backgroundColor: isSelected ? color : colors.card,
                          borderColor: isSelected ? color : colors.border,
                        },
                      ]}
                      onPress={() => setCategory(cat.key)}
                    >
                      <Feather name={cat.icon as "star"} size={13} color={isSelected ? "#fff" : color} />
                      <Text style={[styles.categoryChipText, { color: isSelected ? "#fff" : colors.foreground }]}>
                        {cat.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.halfField}>
                <Text style={styles.label}>TOTAL SPOTS</Text>
                <TextInput
                  style={styles.input}
                  value={totalSpots}
                  onChangeText={setTotalSpots}
                  keyboardType="number-pad"
                  placeholder="10"
                  placeholderTextColor={colors.mutedForeground}
                />
              </View>
            </View>

            <View>
              <Text style={styles.label}>EVENT DATE & TIME</Text>
              <TextInput
                style={styles.input}
                value={eventDate}
                onChangeText={setEventDate}
                placeholder={Platform.OS === "ios" ? "YYYY-MM-DDTHH:MM" : "YYYY-MM-DDTHH:MM"}
                placeholderTextColor={colors.mutedForeground}
              />
              <Text style={{ fontSize: 11, color: colors.mutedForeground, marginTop: 4, fontFamily: "Inter_400Regular" }}>
                Format: YYYY-MM-DDTHH:MM (e.g. {addDays(3)})
              </Text>
            </View>

            <View>
              <Text style={styles.label}>SIGN-UP DEADLINE</Text>
              <TextInput
                style={styles.input}
                value={deadline}
                onChangeText={setDeadline}
                placeholder="YYYY-MM-DDTHH:MM"
                placeholderTextColor={colors.mutedForeground}
              />
              <Text style={{ fontSize: 11, color: colors.mutedForeground, marginTop: 4, fontFamily: "Inter_400Regular" }}>
                Must be before the event date
              </Text>
            </View>
          </ScrollView>

          <Pressable style={styles.createBtn} onPress={handleCreate}>
            <Text style={styles.createBtnText}>Create Event</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
