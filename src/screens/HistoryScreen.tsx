import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Calendar, DateData } from "react-native-calendars";
import { WorkoutApi } from "../types/workout";

type ViewMode = "list" | "calendar";

const COLORS = {
  background: "#f5f5f5",
  text: "#333",
  cardBackground: "#FFFFFF",
  pastWorkout: "#8E8E93",
  skippedWorkout: "#FF3B30",
  upcomingWorkout: "#007AFF",
  completedGreen: "#34C759",
  shadow: "#000",
  border: "#E5E5EA",
};

// Mock workout history data
const MOCK_HISTORY: WorkoutApi[] = [
  // Past workouts
  {
    id: "mock-1",
    template_id: "template-1",
    date: "2025-11-28",
    start_time: "09:00",
    end_time: "09:45",
    exercises: [
      {
        name: "Bench Press",
        target_sets: 3,
        target_rep_min: 6,
        target_rep_max: 10,
        sets: [
          { reps: 10, weight: 135, rest_seconds: 90, completed: true, notes: null },
          { reps: 8, weight: 155, rest_seconds: 90, completed: true, notes: null },
          { reps: 6, weight: 175, rest_seconds: 90, completed: true, notes: null },
        ],
        notes: null,
      },
      {
        name: "Squats",
        target_sets: 2,
        target_rep_min: 10,
        target_rep_max: 12,
        sets: [
          { reps: 12, weight: 185, rest_seconds: 120, completed: true, notes: null },
          { reps: 10, weight: 205, rest_seconds: 120, completed: true, notes: null },
        ],
        notes: null,
      },
    ],
    created_at: "2025-11-28T09:00:00",
    updated_at: "2025-11-28T09:45:00",
  },
  {
    id: "mock-2",
    template_id: "template-2",
    date: "2025-11-26",
    start_time: "10:30",
    end_time: "11:15",
    exercises: [
      {
        name: "Deadlifts",
        target_sets: 3,
        target_rep_min: 5,
        target_rep_max: 8,
        sets: [
          { reps: 8, weight: 225, rest_seconds: 120, completed: true, notes: null },
          { reps: 6, weight: 245, rest_seconds: 120, completed: true, notes: null },
          { reps: 5, weight: 265, rest_seconds: 120, completed: true, notes: null },
        ],
        notes: null,
      },
      {
        name: "Pull-ups",
        target_sets: 3,
        target_rep_min: 6,
        target_rep_max: 10,
        sets: [
          { reps: 10, rest_seconds: 60, completed: true, notes: null },
          { reps: 8, rest_seconds: 60, completed: true, notes: null },
          { reps: 6, rest_seconds: 60, completed: true, notes: null },
        ],
        notes: null,
      },
    ],
    created_at: "2025-11-26T10:30:00",
    updated_at: "2025-11-26T11:15:00",
  },
  {
    id: "mock-3",
    template_id: "template-3",
    date: "2025-11-24",
    start_time: null,
    end_time: null,
    exercises: [
      {
        name: "Leg Day",
        target_sets: 3,
        target_rep_min: 8,
        target_rep_max: 12,
        sets: [
          { reps: 12, weight: 185, rest_seconds: 90, completed: false, notes: null },
          { reps: 10, weight: 205, rest_seconds: 90, completed: false, notes: null },
          { reps: 8, weight: 225, rest_seconds: 90, completed: false, notes: null },
        ],
        notes: null,
      },
    ],
    created_at: "2025-11-24T00:00:00",
    updated_at: "2025-11-24T00:00:00",
  },
  // Upcoming workouts
  {
    id: "mock-4",
    template_id: "template-4",
    date: "2025-12-01",
    start_time: null,
    end_time: null,
    exercises: [
      {
        name: "Overhead Press",
        target_sets: 3,
        target_rep_min: 6,
        target_rep_max: 10,
        sets: [
          { reps: 10, weight: 95, rest_seconds: 90, completed: false, notes: null },
          { reps: 8, weight: 105, rest_seconds: 90, completed: false, notes: null },
          { reps: 6, weight: 115, rest_seconds: 90, completed: false, notes: null },
        ],
        notes: null,
      },
      {
        name: "Rows",
        target_sets: 2,
        target_rep_min: 10,
        target_rep_max: 12,
        sets: [
          { reps: 12, weight: 135, rest_seconds: 90, completed: false, notes: null },
          { reps: 10, weight: 145, rest_seconds: 90, completed: false, notes: null },
        ],
        notes: null,
      },
    ],
    created_at: "2025-12-01T00:00:00",
    updated_at: "2025-12-01T00:00:00",
  },
  {
    id: "mock-5",
    template_id: "template-5",
    date: "2025-12-03",
    start_time: null,
    end_time: null,
    exercises: [
      {
        name: "Lunges",
        target_sets: 2,
        target_rep_min: 12,
        target_rep_max: 12,
        sets: [
          { reps: 12, weight: 95, rest_seconds: 60, completed: false, notes: null },
          { reps: 12, weight: 95, rest_seconds: 60, completed: false, notes: null },
        ],
        notes: null,
      },
      {
        name: "Leg Press",
        target_sets: 2,
        target_rep_min: 12,
        target_rep_max: 15,
        sets: [
          { reps: 15, weight: 225, rest_seconds: 90, completed: false, notes: null },
          { reps: 12, weight: 245, rest_seconds: 90, completed: false, notes: null },
        ],
        notes: null,
      },
    ],
    created_at: "2025-12-03T00:00:00",
    updated_at: "2025-12-03T00:00:00",
  },
];

export default function HistoryScreen() {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const today = new Date().toISOString().split("T")[0];

  const toggleViewMode = () => {
    setViewMode((prev) => (prev === "list" ? "calendar" : "list"));
  };

  const isPastWorkout = (workout: WorkoutApi): boolean => {
    return workout.date < today;
  };

  const isToday = (workout: WorkoutApi): boolean => {
    return workout.date === today;
  };

  const isWorkoutCompleted = (workout: WorkoutApi): boolean => {
    // A workout is considered completed if it has start/end times
    // or if any sets are marked as completed
    if (workout.start_time && workout.end_time) return true;
    return workout.exercises.some((exercise) =>
      exercise.sets.some((set) => set.completed)
    );
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

  const renderWorkoutCard = ({ item }: { item: WorkoutApi }) => {
    const past = isPastWorkout(item);
    const todayWorkout = isToday(item);
    const completed = isWorkoutCompleted(item);
    const skipped = past && !completed;

    return (
      <View
        style={[
          styles.workoutCard,
          past && styles.pastWorkoutCard,
          todayWorkout && styles.todayWorkoutCard,
          skipped && styles.skippedWorkoutCard,
        ]}
      >
        <View style={styles.cardHeader}>
          <View>
            <Text
              style={[
                styles.dateText,
                past && !skipped && styles.pastText,
                todayWorkout && styles.todayText,
                skipped && styles.skippedText,
              ]}
            >
              {formatDate(item.date)}
              {todayWorkout && " (Today)"}
            </Text>
            {completed && item.start_time && item.end_time && (
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
          {skipped && (
            <View style={styles.skippedBadge}>
              <Text style={styles.skippedBadgeText}>Skipped</Text>
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
              • {exercise.name} ({exercise.sets.length} sets)
            </Text>
          ))}
        </View>
      </View>
    );
  };

  // Create marked dates for the calendar
  const getMarkedDates = () => {
    const marked: {
      [key: string]: {
        marked: boolean;
        dotColor: string;
        selected: boolean;
        selectedColor: string;
      };
    } = {};

    MOCK_HISTORY.forEach((workout) => {
      const isPast = workout.date < today;
      const isToday = workout.date === today;
      const completed = isWorkoutCompleted(workout);

      let color: string;
      if (isToday) {
        color = COLORS.completedGreen;
      } else if (isPast) {
        color = completed ? COLORS.pastWorkout : COLORS.skippedWorkout;
      } else {
        color = COLORS.upcomingWorkout;
      }

      marked[workout.date] = {
        marked: true,
        dotColor: color,
        selected: selectedDate === workout.date,
        selectedColor: color,
      };
    });

    return marked;
  };

  const getSelectedDayWorkout = (): WorkoutApi | null => {
    if (!selectedDate) return null;
    return MOCK_HISTORY.find((w) => w.date === selectedDate) || null;
  };

  const renderCalendarView = () => {
    const selectedWorkout = getSelectedDayWorkout();

    return (
      <ScrollView style={styles.calendarScrollView}>
        <Calendar
          current={today}
          markedDates={getMarkedDates()}
          onDayPress={(day: DateData) => {
            setSelectedDate(day.dateString);
          }}
          theme={{
            backgroundColor: COLORS.background,
            calendarBackground: COLORS.cardBackground,
            textSectionTitleColor: COLORS.text,
            selectedDayBackgroundColor: COLORS.upcomingWorkout,
            selectedDayTextColor: COLORS.cardBackground,
            todayTextColor: COLORS.completedGreen,
            dayTextColor: COLORS.text,
            textDisabledColor: COLORS.pastWorkout,
            dotColor: COLORS.upcomingWorkout,
            monthTextColor: COLORS.text,
            textDayFontSize: 16,
            textMonthFontSize: 18,
            textDayHeaderFontSize: 14,
          }}
          style={styles.calendar}
        />

        {selectedWorkout && (
          <View style={styles.selectedDayDetails}>
            <Text style={styles.selectedDayTitle}>
              {formatDate(selectedWorkout.date)}
              {selectedWorkout.date === today && " (Today)"}
            </Text>
            {selectedWorkout.start_time && selectedWorkout.end_time && (
              <Text style={styles.selectedDayTime}>
                {selectedWorkout.start_time} - {selectedWorkout.end_time}
              </Text>
            )}
            <View style={styles.selectedDayExercises}>
              {selectedWorkout.exercises.map((exercise, index) => (
                <View key={index} style={styles.selectedExerciseRow}>
                  <Text style={styles.selectedExerciseName}>
                    {exercise.name}
                  </Text>
                  <Text style={styles.selectedExerciseSets}>
                    {exercise.sets.length} sets
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {selectedDate && !selectedWorkout && (
          <View style={styles.selectedDayDetails}>
            <Text style={styles.noWorkoutText}>No workout on this day</Text>
          </View>
        )}
      </ScrollView>
    );
  };

  const renderListView = () => {
    return (
      <FlatList
        data={MOCK_HISTORY}
        renderItem={renderWorkoutCard}
        keyExtractor={(item) => item.date}
        contentContainerStyle={styles.listContent}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Workout History</Text>
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={toggleViewMode}
        >
          <Text style={styles.toggleButtonText}>
            {viewMode === "list" ? "📅" : "📋"}
          </Text>
        </TouchableOpacity>
      </View>
      {viewMode === "list" ? renderListView() : renderCalendarView()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.text,
  },
  toggleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.cardBackground,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  toggleButtonText: {
    fontSize: 24,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  calendarScrollView: {
    flex: 1,
  },
  calendar: {
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    elevation: 3,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  selectedDayDetails: {
    margin: 16,
    padding: 16,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    elevation: 3,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  selectedDayTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
  },
  selectedDayTime: {
    fontSize: 14,
    color: COLORS.pastWorkout,
    marginBottom: 12,
  },
  selectedDayExercises: {
    gap: 8,
  },
  selectedExerciseRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  selectedExerciseName: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.text,
  },
  selectedExerciseSets: {
    fontSize: 14,
    color: COLORS.pastWorkout,
  },
  noWorkoutText: {
    fontSize: 16,
    color: COLORS.pastWorkout,
    textAlign: "center",
    fontStyle: "italic",
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
  skippedWorkoutCard: {
    borderLeftColor: COLORS.skippedWorkout,
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
  skippedText: {
    color: COLORS.skippedWorkout,
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
  skippedBadge: {
    backgroundColor: COLORS.skippedWorkout,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  skippedBadgeText: {
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
