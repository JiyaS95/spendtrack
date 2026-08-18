import React, { useState, useEffect, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Animated, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API = "https://studious-memory-wr596gpqw9xpcg6wr-8080.app.github.dev";

export default function WishlistScreen() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadItems();
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const loadItems = async () => {
    const t = await AsyncStorage.getItem("token");
    try {
      const res = await axios.get(`${API}/wishlist`, { headers: { Authorization: `Bearer ${t}` } });
      setItems(res.data);
    } catch (e) {}
  };

  const addItem = async () => {
    if (!name || !price) return Alert.alert("Error", "Please enter a name and price");
    setLoading(true);
    const t = await AsyncStorage.getItem("token");
    try {
      await axios.post(`${API}/wishlist`,
        { name, targetPrice: parseFloat(price) },
        { headers: { Authorization: `Bearer ${t}` } }
      );
      setName("");
      setPrice("");
      loadItems();
    } catch (e) {
      Alert.alert("Error", "Failed to add item");
    }
    setLoading(false);
  };

  const deleteItem = async (id) => {
    const t = await AsyncStorage.getItem("token");
    try {
      await axios.delete(`${API}/wishlist/${id}`, { headers: { Authorization: `Bearer ${t}` } });
      loadItems();
    } catch (e) {}
  };

  const formatMonths = (months) => {
    if (!months) return "Add more expenses for estimate";
    if (months >= 1200) return "Need more spending data";
    if (months < 1) return "Almost there!";
    const m = Math.ceil(months);
    if (m < 12) return `~${m} month${m === 1 ? "" : "s"}`;
    const years = Math.floor(m / 12);
    const rem = m % 12;
    return rem > 0 ? `~${years}y ${rem}m` : `~${years} year${years === 1 ? "" : "s"}`;
  };

  const getGoalColor = (months) => {
    if (!months || months >= 1200) return "#555";
    if (months <= 3) return "#1a9e5c";
    if (months <= 12) return "#f7971e";
    return "#ff6584";
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Animated.View style={{ opacity: fadeAnim }}>
        <Text style={styles.title}>Wishlist</Text>
        <Text style={styles.subtitle}>Track goals. See how long until you can afford them.</Text>

        <View style={styles.addCard}>
          <Text style={styles.addTitle}>Add a goal</Text>
          <TextInput
            style={styles.input}
            placeholder="What do you want? (e.g. MacBook Pro)"
            placeholderTextColor="#555"
            value={name}
            onChangeText={setName}
          />
          <View style={styles.priceRow}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={styles.priceInput}
              placeholder="Target price"
              placeholderTextColor="#555"
              value={price}
              onChangeText={setPrice}
              keyboardType="decimal-pad"
            />
          </View>
          <TouchableOpacity style={styles.addButton} onPress={addItem} disabled={loading}>
            <Ionicons name="add-circle-outline" size={18} color="#fff" />
            <Text style={styles.addButtonText}>{loading ? "Adding..." : "Add to Wishlist"}</Text>
          </TouchableOpacity>
        </View>

        {items.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="star-outline" size={48} color="#333" />
            <Text style={styles.emptyText}>No wishlist items yet</Text>
            <Text style={styles.emptySubText}>Add something you're saving toward</Text>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Goals</Text>
            {items.map((item, i) => (
              <View key={item.id} style={styles.itemCard}>
                <View style={styles.itemTop}>
                  <View style={styles.itemIconWrap}>
                    <Ionicons name="star" size={18} color="#f7971e" />
                  </View>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemPrice}>${item.targetPrice.toLocaleString()}</Text>
                  </View>
                  <TouchableOpacity onPress={() => deleteItem(item.id)} style={styles.deleteBtn}>
                    <Ionicons name="trash-outline" size={18} color="#555" />
                  </TouchableOpacity>
                </View>
                <View style={styles.itemBottom}>
                  <Ionicons name="time-outline" size={14} color={getGoalColor(item.monthsToGoal)} />
                  <Text style={[styles.timeToGoal, { color: getGoalColor(item.monthsToGoal) }]}>
                    {formatMonths(item.monthsToGoal)}
                  </Text>
                  {item.monthlySavingsEstimate > 0 && item.monthsToGoal < 1200 && (
                    <Text style={styles.savingsHint}>
                      saving ~${item.monthlySavingsEstimate}/mo
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0d0d0d", padding: 20 },
  title: { color: "#fff", fontSize: 28, fontWeight: "800", marginTop: 52, marginBottom: 6 },
  subtitle: { color: "#555", fontSize: 14, marginBottom: 24 },
  addCard: { backgroundColor: "#141414", borderRadius: 16, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: "#1c1c1e" },
  addTitle: { color: "#fff", fontSize: 16, fontWeight: "700", marginBottom: 14 },
  input: { backgroundColor: "#0d0d0d", color: "#fff", padding: 14, borderRadius: 12, fontSize: 14, marginBottom: 10, borderWidth: 1, borderColor: "#1c1c1e" },
  priceRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#0d0d0d", borderRadius: 12, borderWidth: 1, borderColor: "#1c1c1e", marginBottom: 14, paddingHorizontal: 14 },
  currencySymbol: { color: "#1a9e5c", fontSize: 18, fontWeight: "800", marginRight: 6 },
  priceInput: { color: "#fff", fontSize: 16, flex: 1, padding: 14 },
  addButton: { backgroundColor: "#1a9e5c", padding: 14, borderRadius: 12, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  addButtonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  emptyCard: { alignItems: "center", padding: 48 },
  emptyText: { color: "#555", fontSize: 16, fontWeight: "600", marginTop: 12 },
  emptySubText: { color: "#333", fontSize: 13, marginTop: 6 },
  section: { marginBottom: 24 },
  sectionTitle: { color: "#fff", fontSize: 18, fontWeight: "700", marginBottom: 14 },
  itemCard: { backgroundColor: "#141414", borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "#1c1c1e" },
  itemTop: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  itemIconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: "#f7971e22", alignItems: "center", justifyContent: "center", marginRight: 12 },
  itemInfo: { flex: 1 },
  itemName: { color: "#fff", fontSize: 15, fontWeight: "700" },
  itemPrice: { color: "#888", fontSize: 13, marginTop: 2 },
  deleteBtn: { padding: 6 },
  itemBottom: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#0d0d0d", padding: 10, borderRadius: 10 },
  timeToGoal: { fontSize: 13, fontWeight: "700", flex: 1 },
  savingsHint: { color: "#444", fontSize: 11 },
});
