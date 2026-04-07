import React, { useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { useOrdersStore } from "../../store/useOrdersStore";
import { useTheme } from "../../context/ThemeContext";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/AppNavigator";

type NavProp = NativeStackNavigationProp<RootStackParamList, "OrderDetails">;
type ScreenRouteProp = RouteProp<RootStackParamList, "OrderDetails">;

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

const getStatusConfig = (status: string, isDark: boolean) => {
  const normalized = normalizeStatus(status);

  if (normalized === "completed") {
    return {
      label: "completed",
      badgeBg: isDark ? "#064E3B" : "#DCFCE7",
      badgeText: isDark ? "#6EE7B7" : "#16A34A",
      progressColor: "#10B981",
      stepIndex: 2,
      etaLabel: "Completed",
    };
  }

  if (normalized === "Processing") {
    return {
      label: "Processing",
      badgeBg: isDark ? "#1E3A8A" : "#DBEAFE",
      badgeText: isDark ? "#93C5FD" : "#1D4ED8",
      progressColor: "#2563EB",
      stepIndex: 1,
      etaLabel: "In Progress",
    };
  }

  return {
    label: "Pending",
    badgeBg: isDark ? "#3F2A00" : "#FEF3C7",
    badgeText: isDark ? "#FCD34D" : "#B45309",
    progressColor: "#F59E0B",
    stepIndex: 0,
    etaLabel: "Pending Confirmation",
  };
};

const OrderDetailsScreen = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<ScreenRouteProp>();
  const { orderId } = route.params;

  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  const { selectedOrder, detailsLoading, fetchOrderDetails } = useOrdersStore();

  useEffect(() => {
    fetchOrderDetails(orderId);
  }, [orderId, fetchOrderDetails]);

  const order = selectedOrder;

  if (detailsLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Details</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={colors.text} />
          <Text style={[styles.stateText, { color: colors.textSecondary }]}>
            Loading order details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Not Found</Text>
          <View style={{ width: 24 }} />
        </View>
      </SafeAreaView>
    );
  }

  const statusUI = getStatusConfig(order.status, isDark);
  const steps = ["Pending", "Processing", "completed"];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={styles.rowBetween}>
          <Text style={styles.orderId}>Order #{String(order.id).slice(-6)}</Text>

          <View style={[styles.statusBadge, { backgroundColor: statusUI.badgeBg }]}>
            <Text style={[styles.statusText, { color: statusUI.badgeText }]}>
              {statusUI.label}
            </Text>
          </View>
        </View>

        <View style={styles.topMetaRow}>
          <Text style={[styles.metaText, { color: colors.textSecondary }]}>
            Order date:{" "}
            <Text style={{ fontWeight: "700", color: colors.text }}>
              {new Date(order.date).toLocaleDateString("en-LK", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </Text>
          </Text>
        </View>

        {/* Status Progress */}
        <View
          style={[
            styles.progressCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.progressHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>
              Order Status
            </Text>
            <Text style={[styles.progressStateText, { color: statusUI.badgeText }]}>
              {statusUI.etaLabel}
            </Text>
          </View>

          <View style={styles.stepsRow}>
            {steps.map((step, index) => {
              const isDone = index <= statusUI.stepIndex;
              const isLast = index === steps.length - 1;

              return (
                <View key={step} style={styles.stepWrapper}>
                  {!isLast && (
                    <View
                      style={[
                        styles.stepLine,
                        {
                          backgroundColor:
                            index < statusUI.stepIndex
                              ? statusUI.progressColor
                              : colors.border,
                        },
                      ]}
                    />
                  )}

                  <View
                    style={[
                      styles.stepCircle,
                      {
                        backgroundColor: isDone ? statusUI.progressColor : colors.border,
                      },
                    ]}
                  >
                    {isDone ? (
                      <Feather name="check" size={12} color="#fff" />
                    ) : (
                      <View />
                    )}
                  </View>

                  <Text
                    style={[
                      styles.stepLabel,
                      {
                        color: isDone ? colors.text : colors.textSecondary,
                        fontWeight: isDone ? "700" : "500",
                      },
                    ]}
                  >
                    {step}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Items */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Items ({order.items.length})
        </Text>

        <View
          style={[
            styles.blockCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          {order.items.map((item, idx) => (
            <View
              key={idx}
              style={[
                styles.itemRow,
                idx !== order.items.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                },
              ]}
            >
              <Image
                source={
                  typeof item.image === "string"
                    ? { uri: item.image }
                    : item.image || require("../../../assets/images/clothing.png")
                }
                style={styles.thumb}
              />

              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.itemTitle, { color: colors.text }]}>
                  {item.title}
                </Text>

                <Text style={[styles.itemMeta, { color: colors.textSecondary }]}>
                  Qty: {item.qty}
                  {item.size ? ` • Size: ${item.size}` : ""}
                  {item.color ? ` • Color: ${item.color}` : ""}
                </Text>

                <Text style={[styles.itemPrice, { color: colors.text }]}>
                  {formatLKR(item.price)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Delivery Address */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Delivery Address
        </Text>

        <View
          style={[
            styles.blockCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          {!!order.address.fullName && (
            <Text style={[styles.infoText, { color: colors.text }]}>
              {order.address.fullName}
            </Text>
          )}

          {!!order.address.addressLine && (
            <Text style={[styles.infoText, { color: colors.text }]}>
              {order.address.addressLine}
            </Text>
          )}

          <Text style={[styles.infoText, { color: colors.text }]}>
            {order.address.city}, {order.address.postalCode}
          </Text>

          <Text style={[styles.infoText, { color: colors.text }]}>
            {order.address.country}
          </Text>
        </View>

        {/* Payment */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Payment Info
        </Text>

        <View
          style={[
            styles.blockCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Feather
              name="credit-card"
              size={16}
              color={colors.textSecondary}
              style={{ marginRight: 8 }}
            />
            <Text style={[styles.infoText, { color: colors.text }]}>
              {order.payment.method === "cash"
                ? "Cash on Delivery"
                : `${String(order.payment.method).toUpperCase()} **** ${order.payment.last4 || "0000"}`}
            </Text>
          </View>
        </View>

        {/* Summary */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Summary
        </Text>

        <View
          style={[
            styles.summaryContainer,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.summaryRow}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              Subtotal
            </Text>
            <Text style={[styles.val, { color: colors.text }]}>
              {formatLKR(order.subtotal)}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              Shipping
            </Text>
            <Text style={[styles.val, { color: colors.text }]}>
              {formatLKR(order.shipping)}
            </Text>
          </View>

          {Number(order.discount || 0) > 0 && (
            <View style={styles.summaryRow}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Discount
              </Text>
              <Text style={[styles.val, { color: "#16A34A" }]}>
                - {formatLKR(order.discount)}
              </Text>
            </View>
          )}

          <View
            style={[
              styles.summaryRow,
              {
                marginTop: 12,
                paddingTop: 12,
                borderTopWidth: 1,
                borderTopColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.totalLabel, { color: colors.text }]}>Total</Text>
            <Text style={[styles.totalValue, { color: colors.text }]}>
              {formatLKR(order.total)}
            </Text>
          </View>
        </View>
      </ScrollView>
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
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderColor: colors.border,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
    },

    rowBetween: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10,
    },
    orderId: {
      fontSize: 18,
      fontWeight: "800",
      color: colors.text,
    },
    topMetaRow: {
      marginBottom: 18,
    },
    metaText: {
      fontSize: 13,
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

    progressCard: {
      borderWidth: 1,
      borderRadius: 16,
      padding: 16,
      marginBottom: 20,
    },
    progressHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 18,
    },
    progressStateText: {
      fontSize: 13,
      fontWeight: "700",
    },

    stepsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    stepWrapper: {
      flex: 1,
      alignItems: "center",
      position: "relative",
    },
    stepLine: {
      position: "absolute",
      top: 7,
      left: "50%",
      width: "100%",
      height: 3,
      zIndex: 1,
    },
    stepCircle: {
      width: 16,
      height: 16,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      zIndex: 2,
      marginBottom: 10,
    },
    stepLabel: {
      fontSize: 12,
      textAlign: "center",
      lineHeight: 16,
      paddingHorizontal: 4,
    },

    sectionTitle: {
      fontSize: 16,
      fontWeight: "800",
      marginBottom: 12,
    },

    blockCard: {
      borderWidth: 1,
      borderRadius: 16,
      padding: 16,
      marginBottom: 20,
    },

    itemRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 10,
    },
    thumb: {
      width: 64,
      height: 64,
      borderRadius: 10,
      backgroundColor: isDark ? "#333" : "#eee",
    },
    itemTitle: {
      fontSize: 14,
      fontWeight: "700",
    },
    itemMeta: {
      fontSize: 12,
      marginTop: 4,
    },
    itemPrice: {
      fontSize: 14,
      fontWeight: "800",
      marginTop: 8,
    },

    infoText: {
      fontSize: 14,
      lineHeight: 22,
    },

    summaryContainer: {
      borderWidth: 1,
      borderRadius: 16,
      padding: 16,
      marginBottom: 24,
    },
    summaryRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 10,
    },
    label: {
      fontSize: 14,
    },
    val: {
      fontSize: 14,
      fontWeight: "700",
    },
    totalLabel: {
      fontSize: 17,
      fontWeight: "800",
    },
    totalValue: {
      fontSize: 17,
      fontWeight: "800",
    },

    centerState: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    stateText: {
      marginTop: 12,
      fontSize: 14,
    },
  });

export default OrderDetailsScreen;