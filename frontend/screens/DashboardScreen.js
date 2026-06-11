import React, { useState, useEffect, useRef } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Animated, Dimensions } from "react-native";
import { PieChart } from "react-native-chart-kit";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API = "https://studious-memory-wr596gpqw9xpcg6wr-8080.app.github.dev";
const SCREEN_WIDTH = Dimensions.get("window").width;
const COLORS = ["#1a9e5c", "#ff6584", "#43e97b", "#f7971e", "#4facfe", "#f953c6", "#b91d73"];

export default function DashboardScreen({ navigation }) {
  const [expenses, setExpenses] = useState([]);
  const [budgetStatus, setBudgetStatus] = useState([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    loadData();
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const loadData = async () => {
    const t = await AsyncStorage.getItem("token");
    const headers = { Authorization: `Bearer ${t}` };
    try {
      const [expRes, budRes] = await Promise.all([
        axios.get(`${API}/expenses`, { headers }),
        axios.get(`${API}/budgets/status`, { headers }),
      ]);
      setExpenses(expRes.data.reverse());
      setBudgetStatus(budRes.data);
    } catch (e) {}
  };

  const logout = async () => {
    await AsyncStorage.removeItem("token");
    navigation.replace("Login");
  };

  const totalSpent = expenses.slice(0, 30).reduce((sum, e) => sum + e.amount, 0);

  const categoryTotals = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});

  const pieData = Object.entries(categoryTotals).map(([name, amount], i) => ({
    name, amount, color: COLORS[i % COLORS.length], legendFontColor: "#aaa", legendFontSize: 12,
  }));

  const getStatusColor = (status) =>
    status === "OVER_BUDGET" ? "#ff6584" : status === "WARNING" ? "#f7971e" : "#43e97b";

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good day 👋</Text>
            <Text style={styles.headerTitle}>Your Overview</Text>
          </View>
          <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={22} color="#ff6584" />
          </TouchableOpacity>
        </View>

        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>Total Spent</Text>
          <Text style={styles.heroAmount}>${totalSpent.toFixed(2)}</Text>
          <Text style={styles.heroSub}>{expenses.length} transactions recorded</Text>
        </View>

        {budgetStatus.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Budget Status</Text>
            {budgetStatus.map((b, i) => (
              <View key={i} style={styles.budgetCard}>
                <View style={styles.budgetRow}>
                  <Text style={styles.budgetCategory}>{b.category}</Text>
                  <Text style={[styles.budgetBadge, { color: getStatusColor(b.status) }]}>{b.status}</Text>
                </View>
                <View style={styles.progressTrack}>
                  <Animated.View style={[styles.progressFill, {
                    width: `${Math.min(b.percentage, 100)}%`,
                    backgroundColor: getStatusColor(b.status),
                  }]} />
                </View>
                <View style={styles.budgetRow}>
                  <Text style={styles.budgetMeta}>${b.spent.toFixed(2)} spent</Text>
                  <Text style={styles.budgetMeta}>${b.limit.toFixed(2)} limit</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {pieData.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Spending by Category</Text>
            <View style={styles.chartCard}>
              <PieChart
                data={pieData}
                width={SCREEN_WIDTH - 48}
                height={180}
                chartConfig={{ color: () => "#fff" }}
                accessor="amount"
                backgroundColor="transparent"
                paddingLeft="8"
                hasLegend={true}
              />
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          {expenses.slice(0, 5).map((e, i) => (
            <View key={i} style={styles.txCard}>
              <View style={[styles.txIcon, { backgroundColor: COLORS[i % COLORS.length] + "22" }]}>
                <Text style={styles.txEmoji}>
                  {e.category === "Food" ? "🍔" : e.category === "Transport" ? "🚗" :
                   e.category === "Shopping" ? "🛍️" : e.category === "Health" ? "💊" :
                   e.category === "Bills" ? "📄" : e.category === "Entertainment" ? "🎮" : "💸"}
                </Text>
              </View>
              <View style={styles.txInfo}>
                <Text style={styles.txCategory}>{e.category}</Text>
                <Text style={styles.txNote}>{e.note || "No note"}</Text>
              </View>
              <View style={styles.txRight}>
                <Text style={styles.txAmount}>-${e.amount.toFixed(2)}</Text>
                <Text style={styles.txDate}>{e.date}</Text>
              </View>
            </View>
          ))}
        </View>

      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0d0d0d" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, paddingTop: 52 },
  greeting: { color: "#888", fontSize: 14 },
  headerTitle: { color: "#fff", fontSize: 24, fontWeight: "800" },
  logoutBtn: { backgroundColor: "#141414", padding: 10, borderRadius: 12 },
  heroCard: { margin: 16, padding: 28, backgroundColor: "#1a9e5c", borderRadius: 20, shadowColor: "#1a9e5c", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 20 },
  heroLabel: { color: "#ffffff99", fontSize: 13, fontWeight: "600" },
  heroAmount: { color: "#fff", fontSize: 44, fontWeight: "800", marginVertical: 4 },
  heroSub: { color: "#ffffff88", fontSize: 13 },
  section: { marginHorizontal: 16, marginBottom: 24 },
  sectionTitle: { color: "#fff", fontSize: 18, fontWeight: "700", marginBottom: 12 },
  budgetCard: { backgroundColor: "#141414", borderRadius: 14, padding: 16, marginBottom: 10 },
  budgetRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  budgetCategory: { color: "#fff", fontSize: 15, fontWeight: "600" },
  budgetBadge: { fontSize: 12, fontWeight: "700" },
  progressTrack: { height: 6, backgroundColor: "#1c1c1e", borderRadius: 3, marginBottom: 8 },
  progressFill: { height: 6, borderRadius: 3 },
  budgetMeta: { color: "#888", fontSize: 12 },
  chartCard: { backgroundColor: "#141414", borderRadius: 16, padding: 12, alignItems: "center" },
  txCard: { backgroundColor: "#141414", borderRadius: 14, padding: 14, marginBottom: 8, flexDirection: "row", alignItems: "center" },
  txIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center", marginRight: 12 },
  txEmoji: { fontSize: 20 },
  txInfo: { flex: 1 },
  txCategory: { color: "#fff", fontSize: 15, fontWeight: "600" },
  txNote: { color: "#888", fontSize: 13, marginTop: 2 },
  txRight: { alignItems: "flex-end" },
  txAmount: { color: "#ff6584", fontSize: 15, fontWeight: "700" },
  txDate: { color: "#555", fontSize: 12, marginTop: 2 },
});
