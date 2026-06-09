import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API = "http://localhost:8080";

export default function DashboardScreen({ navigation }) {
  const [expenses, setExpenses] = useState([]);
  const [budgetStatus, setBudgetStatus] = useState([]);
  const [token, setToken] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const t = await AsyncStorage.getItem("token");
    setToken(t);
    const headers = { Authorization: `Bearer ${t}` };
    try {
      const [expRes, budRes] = await Promise.all([
        axios.get(`${API}/expenses`, { headers }),
        axios.get(`${API}/budgets/status`, { headers }),
      ]);
      setExpenses(expRes.data.slice(-5).reverse());
      setBudgetStatus(budRes.data);
    } catch (e) {
      Alert.alert("Error", "Failed to load data");
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem("token");
    navigation.replace("Login");
  };

  const getStatusColor = (status) => {
    if (status === "OVER_BUDGET") return "#e74c3c";
    if (status === "WARNING") return "#f39c12";
    return "#2ecc71";
  };

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>💰 SpendTrack</Text>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logout}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Recent Spending</Text>
        <Text style={styles.cardAmount}>${totalSpent.toFixed(2)}</Text>
      </View>

      {budgetStatus.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Budget Status</Text>
          {budgetStatus.map((b, i) => (
            <View key={i} style={styles.budgetItem}>
              <View style={styles.budgetRow}>
                <Text style={styles.budgetCategory}>{b.category}</Text>
                <Text style={[styles.budgetStatus, { color: getStatusColor(b.status) }]}>
                  {b.status}
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, {
                  width: `${Math.min(b.percentage, 100)}%`,
                  backgroundColor: getStatusColor(b.status)
                }]} />
              </View>
              <Text style={styles.budgetText}>${b.spent.toFixed(2)} / ${b.limit.toFixed(2)}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Expenses</Text>
        {expenses.length === 0 && <Text style={styles.empty}>No expenses yet</Text>}
        {expenses.map((e, i) => (
          <View key={i} style={styles.expenseItem}>
            <View>
              <Text style={styles.expenseCategory}>{e.category}</Text>
              <Text style={styles.expenseNote}>{e.note}</Text>
            </View>
            <Text style={styles.expenseAmount}>-${e.amount.toFixed(2)}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate("AddExpense", { token, onGoBack: loadData })}>
        <Text style={styles.fabText}>+ Add Expense</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, paddingTop: 50 },
  title: { fontSize: 24, fontWeight: "bold", color: "#1a1a2e" },
  logout: { color: "#e74c3c", fontSize: 14 },
  card: { margin: 16, padding: 24, backgroundColor: "#1a1a2e", borderRadius: 16 },
  cardLabel: { color: "#aaa", fontSize: 14 },
  cardAmount: { color: "#fff", fontSize: 40, fontWeight: "bold", marginTop: 4 },
  section: { margin: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 12, color: "#1a1a2e" },
  budgetItem: { backgroundColor: "#fff", padding: 14, borderRadius: 10, marginBottom: 10 },
  budgetRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  budgetCategory: { fontSize: 15, fontWeight: "600", color: "#1a1a2e" },
  budgetStatus: { fontSize: 13, fontWeight: "bold" },
  progressBar: { height: 8, backgroundColor: "#f0f0f0", borderRadius: 4, marginBottom: 6 },
  progressFill: { height: 8, borderRadius: 4 },
  budgetText: { fontSize: 12, color: "#666" },
  expenseItem: { backgroundColor: "#fff", padding: 14, borderRadius: 10, marginBottom: 8, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  expenseCategory: { fontSize: 15, fontWeight: "600", color: "#1a1a2e" },
  expenseNote: { fontSize: 13, color: "#666", marginTop: 2 },
  expenseAmount: { fontSize: 16, fontWeight: "bold", color: "#e74c3c" },
  empty: { color: "#999", textAlign: "center", marginTop: 20 },
  fab: { margin: 16, backgroundColor: "#4CAF50", padding: 16, borderRadius: 12, alignItems: "center", marginBottom: 40 },
  fabText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
