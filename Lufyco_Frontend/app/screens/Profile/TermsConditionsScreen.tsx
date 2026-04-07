import React from "react";
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, StatusBar } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../../context/ThemeContext";

const TermsConditionsScreen = () => {
    const navigation = useNavigation();
    const { colors } = useTheme();

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { borderColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Feather name="arrow-left" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Terms & Conditions</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={{ padding: 20 }}>
                <Text style={[styles.mainTitle, { color: colors.text }]}>Terms & Conditions</Text>
                <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                    Welcome to Fashion! These Terms and Conditions ("Terms") govern your use of our e-commerce app. By accessing or using Fashion, you agree to be bound by these Terms. Please read them carefully before proceeding.
                </Text>

                <Text style={[styles.sectionHeader, { color: colors.text }]}>1. Account Registration:</Text>
                <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                    - You must create an account to use certain features of Fashion.{"\n"}
                    - You are responsible for providing accurate and up-to-date information during the registration process.{"\n"}
                    - You must safeguard your account credentials and notify us immediately of any unauthorized access or use of your account.
                </Text>

                <Text style={[styles.sectionHeader, { color: colors.text }]}>2. Product Information and Pricing:</Text>
                <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                    - Fashion strives to provide accurate product descriptions, images, and pricing.{"\n"}
                    - We reserve the right to modify product details and prices without prior notice.{"\n"}
                    - In the event of an error, we may cancel or refuse orders placed for incorrectly priced products.
                </Text>

                <Text style={[styles.sectionHeader, { color: colors.text }]}>3. Order Placement and Fulfillment:</Text>
                <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                    - By placing an order on Fashion, you agree to purchase the selected products at the stated price.{"\n"}
                    - We reserve the right to accept or reject any order. In case we are unable to fulfill your order, we may cancel the order due to product unavailability, pricing errors, or other reasons.{"\n"}
                    - Once an order is confirmed, we will make reasonable efforts to fulfill and deliver it in a timely manner.
                </Text>

                <Text style={[styles.sectionHeader, { color: colors.text }]}>4. Payment:</Text>
                <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                    - Fashion supports various payment methods, including credit/debit cards and other payment gateways.{"\n"}
                    - By providing payment information, you represent and warrant that you are authorized to use the chosen payment method.{"\n"}
                    - All payments are subject to verification and approval by relevant financial institutions.
                </Text>

                <Text style={[styles.sectionHeader, { color: colors.text }]}>5. Shipping and Delivery:</Text>
                <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                    - Fashion will make reasonable efforts to ensure timely delivery of products.{"\n"}
                    - Delivery times may vary based on factors beyond our control, such as location, weather conditions, or carrier delays.{"\n"}
                    - Risk of loss or damage to products passes to you upon delivery.
                </Text>

                <Text style={[styles.sectionHeader, { color: colors.text }]}>6. Returns and Refunds:</Text>
                <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                    - Our return and refund policies are detailed separately and govern the process for returning products and seeking refunds.{"\n"}
                    - Certain products may be non-returnable or subject to specific conditions.
                </Text>

                <Text style={[styles.sectionHeader, { color: colors.text }]}>7. Intellectual Property:</Text>
                <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                    - Fashion and its content, including logos, trademarks, text, images, and software, are protected by intellectual property rights.{"\n"}
                    - You may not use, reproduce, modify, distribute, or display any part of Fashion without our prior written consent.
                </Text>

                <Text style={[styles.sectionHeader, { color: colors.text }]}>8. User Conduct:</Text>
                <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                    - You agree to use Fashion in compliance with applicable laws and regulations.{"\n"}
                    - You will not engage in any activity that disrupts or interferes with the functioning of the app.{"\n"}
                    - Any unauthorized use or attempts to access restricted areas or user accounts is strictly prohibited.
                </Text>

                <Text style={[styles.sectionHeader, { color: colors.text }]}>9. Limitation of Liability:</Text>
                <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                    - Fashion and its affiliates shall not be liable for any direct, indirect, incidental, consequential, or punitive damages arising from the use or inability to use our app or any products purchased through it.{"\n"}
                    - We do not guarantee the accuracy, completeness, or reliability of information provided on Fashion.
                </Text>

                <Text style={[styles.sectionHeader, { color: colors.text }]}>10. Governing Law:</Text>
                <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                    - These Terms shall be governed by and constructed in accordance with the laws of [jurisdiction].{"\n"}
                    - Any disputes arising out of or relating to these Terms shall be resolved in the courts of [jurisdiction].
                </Text>

                <Text style={[styles.paragraph, { color: colors.textSecondary, marginTop: 10 }]}>
                    If you have any questions or concerns regarding these Terms and Conditions, please contact our customer support. By using Fashion, you acknowledge that you have read, understood, and agreed to these Terms and Conditions.
                </Text>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safe: { flex: 1 , paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1,
    },
    headerTitle: { fontSize: 18, fontWeight: '700' },
    mainTitle: { fontSize: 22, fontWeight: '800', marginBottom: 12 },
    sectionHeader: { fontSize: 15, fontWeight: '700', marginTop: 18, marginBottom: 8 },
    paragraph: { fontSize: 14, lineHeight: 22, marginBottom: 6 },
});

export default TermsConditionsScreen;
