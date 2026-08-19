import React, { useState, useEffect, useRef } from "react";
import { View, Text, ScrollView, StyleSheet, Animated, Dimensions, TouchableOpacity } from "react-native";
import { BarChart, LineChart } from "react-native-chart-kit";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API = "https://studious-memory-wr596gpqw9xpcg6wr-8080.app.github.dev";
const SCREEN_WIDTH = Dimensions.get("window").width;
const CATEGORIES = ["Food", "Transport", "Shopping", "Entertainment", "Health", "Bills", "Other"];
const CUT_OPTIONS = [10, 20, 30, 50];

export default function InsightsScreen() {
  const [expenses, setExpenses] = useState([]);
  const [burnRate, setBurnRate] = useState(null);
  const [timeMachine, setTimeMachine] = useState(null);
  const [habits, setHabits] = useState(null);
  const [anomalies, setAnomalies] = useState([]);
  const [whatIfCategory, setWhatIfCategory] = useState("Food");
  const [whatIfCut, setWhatIfCut] = useState(20);
  const [whatIfResult, setWhatIfResult] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadData();
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  useEffect(() => { fetchWhatIf(); }, [whatIfCategory, whatIfCut]);

  const loadData = async () => {
    const t = await AsyncStorage.getItem("token");
    const headers = { Authorization: `Bearer ${t}` };
    try {
      const [expRes, burnRes, tmRes, habitsRes, anomRes] = await Promise.all([
        axios.get(`${API}/expenses`, { headers }),
        axios.get(`${API}/insights/burn-rate`, { headers }),
        axios.get(`${API}/insights/time-machine`, { headers }),
        axios.get(`${API}/insights/habits`, { headers }),
        axios.get(`${API}/anomalies`, { headers }),
      ]);
      setExpenses(expRes.data);
      setBurnRate(burnRes.data);
      setTimeMachine(tmRes.data);
      setHabits(habitsRes.data);
      setAnomalies(anomRes.data);
    } catch (e) {}
  };

  const fetchWhatIf = async () => {
    const t = await AsyncStorage.getItem("token");
    try {
      const res = await axios.get(`${API}/insights/whatif?category=${whatIfCategory}&cutPercent=${whatIfCut}`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      setWhatIfResult(res.data);
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

  const getBurnColor = (pct) => {
    if (pct <= 90) return "#1a9e5c";
    if (pct <= 110) return "#f7971e";
    return "#ff6584";
  };

  const getBurnLabel = (pct) => {
    if (pct <= 90) return "Under budget 🎉";
    if (pct <= 110) return "On track 👍";
    return "Overspending ⚠️";
  };

  const formatMonth = (yyyymm) => {
    const [y, m] = yyyymm.split("-");
    return new Date(y, m - 1).toLocaleDateString("en-US", { month: "short" });
  };

  const formatAnomalyDate = (d) => {
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const tmChartData = timeMachine ? (() => {
    const allLabels = [...timeMachine.labels, ...timeMachine.projectionLabels];
    const allActuals = [...timeMachine.actuals, ...timeMachine.projectionValues.map(() => null)];
    const allProjected = [...timeMachine.actuals.map(() => null), ...timeMachine.projectionValues];
    const lastActual = timeMachine.actuals[timeMachine.actuals.length - 1] || 0;
    allProjected[timeMachine.actuals.length - 1] = lastActual;
    return {
      labels: allLabels.map(formatMonth),
      datasets: [
        { data: allLabels.map((_, i) => allActuals[i] ?? 0), color: (opacity = 1) => `rgba(26, 158, 92, ${opacity})`, strokeWidth: 2 },
        { data: allLabels.map((_, i) => allProjected[i] ?? 0), color: (opacity = 1) => `rgba(108, 99, 255, ${opacity})`, strokeWidth: 2 },
      ],
      legend: ["Actual", "Projected"],
    };
  })() : null;

  const formatDay = (d) => d.charAt(0) + d.slice(1).toLowerCase();

  const habitItems = habits && !habits.message ? [
    { icon: "fast-food-outline", color: "#f7971e", label: "Favourite category", value: habits.mostFrequentCategory },
    { icon: "cash-outline", color: "#ff6584", label: "Costs you most", value: habits.mostExpensiveCategory },
    { icon: "calendar-outline", color: "#4facfe", label: "Biggest spending day", value: formatDay(habits.biggestSpendingDay) + "s" },
    { icon: "sunny-outline", color: "#43e97b", label: "You're a", value: habits.spenderType + " spender" },
    { icon: "repeat-outline", color: "#a18cd1", label: "Avg expenses/week", value: `${habits.avgExpensesPerWeek}x` },
  ] : [];

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
              <BarChart data={barData} width={SCREEN_WIDTH - 64} height={180} chartConfig={chartConfig}
                style={{ borderRadius: 12 }} showValuesOnTopOfBars={false} withInnerLines={false}
                yAxisLabel="$" yAxisSuffix="" />
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

        {habitItems.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🧠 Your Spending Habits</Text>
            <View style={styles.habitsCard}>
              {habitItems.map((h, i) => (
                <View key={i} style={[styles.habitRow, i < habitItems.length - 1 && styles.habitRowBorder]}>
                  <View style={[styles.habitIcon, { backgroundColor: h.color + "22" }]}>
                    <Ionicons name={h.icon} size={18} color={h.color} />
                  </View>
                  <Text style={styles.habitLabel}>{h.label}</Text>
                  <Text style={[styles.habitValue, { color: h.color }]}>{h.value}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {burnRate && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔥 Burn Rate</Text>
            <View style={styles.burnCard}>
              <View style={styles.burnRow}>
                <View style={styles.burnStat}>
                  <Text style={styles.burnLabel}>This Month</Text>
                  <Text style={styles.burnValue}>${burnRate.currentMonthSpend.toFixed(0)}</Text>
                </View>
                <View style={styles.burnDivider} />
                <View style={styles.burnStat}>
                  <Text style={styles.burnLabel}>Monthly Avg</Text>
                  <Text style={styles.burnValue}>${burnRate.avgMonthly.toFixed(0)}</Text>
                </View>
                <View style={styles.burnDivider} />
                <View style={styles.burnStat}>
                  <Text style={styles.burnLabel}>Projected</Text>
                  <Text style={[styles.burnValue, { color: getBurnColor(burnRate.burnPercent) }]}>
                    ${burnRate.projectedMonthEnd.toFixed(0)}
                  </Text>
                </View>
              </View>
              <View style={styles.burnTrack}>
                <View style={[styles.burnFill, { width: `${Math.min(burnRate.burnPercent, 100)}%`, backgroundColor: getBurnColor(burnRate.burnPercent) }]} />
              </View>
              <View style={styles.burnFooter}>
                <Text style={[styles.burnStatusText, { color: getBurnColor(burnRate.burnPercent) }]}>{getBurnLabel(burnRate.burnPercent)}</Text>
                <Text style={styles.burnPct}>{burnRate.burnPercent}% of avg</Text>
              </View>
            </View>
          </View>
        )}

        {timeMachine && tmChartData && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⏳ Financial Time Machine</Text>
            <View style={styles.chartCard}>
              <LineChart data={tmChartData} width={SCREEN_WIDTH - 64} height={200}
                chartConfig={{ backgroundGradientFrom: "#141414", backgroundGradientTo: "#141414",
                  color: (opacity = 1) => `rgba(26, 158, 92, ${opacity})`, labelColor: () => "#888",
                  decimalPlaces: 0, propsForDots: { r: "3" } }}
                style={{ borderRadius: 12 }} withInnerLines={false} bezier yAxisLabel="$" />
            </View>
            <View style={styles.tmLegend}>
              <View style={styles.tmLegendItem}>
                <View style={[styles.tmDot, { backgroundColor: "#1a9e5c" }]} />
                <Text style={styles.tmLegendText}>Actual spending</Text>
              </View>
              <View style={styles.tmLegendItem}>
                <View style={[styles.tmDot, { backgroundColor: "#6c63ff" }]} />
                <Text style={styles.tmLegendText}>Projected (3 months)</Text>
              </View>
            </View>
            <View style={styles.insightBadge}>
              <Ionicons name="time-outline" size={16} color="#6c63ff" />
              <Text style={styles.insightText}>
                At your current pace, you'll spend <Text style={styles.insightHighlight}>${timeMachine.projectionValues[2]?.toFixed(0)}/mo</Text> by {formatMonth(timeMachine.projectionLabels[2])}
              </Text>
            </View>
          </View>
        )}

        {anomalies.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Unusual Purchases</Text>
            <View style={styles.anomalyCard}>
              {anomalies.map((a, i) => (
                <View key={a.id} style={[styles.anomalyRow, i < anomalies.length - 1 && styles.habitRowBorder]}>
                  <View style={styles.anomalyIcon}>
                    <Ionicons name="alert-circle-outline" size={18} color="#ff6584" />
                  </View>
                  <View style={styles.anomalyBody}>
                    <View style={styles.anomalyTopLine}>
                      <Text style={styles.anomalyCategory}>{a.category}</Text>
                      <Text style={styles.anomalyAmount}>${a.amount.toFixed(0)}</Text>
                    </View>
                    <Text style={styles.anomalyDate}>{formatAnomalyDate(a.date)}</Text>
                    {a.reason && <Text style={styles.anomalyReason}>{a.reason}</Text>}
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🤔 What If Simulator</Text>
          <View style={styles.whatIfCard}>
            <Text style={styles.whatIfLabel}>If I cut my spending on...</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
              {CATEGORIES.map(cat => (
                <TouchableOpacity key={cat}
                  style={[styles.chip, whatIfCategory === cat && styles.chipActive]}
                  onPress={() => setWhatIfCategory(cat)}>
                  <Text style={[styles.chipText, whatIfCategory === cat && styles.chipTextActive]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.whatIfLabel}>...by this much:</Text>
            <View style={styles.cutRow}>
              {CUT_OPTIONS.map(pct => (
                <TouchableOpacity key={pct}
                  style={[styles.cutChip, whatIfCut === pct && styles.cutChipActive]}
                  onPress={() => setWhatIfCut(pct)}>
                  <Text style={[styles.cutChipText, whatIfCut === pct && styles.cutChipTextActive]}>{pct}%</Text>
                </TouchableOpacity>
              ))}
            </View>

            {whatIfResult && (
              <View style={styles.whatIfResult}>
                <View style={styles.whatIfRow}>
                  <Ionicons name="save-outline" size={16} color="#1a9e5c" />
                  <Text style={styles.whatIfResultText}>
                    You'd save <Text style={styles.whatIfHighlight}>${whatIfResult.monthlySaving.toFixed(0)}/mo</Text> and <Text style={styles.whatIfHighlight}>${whatIfResult.yearlySaving.toFixed(0)}/yr</Text>
                  </Text>
                </View>
                {whatIfResult.wishlistImpact?.map((w, i) => w.monthsSaved > 0 && (
                  <View key={i} style={styles.whatIfRow}>
                    <Ionicons name="star-outline" size={16} color="#f7971e" />
                    <Text style={styles.whatIfResultText}>
                      <Text style={styles.whatIfHighlight}>{w.name}</Text> would be {w.monthsSaved} months sooner
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
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
  insightText: { color: "#aaa", fontSize: 13, flex: 1 },
  insightHighlight: { color: "#f7971e", fontWeight: "700" },
  categoryRow: { flexDirection: "row", alignItems: "center", marginBottom: 12, gap: 10 },
  categoryName: { color: "#aaa", fontSize: 13, width: 90 },
  categoryBarTrack: { flex: 1, height: 8, backgroundColor: "#141414", borderRadius: 4 },
  categoryBarFill: { height: 8, borderRadius: 4 },
  categoryAmt: { color: "#fff", fontSize: 13, fontWeight: "600", width: 50, textAlign: "right" },
  emptyCard: { alignItems: "center", padding: 40 },
  emptyText: { color: "#555", marginTop: 12, fontSize: 15, textAlign: "center" },
  habitsCard: { backgroundColor: "#141414", borderRadius: 16, overflow: "hidden" },
  habitRow: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  habitRowBorder: { borderBottomWidth: 1, borderBottomColor: "#1c1c1e" },
  habitIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  habitLabel: { color: "#888", fontSize: 13, flex: 1 },
  habitValue: { fontSize: 13, fontWeight: "700" },
  burnCard: { backgroundColor: "#141414", borderRadius: 16, padding: 20 },
  burnRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  burnStat: { flex: 1, alignItems: "center" },
  burnLabel: { color: "#666", fontSize: 11, marginBottom: 4 },
  burnValue: { color: "#fff", fontSize: 20, fontWeight: "800" },
  burnDivider: { width: 1, backgroundColor: "#222", marginHorizontal: 8 },
  burnTrack: { height: 8, backgroundColor: "#222", borderRadius: 4, marginBottom: 12 },
  burnFill: { height: 8, borderRadius: 4 },
  burnFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  burnStatusText: { fontSize: 13, fontWeight: "700" },
  burnPct: { color: "#555", fontSize: 12 },
  tmLegend: { flexDirection: "row", gap: 16, marginTop: 10, marginBottom: 4 },
  tmLegendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  tmDot: { width: 8, height: 8, borderRadius: 4 },
  tmLegendText: { color: "#666", fontSize: 12 },
  anomalyCard: { backgroundColor: "#141414", borderRadius: 16, overflow: "hidden" },
  anomalyRow: { flexDirection: "row", padding: 14, gap: 12 },
  anomalyIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: "#ff658422" },
  anomalyBody: { flex: 1 },
  anomalyTopLine: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  anomalyCategory: { color: "#fff", fontSize: 14, fontWeight: "700" },
  anomalyAmount: { color: "#ff6584", fontSize: 14, fontWeight: "800" },
  anomalyDate: { color: "#555", fontSize: 11, marginTop: 2 },
  anomalyReason: { color: "#aaa", fontSize: 13, marginTop: 6, lineHeight: 18 },
  whatIfCard: { backgroundColor: "#141414", borderRadius: 16, padding: 20 },
  whatIfLabel: { color: "#888", fontSize: 13, marginBottom: 10 },
  chipScroll: { marginBottom: 16 },
  chip: { backgroundColor: "#0d0d0d", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, marginRight: 8, borderWidth: 1, borderColor: "#1c1c1e" },
  chipActive: { backgroundColor: "#1a9e5c22", borderColor: "#1a9e5c" },
  chipText: { color: "#555", fontSize: 13, fontWeight: "600" },
  chipTextActive: { color: "#1a9e5c" },
  cutRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  cutChip: { flex: 1, backgroundColor: "#0d0d0d", borderRadius: 12, padding: 12, alignItems: "center", borderWidth: 1, borderColor: "#1c1c1e" },
  cutChipActive: { backgroundColor: "#6c63ff22", borderColor: "#6c63ff" },
  cutChipText: { color: "#555", fontSize: 14, fontWeight: "700" },
  cutChipTextActive: { color: "#6c63ff" },
  whatIfResult: { backgroundColor: "#0d0d0d", borderRadius: 12, padding: 14, gap: 10 },
  whatIfRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  whatIfResultText: { color: "#aaa", fontSize: 13, flex: 1 },
  whatIfHighlight: { color: "#1a9e5c", fontWeight: "700" },
});
