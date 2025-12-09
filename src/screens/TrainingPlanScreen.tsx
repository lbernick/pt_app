import { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { useRoute, RouteProp } from "@react-navigation/native";
import { TrainingPlan } from "../types/trainingplan";
import { getTrainingPlan } from "../services/trainingPlanApi";

type TrainingPlanScreenRouteProp = RouteProp<
  { TrainingPlan: { backendUrl: string } },
  "TrainingPlan"
>;

const COLORS = {
  background: "#f5f5f5",
  headerBg: "#1a1d2e",
  headerText: "#ffffff",
  headerSubtext: "#a0a5b8",
  cardBg: "#ffffff",
  templateABg: "#e8f1ff",
  templateABorder: "#4a90e2",
  templateAText: "#4a90e2",
  templateACircle: "#4a90e2",
  templateBBg: "#fff4e6",
  templateBBorder: "#f5a623",
  templateBText: "#f5a623",
  templateBCircle: "#f5a623",
  restBg: "#f5f5f5",
  restBorder: "#d0d0d0",
  restText: "#999999",
  sectionTitle: "#1a1d2e",
  exerciseText: "#666666",
  setsText: "#4a90e2",
  errorText: "#FF3B30",
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function TrainingPlanScreen() {
  const route = useRoute<TrainingPlanScreenRouteProp>();
  const { backendUrl } = route.params;

  const [plan, setPlan] = useState<TrainingPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedPlan = await getTrainingPlan(backendUrl);
        setPlan(fetchedPlan);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch training plan"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [backendUrl]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading your training plan...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  if (!plan) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>No training plan found</Text>
      </View>
    );
  }

  // Get template letter (A, B, C, etc.)
  const getTemplateLetter = (templateIndex: number) => {
    return String.fromCharCode(65 + templateIndex); // 65 is 'A'
  };

  // Get colors for a template
  const getTemplateColors = (templateIndex: number) => {
    // Alternate between A and B color schemes
    const colorScheme = templateIndex % 2 === 0 ? "A" : "B";
    if (colorScheme === "A") {
      return {
        bg: COLORS.templateABg,
        border: COLORS.templateABorder,
        text: COLORS.templateAText,
        circle: COLORS.templateACircle,
      };
    }
    return {
      bg: COLORS.templateBBg,
      border: COLORS.templateBBorder,
      text: COLORS.templateBText,
      circle: COLORS.templateBCircle,
    };
  };

  // Split microcycle into rows of 7 days
  const getMicrocycleRows = () => {
    const rows = [];
    for (let i = 0; i < plan.microcycle.length; i += 7) {
      rows.push(plan.microcycle.slice(i, i + 7));
    }
    return rows;
  };

  const renderDayBox = (dayIndex: number, templateIndex: number) => {
    const template = templateIndex !== -1 ? plan.templates[templateIndex] : null;
    const isRest = templateIndex === -1;
    const dayName = DAYS[dayIndex % 7];

    if (isRest) {
      return (
        <View key={dayIndex} style={[styles.dayBox, styles.restDayBox]}>
          <Text style={styles.dayName}>{dayName}</Text>
          <Text style={styles.restText}>Rest</Text>
          <Text style={styles.restSubtext}>Recovery</Text>
        </View>
      );
    }

    const colors = getTemplateColors(templateIndex);
    const letter = getTemplateLetter(templateIndex);

    return (
      <View
        key={dayIndex}
        style={[
          styles.dayBox,
          { backgroundColor: colors.bg, borderColor: colors.border },
        ]}
      >
        <Text style={styles.dayName}>{dayName}</Text>
        <Text style={[styles.templateLetter, { color: colors.text }]}>
          {letter}
        </Text>
        <Text style={styles.daySubtext}>
          {template?.exercises.length || 0} lifts
        </Text>
      </View>
    );
  };

  const renderTemplateCard = (template: TrainingPlan["templates"][0], index: number) => {
    const colors = getTemplateColors(index);
    const letter = getTemplateLetter(index);

    return (
      <View
        key={template.id}
        style={[
          styles.templateCard,
          { backgroundColor: colors.bg, borderColor: colors.border },
        ]}
      >
        <View style={styles.templateHeader}>
          <View style={[styles.templateCircle, { backgroundColor: colors.circle }]}>
            <Text style={styles.templateCircleLetter}>{letter}</Text>
          </View>
          <View style={styles.templateInfo}>
            <Text style={styles.templateName}>{template.name}</Text>
            <Text style={styles.templateExercises}>
              {template.exercises.map(ex => ex.name).join(" • ")}
            </Text>
            {template.description && (
              <Text style={styles.templateDescription}>{template.description}</Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Training Plan</Text>
        {plan.description && (
          <Text style={styles.headerSubtitle}>{plan.description}</Text>
        )}
      </View>

      {/* Weekly Rotation */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Weekly Rotation</Text>
        {getMicrocycleRows().map((row, rowIndex) => (
          <View key={rowIndex} style={styles.weekRow}>
            {row.map((templateIndex, dayInRow) => {
              const dayIndex = rowIndex * 7 + dayInRow;
              return renderDayBox(dayIndex, templateIndex);
            })}
          </View>
        ))}
      </View>

      {/* Workouts at a Glance */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Workouts at a Glance</Text>
        {plan.templates.map((template, index) => renderTemplateCard(template, index))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.headerBg,
    padding: 24,
    paddingTop: 32,
    paddingBottom: 32,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.headerText,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.headerSubtext,
    lineHeight: 22,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.sectionTitle,
    marginBottom: 16,
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  dayBox: {
    flex: 1,
    marginHorizontal: 4,
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    minHeight: 90,
  },
  restDayBox: {
    backgroundColor: COLORS.restBg,
    borderColor: COLORS.restBorder,
  },
  dayName: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.sectionTitle,
    marginBottom: 8,
  },
  templateLetter: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  daySubtext: {
    fontSize: 11,
    color: COLORS.exerciseText,
  },
  restText: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.restText,
    marginBottom: 2,
  },
  restSubtext: {
    fontSize: 11,
    color: COLORS.restText,
  },
  templateCard: {
    borderRadius: 12,
    borderWidth: 2,
    padding: 16,
    marginBottom: 12,
  },
  templateHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  templateCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  templateCircleLetter: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.headerText,
  },
  templateInfo: {
    flex: 1,
  },
  templateName: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.sectionTitle,
    marginBottom: 6,
  },
  templateExercises: {
    fontSize: 14,
    color: COLORS.exerciseText,
    marginBottom: 6,
  },
  templateDescription: {
    fontSize: 12,
    color: COLORS.setsText,
    fontWeight: "600",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.exerciseText,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.errorText,
    textAlign: "center",
  },
});
