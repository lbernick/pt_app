import { View, Text, StyleSheet, FlatList } from "react-native";
import { WorkoutInstance } from "../types/workout";

const COLORS = {
  background: "#f5f5f5",
  text: "#333",
  cardBackground: "#FFFFFF",
  pastWorkout: "#8E8E93",
  upcomingWorkout: "#007AFF",
  completedGreen: "#34C759",
  shadow: "#000",
  border: "#E5E5EA",
};

// Mock workout history data
const MOCK_HISTORY: WorkoutInstance[] = [
  // Past workouts
  {
    date: "2025-11-28",
    start_time: "09:00",
    end_time: "09:45",
    exercises: [
      {
        exercise: { name: "Bench Press" },
        sets: [
          { reps: 10, weight: 135, rest_seconds: 90, completed: true },
          { reps: 8, weight: 155, rest_seconds: 90, completed: true },
          { reps: 6, weight: 175, rest_seconds: 90, completed: true },
        ],
      },
      {
        exercise: { name: "Squats" },
        sets: [
          { reps: 12, weight: 185, rest_seconds: 120, completed: true },
          { reps: 10, weight: 205, rest_seconds: 120, completed: true },
        ],
      },
    ],
  },
  {
    date: "2025-11-26",
    start_time: "10:30",
    end_time: "11:15",
    exercises: [
      {
        exercise: { name: "Deadlifts" },
        sets: [
          { reps: 8, weight: 225, rest_seconds: 120, completed: true },
          { reps: 6, weight: 245, rest_seconds: 120, completed: true },
          { reps: 5, weight: 265, rest_seconds: 120, completed: true },
        ],
      },
      {
        exercise: { name: "Pull-ups" },
        sets: [
          { reps: 10, rest_seconds: 60, completed: true },
          { reps: 8, rest_seconds: 60, completed: true },
          { reps: 6, rest_seconds: 60, completed: true },
        ],
      },
    ],
  },
  // Upcoming workouts
  {
    date: "2025-12-01",
    exercises: [
      {
        exercise: { name: "Overhead Press" },
        sets: [
          { reps: 10, weight: 95, rest_seconds: 90, completed: false },
          { reps: 8, weight: 105, rest_seconds: 90, completed: false },
          { reps: 6, weight: 115, rest_seconds: 90, completed: false },
        ],
      },
      {
        exercise: { name: "Rows" },
        sets: [
          { reps: 12, weight: 135, rest_seconds: 90, completed: false },
          { reps: 10, weight: 145, rest_seconds: 90, completed: false },
        ],
      },
    ],
  },
  {
    date: "2025-12-03",
    exercises: [
      {
        exercise: { name: "Lunges" },
        sets: [
          { reps: 12, weight: 95, rest_seconds: 60, completed: false },
          { reps: 12, weight: 95, rest_seconds: 60, completed: false },
        ],
      },
      {
        exercise: { name: "Leg Press" },
        sets: [
          { reps: 15, weight: 225, rest_seconds: 90, completed: false },
          { reps: 12, weight: 245, rest_seconds: 90, completed: false },
        ],
      },
    ],
  },
];

export default function HistoryScreen() {
  const today = new Date().toISOString().split("T")[0];

  const isPastWorkout = (workout: WorkoutInstance): boolean => {
    return workout.date < today;
  };

  const isToday = (workout: WorkoutInstance): boolean => {
    return workout.date === today;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString + "T00:00:00");
    const options: Intl.DateTimeFormatOptions = {
      weekday: "short",
      month: "short",
      day: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  };

  const renderWorkoutCard = ({ item }: { item: WorkoutInstance }) => {
    const past = isPastWorkout(item);
    const todayWorkout = isToday(item);
    const completed = item.start_time && item.end_time;

    return (
      <View
        style={[
          styles.workoutCard,
          past && styles.pastWorkoutCard,
          todayWorkout && styles.todayWorkoutCard,
        ]}
      >
        <View style={styles.cardHeader}>
          <View>
            <Text
              style={[
                styles.dateText,
                past && styles.pastText,
                todayWorkout && styles.todayText,
              ]}
            >
              {formatDate(item.date)}
              {todayWorkout && " (Today)"}
            </Text>
            {completed && (
              <Text style={styles.timeText}>
                {item.start_time} - {item.end_time}
              </Text>
            )}
          </View>
          {past && completed && (
            <View style={styles.completedBadge}>
              <Text style={styles.completedBadgeText}>✓ Completed</Text>
            </View>
          )}
          {!past && !todayWorkout && (
            <View style={styles.upcomingBadge}>
              <Text style={styles.upcomingBadgeText}>Upcoming</Text>
            </View>
          )}
        </View>

        <View style={styles.exercisesList}>
          {item.exercises.map((exercise, index) => (
            <Text key={index} style={styles.exerciseName}>
              • {exercise.exercise.name} ({exercise.sets.length} sets)
            </Text>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={MOCK_HISTORY}
        renderItem={renderWorkoutCard}
        keyExtractor={(item) => item.date}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <Text style={styles.headerTitle}>Workout History</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    padding: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 16,
  },
  workoutCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.upcomingWorkout,
  },
  pastWorkoutCard: {
    borderLeftColor: COLORS.pastWorkout,
    opacity: 0.85,
  },
  todayWorkoutCard: {
    borderLeftColor: COLORS.completedGreen,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  dateText: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.upcomingWorkout,
    marginBottom: 4,
  },
  pastText: {
    color: COLORS.pastWorkout,
  },
  todayText: {
    color: COLORS.completedGreen,
  },
  timeText: {
    fontSize: 14,
    color: COLORS.pastWorkout,
  },
  completedBadge: {
    backgroundColor: COLORS.completedGreen,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  completedBadgeText: {
    color: COLORS.cardBackground,
    fontSize: 12,
    fontWeight: "600",
  },
  upcomingBadge: {
    backgroundColor: COLORS.upcomingWorkout,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  upcomingBadgeText: {
    color: COLORS.cardBackground,
    fontSize: 12,
    fontWeight: "600",
  },
  exercisesList: {
    gap: 6,
  },
  exerciseName: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 22,
  },
});
