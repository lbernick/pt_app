import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { WorkoutInstance } from "../types/workout";

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

// Mock workout data
const MOCK_WORKOUT: WorkoutInstance = {
  exercises: [
    {
      exercise: { name: "Bench Press" },
      sets: [
        { reps: 10, weight: 135, rest_seconds: 90, completed: true },
        { reps: 8, weight: 155, rest_seconds: 90, completed: true },
        { reps: 6, weight: 175, rest_seconds: 90, completed: false },
        { reps: 6, weight: 175, rest_seconds: 90, completed: false },
      ],
    },
    {
      exercise: { name: "Squats" },
      sets: [
        { reps: 12, weight: 185, rest_seconds: 120, completed: true },
        { reps: 10, weight: 205, rest_seconds: 120, completed: false },
        { reps: 8, weight: 225, rest_seconds: 120, completed: false },
      ],
    },
    {
      exercise: { name: "Pull-ups" },
      sets: [
        { reps: 10, rest_seconds: 60, completed: true },
        { reps: 8, rest_seconds: 60, completed: false },
        { reps: 6, rest_seconds: 60, completed: false },
      ],
    },
  ],
};

export default function WorkoutScreen() {
  const [workout, setWorkout] = useState<WorkoutInstance>(MOCK_WORKOUT);

  const toggleSetCompletion = (exerciseIndex: number, setIndex: number) => {
    setWorkout((prevWorkout) => {
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
  const hasWorkout = workout?.exercises?.length > 0;

  if (!hasWorkout) {
    return (
      <View style={styles.blankStateContainer}>
        <Text style={styles.blankStateTitle}>Rest Day</Text>
        <Text style={styles.blankStateText}>
          No workout scheduled for today. Take time to recover!
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Today&apos;s Workout</Text>
      </View>
      {workout.exercises.map((exerciseInstance, exerciseIndex) => (
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
