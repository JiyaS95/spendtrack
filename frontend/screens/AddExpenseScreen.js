import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from "react-native";
import axios from "axios";

const API = "http://localhost:8080";
const CATEGORIES = ["Food", "Transport", "Shopping", "Entertainment", "Health", "Bills", "Other"];

export default function AddExpenseScreen({ route, navigation }) {
  const { token, onGoBack } = route.params;
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [category, setCategory] = useState("Food");

  const submit = async () => {
    if (!amount) return Alert.alert("Error", "Please enter an amount");
    try {
      await axios.post(`${API}/expenses`, {
        amount: parseFloat(amount),
        note,
        category,
        date: new Date().toISOString().split("T")[0],
      }, { headers: { Authorization: `Bearer ${token}` } });
      onGoBack();
      navigation.goBack();
    } catch (e) {
      Alert.alert("Error", "Failed to add expense");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Add Expense</Text>

      <Text style={styles.label}>Amount ($)</Text>
      <TextInput
        style={styles.input}
        placeholder="0.00"
        value={amount}
        onChangeText={setAmount}
        keyboardType="decimal-pad"
      />

      <Text style={styles.label}>Category</Text>
      <View style={styles.categories}>
        {CATEGORIES.map((c) => (
          <TouchableOpacity
            key={c}
            style={[styles.categoryChip, category === c && styles.categoryChipActive]}
            onPress={() => setCategory(c)}
          >
            <Text style={[styles.categoryText, category === c && styles.categoryTextActive]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Note</Text>
      <TextInput
        style={styles.input}
        placeholder="What was this for?"
        value={note}
        onChangeText={setNote}
      />

      <TouchableOpacity style={styles.button} onPress={submit}>
        <Text style={styles.buttonText}>Save Expense</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa", padding: 24 },
  title: { fontSize: 28, fontWeight: "bold", color: "#1a1a2e", marginBottom: 24, marginTop: 40 },
  label: { fontSize: 14, fontWeight: "600", color: "#666", marginBottom: 8, marginTop: 16 },
  input: { backgroundColor: "#fff", padding: 14, borderRadius: 10, fontSize: 16, borderWidth: 1, borderColor: "#e0e0e0" },
  categories: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  categoryChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: "#fff", borderWidth: 1, borderColor: "#e0e0e0" },
  categoryChipActive: { backgroundColor: "#1a1a2e", borderColor: "#1a1a2e" },
  categoryText: { color: "#666", fontSize: 14 },
  categoryTextActive: { color: "#fff" },
  button: { backgroundColor: "#4CAF50", padding: 16, borderRadius: 12, alignItems: "center", marginTop: 32, marginBottom: 40 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
