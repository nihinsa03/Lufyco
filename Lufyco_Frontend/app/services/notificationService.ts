import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

// Notification messages for different times
const NOTIFICATION_MESSAGES = {
    morning: {
        title: "Good Morning! 🌅",
        body: "Start your day with style! Check out new arrivals at Lufyco.",
    },
    afternoon: {
        title: "Lunchtime Shopping! 🛍️",
        body: "Take a break and explore trending styles just for you.",
    },
    evening: {
        title: "Evening Deals! ✨",
        body: "Don't miss today's exclusive offers. Shop now!",
    },
};

/**
 * Request notification permissions from user
 * Only works on native platforms (iOS/Android), not web
 */
export async function registerForPushNotificationsAsync() {
    // Skip on web platform
    if (Platform.OS === 'web') {
        console.log('⚠️ Notifications are not supported on web platform');
        return;
    }

    let token;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.log('Failed to get push token for push notification!');
            return;
        }
    } else {
        console.log('Must use physical device for Push Notifications');
    }

    return token;
}

/**
 * Schedule daily notifications at specific times
 * Only works on native platforms (iOS/Android), not web
 */
export async function scheduleDailyNotifications() {
    // Skip on web platform
    if (Platform.OS === 'web') {
        console.log('⚠️ Notifications are not supported on web platform');
        return;
    }

    // Cancel any existing notifications first
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Morning notification - 9:00 AM
    await Notifications.scheduleNotificationAsync({
        content: {
            title: NOTIFICATION_MESSAGES.morning.title,
            body: NOTIFICATION_MESSAGES.morning.body,
            data: { screen: 'Home' },
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour: 9,
            minute: 0,
        },
    });

    // Afternoon notification - 2:00 PM
    await Notifications.scheduleNotificationAsync({
        content: {
            title: NOTIFICATION_MESSAGES.afternoon.title,
            body: NOTIFICATION_MESSAGES.afternoon.body,
            data: { screen: 'Offers' },
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour: 14,
            minute: 0,
        },
    });

    // Evening notification - 7:00 PM
    await Notifications.scheduleNotificationAsync({
        content: {
            title: NOTIFICATION_MESSAGES.evening.title,
            body: NOTIFICATION_MESSAGES.evening.body,
            data: { screen: 'Categories' },
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour: 19,
            minute: 0,
        },
    });

    console.log('✅ Daily notifications scheduled successfully!');
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('🔕 All notifications cancelled');
}

/**
 * Get all scheduled notifications (for debugging)
 */
export async function getScheduledNotifications() {
    const notifications = await Notifications.getAllScheduledNotificationsAsync();
    console.log('📅 Scheduled notifications:', notifications.length);
    return notifications;
}
