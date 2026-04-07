import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, SafeAreaView, Platform, StatusBar } from "react-native";
import { Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useShopStore } from '../../store/useShopStore';
import { useTheme } from '../../context/ThemeContext';

const SearchScreen = () => {
    const navigation = useNavigation<any>();
    const { colors, isDark: dark } = useTheme();
    const styles = getStyles(colors, dark);
    const { recentSearches, addRecentSearch, clearRecentSearches, setFilter } = useShopStore();
    const [input, setInput] = useState('');

    const handleSearch = (term: string) => {
        if (!term.trim()) return;
        addRecentSearch(term);
        // Clear categoryId when performing a global search
        setFilter({ query: term, categoryId: undefined });
        navigation.navigate('ProductListing', { search: term, title: `Search: ${term}` });
    };

    const handleClear = () => {
        setInput('');
        setFilter({ query: '' });
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <Text style={styles.logo}>Fashion</Text>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Feather name="x" size={24} color={colors.text} />
                </TouchableOpacity>
            </View>

            <View style={styles.searchBar}>
                <Ionicons name="search" size={20} color={dark ? "#aaa" : "#666"} />
                <TextInput
                    style={styles.input}
                    placeholder="Search"
                    placeholderTextColor={dark ? "#aaa" : "#888"}
                    value={input}
                    onChangeText={setInput}
                    onSubmitEditing={() => handleSearch(input)}
                    autoFocus
                />
                {input.length > 0 ? (
                    <TouchableOpacity onPress={handleClear}>
                        <Feather name="x-circle" size={18} color={dark ? "#888" : "#999"} />
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity onPress={() => navigation.navigate('Filter')}>
                        <Ionicons name="options-outline" size={24} color={dark ? "#ccc" : "#666"} />
                    </TouchableOpacity>
                )}
            </View>

            {recentSearches.length > 0 && (
                <View style={styles.recentSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>RECENT SEARCH</Text>
                        <TouchableOpacity onPress={clearRecentSearches}>
                            <Feather name="trash-2" size={16} color={dark ? "#888" : "#999"} />
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={recentSearches}
                        keyExtractor={(item) => item}
                        renderItem={({ item }) => (
                            <TouchableOpacity style={styles.recentItem} onPress={() => handleSearch(item)}>
                                <Text style={styles.recentText}>{item}</Text>
                                <Feather name="arrow-up-right" size={20} color={dark ? "#555" : "#ccc"} />
                            </TouchableOpacity>
                        )}
                    />
                </View>
            )}


            {/* Optional: Popular Search suggestions could go here */}

            <View style={styles.bottomSpacer} />
            <View style={styles.homeIndicator} />
        </SafeAreaView>
    );
};

const getStyles = (colors: any, dark: boolean) => StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background , paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
        marginBottom: 15
    },
    logo: { fontSize: 24, fontWeight: 'bold', color: colors.text },

    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: dark ? '#1c1c1e' : '#f5f5f5',
        marginHorizontal: 20,
        paddingHorizontal: 15,
        height: 50,
        borderRadius: 25,
        marginBottom: 25,
        borderWidth: dark ? 1 : 0,
        borderColor: '#333'
    },
    input: { flex: 1, marginLeft: 10, fontSize: 16, color: colors.text },

    recentSection: { paddingHorizontal: 20 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
    sectionTitle: { fontSize: 12, fontWeight: '600', color: dark ? '#aaa' : '#888' },

    recentItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: dark ? '#333' : '#f9f9f9'
    },
    recentText: { fontSize: 16, color: colors.text },

    bottomSpacer: { flex: 1 },
    homeIndicator: {
        width: 134,
        height: 5,
        backgroundColor: dark ? '#fff' : '#000',
        borderRadius: 2.5,
        alignSelf: 'center',
        marginBottom: 8,
        opacity: dark ? 0.4 : 0.8
    }
});

export default SearchScreen;
