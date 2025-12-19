import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import {
  WorkoutApi,
  WorkoutSuggestionsResponse,
  SetInstance,
} from "../types/workout";
import SetRow from "./SetRow";

const COLORS = {
  text: "#333",
  exerciseTitle: "#007AFF",
  setCompleted: "#34C759",
  setIncomplete: "#8E8E93",
  cardBackground: "#FFFFFF",
  shadow: "#000",
};

interface ExerciseCardProps {
  // Data
  exercise: WorkoutApi["exercises"][0];
  exerciseIndex: number;

  // Suggestions state
  exerciseSuggestions?: WorkoutSuggestionsResponse["exercises"][0] | null;
  suggestionsLoading: boolean;
  suggestionsError?: string | null;

  // Workout state
  workoutStatus: "not_started" | "in_progress" | "finished";

  // Per-set state (indexed by setIndex)
  inputBuffers?: { [setIndex: number]: { reps?: string; weight?: string } };
  validationErrors?: { [setIndex: number]: { reps?: string; weight?: string } };

  // Handlers
  onAddSet: () => void;
  onDeleteSet: (setIndex: number) => void;
  onToggleSetCompletion: (setIndex: number) => void;
  onFieldChange: (setIndex: number, field: "reps" | "weight", value: string) => void;
  onFieldBlur: (setIndex: number, field: "reps" | "weight", value: string) => void;
}

function ExerciseCard({
  exercise,
  exerciseIndex,
  exerciseSuggestions,
  suggestionsLoading,
  suggestionsError,
  workoutStatus,
  inputBuffers,
  validationErrors,
  onAddSet,
  onDeleteSet,
  onToggleSetCompletion,
  onFieldChange,
  onFieldBlur,
}: ExerciseCardProps) {
  // Internal helper to render individual sets
  const renderSet = (set: SetInstance, setIndex: number) => {
    const isDisabled = workoutStatus !== "in_progress" || suggestionsLoading;
    const showCheckbox = workoutStatus !== "not_started";

    const repsBuffer = inputBuffers?.[setIndex]?.reps;
    const weightBuffer = inputBuffers?.[setIndex]?.weight;
    const repsError = validationErrors?.[setIndex]?.reps;
    const weightError = validationErrors?.[setIndex]?.weight;

    const suggestedReps = exerciseSuggestions?.sets[setIndex]?.reps;
    const suggestedWeight = exerciseSuggestions?.sets[setIndex]?.weight;

    return (
      <SetRow
        key={setIndex}
        set={set}
        setIndex={setIndex}
        exerciseIndex={exerciseIndex}
        isDisabled={isDisabled}
        showCheckbox={showCheckbox}
        repsBuffer={repsBuffer}
        weightBuffer={weightBuffer}
        repsError={repsError}
        weightError={weightError}
        suggestedReps={suggestedReps}
        suggestedWeight={suggestedWeight}
        onFieldChange={(field, value) => onFieldChange(setIndex, field, value)}
        onFieldBlur={(field, value) => onFieldBlur(setIndex, field, value)}
        onToggleCompletion={() => onToggleSetCompletion(setIndex)}
        onDelete={() => onDeleteSet(setIndex)}
      />
    );
  };

  return (
    <View style={styles.exerciseCard}>
      <Text style={styles.exerciseName}>{exercise.name}</Text>

      {/* Show loading indicator while fetching suggestions */}
      {suggestionsLoading && (
        <View style={styles.suggestionsLoadingContainer}>
          <ActivityIndicator size="small" color={COLORS.exerciseTitle} />
          <Text style={styles.suggestionsLoadingText}>
            Loading AI suggestions...
          </Text>
        </View>
      )}

      {/* Show target ranges if no suggestions yet */}
      {!exerciseSuggestions && !suggestionsLoading && (
        <Text style={styles.targetReps}>
          Target: {exercise.target_rep_min}-{exercise.target_rep_max} reps ×{" "}
          {exercise.target_sets} sets
        </Text>
      )}

      {/* Show suggestions error (non-critical) */}
      {suggestionsError && !suggestionsLoading && !exerciseSuggestions && (
        <Text style={styles.suggestionsErrorText}>
          Could not load suggestions. Showing target ranges.
        </Text>
      )}

      {/* Exercise notes */}
      {exercise.notes && (
        <Text style={styles.exerciseNotes}>{exercise.notes}</Text>
      )}

      {/* Sets */}
      {exercise.sets.map((set, setIndex) => renderSet(set, setIndex))}

      {/* Add Set button */}
      {workoutStatus === "in_progress" && !suggestionsLoading && (
        <TouchableOpacity onPress={onAddSet} style={styles.addSetButton}>
          <Text style={styles.addSetButtonText}>+ Add Set</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// Wrap with React.memo for performance optimization
export default React.memo(ExerciseCard);

const styles = StyleSheet.create({
  exerciseCard: {
    backgroundColor: COLORS.cardBackground,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  exerciseName: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.exerciseTitle,
    marginBottom: 8,
  },
  targetReps: {
    fontSize: 14,
    color: COLORS.setIncomplete,
    marginBottom: 8,
    fontStyle: "italic",
  },
  exerciseNotes: {
    fontSize: 14,
    color: COLORS.text,
    marginTop: 8,
    marginBottom: 8,
    fontStyle: "italic",
  },
  suggestionsLoadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    paddingVertical: 4,
  },
  suggestionsLoadingText: {
    fontSize: 14,
    color: COLORS.exerciseTitle,
    marginLeft: 8,
    fontStyle: "italic",
  },
  suggestionsErrorText: {
    fontSize: 13,
    color: COLORS.setIncomplete,
    marginBottom: 8,
    fontStyle: "italic",
  },
  addSetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.exerciseTitle,
    borderStyle: "dashed",
    backgroundColor: COLORS.cardBackground,
  },
  addSetButtonText: {
    color: COLORS.exerciseTitle,
    fontSize: 14,
    fontWeight: "600",
  },
});
