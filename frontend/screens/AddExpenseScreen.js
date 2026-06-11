import React, { useState, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Animated, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API = "https://studious-memory-wr596gpqw9xpcg6wr-8080.app.github.dev";

const CATEGORIES = [
  { name: "Food", emoji: "🍔" },
  { name: "Transport", emoji: "🚗" },
  { name: "Shopping", emoji: "🛍️" },
  { name: "Entertainment", emoji: "🎮" },
  { name: "Health", emoji: "💊" },
  { name: "Bills", emoji: "📄" },
  { name: "Other", emoji: "💸" },
];

export default function AddExpenseScreen() {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [category, setCategory] = useState("Food");
  const [loading, setLoading] = useState(false);
  const successAnim = useRef(new Animated.Value(0)).current;

  const showSuccess = () => {
    Animated.sequence([
      Animated.timing(successAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(1000),
      Animated.timing(successAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  };

  const submit = async () => {
    if (!amount) return Alert.alert("Error", "Please enter an amount");
    setLoading(true);
    try {
      const t = await AsyncStorage.getItem("token");
      await axios.post(`${API}/expenses`, {
        amount: parseFloat(amount),
        note,
        category,
        date: new Date().toISOString().split("T")[0],
      }, { headers: { Authorization: `Bearer ${t}` } });
      setAmount("");
      setNote("");
      setCategory("Food");
      showSuccess();
    } catch (e) {
      Alert.alert("Error", "Failed to add expense");
    }
    setLoading(false);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Add Expense</Text>

      <Animated.View style={[styles.successBanner, { opacity: successAnim, transform: [{ scale: successAnim }] }]}>
        <Ionicons name="checkmark-circle" size={20} color="#43e97b" />
        <Text style={styles.successText}>Expense saved!</Text>
      </Animated.View>

      <View style={styles.amountCard}>
        <Text style={styles.currencySymbol}>$</Text>
        <TextInput
          style={styles.amountInput}
          placeholder="0.00"
          placeholderTextColor="#444"
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
        />
      </View>

      <Text style={styles.label}>Category</Text>
      <View style={styles.categoryGrid}>
        {CATEGORIES.map((c) => (
          <TouchableOpacity
            key={c.name}
            style={[styles.categoryChip, category === c.name && styles.categoryChipActive]}
            onPress={() => setCategory(c.name)}
          >
            <Text style={styles.categoryEmoji}>{c.emoji}</Text>
            <Text style={[styles.categoryText, category === c.name && styles.categoryTextActive]}>{c.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Note</Text>
      <TextInput
        style={styles.noteInput}
        placeholder="What was this for?"
        placeholderTextColor="#555"
        value={note}
        onChangeText={setNote}
      />

      <TouchableOpacity style={styles.button} onPress={submit} disabled={loading}>
        <Ionicons name="add-circle-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.buttonText}>{loading ? "Saving..." : "Save Expense"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0d0d0d", padding: 20 },
  title: { color: "#fff", fontSize: 28, fontWeight: "800", marginTop: 52, marginBottom: 24 },
  successBanner: { flexDirection: "row", alignItems: "center", backgroundColor: "#43e97b22", padding: 14, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: "#43e97b44" },
  successText: { color: "#43e97b", fontWeight: "600", marginLeft: 8 },
  amountCard: { backgroundColor: "#141414", borderRadius: 20, padding: 24, flexDirection: "row", alignItems: "center", marginBottom: 28, borderWidth: 1, borderColor: "#1c1c1e" },
  currencySymbol: { color: "#1a9e5c", fontSize: 36, fontWeight: "800", marginRight: 8 },
  amountInput: { color: "#fff", fontSize: 48, fontWeight: "800", flex: 1 },
  label: { color: "#888", fontSize: 13, fontWeight: "600", marginBottom: 10, letterSpacing: 0.5 },
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 24 },
  categoryChip: { backgroundColor: "#141414", borderRadius: 14, padding: 12, alignItems: "center", minWidth: 80, borderWidth: 1, borderColor: "#1c1c1e" },
  categoryChipActive: { backgroundColor: "#1a9e5c22", borderColor: "#1a9e5c" },
  categoryEmoji: { fontSize: 22, marginBottom: 4 },
  categoryText: { color: "#888", fontSize: 12, fontWeight: "600" },
  categoryTextActive: { color: "#1a9e5c" },
  noteInput: { backgroundColor: "#141414", color: "#fff", padding: 16, borderRadius: 14, fontSize: 15, marginBottom: 28, borderWidth: 1, borderColor: "#1c1c1e" },
  button: { backgroundColor: "#1a9e5c", padding: 18, borderRadius: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", shadowColor: "#1a9e5c", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16, marginBottom: 40 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
