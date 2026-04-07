import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Dimensions, Image } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

// Header
export const AuthHeader = ({ title, subtitle }: { title: string, subtitle?: string }) => {
    const { colors, isDark } = useTheme();
    const styles = getStyles(colors, isDark);
    
    return (
        <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
    );
};

// Text Field
export const AuthInput = ({
    label, value, onChangeText, placeholder, secureTextEntry, icon, rightIcon, onRightIconPress, keyboardType
}: any) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const { colors, isDark } = useTheme();
    const styles = getStyles(colors, isDark);

    return (
        <View style={styles.inputContainer}>
            {label && <Text style={styles.label}>{label}</Text>}
            <View style={[
                styles.inputBox,
                isFocused && { borderColor: '#4A90E2', backgroundColor: colors.background } // Blue highlight color
            ]}>
                {icon && <Feather name={icon} size={20} color={isFocused ? "#4A90E2" : colors.textSecondary} style={{ marginRight: 10 }} />}
                <TextInput
                    style={[styles.input, { outlineStyle: 'none' } as any]} // Remove web outline
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={colors.textMuted}
                    secureTextEntry={secureTextEntry}
                    keyboardType={keyboardType}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                />
                {rightIcon && (
                    <TouchableOpacity onPress={onRightIconPress}>
                        <Feather name={rightIcon} size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

// Buttons
export const PrimaryButton = ({ title, onPress, loading, disabled }: any) => {
    const { colors, isDark } = useTheme();
    const styles = getStyles(colors, isDark);
    
    return (
        <TouchableOpacity
            style={[styles.primaryBtn, disabled && styles.disabledBtn]}
            onPress={onPress}
            disabled={loading || disabled}
        >
            {loading ? <ActivityIndicator color={isDark ? "#111" : "#fff"} /> : <Text style={styles.primaryBtnText}>{title}</Text>}
        </TouchableOpacity>
    );
};

export const SecondaryButton = ({ title, onPress }: any) => {
    const { colors, isDark } = useTheme();
    const styles = getStyles(colors, isDark);

    return (
        <TouchableOpacity style={styles.secondaryBtn} onPress={onPress}>
            <Text style={styles.secondaryBtnText}>{title}</Text>
        </TouchableOpacity>
    );
};

// OTP Input
export const OTPInput = ({ otp, setOtp }: { otp: string, setOtp: (s: string) => void }) => {
    const { colors, isDark } = useTheme();
    const styles = getStyles(colors, isDark);
    
    return (
        <View style={styles.otpContainer}>
            {Array.from({ length: 6 }).map((_, i) => (
                <View key={i} style={styles.otpBox}>
                    <Text style={styles.otpText}>{otp[i] || ''}</Text>
                </View>
            ))}
            {/* hidden input overlay to capture typing */}
            <TextInput
                style={styles.hiddenInput}
                value={otp}
                onChangeText={(t) => setOtp(t.slice(0, 6))}
                keyboardType="number-pad"
                maxLength={6}
                autoFocus
            />
        </View>
    );
};

export const SocialRow = () => {
    const { colors, isDark } = useTheme();
    const styles = getStyles(colors, isDark);

    return (
        <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialBtn}>
                <Image source={require('../../assets/images/facebook_icon.png')} style={{ width: 28, height: 28, borderRadius: 6 }} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn}>
                <Image source={require('../../assets/images/instagram_icon.png')} style={{ width: 28, height: 28, borderRadius: 6 }} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn}>
                <Image source={require('../../assets/images/google_icon.png')} style={{ width: 28, height: 28, borderRadius: 6 }} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn}>
                <Ionicons name="logo-tiktok" size={24} color={colors.text} />
            </TouchableOpacity>
        </View>
    );
};


const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
    header: { marginBottom: 30 },
    title: { fontSize: 28, fontWeight: 'bold', color: colors.text, marginBottom: 10 },
    subtitle: { fontSize: 16, color: colors.textSecondary },

    inputContainer: { marginBottom: 20 },
    label: { fontSize: 14, fontWeight: '600', marginBottom: 8, color: colors.text },
    inputBox: {
        flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border,
        borderRadius: 12, paddingHorizontal: 15, height: 50, backgroundColor: colors.inputBg
    },
    input: { flex: 1, fontSize: 16, color: colors.text },

    primaryBtn: {
        backgroundColor: isDark ? '#fff' : '#000', height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center', marginVertical: 10
    },
    disabledBtn: { backgroundColor: isDark ? '#444' : '#888' },
    primaryBtnText: { color: isDark ? '#111' : '#fff', fontSize: 16, fontWeight: 'bold' },

    secondaryBtn: {
        height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center', marginVertical: 10, borderWidth: 1, borderColor: colors.border
    },
    secondaryBtnText: { color: colors.text, fontSize: 16, fontWeight: '600' },

    otpContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30, position: 'relative' },
    otpBox: {
        width: (width - 80) / 6, height: 50, borderWidth: 1, borderColor: colors.border, borderRadius: 10,
        justifyContent: 'center', alignItems: 'center', backgroundColor: colors.inputBg
    },
    otpText: { fontSize: 20, fontWeight: 'bold', color: colors.text },
    hiddenInput: { position: 'absolute', width: '100%', height: '100%', opacity: 0 },

    socialRow: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginTop: 20 },
    socialBtn: {
        width: 50, height: 50, borderRadius: 25, borderWidth: 1, borderColor: colors.border,
        justifyContent: 'center', alignItems: 'center', backgroundColor: isDark ? '#222' : '#fff'
    }
});
