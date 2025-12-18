import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRoute, RouteProp } from "@react-navigation/native";
import { TrainingPlan } from "../types/trainingplan";
import { useApiClient } from "../hooks/useApiClient";

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
  templateCBg: "#f0e6ff",
  templateCBorder: "#9b59b6",
  templateCText: "#9b59b6",
  templateCCircle: "#9b59b6",
  templateDBg: "#e6fff2",
  templateDBorder: "#27ae60",
  templateDText: "#27ae60",
  templateDCircle: "#27ae60",
  templateEBg: "#ffe6f0",
  templateEBorder: "#e74c3c",
  templateEText: "#e74c3c",
  templateECircle: "#e74c3c",
  templateFBg: "#fff0e6",
  templateFBorder: "#e67e22",
  templateFText: "#e67e22",
  templateFCircle: "#e67e22",
  templateGBg: "#e6f7ff",
  templateGBorder: "#16a085",
  templateGText: "#16a085",
  templateGCircle: "#16a085",
  restBg: "#f5f5f5",
  restBorder: "#d0d0d0",
  restText: "#999999",
  sectionTitle: "#1a1d2e",
  exerciseText: "#666666",
  setsText: "#4a90e2",
  errorText: "#FF3B30",
};

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

export default function TrainingPlanScreen() {
  const route = useRoute<TrainingPlanScreenRouteProp>();
  const { backendUrl } = route.params;
  const apiClient = useApiClient();

  const [plan, setPlan] = useState<TrainingPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPlan = async () => {
    try {
      setLoading(true);
      setError(null);
      const apiUrl = `${backendUrl}/api/v1/training-plan`;
      const fetchedPlan = await apiClient.fetchJson<TrainingPlan>(apiUrl, {
        method: "GET",
      });
      setPlan(fetchedPlan);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch training plan",
      );
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPlan();
    setRefreshing(false);
  };

  useEffect(() => {
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
    // Cycle through all color schemes (A, B, C, D, E, F, G)
    const colorSchemes = [
      {
        bg: COLORS.templateABg,
        border: COLORS.templateABorder,
        text: COLORS.templateAText,
        circle: COLORS.templateACircle,
      },
      {
        bg: COLORS.templateBBg,
        border: COLORS.templateBBorder,
        text: COLORS.templateBText,
        circle: COLORS.templateBCircle,
      },
      {
        bg: COLORS.templateCBg,
        border: COLORS.templateCBorder,
        text: COLORS.templateCText,
        circle: COLORS.templateCCircle,
      },
      {
        bg: COLORS.templateDBg,
        border: COLORS.templateDBorder,
        text: COLORS.templateDText,
        circle: COLORS.templateDCircle,
      },
      {
        bg: COLORS.templateEBg,
        border: COLORS.templateEBorder,
        text: COLORS.templateEText,
        circle: COLORS.templateECircle,
      },
      {
        bg: COLORS.templateFBg,
        border: COLORS.templateFBorder,
        text: COLORS.templateFText,
        circle: COLORS.templateFCircle,
      },
      {
        bg: COLORS.templateGBg,
        border: COLORS.templateGBorder,
        text: COLORS.templateGText,
        circle: COLORS.templateGCircle,
      },
    ];
    return colorSchemes[templateIndex % colorSchemes.length];
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
    const isRest = templateIndex === -1;
    const dayName = DAYS[dayIndex % 7];

    if (isRest) {
      return (
        <View key={dayIndex} style={[styles.dayBox, styles.restDayBox]}>
          <Text style={styles.dayLetter}>{dayName}</Text>
        </View>
      );
    }

    const colors = getTemplateColors(templateIndex);

    return (
      <View
        key={dayIndex}
        style={[
          styles.dayBox,
          { backgroundColor: colors.bg, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.dayLetter, { color: colors.text }]}>
          {dayName}
        </Text>
      </View>
    );
  };

  const renderTemplateCard = (
    template: TrainingPlan["templates"][0],
    index: number,
  ) => {
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
          <View
            style={[styles.templateCircle, { backgroundColor: colors.circle }]}
          >
            <Text style={styles.templateCircleLetter}>{letter}</Text>
          </View>
          <View style={styles.templateInfo}>
            <Text style={styles.templateName}>{template.name}</Text>
            <Text style={styles.templateExercises}>
              {template.exercises.map((ex) => ex.name).join(" • ")}
            </Text>
            {template.description && (
              <Text style={styles.templateDescription}>
                {template.description}
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
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
        {plan.templates.map((template, index) =>
          renderTemplateCard(template, index),
        )}
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
    justifyContent: "center",
    minHeight: 60,
  },
  restDayBox: {
    backgroundColor: COLORS.restBg,
    borderColor: COLORS.restBorder,
  },
  dayLetter: {
    fontSize: 20,
    fontWeight: "bold",
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
