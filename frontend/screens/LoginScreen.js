import React, { useState, useRef, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Animated, ScrollView, Dimensions } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API = "https://studious-memory-wr596gpqw9xpcg6wr-8080.app.github.dev";
const W = Dimensions.get("window").width;

export default function LoginScreen({ navigation }) {
  const [screen, setScreen] = useState("about");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const buttonScale = useRef(new Animated.Value(1)).current;
  const heroAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(heroAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 900, useNativeDriver: true }),
    ]).start();
  }, [screen]);

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.timing(buttonScale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
  };

  const handleSubmit = async () => {
    animateButton();
    if (!email || !password) return Alert.alert("Error", "Please fill in all fields");
    setLoading(true);
    try {
      if (isLogin) {
        const res = await axios.post(`${API}/auth/login`, { email, password });
        await AsyncStorage.setItem("token", res.data.token);
        navigation.replace("Main");
      } else {
        await axios.post(`${API}/auth/register`, { email, password });
        Alert.alert("Success!", "Account created. Sign in now.");
        setIsLogin(true);
      }
    } catch (e) {
      Alert.alert("Error", isLogin ? "Invalid credentials" : "Registration failed");
    }
    setLoading(false);
  };

  if (screen === "about") {
    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: heroAnim, transform: [{ translateY: slideAnim }] }}>

          <View style={styles.heroSection}>
            <Text style={styles.heroEmoji}>💰</Text>
            <Text style={styles.heroAppName}>SpendTrack</Text>
            <Text style={styles.heroTitle}>Know where your money <Text style={styles.heroAccent}>actually goes.</Text></Text>
            <Text style={styles.heroSub}>Track spending. Set budgets. Predict your future.</Text>
          </View>

          <View style={styles.statsStrip}>
            <View style={styles.statItem}>
              <Text style={styles.statNum}>100%</Text>
              <Text style={styles.statLbl}>Free</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNum}>Real-time</Text>
              <Text style={styles.statLbl}>Insights</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNum}>Secure</Text>
              <Text style={styles.statLbl}>Encrypted</Text>
            </View>
          </View>

          <View style={styles.bigFeatureCard}>
            <Text style={styles.bigFeatureEmoji}>📊</Text>
            <Text style={styles.bigFeatureLabel}>CORE FEATURE</Text>
            <Text style={styles.bigFeatureTitle}>Visual spending dashboard</Text>
            <Text style={styles.bigFeatureDesc}>Pie charts, bar graphs, and category breakdowns that make your finances impossible to ignore.</Text>
          </View>

          <View style={styles.twoCol}>
            <View style={[styles.smallCard, { marginRight: 8 }]}>
              <Text style={styles.smallCardEmoji}>🎯</Text>
              <Text style={styles.smallCardTitle}>Budget Warnings</Text>
              <Text style={styles.smallCardDesc}>Green → Yellow → Red as you approach limits.</Text>
            </View>
            <View style={[styles.smallCard, { marginLeft: 8 }]}>
              <Text style={styles.smallCardEmoji}>🔮</Text>
              <Text style={styles.smallCardTitle}>Predictions</Text>
              <Text style={styles.smallCardDesc}>See when you can afford your next big purchase.</Text>
            </View>
          </View>

          <View style={styles.twoCol}>
            <View style={[styles.smallCard, { marginRight: 8 }]}>
              <Text style={styles.smallCardEmoji}>💡</Text>
              <Text style={styles.smallCardTitle}>Habit Detection</Text>
              <Text style={styles.smallCardDesc}>Patterns you never noticed, now impossible to miss.</Text>
            </View>
            <View style={[styles.smallCard, { marginLeft: 8 }]}>
              <Text style={styles.smallCardEmoji}>🏆</Text>
              <Text style={styles.smallCardTitle}>Milestones</Text>
              <Text style={styles.smallCardDesc}>Unlock badges as your savings grow.</Text>
            </View>
          </View>

          <View style={styles.ctaBox}>
            <Text style={styles.ctaTitle}>Ready to take control?</Text>
            <TouchableOpacity style={styles.ctaButton} onPress={() => { setIsLogin(false); setScreen("auth"); }}>
              <Text style={styles.ctaButtonText}>Create Free Account →</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setIsLogin(true); setScreen("auth"); }}>
              <Text style={styles.ctaSignIn}>Already have an account? <Text style={styles.ctaSignInAccent}>Sign in</Text></Text>
            </TouchableOpacity>
          </View>

        </Animated.View>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setScreen("about")} style={styles.backBtn}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
      <View style={styles.authTop}>
        <Text style={styles.authEmoji}>💰</Text>
        <Text style={styles.authTitle}>SpendTrack</Text>
      </View>
      <View style={styles.authCard}>
        <Text style={styles.authHeading}>{isLogin ? "Welcome back" : "Create account"}</Text>
        <Text style={styles.authSub}>{isLogin ? "Sign in to your account" : "Start tracking for free"}</Text>

        <View style={styles.inputWrapper}>
          <Text style={styles.inputIcon}>✉️</Text>
          <TextInput style={styles.input} placeholder="Email address" placeholderTextColor="#555"
            value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        </View>
        <View style={styles.inputWrapper}>
          <Text style={styles.inputIcon}>🔒</Text>
          <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#555"
            value={password} onChangeText={setPassword} secureTextEntry />
        </View>

        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <TouchableOpacity style={styles.authButton} onPress={handleSubmit} disabled={loading}>
            <Text style={styles.authButtonText}>{loading ? "Please wait..." : isLogin ? "Sign In →" : "Create Account →"}</Text>
          </TouchableOpacity>
        </Animated.View>

        <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={{ marginTop: 16, alignItems: "center" }}>
          <Text style={styles.switchText}>
            {isLogin ? "No account? " : "Have an account? "}
            <Text style={styles.switchAccent}>{isLogin ? "Sign up free" : "Sign in"}</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0d0d0d" },
  heroSection: { paddingHorizontal: 24, paddingTop: 72, paddingBottom: 36, alignItems: "center" },
  heroEmoji: { fontSize: 56, marginBottom: 12 },
  heroAppName: { fontSize: 44, fontWeight: "900", color: "#fff", letterSpacing: 1, marginBottom: 20 },
  heroTitle: { fontSize: 18, fontWeight: "600", color: "#aaa", textAlign: "center", marginBottom: 10, lineHeight: 26 },
  heroAccent: { color: "#1a9e5c" },
  heroSub: { fontSize: 14, color: "#555", textAlign: "center", letterSpacing: 0.3 },
  statsStrip: { flexDirection: "row", backgroundColor: "#141414", marginHorizontal: 20, borderRadius: 16, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: "#222", alignItems: "center", justifyContent: "space-around" },
  statItem: { alignItems: "center" },
  statNum: { color: "#fff", fontSize: 15, fontWeight: "800" },
  statLbl: { color: "#555", fontSize: 12, marginTop: 2 },
  statDivider: { width: 1, height: 30, backgroundColor: "#222" },
  bigFeatureCard: { marginHorizontal: 20, backgroundColor: "#141414", borderRadius: 20, padding: 24, marginBottom: 16, borderWidth: 1, borderColor: "#1a9e5c33" },
  bigFeatureEmoji: { fontSize: 36, marginBottom: 8 },
  bigFeatureLabel: { color: "#1a9e5c", fontSize: 11, fontWeight: "800", letterSpacing: 1.5, marginBottom: 6 },
  bigFeatureTitle: { color: "#fff", fontSize: 22, fontWeight: "800", marginBottom: 8 },
  bigFeatureDesc: { color: "#777", fontSize: 14, lineHeight: 22 },
  twoCol: { flexDirection: "row", marginHorizontal: 20, marginBottom: 16 },
  smallCard: { flex: 1, backgroundColor: "#141414", borderRadius: 18, padding: 18, borderWidth: 1, borderColor: "#222" },
  smallCardEmoji: { fontSize: 28, marginBottom: 10 },
  smallCardTitle: { color: "#fff", fontSize: 15, fontWeight: "700", marginBottom: 6 },
  smallCardDesc: { color: "#666", fontSize: 13, lineHeight: 19 },
  ctaBox: { margin: 20, backgroundColor: "#141414", borderRadius: 24, padding: 28, alignItems: "center", borderWidth: 1, borderColor: "#222", marginBottom: 60 },
  ctaTitle: { color: "#fff", fontSize: 22, fontWeight: "800", marginBottom: 20, textAlign: "center" },
  ctaButton: { backgroundColor: "#1a9e5c", paddingVertical: 18, paddingHorizontal: 40, borderRadius: 16, width: "100%", alignItems: "center", marginBottom: 16, shadowColor: "#1a9e5c", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 14 },
  ctaButtonText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  ctaSignIn: { color: "#555", fontSize: 14 },
  ctaSignInAccent: { color: "#1a9e5c", fontWeight: "700" },
  backBtn: { paddingTop: 52, paddingHorizontal: 20, paddingBottom: 4 },
  backText: { color: "#1a9e5c", fontSize: 15, fontWeight: "600" },
  authTop: { alignItems: "center", paddingVertical: 28 },
  authEmoji: { fontSize: 44 },
  authTitle: { color: "#fff", fontSize: 28, fontWeight: "900", marginTop: 8 },
  authCard: { backgroundColor: "#141414", borderRadius: 28, padding: 24, marginHorizontal: 20, borderWidth: 1, borderColor: "#222" },
  authHeading: { color: "#fff", fontSize: 24, fontWeight: "800", marginBottom: 4 },
  authSub: { color: "#666", fontSize: 14, marginBottom: 24 },
  inputWrapper: { flexDirection: "row", alignItems: "center", backgroundColor: "#0d0d0d", borderRadius: 14, marginBottom: 14, paddingHorizontal: 14, borderWidth: 1, borderColor: "#222" },
  inputIcon: { fontSize: 16, marginRight: 10 },
  input: { flex: 1, color: "#fff", padding: 16, fontSize: 15 },
  authButton: { backgroundColor: "#1a9e5c", padding: 18, borderRadius: 16, alignItems: "center", shadowColor: "#1a9e5c", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 16 },
  authButtonText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  switchText: { color: "#555", fontSize: 14 },
  switchAccent: { color: "#1a9e5c", fontWeight: "700" },
});
