import { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRoute, RouteProp } from "@react-navigation/native";
import {
  WorkoutApi,
  WorkoutSuggestionsResponse,
  SetInstance,
} from "../types/workout";
import { useApiClient } from "../hooks/useApiClient";
import ExerciseCard from "../components/ExerciseCard";

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
  const apiClient = useApiClient();

  const [workout, setWorkout] = useState<WorkoutApi | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Suggestions state
  const [suggestions, setSuggestions] =
    useState<WorkoutSuggestionsResponse | null>(null);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [suggestionsError, setSuggestionsError] = useState<string | null>(null);

  // Workout action state
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Field editing state
  const [dirtyFields, setDirtyFields] = useState<{
    [exerciseIndex: number]: {
      [setIndex: number]: {
        reps?: boolean;
        weight?: boolean;
      };
    };
  }>({});

  const [inputBuffers, setInputBuffers] = useState<{
    [exerciseIndex: number]: {
      [setIndex: number]: {
        reps?: string;
        weight?: string;
      };
    };
  }>({});

  const [validationErrors, setValidationErrors] = useState<{
    [exerciseIndex: number]: {
      [setIndex: number]: {
        reps?: string;
        weight?: string;
      };
    };
  }>({});

  const [saveTimeoutId, setSaveTimeoutId] = useState<NodeJS.Timeout | null>(
    null,
  );

  const fetchSuggestionsInBackground = async (workoutId: string) => {
    setSuggestionsLoading(true);
    setSuggestionsError(null);

    try {
      const apiUrl = `${backendUrl}/api/v1/workouts/${workoutId}/suggest`;
      const suggestionsData =
        await apiClient.fetchJson<WorkoutSuggestionsResponse>(apiUrl, {
          method: "POST",
        });
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

  const fetchTodaysWorkout = async () => {
    setLoading(true);
    setError(null);
    setSuggestionsError(null);

    try {
      const today = new Date().toISOString().split("T")[0];
      const dateParam = today ? `?date=${today}` : "";
      const apiUrl = `${backendUrl}/api/v1/workouts${dateParam}`;
      const workouts = await apiClient.fetchJson<WorkoutApi[]>(apiUrl, {
        method: "GET",
      });

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
      setError(err instanceof Error ? err.message : "Failed to fetch workout");
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTodaysWorkout();
    setRefreshing(false);
  };

  // Fetch today's workout on mount
  useEffect(() => {
    fetchTodaysWorkout();
  }, [backendUrl]);

  // Apply AI suggestions when they arrive (but only to non-dirty fields)
  useEffect(() => {
    if (!suggestions || !workout) return;

    let updatedWorkout = { ...workout };
    let hasChanges = false;

    workout.exercises.forEach((ex, exIdx) => {
      const exSuggestion = suggestions.exercises.find(
        (s) => s.name === ex.name,
      );
      if (!exSuggestion) return;

      ex.sets.forEach((set, setIdx) => {
        if (set.completed) return; // Don't change completed sets

        const setSuggestion = exSuggestion.sets[setIdx];
        if (!setSuggestion) return;

        // Only apply if not dirty
        const isRepsDirty = dirtyFields[exIdx]?.[setIdx]?.reps;
        const isWeightDirty = dirtyFields[exIdx]?.[setIdx]?.weight;

        if (!isRepsDirty && set.reps !== setSuggestion.reps) {
          updatedWorkout = updateSetField(
            updatedWorkout,
            exIdx,
            setIdx,
            "reps",
            setSuggestion.reps,
          );
          hasChanges = true;
        }

        const suggWeight =
          setSuggestion.weight === null ? undefined : setSuggestion.weight;
        if (!isWeightDirty && set.weight !== suggWeight) {
          updatedWorkout = updateSetField(
            updatedWorkout,
            exIdx,
            setIdx,
            "weight",
            suggWeight,
          );
          hasChanges = true;
        }
      });
    });

    if (hasChanges) {
      setWorkout(updatedWorkout);
    }
  }, [suggestions, workout, dirtyFields]);

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
        // Check dirty tracking before applying
        const isRepsDirty = dirtyFields[exerciseIndex]?.[setIndex]?.reps;
        const isWeightDirty = dirtyFields[exerciseIndex]?.[setIndex]?.weight;

        if (!isRepsDirty) {
          updatedSet.reps = suggestedValues.reps;
        }
        if (!isWeightDirty) {
          updatedSet.weight =
            suggestedValues.weight === null
              ? undefined
              : suggestedValues.weight;
        }
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

    // Update backend
    await updateExercisesOnBackend(
      optimisticWorkout,
      previousWorkout,
      "Failed to update set completion",
    );
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
    const previousSet = currentExercise.sets[currentExercise.sets.length - 1];

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

    // Update backend
    await updateExercisesOnBackend(
      optimisticWorkout,
      previousWorkout,
      "Failed to add set",
    );
  };

  const handleDeleteSet = async (exerciseIndex: number, setIndex: number) => {
    if (!workout) return;

    const status = getWorkoutStatus();
    if (status !== "in_progress") {
      return;
    }

    // TODO: If the last set is deleted, delete the exercise

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

    // Update backend
    await updateExercisesOnBackend(
      optimisticWorkout,
      previousWorkout,
      "Failed to delete set",
    );
  };

  const parseFieldValue = (
    field: "reps" | "weight",
    value: string,
  ): number | undefined | null => {
    const trimmed = value.trim();

    // Empty weight = bodyweight (undefined)
    if (field === "weight" && trimmed === "") {
      return undefined;
    }

    // Empty reps = invalid
    if (trimmed === "") {
      return null;
    }

    const num = parseFloat(trimmed);

    if (isNaN(num) || num <= 0) {
      return null;
    }

    if (field === "reps") {
      // Must be integer, max 9999
      if (!Number.isInteger(num) || num > 9999) {
        return null;
      }
    } else {
      // Weight can have decimals, max 999.9
      if (num > 999.9) {
        return null;
      }
    }

    return num;
  };

  const updateSetField = (
    workout: WorkoutApi,
    exerciseIndex: number,
    setIndex: number,
    field: "reps" | "weight",
    value: number | undefined,
  ): WorkoutApi => {
    // Immutable update pattern (same as existing code)
    const optimisticWorkout = { ...workout };
    optimisticWorkout.exercises = [...workout.exercises];
    optimisticWorkout.exercises[exerciseIndex] = {
      ...workout.exercises[exerciseIndex],
    };
    optimisticWorkout.exercises[exerciseIndex].sets = [
      ...workout.exercises[exerciseIndex].sets,
    ];
    optimisticWorkout.exercises[exerciseIndex].sets[setIndex] = {
      ...optimisticWorkout.exercises[exerciseIndex].sets[setIndex],
      [field]: value,
    };
    return optimisticWorkout;
  };

  // Shared function to update exercises via API
  const updateExercisesOnBackend = async (
    optimisticWorkout: WorkoutApi,
    previousWorkout: WorkoutApi | null,
    errorMessage: string,
  ) => {
    try {
      const apiUrl = `${backendUrl}/api/v1/workouts/${optimisticWorkout.id}/exercises`;
      const updatedWorkoutFromApi = await apiClient.fetchJson<WorkoutApi>(
        apiUrl,
        {
          method: "PATCH",
          body: { exercises: optimisticWorkout.exercises },
        },
      );
      setWorkout(updatedWorkoutFromApi);
      setActionError(null);
    } catch (err) {
      console.error(errorMessage, err);
      setActionError(err instanceof Error ? err.message : errorMessage);
      // Rollback on error
      if (previousWorkout) {
        setWorkout(previousWorkout);
      }
    }
  };

  const saveWorkoutToBackend = async (workoutToSave: WorkoutApi) => {
    const previousWorkout = workout;
    await updateExercisesOnBackend(
      workoutToSave,
      previousWorkout,
      "Failed to save changes",
    );
  };

  const handleFieldChange = (
    exerciseIndex: number,
    setIndex: number,
    field: "reps" | "weight",
    value: string,
  ) => {
    // Update input buffer (temporary string storage)
    setInputBuffers((prev) => ({
      ...prev,
      [exerciseIndex]: {
        ...prev[exerciseIndex],
        [setIndex]: {
          ...prev[exerciseIndex]?.[setIndex],
          [field]: value,
        },
      },
    }));

    // Validate and show error if invalid (but don't save yet)
    const parsedValue = parseFieldValue(field, value);
    if (parsedValue === null && value.trim() !== "") {
      setValidationErrors((prev) => ({
        ...prev,
        [exerciseIndex]: {
          ...prev[exerciseIndex],
          [setIndex]: {
            ...prev[exerciseIndex]?.[setIndex],
            [field]: "Must be a positive number",
          },
        },
      }));
    } else {
      // Clear error
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        if (newErrors[exerciseIndex]?.[setIndex]) {
          delete newErrors[exerciseIndex][setIndex][field];
        }
        return newErrors;
      });
    }
  };

  const handleFieldBlur = async (
    exerciseIndex: number,
    setIndex: number,
    field: "reps" | "weight",
    value: string,
  ) => {
    // Parse and validate
    const numValue = parseFieldValue(field, value);

    if (numValue === null) {
      // Invalid - revert to previous value
      const currentValue =
        workout!.exercises[exerciseIndex].sets[setIndex][field];
      setInputBuffers((prev) => ({
        ...prev,
        [exerciseIndex]: {
          ...prev[exerciseIndex],
          [setIndex]: {
            ...prev[exerciseIndex]?.[setIndex],
            [field]:
              currentValue !== undefined && currentValue !== null
                ? String(currentValue)
                : "",
          },
        },
      }));
      return;
    }

    // Mark field as dirty (prevents AI from overwriting)
    setDirtyFields((prev) => ({
      ...prev,
      [exerciseIndex]: {
        ...prev[exerciseIndex],
        [setIndex]: {
          ...prev[exerciseIndex]?.[setIndex],
          [field]: true,
        },
      },
    }));

    // Update workout state (immutable pattern)
    const updatedWorkout = updateSetField(
      workout!,
      exerciseIndex,
      setIndex,
      field,
      numValue,
    );
    setWorkout(updatedWorkout);

    // Debounced save to backend (500ms after last edit)
    if (saveTimeoutId) {
      clearTimeout(saveTimeoutId);
    }

    const timeoutId = setTimeout(() => {
      saveWorkoutToBackend(updatedWorkout);
    }, 500);

    setSaveTimeoutId(timeoutId);
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
      const apiUrl = `${backendUrl}/api/v1/workouts/${workout.id}/start`;
      const updatedWorkout = await apiClient.fetchJson<WorkoutApi>(apiUrl, {
        method: "POST",
      });
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
      const apiUrl = `${backendUrl}/api/v1/workouts/${workout.id}/finish`;
      const updatedWorkout = await apiClient.fetchJson<WorkoutApi>(apiUrl, {
        method: "POST",
      });
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
      const apiUrl = `${backendUrl}/api/v1/workouts/${workout.id}/cancel`;
      const updatedWorkout = await apiClient.fetchJson<WorkoutApi>(apiUrl, {
        method: "POST",
      });
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

  // Performance optimization: Create Map for O(1) suggestions lookup
  const suggestionsByExercise = useMemo(() => {
    if (!suggestions) return new Map();
    return new Map(suggestions.exercises.map((ex) => [ex.name, ex]));
  }, [suggestions]);

  // Check if there's a workout
  const hasWorkout = (workout?.exercises?.length ?? 0) > 0;

  // Check if at least one set is completed
  const hasCompletedSets =
    workout?.exercises.some((exercise) =>
      exercise.sets.some((set) => set.completed),
    ) ?? false;

  if (!hasWorkout) {
    // TODO: Swipe to refresh here too
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
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
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
              disabled={actionLoading || !hasCompletedSets}
              style={[
                styles.finishButton,
                (actionLoading || !hasCompletedSets) && styles.buttonDisabled,
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
      {workout?.exercises.map((exerciseInstance, exerciseIndex) => {
        const exerciseSuggestions = suggestionsByExercise.get(
          exerciseInstance.name,
        );

        return (
          <ExerciseCard
            key={exerciseIndex}
            exercise={exerciseInstance}
            exerciseIndex={exerciseIndex}
            exerciseSuggestions={exerciseSuggestions}
            suggestionsLoading={suggestionsLoading}
            suggestionsError={suggestionsError}
            workoutStatus={getWorkoutStatus()}
            inputBuffers={inputBuffers[exerciseIndex]}
            validationErrors={validationErrors[exerciseIndex]}
            onAddSet={() => handleAddSet(exerciseIndex)}
            onDeleteSet={(setIndex) =>
              handleDeleteSet(exerciseIndex, setIndex)
            }
            onToggleSetCompletion={(setIndex) =>
              toggleSetCompletion(exerciseIndex, setIndex)
            }
            onFieldChange={(setIndex, field, value) =>
              handleFieldChange(exerciseIndex, setIndex, field, value)
            }
            onFieldBlur={(setIndex, field, value) =>
              handleFieldBlur(exerciseIndex, setIndex, field, value)
            }
          />
        );
      })}

      {/* Cancel button - bottom */}
      {getWorkoutStatus() === "in_progress" && (
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
});
