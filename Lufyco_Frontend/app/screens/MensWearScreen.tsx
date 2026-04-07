// screens/CategoriesScreen.tsx
import React, { useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, SafeAreaView, Platform, StatusBar } from "react-native";
import { Feather } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "MensWear">;

const categoryData = [
  {
    label: "Men's Wear",
    image: require("../../assets/images/menu/mens-wear.jpg"),
    sections: [
      {
        title: "Casual Wear",
        items: [
          { name: "SHIRTS", image: require("../../assets/images/men/casual/shirts.jpg") },
          { name: "JEANS", image: require("../../assets/images/men/casual/jeans.jpg") },
          { name: "TSHIRTS", image: require("../../assets/images/men/casual/tshirts.jpg") },
          { name: "TROUSERS", image: require("../../assets/images/men/casual/trousers.jpg") },
          { name: "SHORTS", image: require("../../assets/images/men/casual/shorts.jpg") },
          { name: "TRACK PANTS", image: require("../../assets/images/men/casual/trackpants.jpg") },
          { name: "JACKETS", image: require("../../assets/images/men/casual/jackets.jpg") },
          { name: "SWEATER", image: require("../../assets/images/men/casual/sweater.jpg") },
        ],
      },
      {
        title: "Work Wear",
        items: [
          { name: "FORMAL SHIRTS", image: require("../../assets/images/men/work/formal-shirts.jpg") },
          { name: "BLAZERS", image: require("../../assets/images/men/work/blazers.jpg") },
          { name: "FORMAL TROUSERS", image: require("../../assets/images/men/work/formal-trousers.jpg") },
          { name: "TIES", image: require("../../assets/images/men/work/ties.jpg") },
          { name: "FORMAL SHOES", image: require("../../assets/images/men/work/formal-shoes.jpg") },
        ],
      },
      {
        title: "Sports Wear",
        items: [
          { name: "TSHIRTS", image: require("../../assets/images/men/sports/sports-tshirts.jpg") },
          { name: "TRACK PANTS", image: require("../../assets/images/men/sports/track-pants.jpg") },
          { name: "JACKETS", image: require("../../assets/images/men/sports/s-jackets.jpg") },
          { name: "SHORTS", image: require("../../assets/images/men/sports/s-shorts.jpg") },
          { name: "TRACKSUITS", image: require("../../assets/images/men/sports/s-tracksuits.jpg") },
        ],
      },
    ],
  },
  {
    label: "Women's Wear",
    image: require("../../assets/images/menu/womens-wear.jpg"),
    sections: [],
  },
  {
    label: "Kids' Wear",
    image: require("../../assets/images/menu/kids-wear.jpg"),
    sections: [],
  },
  {
    label: "Foot Wear",
    image: require("../../assets/images/menu/foot-wear.jpg"),
    sections: [],
  },
  {
    label: "Beauty Products",
    image: require("../../assets/images/menu/beauty-products.jpg"),
    sections: [],
  },
  {
    label: "Jewellery",
    image: require("../../assets/images/categories/jewellery/jewellery.png"),
    sections: [],
  },
  {
    label: "Accessories",
    image: require("../../assets/images/menu/accessories.jpg"),
    sections: [],
  },
];

const MensWearScreen: React.FC<Props> = ({ navigation }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedCategory = categoryData[selectedIndex];

  const handleItemPress = (sectionTitle: string, itemName: string) => {
    // Route only the Men → Casual Wear → SHIRTS to the shirts listing screen
    if (
      selectedCategory.label === "Men's Wear" &&
      sectionTitle === "Casual Wear" &&
      itemName === "SHIRTS"
    ) {
      navigation.navigate("MenCasualShirts");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 6 }}>
          <Feather name="arrow-left" size={22} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Categories</Text>
        <View style={styles.headerIcons}>
          <Feather name="bell" size={22} style={styles.icon} />
          <Feather name="heart" size={22} style={styles.icon} />
          <Feather name="user" size={22} style={styles.icon} />
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.container}>
        {/* Left Menu */}
        <ScrollView style={styles.leftMenu} showsVerticalScrollIndicator={false}>
          {categoryData.map((cat, index) => {
            const active = selectedIndex === index;
            return (
              <TouchableOpacity
                key={cat.label}
                style={[styles.categoryButton, active && styles.selectedCategory]}
                onPress={() => setSelectedIndex(index)}
              >
                <Image source={cat.image} style={styles.categoryImage} />
                <Text style={[styles.categoryLabel, active && styles.categoryLabelActive]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Right Panel */}
        <ScrollView
          contentContainerStyle={styles.rightPanel}
          showsVerticalScrollIndicator={false}
        >
          {selectedCategory.sections.length > 0 ? (
            selectedCategory.sections.map((section) => (
              <View key={section.title} style={styles.section}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <View style={styles.grid}>
                  {section.items.map((item) => (
                    <TouchableOpacity
                      key={item.name}
                      style={styles.itemBox}
                      onPress={() => handleItemPress(section.title, item.name)}
                      activeOpacity={0.7}
                    >
                      <Image source={item.image} style={styles.itemImage} />
                      <Text style={styles.itemLabel}>{item.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noItemsText}>No items available.</Text>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" , paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 15,
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "500",
    flex: 1,
    textAlign: "center",
    marginLeft: -22,
  },
  headerIcons: { flexDirection: "row", alignItems: "center" },
  icon: { marginLeft: 15 },

  container: { flexDirection: "row", flex: 1 , paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },

  leftMenu: {
    width: "32%",
    backgroundColor: "#eee",
    paddingTop: 10,
    paddingLeft: 5,
  },
  categoryButton: {
    backgroundColor: "#f6f6f6",
    padding: 8,
    marginVertical: 6,
    borderRadius: 12,
    alignItems: "center",
  },
  selectedCategory: {
    borderWidth: 2,
    borderColor: "#1E90FF",
    backgroundColor: "#fff",
    shadowColor: "#1E90FF",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  categoryImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
    resizeMode: "cover",
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
    marginTop: 6,
    color: "#222",
  },
  categoryLabelActive: { color: "#1E90FF" },

  rightPanel: {
    flexGrow: 1,
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 80,
  },

  section: { marginBottom: 22 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 10 },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start", // ensures consistent packing
  },
  itemBox: {
    width: "30%",
    marginRight: "3.3%", // 30 + 3.3 + 30 + 3.3 + 30 ≈ 96.6 -> nice 3-up layout
    marginBottom: 20,
    alignItems: "center",
  },
  itemImage: {
    width: 80,
    height: 90,
    borderRadius: 10,
    resizeMode: "cover",
  },
  itemLabel: {
    fontSize: 12,
    marginTop: 6,
    textAlign: "center",
    fontWeight: "500",
  },

  noItemsText: {
    fontSize: 14,
    fontStyle: "italic",
    marginTop: 20,
    textAlign: "center",
  },
});

export default MensWearScreen;
