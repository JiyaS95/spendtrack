import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API = "https://sturdy-umbrella-r46r9pq5j4vgfpj7p-8080.app.github.dev";

export default function ProfileScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ expenseCount: 0, badgeCount: 0 });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const t = await AsyncStorage.getItem("token");
    const headers = { Authorization: `Bearer ${t}` };
    try {
      const [profileRes, expensesRes, badgesRes] = await Promise.all([
        axios.get(`${API}/auth/me`, { headers }),
        axios.get(`${API}/expenses`, { headers }),
        axios.get(`${API}/badges`, { headers }),
      ]);
      setProfile(profileRes.data);
      setStats({
        expenseCount: expensesRes.data.length,
        badgeCount: badgesRes.data.filter(b => b.earned).length,
      });
    } catch (e) {}
  };

  const formatJoinDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const handleLogout = () => {
    Alert.alert("Sign out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem("token");
          navigation.replace("Login");
        },
      },
    ]);
  };

  const initials = profile?.name
    ? profile.name.trim().split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Profile</Text>

      <View style={styles.avatarCard}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarInitials}>{initials}</Text>
        </View>
        <Text style={styles.name}>{profile?.name || "No name on file"}</Text>
        <Text style={styles.email}>{profile?.email || "—"}</Text>
        <Text style={styles.joined}>Member since {formatJoinDate(profile?.joinedDate)}</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Ionicons name="receipt-outline" size={20} color="#1a9e5c" />
          <Text style={styles.statValue}>{stats.expenseCount}</Text>
          <Text style={styles.statLabel}>Expenses logged</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="trophy-outline" size={20} color="#f7971e" />
          <Text style={styles.statValue}>{stats.badgeCount}/5</Text>
          <Text style={styles.statLabel}>Badges earned</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={18} color="#ff6584" />
        <Text style={styles.logoutText}>Sign out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0d0d0d", padding: 20 },
  title: { color: "#fff", fontSize: 28, fontWeight: "800", marginTop: 52, marginBottom: 24 },
  avatarCard: { backgroundColor: "#141414", borderRadius: 20, padding: 28, alignItems: "center", marginBottom: 20 },
  avatarCircle: { width: 76, height: 76, borderRadius: 38, backgroundColor: "#1a9e5c22", alignItems: "center", justifyContent: "center", marginBottom: 14 },
  avatarInitials: { color: "#1a9e5c", fontSize: 26, fontWeight: "800" },
  name: { color: "#fff", fontSize: 20, fontWeight: "800", marginBottom: 4 },
  email: { color: "#888", fontSize: 14, marginBottom: 10 },
  joined: { color: "#555", fontSize: 12 },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 24 },
  statCard: { flex: 1, backgroundColor: "#141414", borderRadius: 16, padding: 16, alignItems: "center", gap: 6 },
  statValue: { color: "#fff", fontSize: 18, fontWeight: "800" },
  statLabel: { color: "#888", fontSize: 11, textAlign: "center" },
  logoutButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "#ff658422", borderWidth: 1, borderColor: "#ff658444", borderRadius: 14, padding: 16 },
  logoutText: { color: "#ff6584", fontSize: 15, fontWeight: "700" },
});
