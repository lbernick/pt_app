import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRoute, RouteProp } from "@react-navigation/native";
import { WorkoutInstance } from "../types/workout";
import {
  generateWorkout,
  convertWorkoutToInstance,
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
};

export default function WorkoutScreen() {
  const route = useRoute<WorkoutScreenRouteProp>();
  const { backendUrl } = route.params;
  const apiUrl = `${backendUrl}/api/v1/generate-workout`;

  const [workout, setWorkout] = useState<WorkoutInstance | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateWorkout = async () => {
    setLoading(true);
    setError(null);

    try {
      // Mock request data
      const request = {
        prompt: "Full body strength training",
        difficulty: "intermediate",
        duration_minutes: 45,
      };

      const generatedWorkout = await generateWorkout(request, apiUrl);
      const workoutInstance = convertWorkoutToInstance(generatedWorkout);
      setWorkout(workoutInstance);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate workout"
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleSetCompletion = (exerciseIndex: number, setIndex: number) => {
    setWorkout((prevWorkout) => {
      if (!prevWorkout) return prevWorkout;

      const newWorkout = { ...prevWorkout };
      newWorkout.exercises = [...prevWorkout.exercises];
      newWorkout.exercises[exerciseIndex] = {
        ...prevWorkout.exercises[exerciseIndex],
      };
      newWorkout.exercises[exerciseIndex].sets = [
        ...prevWorkout.exercises[exerciseIndex].sets,
      ];
      newWorkout.exercises[exerciseIndex].sets[setIndex] = {
        ...prevWorkout.exercises[exerciseIndex].sets[setIndex],
        completed:
          !prevWorkout.exercises[exerciseIndex].sets[setIndex].completed,
      };
      return newWorkout;
    });
  };

  const renderSet = (
    set: WorkoutInstance["exercises"][0]["sets"][0],
    exerciseIndex: number,
    setIndex: number,
  ) => {
    const weightText = set.weight ? `${set.weight} lbs` : "Bodyweight";
    const setColor = set.completed ? COLORS.setCompleted : COLORS.setIncomplete;

    return (
      <View key={setIndex} style={styles.setRow}>
        <TouchableOpacity
          onPress={() => toggleSetCompletion(exerciseIndex, setIndex)}
          style={styles.checkbox}
        >
          <View
            style={[
              styles.checkboxInner,
              set.completed && styles.checkboxChecked,
            ]}
          >
            {set.completed && <Text style={styles.checkmark}>✓</Text>}
          </View>
        </TouchableOpacity>
        <Text style={[styles.setNumber, { color: setColor }]}>
          {setIndex + 1}
        </Text>
        <Text style={styles.setDetails}>
          {set.reps} reps × {weightText}
        </Text>
        {set.rest_seconds && (
          <Text style={styles.restTime}>{set.rest_seconds}s rest</Text>
        )}
      </View>
    );
  };

  // Check if there's a workout
  const hasWorkout = (workout?.exercises?.length ?? 0) > 0;

  if (!hasWorkout) {
    return (
      <View style={styles.blankStateContainer}>
        <Text style={styles.blankStateTitle}>
          {loading ? "Generating..." : "Rest Day"}
        </Text>
        {loading ? (
          <ActivityIndicator
            size="large"
            color={COLORS.exerciseTitle}
            style={styles.loadingIndicator}
          />
        ) : (
          <>
            <Text style={styles.blankStateText}>
              {error ||
                "No workout scheduled for today. Generate a new workout to get started!"}
            </Text>
            <TouchableOpacity
              style={styles.generateButton}
              onPress={handleGenerateWorkout}
              disabled={loading}
            >
              <Text style={styles.generateButtonText}>Generate Workout</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Today&apos;s Workout</Text>
      </View>
      {workout?.exercises.map((exerciseInstance, exerciseIndex) => (
        <View key={exerciseIndex} style={styles.exerciseCard}>
          <Text style={styles.exerciseName}>
            {exerciseInstance.exercise.name}
          </Text>
          {exerciseInstance.sets.map((set, setIndex) =>
            renderSet(set, exerciseIndex, setIndex),
          )}
        </View>
      ))}
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
  generateButton: {
    backgroundColor: COLORS.exerciseTitle,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  generateButtonText: {
    color: COLORS.cardBackground,
    fontSize: 18,
    fontWeight: "600",
  },
  header: {
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
    marginBottom: 12,
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
});
