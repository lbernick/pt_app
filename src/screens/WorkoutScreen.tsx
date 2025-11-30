import { View, Text, StyleSheet } from "react-native";

const COLORS = {
  background: "#f5f5f5",
  text: "#333",
};

export default function WorkoutScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Today&apos;s workout</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  text: {
    fontSize: 18,
    color: COLORS.text,
  },
});
