import React from "react";
import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity, ScrollView, FlatList, Platform, StatusBar } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { mockCategories, Category } from "../data/mockData";

const { width } = Dimensions.get("window");

type OffersScreenNavigationProp = StackNavigationProp<RootStackParamList, "Offers">;

const OffersScreen = () => {
  const navigation = useNavigation<OffersScreenNavigationProp>();

  const menCategories = mockCategories.filter(c => c.gender === 'men');
  const womenCategories = mockCategories.filter(c => c.gender === 'women');

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <View style={styles.categoryCard}>
      <Image source={item.image} style={styles.categoryImage} resizeMode="cover" />
      <Text style={styles.categoryName} numberOfLines={1}>{item.name}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backText}>←</Text>
      </TouchableOpacity>

      {/* Main Content: Two Horizontal Scroll Rows */}
      <View style={styles.listContainer}>
        {/* Row 1: Men's Categories */}
        <View style={styles.rowWrapper}>
          <Text style={styles.rowHeader}>Men's Categories</Text>
          <FlatList
            data={menCategories}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={renderCategoryItem}
            contentContainerStyle={styles.scrollContent}
          />
        </View>

        {/* Row 2: Women's Categories */}
        <View style={styles.rowWrapper}>
          <Text style={styles.rowHeader}>Women's Categories</Text>
          <FlatList
            data={womenCategories}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={renderCategoryItem}
            contentContainerStyle={styles.scrollContent}
          />
        </View>
      </View>

      <Text style={styles.title}>Unlock exclusive offers {"\n"}and discounts</Text>
      <Text style={styles.subtitle}>
        Get access to limited-time deals and special promotions available only to our valued customers.
      </Text>

      {/* Next Button */}
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Payments")}>
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>

      <View style={styles.pagination}>
        <View style={styles.dot} />
        <View style={[styles.dot, styles.activeDot]} />
        <View style={styles.dot} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 60 : 60,
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
  },
  backText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  listContainer: {
    width: width,
    marginBottom: 20,
    marginTop: 20,
  },
  rowWrapper: {
    marginBottom: 20,
  },
  rowHeader: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 20,
    marginBottom: 10,
    color: '#333',
  },
  scrollContent: {
    paddingHorizontal: 15,
  },
  categoryCard: {
    marginRight: 12,
    width: 100,
    alignItems: 'center',
  },
  categoryImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
    marginBottom: 5,
    backgroundColor: '#f0f0f0',
  },
  categoryName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 10,
  },
  subtitle: {
    fontSize: 14,
    color: "#777",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: "#000",
    paddingVertical: 15,
    width: "100%",
    alignItems: "center",
    borderRadius: 10,
    marginTop: 0,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  pagination: {
    flexDirection: "row",
    marginTop: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ccc",
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: "#007BFF",
  },
});

export default OffersScreen;
