import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";

export default function LogoutButton() {
  const { signOut } = useAuth();

  return (
    <TouchableOpacity style={styles.button} onPress={signOut}>
      <MaterialIcons name="logout" size={24} color="#007AFF" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    marginRight: 15,
  },
});
