import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from "react-native";
import { SetInstance } from "../types/workout";

const COLORS = {
  text: "#1C1C1E",
  exerciseTitle: "#007AFF",
  setCompleted: "#34C759",
  setIncomplete: "#8E8E93",
  cardBackground: "#FFFFFF",
  border: "#F0F0F0",
  destructive: "#FF3B30",
};

interface SetRowProps {
  // Data
  set: SetInstance;
  setIndex: number;
  exerciseIndex: number;

  // State
  isDisabled: boolean;
  showCheckbox: boolean;

  // Input state
  repsBuffer?: string;
  weightBuffer?: string;
  repsError?: string;
  weightError?: string;

  // Suggestions (for display values)
  suggestedReps?: number | null;
  suggestedWeight?: number | null;

  // Handlers
  onFieldChange: (field: "reps" | "weight", value: string) => void;
  onFieldBlur: (field: "reps" | "weight", value: string) => void;
  onToggleCompletion: () => void;
  onDelete: () => void;
}

export default function SetRow({
  set,
  setIndex,
  isDisabled,
  showCheckbox,
  repsBuffer,
  weightBuffer,
  repsError,
  weightError,
  suggestedReps,
  suggestedWeight,
  onFieldChange,
  onFieldBlur,
  onToggleCompletion,
  onDelete,
}: SetRowProps) {
  const setColor = set.completed ? COLORS.setCompleted : COLORS.setIncomplete;

  // Compute display values
  const displayReps =
    repsBuffer !== undefined
      ? repsBuffer
      : set.reps !== undefined && set.reps !== null
        ? String(set.reps)
        : suggestedReps !== undefined && suggestedReps !== null
          ? String(suggestedReps)
          : "";

  const displayWeight =
    weightBuffer !== undefined
      ? weightBuffer
      : set.weight !== undefined && set.weight !== null
        ? String(set.weight)
        : suggestedWeight !== undefined && suggestedWeight !== null
          ? String(suggestedWeight)
          : "";

  return (
    <View key={setIndex}>
      <View style={styles.setRow}>
        {showCheckbox && (
          <TouchableOpacity
            onPress={onToggleCompletion}
            style={styles.checkbox}
            disabled={isDisabled}
          >
            <View
              style={[
                styles.checkboxInner,
                set.completed && styles.checkboxChecked,
                isDisabled && styles.checkboxDisabled,
              ]}
            >
              {set.completed && <Text style={styles.checkmark}>✓</Text>}
            </View>
          </TouchableOpacity>
        )}
        <Text style={[styles.setNumber, { color: setColor }]}>
          {setIndex + 1}
        </Text>

        {/* Editable input fields */}
        <View style={styles.inputGroup}>
          {/* Reps Input */}
          <TextInput
            style={[
              styles.setInput,
              styles.repsInput,
              repsError && styles.inputError,
            ]}
            value={displayReps}
            onChangeText={(val) => onFieldChange("reps", val)}
            onBlur={() => onFieldBlur("reps", displayReps)}
            keyboardType="number-pad"
            maxLength={4}
            editable={!isDisabled}
            selectTextOnFocus
          />

          <Text style={styles.timesSymbol}>×</Text>

          {/* Weight Input */}
          <TextInput
            style={[
              styles.setInput,
              styles.weightInput,
              weightError && styles.inputError,
            ]}
            value={displayWeight}
            onChangeText={(val) => onFieldChange("weight", val)}
            onBlur={() => onFieldBlur("weight", displayWeight)}
            placeholder="0"
            keyboardType="decimal-pad"
            maxLength={5}
            editable={!isDisabled}
            selectTextOnFocus
          />
          <Text style={styles.weightUnit}>lbs</Text>
        </View>

        {/* Delete button */}
        {!isDisabled && (
          <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
            <Text style={styles.deleteButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
      {set.notes && <Text style={styles.setNotes}>{set.notes}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  checkbox: {
    padding: 4,
    marginRight: 8,
  },
  checkboxInner: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: COLORS.setIncomplete,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: COLORS.setCompleted,
    borderColor: COLORS.setCompleted,
  },
  checkboxDisabled: {
    opacity: 0.4,
    backgroundColor: COLORS.border,
  },
  checkmark: {
    color: COLORS.cardBackground,
    fontSize: 16,
    fontWeight: "bold",
  },
  setNumber: {
    fontSize: 16,
    fontWeight: "600",
    width: 60,
  },
  setNotes: {
    fontSize: 12,
    color: COLORS.setIncomplete,
    marginTop: 4,
    marginLeft: 36,
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  setInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 16,
    fontWeight: "600",
    backgroundColor: COLORS.cardBackground,
    textAlign: "center",
  },
  repsInput: {
    width: 50,
  },
  weightInput: {
    width: 60,
  },
  timesSymbol: {
    fontSize: 16,
    color: COLORS.text,
    marginHorizontal: 4,
  },
  weightUnit: {
    fontSize: 14,
    color: COLORS.setIncomplete,
    marginLeft: 2,
    marginRight: 8,
  },
  inputError: {
    borderColor: COLORS.destructive,
    borderWidth: 2,
  },
  deleteButton: {
    marginLeft: 8,
    padding: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButtonText: {
    color: COLORS.destructive,
    fontSize: 20,
    fontWeight: "600",
  },
});
