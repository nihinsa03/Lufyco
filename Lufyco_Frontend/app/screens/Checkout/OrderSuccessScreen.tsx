import React from "react";
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, Image, Platform, StatusBar } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/AppNavigator";
import { useTheme } from "../../context/ThemeContext";

type NavProp = NativeStackNavigationProp<RootStackParamList, "OrderSuccess">;

const OrderSuccessScreen = () => {
    const navigation = useNavigation<NavProp>();
    const { colors, isDark } = useTheme();
    const styles = getStyles(colors, isDark);

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.container}>
                <View style={[styles.iconContainer, { backgroundColor: isDark ? '#1E293B' : '#EFF6FF' }]}>
                    <Image
                        source={require('../../../assets/images/bag.png')}
                        style={{ width: 80, height: 80, tintColor: '#2563EB' }}
                        resizeMode="contain"
                    />
                </View>

                <Text style={[styles.title, { color: colors.text }]}>Order Placed Successfully!</Text>
                <Text style={[styles.sub, { color: colors.textSecondary }]}>
                    Thank you for your purchase. Your order is being processed and will be shipped soon.
                </Text>

                <View style={styles.btnGroup}>
                    <TouchableOpacity
                        style={[styles.primaryBtn, { backgroundColor: colors.text }]}
                        onPress={() => navigation.navigate("Main", { screen: "Home" })}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Text style={[styles.primaryText, { color: colors.background }]}>Continue Shopping</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.secondaryBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                        onPress={() => navigation.navigate("OrderHistory")}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Text style={[styles.secondaryText, { color: colors.text }]}>View Orders</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const getStyles = (colors: any, dark: boolean) => StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background , paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
    container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
    iconContainer: {
        width: 120, height: 120, borderRadius: 60,
        alignItems: 'center', justifyContent: 'center', marginBottom: 24
    },
    title: { fontSize: 24, fontWeight: '800', textAlign: 'center', marginBottom: 12 },
    sub: { fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 40 },

    btnGroup: { width: '100%' },
    primaryBtn: {
        height: 56, borderRadius: 14,
        alignItems: 'center', justifyContent: 'center', marginBottom: 16
    },
    primaryText: { fontWeight: '700', fontSize: 16 },

    secondaryBtn: {
        height: 56, borderRadius: 14,
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 1
    },
    secondaryText: { fontWeight: '700', fontSize: 16 },
});

export default OrderSuccessScreen;
