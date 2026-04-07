import React, { useState } from "react";
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, StatusBar } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useOrdersStore } from "../store/useOrdersStore";
import { useTheme } from "../context/ThemeContext";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/AppNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "TrackOrder">;

const TrackOrderScreen: React.FC<Props> = ({ route, navigation }) => {
    const { orderId } = route.params || {};
    const { getOrderById } = useOrdersStore();
    const { colors, isDark } = useTheme();
    const styles = getStyles(colors, isDark);
    
    const order = getOrderById(orderId);
    
    // Mock steps based on order status
    const steps = [
        { title: "Order Placed", date: order ? new Date(order.date).toLocaleDateString() : "Pending", completed: true },
        { title: "Processing", date: "In Progress", completed: true },
        { title: "Shipped", date: "Coming Soon", completed: order?.status === 'Shipped' || order?.status === 'Delivered' },
        { title: "Delivered", date: "Coming Soon", completed: order?.status === 'Delivered' },
    ];
    
    const currentStepIndex = order?.status === 'Delivered' ? 3 : (order?.status === 'Shipped' ? 2 : 1);

    return (
        <SafeAreaView style={styles.safe}>
            <View style={[styles.header, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
                    <Feather name="arrow-left" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Track Order</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={[styles.orderIdBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.orderIdText, { color: colors.text }]}>Order #{orderId?.split('-')?.[1] || "N/A"}</Text>
                    <Text style={[styles.orderAmount, { color: colors.text }]}>${order?.total?.toFixed(2) || "0.00"}</Text>
                </View>

                <View style={[styles.timelineContainer, { backgroundColor: colors.card }]}>
                    {steps.map((step, index) => {
                        const isLast = index === steps.length - 1;
                        const isActive = index === currentStepIndex;
                        return (
                            <View key={index} style={styles.stepContainer}>
                                <View style={styles.indicatorContainer}>
                                    <View style={[styles.circle, step.completed ? styles.completedCircle : (isActive ? styles.activeCircle : styles.inactiveCircle)]}>
                                        {step.completed && <Feather name="check" size={12} color="#fff" />}
                                    </View>
                                    {!isLast && <View style={[styles.line, step.completed ? styles.completedLine : styles.inactiveLine]} />}
                                </View>
                                <View style={styles.textContainer}>
                                    <Text style={[styles.stepTitle, (step.completed || isActive) ? { color: colors.text } : { color: colors.textSecondary }]}>{step.title}</Text>
                                    <Text style={[styles.stepDate, { color: colors.textMuted }]}>{step.date}</Text>
                                </View>
                            </View>
                        );
                    })}
                </View>

                <View style={[styles.shippingInfo, { backgroundColor: colors.card }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Shipping Address</Text>
                    <Text style={[styles.addressText, { color: colors.text }]}>{order?.address?.fullName || "Guest"}</Text>
                    <Text style={[styles.addressText, { color: colors.textSecondary }]}>{order?.address?.addressLine}</Text>
                    <Text style={[styles.addressText, { color: colors.textSecondary }]}>{order?.address?.city}, {order?.address?.postalCode}</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const getStyles = (colors: any, dark: boolean) => StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background , paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
    header: {
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        paddingHorizontal: 16, paddingVertical: 12, backgroundColor: colors.background, borderBottomWidth: 1, borderColor: colors.border
    },
    headerTitle: { fontSize: 18, fontWeight: "700" },
    content: { padding: 20 },
    orderIdBox: {
        padding: 16, borderRadius: 12, flexDirection: "row", justifyContent: "space-between",
        marginBottom: 24, borderWidth: 1, borderColor: colors.border
    },
    orderIdText: { fontSize: 16, fontWeight: "700" },
    orderAmount: { fontSize: 16, fontWeight: "700", color: "#2563EB" },
    timelineContainer: {
        padding: 20, borderRadius: 12, marginBottom: 24,
        borderWidth: 1, borderColor: colors.border
    },
    stepContainer: { flexDirection: "row", minHeight: 70 },
    indicatorContainer: { alignItems: "center", width: 30 },
    circle: { width: 20, height: 20, borderRadius: 10, alignItems: "center", justifyContent: "center", zIndex: 2 },
    completedCircle: { backgroundColor: "#10B981" },
    activeCircle: { backgroundColor: "#3B82F6", borderWidth: 4, borderColor: "#DBEAFE" },
    inactiveCircle: { backgroundColor: dark ? "#333" : "#E5E7EB" },
    line: { width: 2, flex: 1, marginVertical: -4, zIndex: 1 },
    completedLine: { backgroundColor: "#10B981" },
    inactiveLine: { backgroundColor: dark ? "#333" : "#E5E7EB" },
    textContainer: { marginLeft: 16, paddingBottom: 30 },
    stepTitle: { fontSize: 16, fontWeight: "600" },
    stepDate: { fontSize: 13, marginTop: 4 },
    shippingInfo: {
        padding: 20, borderRadius: 12,
        borderWidth: 1, borderColor: colors.border
    },
    sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 12 },
    addressText: { fontSize: 14, marginBottom: 4, lineHeight: 20 },
});

export default TrackOrderScreen;
