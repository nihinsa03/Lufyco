import React from "react";
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, StatusBar } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../../context/ThemeContext";

const PrivacyPolicyScreen = () => {
    const navigation = useNavigation();
    const { colors } = useTheme();

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { borderColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Feather name="arrow-left" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Privacy Policy</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={{ padding: 20 }}>
                <Text style={[styles.mainTitle, { color: colors.text }]}>Our Policy</Text>
                <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                    At Fashion, we are committed to protecting the privacy and security of our users' personal information. This Privacy Policy outlines how we collect, use, disclose, and safeguard the information obtained through our e-commerce app. By using Fashion, you consent to the practices described in this policy.
                </Text>

                <Text style={[styles.sectionHeader, { color: colors.text }]}>1. Information Collection:</Text>
                <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                    - Personal Information: We may collect personal information such as name, email, and phone number when you create an account, make a purchase, or interact with our services.
                </Text>
                <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                    - Transaction Details: We collect information related to your purchases, including order history, payment method, and shopping details.
                </Text>
                <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                    - Usage Data: We may collect data on how you interact with our app, such as browsing activity, search queries, and preferences.
                </Text>

                <Text style={[styles.sectionHeader, { color: colors.text }]}>2. Information Use:</Text>
                <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                    - Provide Services: We use the collected information to process orders, deliver products, and provide customer support.
                </Text>
                <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                    - Personalization: We may use your information to personalize your shopping experience, recommend products, and display targeted advertisements.
                </Text>
                <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                    - Communication: We may use your contact information to send important updates, promotional offers, and newsletters. You can opt-out of these communications at any time.
                </Text>

                <Text style={[styles.sectionHeader, { color: colors.text }]}>3. Information Sharing:</Text>
                <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                    - Third-Party Service Providers: We may share your information with trusted third-party service providers who assist us in operating our app, fulfilling orders, and improving our services.
                </Text>
                <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                    - Legal Compliance: We may disclose personal information if required by law or in response to a valid legal request from authorities.
                </Text>

                <Text style={[styles.sectionHeader, { color: colors.text }]}>4. Data Security:</Text>
                <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                    - We implement appropriate security measures to protect your information from unauthorized access, alteration, disclosure, or destruction.
                </Text>
                <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                    - However, please note that no data transmission over the Internet or electronic storage is 100% secure. We cannot guarantee absolute security of your information.
                </Text>

                <Text style={[styles.sectionHeader, { color: colors.text }]}>5. User Rights:</Text>
                <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                    - Access and Update: You have the right to access, correct, or update your personal information stored in our app.
                </Text>
                <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                    - Data Retention: We retain your personal information as long as necessary to provide our services and comply with legal obligations.
                </Text>

                <Text style={[styles.sectionHeader, { color: colors.text }]}>6. Children's Privacy:</Text>
                <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                    - Fashion is not intended for children under the age of 13. We do not knowingly collect or solicit personal information from children.
                </Text>

                <Text style={[styles.sectionHeader, { color: colors.text }]}>7. Updates to the Privacy Policy:</Text>
                <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                    - We reserve the right to update this Privacy Policy from time to time. Any changes will be posted on our app, and the revised policy will be effective upon posting.
                </Text>

                <Text style={[styles.paragraph, { color: colors.textSecondary, marginTop: 10 }]}>
                    If you have any questions or concerns about our Privacy Policy, please contact our customer support. By using Fashion, you acknowledge that you have read and understood this Privacy Policy and agree to its terms and conditions.
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

export default PrivacyPolicyScreen;
