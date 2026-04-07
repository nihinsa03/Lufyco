import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather, Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import AIStylistScreen from '../screens/AIStylistScreen'; // Exist
import MyCartScreen from '../screens/MyCartScreen'; // Exist
import WishlistScreen from '../screens/WishlistScreen'; // Exist
import ProfileScreen from '../screens/ProfileScreen';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';

const Tab = createBottomTabNavigator();

const CustomTabBar = ({ state, descriptors, navigation }: any) => {
    const { count } = useCart();
    const { colors } = useTheme();

    return (
        <View style={[styles.tabBar, { backgroundColor: colors.tabBar, borderColor: colors.border }]}>
            {state.routes.map((route: any, index: number) => {
                const { options } = descriptors[route.key];
                const isFocused = state.index === index;

                const onPress = () => {
                    const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                        canPreventDefault: true,
                    });

                    if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(route.name);
                    }
                };

                const onLongPress = () => {
                    navigation.emit({
                        type: 'tabLongPress',
                        target: route.key,
                    });
                };

                let iconName: any = "home-outline";
                let IconComp: any = Ionicons;

                if (route.name === 'Home') iconName = isFocused ? 'home' : 'home-outline';
                else if (route.name === 'AIStylist') iconName = isFocused ? 'grid' : 'grid-outline';
                else if (route.name === 'MyCart') iconName = isFocused ? 'cart' : 'cart-outline';
                else if (route.name === 'Wishlist') iconName = isFocused ? 'heart' : 'heart-outline';
                else if (route.name === 'Profile') iconName = isFocused ? 'person' : 'person-outline';

                const label = options.tabBarLabel !== undefined
                    ? options.tabBarLabel
                    : options.title !== undefined
                        ? options.title
                        : route.name;

                return (
                    <TouchableOpacity
                        key={index}
                        accessibilityRole="button"
                        accessibilityState={isFocused ? { selected: true } : {}}
                        accessibilityLabel={options.tabBarAccessibilityLabel}
                        testID={options.tabBarTestID}
                        onPress={onPress}
                        onLongPress={onLongPress}
                        style={styles.tabItem}
                    >
                        <View>
                            <IconComp name={iconName} size={24} color={isFocused ? (colors.tabActive || '#0066FF') : (colors.tabInactive || '#8E8E93')} />
                            {route.name === 'MyCart' && count > 0 && (
                                <View style={styles.redDot} />
                            )}
                        </View>
                        <Text style={{ fontSize: 11, color: isFocused ? (colors.tabActive || '#0066FF') : (colors.tabInactive || '#8E8E93'), marginTop: 4, fontWeight: isFocused ? '600' : '400' }}>
                            {label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

const BottomTabNavigator = () => {
    return (
        <Tab.Navigator
            initialRouteName="Home"
            tabBar={(props) => <CustomTabBar {...props} />}
            screenOptions={{ headerShown: false }}
        >
            <Tab.Screen name="Home" component={HomeScreen as any} options={{ tabBarLabel: 'Home' }} />
            <Tab.Screen name="AIStylist" component={AIStylistScreen as any} options={{ tabBarLabel: 'AI Stylist' }} />
            <Tab.Screen name="MyCart" component={MyCartScreen as any} options={{ tabBarLabel: 'Cart' }} />
            <Tab.Screen name="Wishlist" component={WishlistScreen as any} options={{ tabBarLabel: 'Wishlist' }} />
            <Tab.Screen name="Profile" component={ProfileScreen as any} options={{ tabBarLabel: 'Profile' }} />
        </Tab.Navigator>
    );
};

const styles = StyleSheet.create({
    tabBar: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        height: Platform.OS === 'ios' ? 85 : 60,
        paddingBottom: Platform.OS === 'ios' ? 25 : 0,
        paddingTop: Platform.OS === 'ios' ? 10 : 0,
        borderTopWidth: 1,
        borderColor: '#E5E7EB',
        elevation: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: -4 },
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    redDot: {
        position: 'absolute', top: -2, right: -4, backgroundColor: '#EF4444',
        width: 10, height: 10, borderRadius: 5, borderWidth: 1, borderColor: '#fff'
    },
});

export default BottomTabNavigator;
