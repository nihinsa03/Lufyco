import React from "react";
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Platform, StatusBar } from "react-native";
import { Feather } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/AppNavigator";

// This screen shows a dedicated Women's Wear catalog page
type Props = NativeStackScreenProps<RootStackParamList, "WomensWear">;

const LEFT_MENU = [
  { label: "Men’s Wear", image: require("../../assets/images/menu/mens-wear.jpg"), route: "Categories" as keyof RootStackParamList },
  { label: "Women’s Wear", image: require("../../assets/images/menu/womens-wear.jpg"), route: "WomensWear" as keyof RootStackParamList },
  { label: "Kids’ Wear", image: require("../../assets/images/menu/kids-wear.jpg"), route: undefined },
  { label: "Foot Wear", image: require("../../assets/images/menu/foot-wear.jpg"), route: undefined },
  { label: "Beauty Products", image: require("../../assets/images/menu/beauty-products.jpg"), route: undefined },
  { label: "Jewellery", image: require("../../assets/images/categories/jewellery/jewellery.png"), route: undefined },
  { label: "Accessories", image: require("../../assets/images/menu/accessories.jpg"), route: undefined },
];

const SECTIONS = [
  {
    title: "Western Wear",
    items: [
      { name: "DRESSES", image: require("../../assets/images/women/western/dress.jpg") },
      { name: "TOPS", image: require("../../assets/images/women/western/top.jpg"), route: "WomenTops" as keyof RootStackParamList },
      { name: "JEANS", image: require("../../assets/images/women/western/jeans.jpg") },
      { name: "TROUSERS", image: require("../../assets/images/women/western/trousers.jpg") },
      { name: "T-SHIRTS", image: require("../../assets/images/women/western/t-shirts.jpg") },
      { name: "SHIRTS", image: require("../../assets/images/women/western/shirts-w.jpg") },
    ],
  },
  {
    title: "Ethnic Wear",
    items: [
      { name: "KURTAS", image: require("../../assets/images/women/ethnic/kurtas.jpg") },
      { name: "SAREES", image: require("../../assets/images/women/ethnic/sarees.jpg") },
      { name: "ETHNIC DRESSES", image: require("../../assets/images/women/ethnic/ethnic-dresses.jpg") },
      { name: "LEHENGA", image: require("../../assets/images/women/ethnic/lehenga.jpg") },
    ],
  },
  {
    title: "Sports Wear",
    items: [
      { name: "T-SHIRTS", image: require("../../assets/images/women/sports/sports-tshirts.jpg") },
      { name: "TRACK PANTS", image: require("../../assets/images/women/sports/trackpants-sports.jpg") },
      { name: "JACKETS", image: require("../../assets/images/women/sports/jackets-women.jpg") },
      { name: "SHORTS", image: require("../../assets/images/women/sports/shorts-women.jpg") },
      { name: "SWEAT SHIRTS", image: require("../../assets/images/women/sports/sweat-shirts.jpg") },
    ],
  },
];

const WomensWearScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safe}>
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

      {/* Body: left rail + right panel */}
      <View style={styles.body}>
        {/* Left rail */}
        <ScrollView style={styles.leftRail} showsVerticalScrollIndicator={false}>
          {LEFT_MENU.map((m) => {
            const active = m.label.startsWith("Women");
            return (
              <TouchableOpacity
                key={m.label}
                style={[styles.railBtn, active && styles.railBtnActive]}
                activeOpacity={0.8}
                onPress={() => {
                  if (!active && m.route) navigation.navigate(m.route as any);
                }}
              >
                <Image source={m.image} style={styles.railImg} />
                <Text
                  style={[styles.railLabel, active && styles.railLabelActive]}
                  numberOfLines={2}
                >
                  {m.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Right panel */}
        <ScrollView
          contentContainerStyle={styles.rightPanel}
          showsVerticalScrollIndicator={false}
        >
          {SECTIONS.map((section) => (
            <View key={section.title} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <View style={styles.grid}>
                {section.items.map((it) => (
                  <TouchableOpacity
                    key={it.name}
                    style={styles.itemBox}
                    onPress={() => {
                      if (it.route) {
                        navigation.navigate(it.route as any);
                      }
                    }}
                    activeOpacity={0.75}
                  >
                    <Image source={it.image} style={styles.itemImg} />
                    <Text style={styles.itemLabel}>{it.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" , paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 15,
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
    marginLeft: -22,
  },
  headerIcons: { flexDirection: "row", alignItems: "center" },
  icon: { marginLeft: 15 },

  body: { flexDirection: "row", flex: 1 },

  leftRail: {
    width: 120,
    backgroundColor: "#EFEFEF",
    paddingTop: 10,
    paddingLeft: 8,
  },
  railBtn: {
    backgroundColor: "#F6F6F6",
    padding: 8,
    marginVertical: 6,
    borderRadius: 14,
    alignItems: "center",
  },
  railBtnActive: {
    borderWidth: 2,
    borderColor: "#5C8DFF",
    backgroundColor: "#FFFFFF",
    shadowColor: "#5C8DFF",
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  railImg: {
    width: 64,
    height: 64,
    borderRadius: 12,
    resizeMode: "cover",
  },
  railLabel: {
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
    marginTop: 6,
    color: "#222",
  },
  railLabelActive: { color: "#5C8DFF" },

  rightPanel: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 80,
  },

  section: { marginBottom: 22 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 10 },

  grid: { flexDirection: "row", flexWrap: "wrap" },
  itemBox: {
    width: "28%",
    marginRight: "5%",
    marginBottom: 18,
    alignItems: "center",
  },
  itemImg: { width: 88, height: 100, borderRadius: 12, resizeMode: "cover" },
  itemLabel: {
    fontSize: 12,
    marginTop: 8,
    textAlign: "center",
    fontWeight: "600",
  },
});

export default WomensWearScreen;
