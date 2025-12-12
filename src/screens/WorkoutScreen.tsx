import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRoute, RouteProp } from "@react-navigation/native";
import {
  WorkoutApi,
  WorkoutSuggestionsResponse,
  SetInstance,
} from "../types/workout";
import {
  getWorkouts,
  getWorkoutSuggestions,
  startWorkout,
  finishWorkout,
  cancelWorkout,
  updateWorkoutExercises,
} from "../services/workoutApi";

type WorkoutScreenRouteProp = RouteProp<
  { Workout: { backendUrl: string } },
  "Workout"
>;

const COLORS = {
  background: "#f5f5f5",
  text: "#333",
  exerciseTitle: "#007AFF",
  setCompleted: "#34C759",
  setIncomplete: "#8E8E93",
  cardBackground: "#FFFFFF",
  shadow: "#000",
  border: "#F0F0F0",
  white: "#FFF",
  destructive: "#FF3B30",
};

export default function WorkoutScreen() {
  const route = useRoute<WorkoutScreenRouteProp>();
  const { backendUrl } = route.params;

  const [workout, setWorkout] = useState<WorkoutApi | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Suggestions state
  const [suggestions, setSuggestions] =
    useState<WorkoutSuggestionsResponse | null>(null);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [suggestionsError, setSuggestionsError] = useState<string | null>(null);

  // Workout action state
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Fetch today's workout on mount
  useEffect(() => {
    const fetchTodaysWorkout = async () => {
      setLoading(true);
      setError(null);
      setSuggestionsError(null);

      try {
        const workouts = await getWorkouts(backendUrl, "2026-03-02");

        if (workouts.length > 0) {
          const todaysWorkout = workouts[0];
          setWorkout(todaysWorkout);

          // Immediately set loading to false so workout displays
          setLoading(false);

          // Fetch suggestions in background (non-blocking) - only if not already finished
          if (!todaysWorkout.end_time) {
            fetchSuggestionsInBackground(todaysWorkout.id);
          }
        } else {
          setWorkout(null);
          setLoading(false);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch workout",
        );
        setLoading(false);
      }
    };

    const fetchSuggestionsInBackground = async (workoutId: string) => {
      setSuggestionsLoading(true);
      setSuggestionsError(null);

      try {
        const suggestionsData = await getWorkoutSuggestions(
          backendUrl,
          workoutId,
        );
        setSuggestions(suggestionsData);
      } catch (err) {
        console.error("Failed to fetch suggestions:", err);
        setSuggestionsError(
          err instanceof Error ? err.message : "Failed to fetch suggestions",
        );
        // Don't block the UI - user can still use workout with ranges
      } finally {
        setSuggestionsLoading(false);
      }
    };

    fetchTodaysWorkout();
  }, [backendUrl]);

  const toggleSetCompletion = async (
    exerciseIndex: number,
    setIndex: number,
  ) => {
    // Early return: only allow toggling when workout is in progress
    const status = getWorkoutStatus();
    if (status !== "in_progress") {
      return;
    }

    if (!workout) return;

    // Save the current state for rollback on error
    const previousWorkout = workout;

    // Determine if we're checking or unchecking
    const currentSet = workout.exercises[exerciseIndex].sets[setIndex];
    const isChecking = !currentSet.completed;

    // Build the updated set
    let updatedSet = { ...currentSet };

    if (isChecking) {
      // When checking: use AI suggestions if available
      const exerciseName = workout.exercises[exerciseIndex].name;
      const suggestedValues = getSuggestedSet(exerciseName, setIndex);

      if (suggestedValues) {
        updatedSet.reps = suggestedValues.reps;
        updatedSet.weight =
          suggestedValues.weight === null ? undefined : suggestedValues.weight;
      }
      // If no suggestions, keep current reps/weight values
    }
    // When unchecking: keep current reps/weight values (no change needed)

    updatedSet.completed = !currentSet.completed;

    // Optimistic update: clone workout structure immutably
    const optimisticWorkout = { ...workout };
    optimisticWorkout.exercises = [...workout.exercises];
    optimisticWorkout.exercises[exerciseIndex] = {
      ...workout.exercises[exerciseIndex],
    };
    optimisticWorkout.exercises[exerciseIndex].sets = [
      ...workout.exercises[exerciseIndex].sets,
    ];
    optimisticWorkout.exercises[exerciseIndex].sets[setIndex] = updatedSet;

    // Update UI immediately (optimistic)
    setWorkout(optimisticWorkout);

    // Clear any previous errors
    setActionError(null);

    try {
      // Make API call with complete exercises array
      const updatedWorkoutFromApi = await updateWorkoutExercises(
        backendUrl,
        workout.id,
        optimisticWorkout.exercises,
      );

      // On success: replace with server response
      setWorkout(updatedWorkoutFromApi);
    } catch (err) {
      console.error("Failed to update set completion:", err);
      setActionError(
        err instanceof Error ? err.message : "Failed to update set completion",
      );
      // Revert to previous state on error
      setWorkout(previousWorkout);
    }
  };

  const handleAddSet = async (exerciseIndex: number) => {
    if (!workout) return;

    const status = getWorkoutStatus();
    if (status !== "in_progress") {
      return;
    }

    // Save previous state for rollback
    const previousWorkout = workout;

    // Get the previous set to copy defaults
    const currentExercise = workout.exercises[exerciseIndex];
    const previousSet =
      currentExercise.sets[currentExercise.sets.length - 1];

    // Create new set with defaults from previous set
    const newSet: SetInstance = {
      reps: previousSet?.reps ?? 10,
      weight: previousSet?.weight ?? undefined,
      rest_seconds: previousSet?.rest_seconds ?? 60,
      completed: false,
      notes: null,
    };

    // Immutable update: clone workout structure
    const optimisticWorkout = { ...workout };
    optimisticWorkout.exercises = [...workout.exercises];
    optimisticWorkout.exercises[exerciseIndex] = {
      ...workout.exercises[exerciseIndex],
    };
    optimisticWorkout.exercises[exerciseIndex].sets = [
      ...workout.exercises[exerciseIndex].sets,
      newSet, // Add new set at the end
    ];

    // Optimistic UI update
    setWorkout(optimisticWorkout);
    setActionError(null);

    try {
      const updatedWorkoutFromApi = await updateWorkoutExercises(
        backendUrl,
        workout.id,
        optimisticWorkout.exercises,
      );
      setWorkout(updatedWorkoutFromApi);
    } catch (err) {
      console.error("Failed to add set:", err);
      setActionError(err instanceof Error ? err.message : "Failed to add set");
      setWorkout(previousWorkout); // Revert on error
    }
  };

  const handleDeleteSet = async (
    exerciseIndex: number,
    setIndex: number,
  ) => {
    if (!workout) return;

    const status = getWorkoutStatus();
    if (status !== "in_progress") {
      return;
    }

    // Don't allow deleting the last set
    if (workout.exercises[exerciseIndex].sets.length <= 1) {
      setActionError("Cannot delete the last set");
      return;
    }

    // Save previous state for rollback
    const previousWorkout = workout;

    // Immutable update: clone workout structure and remove set
    const optimisticWorkout = { ...workout };
    optimisticWorkout.exercises = [...workout.exercises];
    optimisticWorkout.exercises[exerciseIndex] = {
      ...workout.exercises[exerciseIndex],
    };
    optimisticWorkout.exercises[exerciseIndex].sets = workout.exercises[
      exerciseIndex
    ].sets.filter((_, index) => index !== setIndex);

    // Optimistic UI update
    setWorkout(optimisticWorkout);
    setActionError(null);

    try {
      const updatedWorkoutFromApi = await updateWorkoutExercises(
        backendUrl,
        workout.id,
        optimisticWorkout.exercises,
      );
      setWorkout(updatedWorkoutFromApi);
    } catch (err) {
      console.error("Failed to delete set:", err);
      setActionError(
        err instanceof Error ? err.message : "Failed to delete set",
      );
      setWorkout(previousWorkout); // Revert on error
    }
  };

  const getWorkoutStatus = (): "not_started" | "in_progress" | "finished" => {
    if (!workout) return "not_started";
    if (workout.end_time) return "finished";
    if (workout.start_time) return "in_progress";
    return "not_started";
  };

  const getSuggestedSet = (
    exerciseName: string,
    setIndex: number,
  ): { reps: number; weight: number | null } | null => {
    if (!suggestions) return null;

    const exerciseSuggestion = suggestions.exercises.find(
      (s) => s.name === exerciseName,
    );

    if (!exerciseSuggestion) return null;

    const setSuggestion = exerciseSuggestion.sets[setIndex];

    if (!setSuggestion) return null;

    return {
      reps: setSuggestion.reps,
      weight: setSuggestion.weight,
    };
  };

  const handleStartWorkout = async () => {
    if (!workout) return;

    setActionLoading(true);
    setActionError(null);

    // Optimistic update
    const now = new Date().toISOString();
    const optimisticWorkout = { ...workout, start_time: now };
    setWorkout(optimisticWorkout);

    try {
      const updatedWorkout = await startWorkout(backendUrl, workout.id);
      setWorkout(updatedWorkout);
    } catch (err) {
      console.error("Failed to start workout:", err);
      setActionError(
        err instanceof Error ? err.message : "Failed to start workout",
      );
      setWorkout(workout); // Revert on error
    } finally {
      setActionLoading(false);
    }
  };

  const handleFinishWorkout = async () => {
    if (!workout) return;

    setActionLoading(true);
    setActionError(null);

    // Optimistic update
    const now = new Date().toISOString();
    const optimisticWorkout = { ...workout, end_time: now };
    setWorkout(optimisticWorkout);

    try {
      const updatedWorkout = await finishWorkout(backendUrl, workout.id);
      setWorkout(updatedWorkout);
    } catch (err) {
      console.error("Failed to finish workout:", err);
      setActionError(
        err instanceof Error ? err.message : "Failed to finish workout",
      );
      setWorkout(workout); // Revert on error
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelWorkout = async () => {
    if (!workout) return;

    setActionLoading(true);
    setActionError(null);

    // Optimistic update: clear times and reset completions
    const optimisticWorkout: WorkoutApi = {
      ...workout,
      start_time: null,
      end_time: null,
      exercises: workout.exercises.map((ex) => ({
        ...ex,
        sets: ex.sets.map((set) => ({ ...set, completed: false })),
      })),
    };
    setWorkout(optimisticWorkout);

    try {
      const updatedWorkout = await cancelWorkout(backendUrl, workout.id);
      setWorkout(updatedWorkout);
    } catch (err) {
      console.error("Failed to cancel workout:", err);
      setActionError(
        err instanceof Error ? err.message : "Failed to cancel workout",
      );
      setWorkout(workout); // Revert on error
    } finally {
      setActionLoading(false);
    }
  };

  const renderSet = (
    set: WorkoutApi["exercises"][0]["sets"][0],
    exerciseIndex: number,
    setIndex: number,
    exerciseName: string,
  ) => {
    const setColor = set.completed ? COLORS.setCompleted : COLORS.setIncomplete;

    // Get suggestions for this specific set
    const suggestedValues = getSuggestedSet(exerciseName, setIndex);

    // Use suggested values if available, otherwise fall back to set data
    const displayReps = suggestedValues?.reps ?? set.reps;
    const displayWeight = suggestedValues?.weight ?? set.weight;
    const weightText = displayWeight ? `${displayWeight} lbs` : "Bodyweight";

    // Visual indicator if using suggestions
    const usingSuggestions = suggestedValues !== null;

    // Determine if checkbox should be disabled
    const workoutStatus = getWorkoutStatus();
    const isDisabled = workoutStatus !== "in_progress" || suggestionsLoading;

    return (
      <View key={setIndex}>
        <View style={styles.setRow}>
          <TouchableOpacity
            onPress={() => toggleSetCompletion(exerciseIndex, setIndex)}
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
          <Text style={[styles.setNumber, { color: setColor }]}>
            {setIndex + 1}
          </Text>
          <Text style={styles.setDetails}>
            {displayReps} reps × {weightText}
            {usingSuggestions && (
              <Text style={styles.suggestedBadge}> ✨ Suggested</Text>
            )}
          </Text>
          {set.rest_seconds && (
            <Text style={styles.restTime}>{set.rest_seconds}s rest</Text>
          )}

          {/* Delete button */}
          {!isDisabled && (
            <TouchableOpacity
              onPress={() => handleDeleteSet(exerciseIndex, setIndex)}
              style={styles.deleteButton}
            >
              <Text style={styles.deleteButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        {set.notes && <Text style={styles.setNotes}>{set.notes}</Text>}
      </View>
    );
  };

  // Check if there's a workout
  const hasWorkout = (workout?.exercises?.length ?? 0) > 0;

  if (!hasWorkout) {
    return (
      <View style={styles.blankStateContainer}>
        <Text style={styles.blankStateTitle}>
          {loading ? "Loading..." : "Rest Day"}
        </Text>
        {loading ? (
          <ActivityIndicator
            size="large"
            color={COLORS.exerciseTitle}
            style={styles.loadingIndicator}
          />
        ) : (
          <Text style={styles.blankStateText}>
            {error || "No workout scheduled for today. Enjoy your rest!"}
          </Text>
        )}
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Today&apos;s Workout</Text>

        {/* Action button - upper right */}
        <View style={styles.headerActions}>
          {actionError && (
            <Text style={styles.actionErrorText}>{actionError}</Text>
          )}

          {getWorkoutStatus() === "not_started" && (
            <TouchableOpacity
              onPress={handleStartWorkout}
              disabled={actionLoading}
              style={[
                styles.startButton,
                actionLoading && styles.buttonDisabled,
              ]}
            >
              {actionLoading ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Text style={styles.startButtonText}>Start</Text>
              )}
            </TouchableOpacity>
          )}

          {getWorkoutStatus() === "in_progress" && (
            <TouchableOpacity
              onPress={handleFinishWorkout}
              disabled={actionLoading}
              style={[
                styles.finishButton,
                actionLoading && styles.buttonDisabled,
              ]}
            >
              {actionLoading ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Text style={styles.finishButtonText}>Finish</Text>
              )}
            </TouchableOpacity>
          )}

          {getWorkoutStatus() === "finished" && (
            <View style={styles.finishedBadge}>
              <Text style={styles.finishedBadgeText}>✓ Completed</Text>
            </View>
          )}
        </View>
      </View>
      {workout?.exercises.map((exerciseInstance, exerciseIndex) => (
        <View key={exerciseIndex} style={styles.exerciseCard}>
          <Text style={styles.exerciseName}>{exerciseInstance.name}</Text>

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
          {!suggestions && !suggestionsLoading && (
            <Text style={styles.targetReps}>
              Target: {exerciseInstance.target_rep_min}-
              {exerciseInstance.target_rep_max} reps ×{" "}
              {exerciseInstance.target_sets} sets
            </Text>
          )}

          {/* Show suggestions error (non-critical) */}
          {suggestionsError && !suggestionsLoading && !suggestions && (
            <Text style={styles.suggestionsErrorText}>
              Could not load suggestions. Showing target ranges.
            </Text>
          )}

          {exerciseInstance.notes && (
            <Text style={styles.exerciseNotes}>{exerciseInstance.notes}</Text>
          )}

          {exerciseInstance.sets.map((set, setIndex) =>
            renderSet(set, exerciseIndex, setIndex, exerciseInstance.name),
          )}

          {/* Add Set button */}
          {getWorkoutStatus() === "in_progress" && !suggestionsLoading && (
            <TouchableOpacity
              onPress={() => handleAddSet(exerciseIndex)}
              style={styles.addSetButton}
            >
              <Text style={styles.addSetButtonText}>+ Add Set</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}

      {/* Cancel button - bottom */}
      {(getWorkoutStatus() === "in_progress" ||
        getWorkoutStatus() === "finished") && (
        <View style={styles.cancelContainer}>
          <TouchableOpacity
            onPress={handleCancelWorkout}
            disabled={actionLoading}
            style={[
              styles.cancelButton,
              actionLoading && styles.buttonDisabled,
            ]}
          >
            {actionLoading ? (
              <ActivityIndicator size="small" color={COLORS.destructive} />
            ) : (
              <Text style={styles.cancelButtonText}>Cancel Workout</Text>
            )}
          </TouchableOpacity>
          <Text style={styles.cancelWarning}>
            This will reset all progress
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  blankStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
    padding: 32,
  },
  blankStateTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 16,
  },
  blankStateText: {
    fontSize: 18,
    color: COLORS.setIncomplete,
    textAlign: "center",
    marginBottom: 24,
  },
  loadingIndicator: {
    marginTop: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingTop: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
  },
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
  setRow: {
    flexDirection: "row",
    justifyContent: "space-between",
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
  setDetails: {
    fontSize: 16,
    color: COLORS.text,
    flex: 1,
  },
  restTime: {
    fontSize: 14,
    color: COLORS.setIncomplete,
  },
  setNotes: {
    fontSize: 12,
    color: COLORS.setIncomplete,
    marginTop: 4,
    marginLeft: 36,
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
  suggestedBadge: {
    fontSize: 12,
    color: COLORS.exerciseTitle,
    fontWeight: "600",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionErrorText: {
    fontSize: 12,
    color: COLORS.destructive,
    marginRight: 8,
  },
  startButton: {
    backgroundColor: COLORS.setCompleted,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 80,
    alignItems: "center",
  },
  startButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  finishButton: {
    backgroundColor: COLORS.exerciseTitle,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 80,
    alignItems: "center",
  },
  finishButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  finishedBadge: {
    backgroundColor: COLORS.setCompleted,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  finishedBadgeText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  cancelContainer: {
    marginHorizontal: 16,
    marginVertical: 24,
    alignItems: "center",
  },
  cancelButton: {
    borderWidth: 2,
    borderColor: COLORS.destructive,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 200,
    alignItems: "center",
  },
  cancelButtonText: {
    color: COLORS.destructive,
    fontSize: 16,
    fontWeight: "600",
  },
  cancelWarning: {
    fontSize: 12,
    color: COLORS.setIncomplete,
    marginTop: 8,
    fontStyle: "italic",
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
