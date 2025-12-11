import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRoute, RouteProp } from "@react-navigation/native";
import { Calendar, DateData } from "react-native-calendars";
import { WorkoutApi } from "../types/workout";
import { getWorkouts, getWorkoutById } from "../services/workoutApi";

type ViewMode = "list" | "calendar";

type HistoryScreenRouteProp = RouteProp<
  { History: { backendUrl: string } },
  "History"
>;

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

export default function HistoryScreen() {
  const route = useRoute<HistoryScreenRouteProp>();
  const { backendUrl } = route.params;

  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [workouts, setWorkouts] = useState<WorkoutApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedWorkouts, setExpandedWorkouts] = useState<Set<string>>(
    new Set(),
  );
  const [detailedWorkouts, setDetailedWorkouts] = useState<
    Map<string, WorkoutApi>
  >(new Map());
  const [loadingDetails, setLoadingDetails] = useState<Set<string>>(new Set());

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const fetchWorkouts = async () => {
      setLoading(true);
      setError(null);

      try {
        const fetchedWorkouts = await getWorkouts(backendUrl);
        setWorkouts(fetchedWorkouts);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch workouts",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchWorkouts();
  }, [backendUrl]);

  const toggleViewMode = () => {
    setViewMode((prev) => (prev === "list" ? "calendar" : "list"));
  };

  const toggleWorkoutExpansion = async (workoutId: string) => {
    const isExpanded = expandedWorkouts.has(workoutId);

    if (isExpanded) {
      // Collapse: just remove from expanded set
      setExpandedWorkouts((prev) => {
        const next = new Set(prev);
        next.delete(workoutId);
        return next;
      });
    } else {
      // Expand: add to set and fetch details if not cached
      setExpandedWorkouts((prev) => new Set(prev).add(workoutId));

      if (!detailedWorkouts.has(workoutId)) {
        // Fetch detailed workout data
        setLoadingDetails((prev) => new Set(prev).add(workoutId));

        try {
          const detailedWorkout = await getWorkoutById(backendUrl, workoutId);
          setDetailedWorkouts((prev) =>
            new Map(prev).set(workoutId, detailedWorkout),
          );
        } catch (err) {
          console.error("Failed to fetch workout details:", err);
          // Remove from expanded on error
          setExpandedWorkouts((prev) => {
            const next = new Set(prev);
            next.delete(workoutId);
            return next;
          });
        } finally {
          setLoadingDetails((prev) => {
            const next = new Set(prev);
            next.delete(workoutId);
            return next;
          });
        }
      }
    }
  };

  const isPastWorkout = (workout: WorkoutApi): boolean => {
    return workout.date < today;
  };

  const isToday = (workout: WorkoutApi): boolean => {
    return workout.date === today;
  };

  const isWorkoutCompleted = (workout: WorkoutApi): boolean => {
    return workout.end_time !== null;
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
    const isExpanded = expandedWorkouts.has(item.id);
    const isLoadingDetails = loadingDetails.has(item.id);
    const detailedWorkout = detailedWorkouts.get(item.id);

    return (
      <TouchableOpacity
        onPress={() => toggleWorkoutExpansion(item.id)}
        style={[
          styles.workoutCard,
          past && styles.pastWorkoutCard,
          todayWorkout && styles.todayWorkoutCard,
          skipped && styles.skippedWorkoutCard,
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderInfo}>
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
            {item.start_time && item.end_time && (
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
          <Text style={styles.expandIcon}>{isExpanded ? "▼" : "▶"}</Text>
        </View>

        {isExpanded && (
          <View style={styles.expandedContent}>
            {isLoadingDetails ? (
              <ActivityIndicator size="small" color={COLORS.upcomingWorkout} />
            ) : detailedWorkout ? (
              detailedWorkout.exercises.map((exercise, exerciseIndex) => (
                <View key={exerciseIndex} style={styles.exerciseDetailCard}>
                  <Text style={styles.exerciseDetailName}>{exercise.name}</Text>
                  {!past && (
                    <Text style={styles.targetReps}>
                      Target: {exercise.target_rep_min}-
                      {exercise.target_rep_max} reps × {exercise.target_sets}{" "}
                      sets
                    </Text>
                  )}
                  {exercise.notes && (
                    <Text style={styles.exerciseNotes}>{exercise.notes}</Text>
                  )}
                  {past &&
                    exercise.sets.map((set, setIndex) => (
                      <View key={setIndex} style={styles.setRow}>
                        <Text style={styles.setNumber}>
                          Set {setIndex + 1}:
                        </Text>
                        <Text style={styles.setDetails}>
                          {set.reps || "-"} reps{" "}
                          {set.weight ? `× ${set.weight} lbs` : "× Bodyweight"}
                        </Text>
                        {set.completed && (
                          <Text style={styles.setCompleted}>✓</Text>
                        )}
                      </View>
                    ))}
                </View>
              ))
            ) : (
              <Text style={styles.errorText}>Failed to load details</Text>
            )}
          </View>
        )}
      </TouchableOpacity>
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

    workouts.forEach((workout) => {
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
    return workouts.find((w) => w.date === selectedDate) || null;
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
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.upcomingWorkout} />
          <Text style={styles.loadingText}>Loading workouts...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={workouts}
        renderItem={renderWorkoutCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Workout History</Text>
        <TouchableOpacity style={styles.toggleButton} onPress={toggleViewMode}>
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
  cardHeaderInfo: {
    flex: 1,
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.text,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.skippedWorkout,
    textAlign: "center",
  },
  expandIcon: {
    fontSize: 16,
    color: COLORS.text,
    marginLeft: 8,
  },
  expandedContent: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  exerciseDetailCard: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  exerciseDetailName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  targetReps: {
    fontSize: 14,
    color: COLORS.pastWorkout,
    fontStyle: "italic",
    marginBottom: 8,
  },
  exerciseNotes: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 8,
    fontStyle: "italic",
  },
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingLeft: 12,
  },
  setNumber: {
    fontSize: 14,
    color: COLORS.pastWorkout,
    width: 60,
  },
  setDetails: {
    fontSize: 14,
    color: COLORS.text,
    flex: 1,
  },
  setCompleted: {
    fontSize: 16,
    color: COLORS.completedGreen,
    fontWeight: "bold",
  },
});
