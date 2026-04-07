import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Platform,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useOrdersStore, Order } from "../store/useOrdersStore";
import { useTheme } from "../context/ThemeContext";
import { useAuthStore } from "../store/useAuthStore";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/AppNavigator";

type NavProp = NativeStackNavigationProp<RootStackParamList, "OrderHistory">;

const formatLKR = (value: number) => {
  return `LKR ${Number(value || 0).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const normalizeStatus = (status?: string) => {
  const s = String(status || "").trim().toLowerCase();

  if (s === "completed") return "completed";
  if (s === "processing") return "Processing";
  return "Pending";
};

const getStatusStyles = (status: string, isDark: boolean) => {
  const normalized = normalizeStatus(status);

  if (normalized === "completed") {
    return {
      bg: isDark ? "#064E3B" : "#DCFCE7",
      text: isDark ? "#6EE7B7" : "#16A34A",
      label: "completed",
    };
  }

  if (normalized === "Processing") {
    return {
      bg: isDark ? "#1E3A8A" : "#DBEAFE",
      text: isDark ? "#93C5FD" : "#1D4ED8",
      label: "Processing",
    };
  }

  return {
    bg: isDark ? "#3F2A00" : "#FEF3C7",
    text: isDark ? "#FCD34D" : "#B45309",
    label: "Pending",
  };
};

const OrderHistoryScreen = () => {
  const navigation = useNavigation<NavProp>();
  const { user } = useAuthStore();
  const { orders, loading, error, fetchMyOrders } = useOrdersStore();
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  const [tab, setTab] = useState<"ongoing" | "completed">("ongoing");

  const loadOrders = useCallback(async () => {
    if (!user?.id) return;
    await fetchMyOrders(user.id); // get all orders once
  }, [user?.id, fetchMyOrders]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [loadOrders])
  );

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const status = String(order.status || "").trim().toLowerCase();

      if (tab === "ongoing") {
        return status === "pending" || status === "processing";
      }

      return status === "completed";
    });
  }, [orders, tab]);

  const renderItem = ({ item }: { item: Order }) => {
    const firstItem = item.items?.[0];
    const statusUI = getStatusStyles(item.status, isDark);

    return (
      <TouchableOpacity
        style={[
          styles.card,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
        onPress={() => navigation.navigate("OrderDetails", { orderId: item.id })}
        activeOpacity={0.85}
      >
        <View style={styles.cardHeader}>
          <View>
            <Text style={[styles.orderId, { color: colors.text }]}>
              Order #{String(item.id).slice(-6)}
            </Text>
            <Text style={[styles.date, { color: colors.textSecondary }]}>
              {new Date(item.date).toLocaleDateString("en-LK", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </Text>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: statusUI.bg }]}>
            <Text style={[styles.statusText, { color: statusUI.text }]}>
              {statusUI.label}
            </Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <Image
            source={
              firstItem?.image && typeof firstItem.image === "string"
                ? { uri: firstItem.image }
                : firstItem?.image || require("../../assets/images/clothing.png")
            }
            style={styles.thumb}
          />

          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text
              style={[styles.title, { color: colors.text }]}
              numberOfLines={1}
            >
              {firstItem?.title || "Product"}
            </Text>

            {item.items.length > 1 && (
              <Text style={[styles.subtext, { color: colors.textSecondary }]}>
                + {item.items.length - 1} more items
              </Text>
            )}

            <Text style={[styles.price, { color: colors.text }]}>
              {formatLKR(item.total)}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.bottomRow,
            {
              borderTopColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.bottomStatusText, { color: colors.textSecondary }]}>
            Current status:{" "}
            <Text style={{ color: statusUI.text, fontWeight: "700" }}>
              {statusUI.label}
            </Text>
          </Text>

          <View style={styles.viewDetailsWrap}>
            <Text style={[styles.trackText, { color: colors.text }]}>
              View Details
            </Text>
            <Feather name="chevron-right" size={16} color={colors.text} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          { borderBottomWidth: 1, borderBottomColor: colors.border },
        ]}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ padding: 6 }}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
        >
          <Feather name="arrow-left" size={22} color={colors.text} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Order History
        </Text>

        <View style={{ width: 22 }} />
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          onPress={() => setTab("ongoing")}
          style={[
            styles.tab,
            {
              borderColor: tab === "ongoing" ? colors.text : colors.border,
              backgroundColor: tab === "ongoing" ? colors.card : "transparent",
            },
          ]}
        >
          <Text
            style={[
              styles.tabText,
              {
                color: tab === "ongoing" ? colors.text : colors.textSecondary,
              },
            ]}
          >
            Ongoing
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setTab("completed")}
          style={[
            styles.tab,
            {
              borderColor: tab === "completed" ? colors.text : colors.border,
              backgroundColor: tab === "completed" ? colors.card : "transparent",
            },
          ]}
        >
          <Text
            style={[
              styles.tabText,
              {
                color: tab === "completed" ? colors.text : colors.textSecondary,
              },
            ]}
          >
            Completed
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={colors.text} />
          <Text style={[styles.stateText, { color: colors.textSecondary }]}>
            Loading orders...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.centerState}>
          <Text style={[styles.stateText, { color: colors.textSecondary }]}>
            {error}
          </Text>

          <TouchableOpacity style={styles.retryBtn} onPress={loadOrders}>
            <Text style={styles.retryBtnText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Image
                source={require("../../assets/images/bag.png")}
                style={styles.emptyImage}
                resizeMode="contain"
              />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                No {tab} orders
              </Text>
              <Text
                style={[styles.emptySub, { color: colors.textSecondary }]}
              >
                Your {tab} orders will appear here.
              </Text>

              <TouchableOpacity
                style={[styles.exploreBtn, { backgroundColor: colors.text }]}
                onPress={() => navigation.navigate("Home")}
              >
                <Text
                  style={[styles.exploreText, { color: colors.background }]}
                >
                  Explore Categories
                </Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const getStyles = (colors: any, dark: boolean) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.background,
      paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    },

    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 10,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "700",
    },

    tabs: {
      flexDirection: "row",
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 8,
      gap: 12,
    },
    tab: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 12,
      borderWidth: 1,
      borderRadius: 12,
    },
    tabText: {
      fontWeight: "700",
      fontSize: 14,
    },

    card: {
      borderRadius: 16,
      padding: 16,
      marginBottom: 14,
      borderWidth: 1,
      elevation: 1,
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 14,
    },
    orderId: {
      fontWeight: "800",
      fontSize: 15,
    },
    date: {
      fontSize: 12,
      marginTop: 4,
    },

    cardBody: {
      flexDirection: "row",
      alignItems: "center",
    },
    thumb: {
      width: 64,
      height: 64,
      borderRadius: 10,
      backgroundColor: dark ? "#333" : "#eee",
    },
    title: {
      fontWeight: "700",
      fontSize: 14,
    },
    subtext: {
      fontSize: 12,
      marginTop: 3,
    },
    price: {
      fontWeight: "800",
      marginTop: 8,
      fontSize: 14,
    },

    statusBadge: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 999,
    },
    statusText: {
      fontSize: 12,
      fontWeight: "800",
    },

    bottomRow: {
      marginTop: 14,
      paddingTop: 12,
      borderTopWidth: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    bottomStatusText: {
      fontSize: 12,
      flex: 1,
      marginRight: 10,
    },
    viewDetailsWrap: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    trackText: {
      fontWeight: "700",
      fontSize: 13,
    },

    centerState: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 24,
    },
    stateText: {
      marginTop: 12,
      fontSize: 14,
      textAlign: "center",
    },
    retryBtn: {
      marginTop: 16,
      backgroundColor: colors.text,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 12,
    },
    retryBtnText: {
      color: colors.background,
      fontWeight: "700",
    },

    emptyContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 70,
    },
    emptyImage: {
      width: 100,
      height: 100,
      opacity: 0.5,
      marginBottom: 20,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: "700",
      marginBottom: 8,
    },
    emptySub: {
      fontSize: 14,
      textAlign: "center",
      marginBottom: 20,
    },
    exploreBtn: {
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 12,
    },
    exploreText: {
      fontWeight: "700",
    },
  });

export default OrderHistoryScreen;