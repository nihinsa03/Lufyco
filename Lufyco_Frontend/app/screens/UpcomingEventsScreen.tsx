import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Modal,
  TextInput,
  Platform,
  StatusBar,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/AppNavigator";
import { useTheme } from "../context/ThemeContext";

import api from "../api/api";
import { useAuthStore } from "../store/useAuthStore";

type Props = NativeStackScreenProps<RootStackParamList, "UpcomingEvents">;

export type OutfitItem = {
  id: string;
  label: string;
  image: any;
  source?: "closet" | "product" | string;
  product?: any;
  slot?: string | null;
  price?: number | null;
};

export type EventCard = {
  id: string;
  title: string;
  dateLine: string;
  time: string;
  outfit: OutfitItem[];
};

const UpcomingEventsScreen: React.FC<Props> = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  const [events, setEvents] = useState<EventCard[]>([]);
  const [loading, setLoading] = useState(false);

  const [editVisible, setEditVisible] = useState(false);
  const [editTarget, setEditTarget] = useState<EventCard | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");

  const [addVisible, setAddVisible] = useState(false);
  const [addTitle, setAddTitle] = useState("");
  const [addDate, setAddDate] = useState("");
  const [addTime, setAddTime] = useState("");
  const userId = useAuthStore.getState().user?.id;

  const mapApiToEventCard = (apiEvent: any): EventCard => ({
    id: apiEvent._id,
    title: apiEvent.occasion || "Event",
    dateLine: new Date(apiEvent.selectedDate).toDateString(),
    time: apiEvent.timeNeed || "TBD",
    outfit: Array.isArray(apiEvent.items)
      ? apiEvent.items.map((item: any, index: number) => ({
          id: String(item._id || item.productId || `${apiEvent._id}-${index}`),
          label: item.name || "Item",
          image: { uri: item.image },
          source: item.source || "closet",
          product: item,
          slot: item.slot || null,
          price: typeof item.price === "number" ? item.price : null,
        }))
      : [],
  });

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/ai/my-upcomming?userId=${userId}`);
      const mapped = res.data.map(mapApiToEventCard);
      setEvents(mapped);
    } catch (err: any) {
      console.error("Fetch Events Error:", err.message);
      Alert.alert("Error", "Failed to fetch events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const openEdit = (event: EventCard) => {
    setEditTarget(event);
    setEditTitle(event.title);
    setEditDate(event.dateLine);
    setEditTime(event.time);
    setEditVisible(true);
  };

  const saveEdit = async () => {
    if (!editTarget) return;
    if (!editTitle.trim()) {
      Alert.alert("Required", "Event title cannot be empty.");
      return;
    }
    try {
      await api.put(`/events/${editTarget.id}`, {
        title: editTitle,
        dateLine: editDate,
        time: editTime,
      });
      setEvents(
        events.map((e) =>
          e.id === editTarget.id
            ? { ...e, title: editTitle, dateLine: editDate, time: editTime }
            : e
        )
      );
      setEditVisible(false);
    } catch (err: any) {
      console.error("Edit Event Error:", err.message);
      Alert.alert("Error", "Failed to update event");
    }
  };

  const saveAdd = async () => {
    if (!addTitle.trim()) {
      Alert.alert("Required", "Event title cannot be empty.");
      return;
    }
    try {
      const res = await api.post(`/events`, {
        title: addTitle,
        dateLine: addDate || "TBD",
        time: addTime || "TBD",
        outfit: [],
      });
      setEvents([res.data, ...events]);
      setAddTitle("");
      setAddDate("");
      setAddTime("");
      setAddVisible(false);
    } catch (err: any) {
      console.error("Add Event Error:", err.message);
      Alert.alert("Error", "Failed to add event");
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert("Delete Event", "Remove this event?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/events/${id}`);
            setEvents(events.filter((e) => e.id !== id));
          } catch (err: any) {
            console.error("Delete Event Error:", err.message);
            Alert.alert("Error", "Failed to delete event");
          }
        },
      },
    ]);
  };

  const handleOutfitItemPress = (item: OutfitItem) => {
    if (item.source !== "product" || !item.product) {
      return;
    }

    navigation.navigate("ProductDetails", {
      id: item.product._id || item.product.id || item.id,
      product: item.product,
    });
  };

  const inputStyle = [
    styles.input,
    {
      backgroundColor: colors.inputBg,
      borderColor: colors.border,
      color: colors.text,
    },
  ];

  if (loading) {
    return (
      <SafeAreaView
        style={[
          styles.safe,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="#0A58FF" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.hBtn}
        >
          <Feather name="arrow-left" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upcoming Events</Text>
        <View style={{ width: 22 }} />
      </View>

      <FlatList
        data={events}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{
          paddingBottom: 140,
          paddingHorizontal: 16,
          paddingTop: 12,
        }}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="calendar" size={48} color={colors.textMuted} />
            <Text style={styles.emptyText}>No upcoming events yet</Text>
            <Text style={styles.emptySubtext}>Tap + to add your first event</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <View>
                <Text style={styles.eventTitle}>{item.title}</Text>
                <Text style={styles.eventDate}>{item.dateLine}</Text>
              </View>

              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
              >
                <Text style={styles.eventTime}>{item.time}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.rowHeader}>
              <Text style={styles.planLabel}>Planned Outfit</Text>
            </View>

            {item?.outfit?.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingVertical: 4 }}
              >
                {item.outfit.map((o) => {
                  const isProduct = o.source === "product";

                  return (
                    <TouchableOpacity
                      key={o.id}
                      style={styles.outfitItem}
                      activeOpacity={isProduct ? 0.85 : 1}
                      disabled={!isProduct}
                      onPress={() => handleOutfitItemPress(o)}
                    >
                      <View style={styles.imageWrap}>
                        <Image source={o.image} style={styles.outfitImg} />

                        {isProduct && (
                          <View style={styles.productOverlay}>
                            <Feather name="shopping-cart" size={20} color="#fff" />
                          </View>
                        )}
                      </View>

                      <Text style={styles.outfitText} numberOfLines={2}>
                        {o.label}
                      </Text>

                      {typeof o.price === "number" && (
                        <Text style={styles.priceText}>
                          LKR {o.price.toFixed(2)}
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            ) : (
              <Text style={styles.noOutfitText}>No outfit planned yet</Text>
            )}
          </View>
        )}
      />

      <TouchableOpacity style={styles.fab} onPress={() => setAddVisible(true)}>
        <View style={styles.fabInner}>
          <Feather name="plus" size={30} color="#fff" />
        </View>
      </TouchableOpacity>

      <Modal
        visible={editVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Event</Text>
              <TouchableOpacity onPress={() => setEditVisible(false)}>
                <Feather name="x" size={22} color={colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>Event Name</Text>
            <TextInput
              style={inputStyle}
              value={editTitle}
              onChangeText={setEditTitle}
              placeholder="e.g. Office Meeting"
              placeholderTextColor={colors.textMuted}
            />

            <Text style={styles.modalLabel}>Date</Text>
            <TextInput
              style={inputStyle}
              value={editDate}
              onChangeText={setEditDate}
              placeholder="e.g. Fri, Aug 8"
              placeholderTextColor={colors.textMuted}
            />

            <Text style={styles.modalLabel}>Time</Text>
            <TextInput
              style={inputStyle}
              value={editTime}
              onChangeText={setEditTime}
              placeholder="e.g. 10:00 AM"
              placeholderTextColor={colors.textMuted}
            />

            <TouchableOpacity style={styles.saveBtn} onPress={saveEdit}>
              <Text style={styles.saveBtnText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={addVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAddVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Event</Text>
              <TouchableOpacity onPress={() => setAddVisible(false)}>
                <Feather name="x" size={22} color={colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>Event Name</Text>
            <TextInput
              style={inputStyle}
              value={addTitle}
              onChangeText={setAddTitle}
              placeholder="e.g. Birthday Party"
              placeholderTextColor={colors.textMuted}
            />

            <Text style={styles.modalLabel}>Date</Text>
            <TextInput
              style={inputStyle}
              value={addDate}
              onChangeText={setAddDate}
              placeholder="e.g. Mon, Dec 25"
              placeholderTextColor={colors.textMuted}
            />

            <Text style={styles.modalLabel}>Time</Text>
            <TextInput
              style={inputStyle}
              value={addTime}
              onChangeText={setAddTime}
              placeholder="e.g. 7:00 PM"
              placeholderTextColor={colors.textMuted}
            />

            <TouchableOpacity style={styles.saveBtn} onPress={saveAdd}>
              <Text style={styles.saveBtnText}>Add Event</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const getStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.background,
      paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    },

    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingTop: 6,
      paddingBottom: 10,
      justifyContent: "space-between",
      borderBottomWidth: 1,
      borderColor: colors.border,
    },
    hBtn: { padding: 4 },
    headerTitle: { fontSize: 22, fontWeight: "700", color: colors.text },

    card: {
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 14,
      backgroundColor: isDark ? colors.card : "#D9D9D9",
    },
    cardTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    eventTitle: { fontSize: 18, fontWeight: "800", color: colors.text },
    eventDate: {
      marginTop: 2,
      fontWeight: "600",
      color: colors.textSecondary,
    },
    eventTime: { fontWeight: "700", color: colors.text },

    divider: {
      height: 1,
      marginVertical: 10,
      backgroundColor: isDark ? colors.border : "rgba(0,0,0,0.15)",
    },

    rowHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    planLabel: { fontWeight: "800", color: colors.text },

    outfitItem: {
      alignItems: "center",
      marginRight: 18,
      width: 110,
    },

    imageWrap: {
      width: 96,
      height: 96,
      borderRadius: 12,
      overflow: "hidden",
      position: "relative",
    },

    outfitImg: {
      width: 96,
      height: 96,
      borderRadius: 12,
      backgroundColor: isDark ? "#222" : "#eee",
    },

    productOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0,0,0,0.32)",
      alignItems: "center",
      justifyContent: "center",
    },

    outfitText: {
      marginTop: 8,
      fontWeight: "700",
      color: colors.text,
      textAlign: "center",
    },

    priceText: {
      marginTop: 4,
      fontSize: 12,
      fontWeight: "700",
      color: colors.textSecondary,
      textAlign: "center",
    },

    noOutfitText: {
      fontSize: 13,
      fontStyle: "italic",
      marginBottom: 8,
      color: colors.textMuted,
    },

    emptyContainer: { alignItems: "center", marginTop: 80, gap: 10 },
    emptyText: { fontSize: 16, fontWeight: "700", color: colors.textSecondary },
    emptySubtext: { fontSize: 13, color: colors.textMuted },

    fab: { position: "absolute", right: 18, bottom: 96 },
    fabInner: {
      width: 64,
      height: 64,
      borderRadius: 20,
      backgroundColor: "#0A58FF",
      alignItems: "center",
      justifyContent: "center",
    },

    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "flex-end",
    },
    modalBox: {
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 24,
      backgroundColor: colors.card,
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
    },
    modalTitle: { fontSize: 20, fontWeight: "700", color: colors.text },
    modalLabel: {
      fontSize: 13,
      fontWeight: "600",
      marginBottom: 6,
      marginTop: 10,
      color: colors.textSecondary,
    },
    input: {
      height: 46,
      borderWidth: 1,
      borderRadius: 10,
      paddingHorizontal: 14,
      fontSize: 15,
      marginBottom: 4,
    },
    saveBtn: {
      backgroundColor: "#0A58FF",
      borderRadius: 14,
      height: 52,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 20,
    },
    saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  });

export default UpcomingEventsScreen;