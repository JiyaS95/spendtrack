import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API = "http://localhost:8080";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    try {
      const res = await axios.post(`${API}/auth/login`, { email, password });
      await AsyncStorage.setItem("token", res.data.token);
      navigation.replace("Dashboard");
    } catch (e) {
      Alert.alert("Error", "Invalid credentials");
    }
  };

  const register = async () => {
    try {
      await axios.post(`${API}/auth/register`, { email, password });
      Alert.alert("Success", "Account created! Please login.");
    } catch (e) {
      Alert.alert("Error", "Registration failed");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>💰 SpendTrack</Text>
      <Text style={styles.subtitle}>Your personal finance tracker</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={login}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.buttonOutline} onPress={register}>
        <Text style={styles.buttonOutlineText}>Create Account</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24, backgroundColor: "#f8f9fa" },
  title: { fontSize: 36, fontWeight: "bold", textAlign: "center", marginBottom: 8, color: "#1a1a2e" },
  subtitle: { fontSize: 14, textAlign: "center", color: "#666", marginBottom: 32 },
  input: { backgroundColor: "#fff", padding: 14, borderRadius: 10, marginBottom: 12, fontSize: 16, borderWidth: 1, borderColor: "#e0e0e0" },
  button: { backgroundColor: "#4CAF50", padding: 16, borderRadius: 10, alignItems: "center", marginBottom: 12 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  buttonOutline: { padding: 16, borderRadius: 10, alignItems: "center", borderWidth: 1, borderColor: "#4CAF50" },
  buttonOutlineText: { color: "#4CAF50", fontSize: 16, fontWeight: "bold" },
});
