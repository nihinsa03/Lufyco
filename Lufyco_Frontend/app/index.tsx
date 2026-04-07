import { useEffect } from "react";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import AppNavigator from "./navigation/AppNavigator";
import { registerForPushNotificationsAsync, scheduleDailyNotifications } from "./services/notificationService";
import { LogBox } from "react-native";

LogBox.ignoreLogs(["expo-notifications: Android Push notifications"]);

export default function App() {
    useEffect(() => {
        // Initialize notifications when app loads
        const setupNotifications = async () => {
            await registerForPushNotificationsAsync();
            await scheduleDailyNotifications();
        };

        setupNotifications();
    }, []);

    return (
        <ThemeProvider>
            <AuthProvider>
                <CartProvider>
                    <AppNavigator />
                </CartProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}
