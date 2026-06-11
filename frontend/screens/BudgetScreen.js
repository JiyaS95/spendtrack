import React, { useState, useEffect, useRef } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, Animated, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API = "https://studious-memory-wr596gpqw9xpcg6wr-8080.app.github.dev";
const CATEGORIES = ["Food", "Transport", "Shopping", "Entertainment", "Health", "Bills", "Other"];

export default function BudgetScreen() {
  const [budgetStatus, setBudgetStatus] = useState([]);
  const [category, setCategory] = useState("Food");
  const [limitAmount, setLimitAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadBudgets();
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const loadBudgets = async () => {
    const t = await AsyncStorage.getItem("token");
    try {
      const res = await axios.get(`${API}/budgets/status`, { headers: { Authorization: `Bearer ${t}` } });
      setBudgetStatus(res.data);
    } catch (e) {}
  };

  const saveBudget = async () => {
    if (!limitAmount) return Alert.alert("Error", "Please enter a limit amount");
    setLoading(true);
    try {
      const t = await AsyncStorage.getItem("token");
      await axios.post(`${API}/budgets`, { category, limitAmount: parseFloat(limitAmount) },
        { headers: { Authorization: `Bearer ${t}` } });
      setLimitAmount("");
      loadBudgets();
    } catch (e) {
      Alert.alert("Error", "Failed to save budget");
    }
    setLoading(false);
  };

  const getStatusColor = (status) =>
    status === "OVER_BUDGET" ? "#ff6584" : status === "WARNING" ? "#f7971e" : "#43e97b";

  const getStatusIcon = (status) =>
    status === "OVER_BUDGET" ? "alert-circle" : status === "WARNING" ? "warning" : "checkmark-circle";

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Animated.View style={{ opacity: fadeAnim }}>
        <Text style={styles.title}>Budgets</Text>

        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Set a Budget</Text>
          <Text style={styles.label}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {CATEGORIES.map((c) => (
              <TouchableOpacity key={c}
                style={[styles.chip, category === c && styles.chipActive]}
                onPress={() => setCategory(c)}>
                <Text style={[styles.chipText, category === c && styles.chipTextActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Text style={styles.label}>Monthly Limit ($)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 500"
            placeholderTextColor="#555"
            value={limitAmount}
            onChangeText={setLimitAmount}
            keyboardType="decimal-pad"
          />
          <TouchableOpacity style={styles.button} onPress={saveBudget} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? "Saving..." : "Set Budget"}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>This Month</Text>
        {budgetStatus.length === 0 && (
          <View style={styles.emptyCard}>
            <Ionicons name="wallet-outline" size={40} color="#333" />
            <Text style={styles.emptyText}>No budgets set yet</Text>
          </View>
        )}
        {budgetStatus.map((b, i) => (
          <View key={i} style={styles.budgetCard}>
            <View style={styles.budgetHeader}>
              <Text style={styles.budgetCategory}>{b.category}</Text>
              <View style={styles.statusBadge}>
                <Ionicons name={getStatusIcon(b.status)} size={14} color={getStatusColor(b.status)} />
                <Text style={[styles.statusText, { color: getStatusColor(b.status) }]}>{b.status}</Text>
              </View>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, {
                width: `${Math.min(b.percentage, 100)}%`,
                backgroundColor: getStatusColor(b.status),
              }]} />
            </View>
            <View style={styles.budgetFooter}>
              <Text style={styles.budgetMeta}>Spent: <Text style={styles.budgetValue}>${b.spent.toFixed(2)}</Text></Text>
              <Text style={styles.budgetMeta}>{b.percentage}% used</Text>
              <Text style={styles.budgetMeta}>Limit: <Text style={styles.budgetValue}>${b.limit.toFixed(2)}</Text></Text>
            </View>
          </View>
        ))}
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0d0d0d", padding: 20 },
  title: { color: "#fff", fontSize: 28, fontWeight: "800", marginTop: 52, marginBottom: 24 },
  formCard: { backgroundColor: "#141414", borderRadius: 20, padding: 20, marginBottom: 28 },
  formTitle: { color: "#fff", fontSize: 17, fontWeight: "700", marginBottom: 16 },
  label: { color: "#888", fontSize: 13, fontWeight: "600", marginBottom: 10 },
  categoryScroll: { marginBottom: 16 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: "#0d0d0d", marginRight: 8, borderWidth: 1, borderColor: "#1c1c1e" },
  chipActive: { backgroundColor: "#1a9e5c22", borderColor: "#1a9e5c" },
  chipText: { color: "#888", fontSize: 13, fontWeight: "600" },
  chipTextActive: { color: "#1a9e5c" },
  input: { backgroundColor: "#0d0d0d", color: "#fff", padding: 14, borderRadius: 12, fontSize: 16, marginBottom: 16, borderWidth: 1, borderColor: "#1c1c1e" },
  button: { backgroundColor: "#1a9e5c", padding: 16, borderRadius: 12, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  sectionTitle: { color: "#fff", fontSize: 18, fontWeight: "700", marginBottom: 14 },
  emptyCard: { backgroundColor: "#141414", borderRadius: 16, padding: 40, alignItems: "center" },
  emptyText: { color: "#555", marginTop: 12, fontSize: 15 },
  budgetCard: { backgroundColor: "#141414", borderRadius: 16, padding: 16, marginBottom: 12 },
  budgetHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  budgetCategory: { color: "#fff", fontSize: 16, fontWeight: "700" },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 4 },
  statusText: { fontSize: 12, fontWeight: "700" },
  progressTrack: { height: 8, backgroundColor: "#0d0d0d", borderRadius: 4, marginBottom: 12 },
  progressFill: { height: 8, borderRadius: 4 },
  budgetFooter: { flexDirection: "row", justifyContent: "space-between" },
  budgetMeta: { color: "#888", fontSize: 12 },
  budgetValue: { color: "#fff", fontWeight: "600" },
});
