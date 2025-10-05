import { StyleSheet } from "react-native";

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback, useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import {
  Card,
  Divider,
  FAB,
  Paragraph,
  Surface,
  Text,
  Title,
} from "react-native-paper";
import { useLanguage } from "../../contexts/LanguageContext";
import { useTheme } from "../../contexts/ThemeContext";
import { Employee, EmployeeStats } from "../../types";
import { BrandColors, getComponentColors } from "../../constants/colors";
import {
  calculateEmployeeStats,
  formatCurrency,
} from "../../utils/calculations";
import { employeeStorage } from "../../utils/storage";

export default function HomeScreen() {
  const { paperTheme, isDark } = useTheme();
  const { t } = useLanguage();
  const componentColors = getComponentColors(isDark);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeStats, setEmployeeStats] = useState<EmployeeStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const employeeList = await employeeStorage.getAll();
      setEmployees(employeeList);

      // Calculate stats for each employee
      const stats = await Promise.all(
        employeeList.map((employee) => calculateEmployeeStats(employee))
      );
      setEmployeeStats(stats);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const renderEmployeeCard = (employee: Employee) => {
    const stats = employeeStats.find((s) => s.employeeId === employee.id);

    return (
      <Card
        key={employee.id}
        style={[
          styles.employeeCard,
          { backgroundColor: paperTheme.colors.surface },
        ]}
        mode="elevated"
      >
        <LinearGradient
          colors={componentColors.card.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          <Card.Content>
            <View style={styles.cardHeader}>
              <View style={styles.employeeInfo}>
                <MaterialCommunityIcons
                  name="account"
                  size={24}
                  color={paperTheme.colors.primary}
                />
                <Title
                  style={[
                    styles.employeeName,
                    { color: paperTheme.colors.onSurface },
                  ]}
                >
                  {employee.name}
                </Title>
              </View>
              <Text
                style={[styles.dailyRate, { color: paperTheme.colors.primary }]}
              >
                {formatCurrency(employee.dailyRate)}/{t("day")}
              </Text>
            </View>

            <Divider
              style={[
                styles.divider,
                {
                  backgroundColor: paperTheme.dark
                    ? "rgba(255, 255, 255, 0.1)"
                    : "rgba(0, 0, 0, 0.1)",
                },
              ]}
            />

            <View style={styles.statsContainer}>
              <View style={styles.statColumn}>
                <Text
                  style={[
                    styles.statLabel,
                    { color: paperTheme.colors.onSurface },
                  ]}
                >
                  {t("last15Days")}
                </Text>
                <View style={styles.statRow}>
                  <MaterialCommunityIcons
                    name="calendar-check"
                    size={16}
                    color={paperTheme.colors.secondary}
                  />
                  <Text
                    style={[
                      styles.statValue,
                      { color: paperTheme.colors.onSurface },
                    ]}
                  >
                    {stats?.last15Days.workDays || 0}{" "}
                    {t("workDays").toLowerCase()}
                  </Text>
                </View>
                <View style={styles.statRow}>
                  <MaterialCommunityIcons
                    name="cash"
                    size={16}
                    color={paperTheme.colors.tertiary}
                  />
                  <Text
                    style={[
                      styles.statValue,
                      { color: paperTheme.colors.onSurface },
                    ]}
                  >
                    {formatCurrency(stats?.last15Days.totalEarnings || 0)}
                  </Text>
                </View>
              </View>

              <View style={styles.statColumn}>
                <Text
                  style={[
                    styles.statLabel,
                    { color: paperTheme.colors.onSurface },
                  ]}
                >
                  {t("currentMonth")}
                </Text>
                <View style={styles.statRow}>
                  <MaterialCommunityIcons
                    name="calendar-month"
                    size={16}
                    color={paperTheme.colors.secondary}
                  />
                  <Text
                    style={[
                      styles.statValue,
                      { color: paperTheme.colors.onSurface },
                    ]}
                  >
                    {stats?.currentMonth.workDays || 0}{" "}
                    {t("workDays").toLowerCase()}
                  </Text>
                </View>
                <View style={styles.statRow}>
                  <MaterialCommunityIcons
                    name="cash-multiple"
                    size={16}
                    color={paperTheme.colors.tertiary}
                  />
                  <Text
                    style={[
                      styles.statValue,
                      { color: paperTheme.colors.onSurface },
                    ]}
                  >
                    {formatCurrency(stats?.currentMonth.totalEarnings || 0)}
                  </Text>
                </View>
                <View style={styles.statRow}>
                  <MaterialCommunityIcons
                    name="cash-minus"
                    size={16}
                    color={paperTheme.colors.error}
                  />
                  <Text
                    style={[
                      styles.statValue,
                      { color: paperTheme.colors.error },
                    ]}
                  >
                    -{formatCurrency(employee.advances || 0)}{" "}
                    {t("advancesGiven").toLowerCase()}
                  </Text>
                </View>
                <View style={styles.statRow}>
                  <MaterialCommunityIcons
                    name="cash-check"
                    size={16}
                    color={paperTheme.colors.secondary}
                  />
                  <Text
                    style={[
                      styles.statValue,
                      {
                        color: paperTheme.colors.secondary,
                        fontWeight: "bold",
                      },
                    ]}
                  >
                    {formatCurrency(
                      (stats?.currentMonth.totalEarnings || 0) -
                        (employee.advances || 0)
                    )}{" "}
                    {t("netEarnings").toLowerCase()}
                  </Text>
                </View>
              </View>
            </View>
          </Card.Content>
        </LinearGradient>
      </Card>
    );
  };

  const renderEmptyState = () => (
    <Card
      style={[styles.emptyCard, { backgroundColor: paperTheme.colors.surface }]}
      mode="elevated"
    >
      <LinearGradient
        colors={
          paperTheme.dark
            ? [paperTheme.colors.surface, paperTheme.colors.surfaceVariant]
            : ["#ffffff", "#f8f9ff"]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGradient}
      >
        <Card.Content style={styles.emptyContent}>
          <MaterialCommunityIcons
            name="account-plus"
            size={64}
            color={paperTheme.colors.onSurfaceVariant}
          />
          <Title
            style={[styles.emptyTitle, { color: paperTheme.colors.onSurface }]}
          >
            {t("noEmployees")}
          </Title>
          <Paragraph
            style={[
              styles.emptyText,
              { color: paperTheme.colors.onSurfaceVariant },
            ]}
          >
            {t("addFirstEmployee")}
          </Paragraph>
        </Card.Content>
      </LinearGradient>
    </Card>
  );

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: paperTheme.colors.background },
      ]}
    >
      {/* Modern Header with Company Branding */}
      <LinearGradient
        colors={BrandColors.gradientFull}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.modernHeader}
      >
        <View style={styles.headerContent}>
          <View style={styles.brandSection}>
            <View style={styles.logoContainer}>
              <MaterialCommunityIcons
                name="office-building"
                size={32}
                color="#ffffff"
              />
            </View>
            <View style={styles.brandText}>
              <Text style={styles.companyName}>{t("companyName")}</Text>
              <Text style={styles.companyTagline}>
                {t("employeeManagement")}
              </Text>
            </View>
          </View>

          <View style={styles.headerStats}>
            <Surface style={styles.statCard} elevation={2}>
              <MaterialCommunityIcons
                name="account-group"
                size={20}
                color={paperTheme.colors.primary}
              />
              <Text style={styles.statNumber}>{employees.length}</Text>
              <Text style={styles.headerStatLabel}>{t("employees")}</Text>
            </Surface>
          </View>
        </View>

        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>{t("welcomeTo")}</Text>
          <Text style={styles.dashboardTitle}>{t("dashboard")}</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {employees.length === 0
          ? renderEmptyState()
          : employees.map(renderEmployeeCard)}
      </ScrollView>

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: BrandColors.primary }]}
        onPress={() => router.push("/(tabs)/employees")}
        label={t("addEmployee")}
        mode="elevated"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 0,
  },
  employeeCard: {
    marginBottom: 20,
    borderRadius: 20,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    backgroundColor: "#ffffff",
    overflow: "hidden",
  },
  cardGradient: {
    borderRadius: 20,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  employeeInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  employeeName: {
    marginLeft: 8,
    fontSize: 18,
    flex: 1,
  },
  dailyRate: {
    fontSize: 14,
    fontWeight: "600",
  },
  divider: {
    marginVertical: 12,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statColumn: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  statValue: {
    marginLeft: 6,
    fontSize: 14,
  },
  emptyCard: {
    marginTop: 40,
  },
  emptyContent: {
    alignItems: "center",
    padding: 20,
  },
  emptyTitle: {
    marginTop: 16,
    textAlign: "center",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 8,
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
  },
  // Modern 2025 Design Styles
  modernHeader: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  brandSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  brandText: {
    flex: 1,
  },
  companyName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    letterSpacing: 1,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  companyTagline: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: 2,
    fontWeight: "500",
  },
  headerStats: {
    alignItems: "flex-end",
  },
  statCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    minWidth: 80,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 4,
  },
  headerStatLabel: {
    fontSize: 11,
    color: "#666",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  welcomeSection: {
    alignItems: "center",
  },
  welcomeText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "400",
  },
  dashboardTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffffff",
    textTransform: "uppercase",
    letterSpacing: 2,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
});
