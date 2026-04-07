import React, { useEffect, useMemo, useState } from "react";
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Platform, TouchableWithoutFeedback, StatusBar } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import DatePicker from "react-native-ui-datepicker";
import dayjs, { Dayjs } from "dayjs";

import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/AppNavigator";
import { useWeather } from "../hooks/useWeather";
import { useTheme } from "../context/ThemeContext";

type Props = NativeStackScreenProps<RootStackParamList, "PlanMyLook">;

const moods = [
  { key: "Happy", label: "Happy", emoji: "😊" },
  { key: "Confident", label: "Confident", emoji: "😎" },
  { key: "Sad", label: "Sad", emoji: "☹️" },
  { key: "Tired", label: "Tired", emoji: "😐" },
  { key: "Excited", label: "Excited", emoji: "😁" },
];

const occasions = ["Casual", "Office", "Party", "Date", "Wedding"] as const;
const timeNeeds = ["Now", "Future"] as const;
const genders = ["Men", "Women", "Kids"] as const;

const formatDateTime = (d: Dayjs) => d.format("DD MMM YYYY | hh:mm A");

const Chip = ({
  label,
  selected,
  onPress,
  styles,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  styles: any;
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.chip, selected ? styles.chipActive : styles.chipInactive]}
  >
    <Text style={[styles.chipText, selected && styles.chipTextActive]}>{label}</Text>
  </TouchableOpacity>
);

const MoodTile = ({
  emoji,
  label,
  selected,
  onPress,
  styles,
}: {
  emoji: string;
  label: string;
  selected: boolean;
  onPress: () => void;
  styles: any;
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.moodTile, selected && styles.moodTileActive]}
  >
    <View style={styles.emojiWrap}>
      <Text style={styles.emoji}>{emoji}</Text>
    </View>
    <Text style={styles.moodLabel}>{label}</Text>
  </TouchableOpacity>
);

const SectionTitle = ({ children, styles }: { children: React.ReactNode; styles: any }) => (
  <Text style={styles.sectionTitle}>{children}</Text>
);

const PlanMyLookScreen: React.FC<Props> = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);
  const [mood, setMood] = useState<string | null>(null);
  const [occasion, setOccasion] = useState<string | null>(null);
  const [timeNeed, setTimeNeed] = useState<"Now" | "Future" | null>(null);
  const [gender, setGender] = useState<string | null>(null);

  // Drive the picker with dayjs to avoid click issues
  const [whenDj, setWhenDj] = useState<Dayjs>(dayjs());
  const [pickerOpen, setPickerOpen] = useState(false);

  const { weather, loading, error } = useWeather();

  const isFuture = timeNeed === "Future";

  useEffect(() => {
    if (timeNeed === "Now") {
      setWhenDj(dayjs());
      setPickerOpen(false);
    }
  }, [timeNeed]);

  const dateText = useMemo(() => formatDateTime(whenDj), [whenDj]);

  const handleGenerate = () => {
    const finalMood = mood ?? "Confident";
    const finalOccasion = occasion ?? "Casual";
    const finalGender = gender ?? "Unisex";
    const finalCategory = finalGender === "Men" ? "Men" : finalGender === "Women" ? "Women" : "Kids";
    const timeFlag = timeNeed === "Future" ? "FUTURE" : "NOW";
    // Keep only the params your navigator type allows
    navigation.navigate("SuggestedOutfit", {
      mood: finalMood,
      occasion: finalOccasion,
      weather: weather?.condition || "Sunny",
      category: finalCategory,
      gender: finalGender,
      timeNeed: timeNeed ?? "Now",
      selectedDate: whenDj.toISOString(),
      nowFlag: timeFlag,
    } as any);
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingRight: 8 }} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Plan My Look</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Mood block */}
        <View style={styles.panel}>
          <SectionTitle styles={styles}>How are you feeling today ?</SectionTitle>

          {/* 2 rows (3 columns then 2 columns) to match UI */}
          <View style={styles.moodRow}>
            {moods.slice(0, 3).map((m) => (
              <MoodTile
                key={m.key}
                emoji={m.emoji}
                label={m.label}
                selected={mood === m.key}
                onPress={() => setMood(m.key)}
                styles={styles}
              />
            ))}
          </View>
          <View style={styles.moodRow}>
            {moods.slice(3, 5).map((m) => (
              <MoodTile
                key={m.key}
                emoji={m.emoji}
                label={m.label}
                selected={mood === m.key}
                onPress={() => setMood(m.key)}
                styles={styles}
              />
            ))}
            {/* Spacer to maintain alignment */}
            <View style={{ width: "30%" }} />
          </View>
        </View>

        {/* Occasion */}
        <View style={{ paddingHorizontal: 25, marginTop: 12 }}>
          <SectionTitle styles={styles}>What's the occasion?</SectionTitle>
          <View style={styles.rowWrap}>
            {occasions.map((o) => (
              <Chip key={o} label={o} selected={occasion === o} onPress={() => setOccasion(o)} styles={styles} />
            ))}
          </View>
        </View>

        {/* Gender */}
        <View style={{ paddingHorizontal: 25, marginTop: 12 }}>
          <SectionTitle styles={styles}>Select Gender</SectionTitle>
          <View style={styles.rowWrap}>
            {genders.map((g) => (
              <Chip key={g} label={g} selected={gender === g} onPress={() => setGender(g)} styles={styles} />
            ))}
          </View>
        </View>

        {/* When do you need it */}
        <View style={{ paddingHorizontal: 25, marginTop: 10 }}>
          <SectionTitle styles={styles}>When do you need this outfit?</SectionTitle>
          <View style={styles.rowWrap}>
            {timeNeeds.map((t) => (
              <Chip key={t} label={t} selected={timeNeed === t} onPress={() => setTimeNeed(t)} styles={styles} />
            ))}
          </View>
        </View>

        {/* Date selector */}
        <View style={{ paddingHorizontal: 16, marginTop: 8 }}>
          <Text style={[styles.label, { color: colors.text }]}>Select Date</Text>

          <View style={styles.dateRow}>
            <View style={[styles.dateBox, { backgroundColor: colors.inputBg }, !isFuture && styles.dateBoxDisabled]}>
              <Text style={[styles.dateText, { color: colors.text }, !isFuture && styles.dateTextDisabled]}>
                {dateText}
              </Text>
            </View>

            <TouchableOpacity
              disabled={!isFuture}
              onPress={() => setPickerOpen(true)}
              style={[styles.calBtn, { backgroundColor: isDark ? colors.border : '#EDE9FE' }, !isFuture && { opacity: 0.45 }]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="calendar-outline" size={22} color={isDark ? colors.text : "#7c3aed"} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Weather */}
        <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
          <SectionTitle styles={styles}>Today’s Weather</SectionTitle>
          <View style={[styles.weatherCard, { backgroundColor: colors.card }]}>
            <Ionicons
              name={weather?.condition === "Sunny" ? "sunny-outline" : "cloud-outline"}
              size={26}
              color={weather?.condition === "Sunny" ? "#FF4D4D" : colors.textSecondary}
            />
            <View style={{ marginLeft: 12 }}>
              <Text style={[styles.weatherMain, { color: colors.text }]}>
                {loading ? "Loading..." : (weather ? `${weather.temp}°F` : "N/A")}
              </Text>
              <Text style={[styles.weatherSub, { color: colors.textSecondary }]}>
                {error || (loading ? "Fetching weather..." : (weather ? weather.condition : "Unknown"))}
              </Text>
            </View>
          </View>
        </View>

        {/* Generate button */}
        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
          <TouchableOpacity style={[styles.cta, { backgroundColor: colors.text }]} onPress={handleGenerate}>
            <Text style={[styles.ctaText, { color: colors.background }]}>Generate  My Look</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* FUTURE picker modal */}
      <Modal
        visible={pickerOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setPickerOpen(false)}
      >
        <TouchableWithoutFeedback onPress={() => setPickerOpen(false)}>
          <View style={styles.modalBackdrop} />
        </TouchableWithoutFeedback>

        <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Pick date & time</Text>
            <TouchableOpacity onPress={() => setPickerOpen(false)}>
              <Feather name="x" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          <DatePicker
            mode="single"
            // Drive with dayjs so day presses work on all builds
            date={whenDj}
            onChange={(params: any) => {
              // params.date may be Dayjs or Date
              const d = params?.date;
              if (!d) return;
              setWhenDj(dayjs.isDayjs(d) ? d : dayjs(d));
            }}
            // Guard: start at today 00:00 so you can tap any future day
            minDate={dayjs().startOf("day")}
            timePicker
            // Removed unsupported props
          />

          <TouchableOpacity style={[styles.cta, { marginTop: 12, backgroundColor: colors.text }]} onPress={() => setPickerOpen(false)}>
            <Text style={[styles.ctaText, { color: colors.background }]}>Done</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const getStyles = (colors: any, dark: boolean) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background , paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 10,
    justifyContent: "space-between",
  },
  headerTitle: { fontSize: 22, fontWeight: "700" },

  panel: {
    borderWidth: 1.5,
    borderColor: dark ? colors.border : "#828e90ff",
    borderRadius: 12,
    marginHorizontal: 16,
    padding: 12,
    marginTop: 6,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2C63FF",
    marginBottom: 10,
  },

  moodRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  moodTile: {
    width: "30%",
    backgroundColor: dark ? colors.inputBg : "#E3E3E3",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  moodTileActive: {
    borderWidth: 2,
    borderColor: "#2C63FF",
    backgroundColor: dark ? "#1E293B" : "#F1F6FF",
  },
  emojiWrap: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#FFE900",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  emoji: { fontSize: 20 },
  moodLabel: { fontWeight: "700", color: colors.text },

  rowWrap: { flexDirection: "row", flexWrap: "wrap" },

  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "transparent"
  },
  chipInactive: { backgroundColor: dark ? colors.inputBg : "#D9D9D9", borderColor: colors.border },
  chipActive: { backgroundColor: "#9DD1FF", borderColor: "#7DD3FC" },
  chipText: { fontWeight: "700", color: colors.text },
  chipTextActive: { color: "#0C1A3A" },

  label: { fontWeight: "700", marginBottom: 6 },
  dateRow: { flexDirection: "row", alignItems: "center" },
  dateBox: {
    flex: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  dateBoxDisabled: { backgroundColor: dark ? "#333" : "#EEE" },
  dateText: { fontWeight: "700" },
  dateTextDisabled: { color: colors.textMuted },
  calBtn: {
    width: 42,
    height: 42,
    marginLeft: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  weatherCard: {
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  weatherMain: { fontSize: 16, fontWeight: "700" },
  weatherSub: { },

  cta: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  ctaText: { fontWeight: "800", fontSize: 16 },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalCard: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.select({ ios: 28, android: 16 }),
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    maxHeight: "88%",
    minHeight: "60%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  modalTitle: { fontSize: 16, fontWeight: "700" },
});

export default PlanMyLookScreen;
