import React, { useState, useEffect, useRef } from "react";
import { View, Text, ScrollView, StyleSheet, Animated, Dimensions } from "react-native";
import { BarChart, LineChart } from "react-native-chart-kit";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API = "https://studious-memory-wr596gpqw9xpcg6wr-8080.app.github.dev";
const SCREEN_WIDTH = Dimensions.get("window").width;

export default function InsightsScreen() {
  const [expenses, setExpenses] = useState([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadData();
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const loadData = async () => {
    const t = await AsyncStorage.getItem("token");
    try {
      const res = await axios.get(`${API}/expenses`, { headers: { Authorization: `Bearer ${t}` } });
      setExpenses(res.data);
    } catch (e) {}
  };

  const categoryTotals = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});

  const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const avgPerExpense = expenses.length ? totalSpent / expenses.length : 0;

  const dayTotals = expenses.reduce((acc, e) => {
    const day = new Date(e.date).toLocaleDateString("en-US", { weekday: "short" });
    acc[day] = (acc[day] || 0) + e.amount;
    return acc;
  }, {});

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const barData = {
    labels: days,
    datasets: [{ data: days.map(d => dayTotals[d] || 0) }],
  };

  const chartConfig = {
    backgroundGradientFrom: "#141414",
    backgroundGradientTo: "#141414",
    color: (opacity = 1) => `rgba(108, 99, 255, ${opacity})`,
    labelColor: () => "#888",
    barPercentage: 0.6,
    decimalPlaces: 0,
  };

  const mostExpensiveDay = days.reduce((max, d) =>
    (dayTotals[d] || 0) > (dayTotals[max] || 0) ? d : max, days[0]);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Animated.View style={{ opacity: fadeAnim }}>
        <Text style={styles.title}>Insights</Text>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="receipt-outline" size={22} color="#1a9e5c" />
            <Text style={styles.statValue}>{expenses.length}</Text>
            <Text style={styles.statLabel}>Transactions</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="trending-up-outline" size={22} color="#43e97b" />
            <Text style={styles.statValue}>${avgPerExpense.toFixed(0)}</Text>
            <Text style={styles.statLabel}>Avg Expense</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="flame-outline" size={22} color="#f7971e" />
            <Text style={styles.statValue}>{topCategory ? topCategory[0] : "—"}</Text>
            <Text style={styles.statLabel}>Top Category</Text>
          </View>
        </View>

        {expenses.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Spending by Day of Week</Text>
            <View style={styles.chartCard}>
              <BarChart
                data={barData}
                width={SCREEN_WIDTH - 64}
                height={180}
                chartConfig={chartConfig}
                style={{ borderRadius: 12 }}
                showValuesOnTopOfBars={false}
                withInnerLines={false}
                yAxisLabel="$"
                yAxisSuffix=""
              />
            </View>
            <View style={styles.insightBadge}>
              <Ionicons name="bulb-outline" size={16} color="#f7971e" />
              <Text style={styles.insightText}>
                You spend most on <Text style={styles.insightHighlight}>{mostExpensiveDay}s</Text>
              </Text>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category Breakdown</Text>
          {Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]).map(([cat, amt], i) => (
            <View key={i} style={styles.categoryRow}>
              <Text style={styles.categoryName}>{cat}</Text>
              <View style={styles.categoryBarTrack}>
                <View style={[styles.categoryBarFill, {
                  width: `${(amt / totalSpent) * 100}%`,
                  backgroundColor: ["#1a9e5c","#ff6584","#43e97b","#f7971e","#4facfe","#f953c6","#b91d73"][i % 7]
                }]} />
              </View>
              <Text style={styles.categoryAmt}>${amt.toFixed(0)}</Text>
            </View>
          ))}
        </View>

        {expenses.length === 0 && (
          <View style={styles.emptyCard}>
            <Ionicons name="bar-chart-outline" size={48} color="#333" />
            <Text style={styles.emptyText}>Add some expenses to see insights</Text>
          </View>
        )}
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0d0d0d", padding: 20 },
  title: { color: "#fff", fontSize: 28, fontWeight: "800", marginTop: 52, marginBottom: 24 },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 24 },
  statCard: { flex: 1, backgroundColor: "#141414", borderRadius: 16, padding: 16, alignItems: "center", gap: 6 },
  statValue: { color: "#fff", fontSize: 18, fontWeight: "800" },
  statLabel: { color: "#888", fontSize: 11, textAlign: "center" },
  section: { marginBottom: 24 },
  sectionTitle: { color: "#fff", fontSize: 18, fontWeight: "700", marginBottom: 14 },
  chartCard: { backgroundColor: "#141414", borderRadius: 16, padding: 16, alignItems: "center" },
  insightBadge: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#f7971e22", padding: 12, borderRadius: 12, marginTop: 10, borderWidth: 1, borderColor: "#f7971e44" },
  insightText: { color: "#aaa", fontSize: 13 },
  insightHighlight: { color: "#f7971e", fontWeight: "700" },
  categoryRow: { flexDirection: "row", alignItems: "center", marginBottom: 12, gap: 10 },
  categoryName: { color: "#aaa", fontSize: 13, width: 90 },
  categoryBarTrack: { flex: 1, height: 8, backgroundColor: "#141414", borderRadius: 4 },
  categoryBarFill: { height: 8, borderRadius: 4 },
  categoryAmt: { color: "#fff", fontSize: 13, fontWeight: "600", width: 50, textAlign: "right" },
  emptyCard: { alignItems: "center", padding: 40 },
  emptyText: { color: "#555", marginTop: 12, fontSize: 15, textAlign: "center" },
});
