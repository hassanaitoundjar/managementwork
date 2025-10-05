import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useState } from "react";
import { Dimensions, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { Card, Surface, Text, Title } from "react-native-paper";
import { useFocusEffect } from "@react-navigation/native";
import { useLanguage } from "../../contexts/LanguageContext";
import { useTheme } from "../../contexts/ThemeContext";
import { Employee, EmployeeStats } from "../../types";
import { calculateEmployeeStats, formatCurrency } from "../../utils/calculations";
import { employeeStorage } from "../../utils/storage";

const { width: screenWidth } = Dimensions.get("window");
const isTablet = screenWidth >= 768;
const isLargeScreen = screenWidth >= 1024;

export default function ReportsScreen() {
  const { paperTheme } = useTheme();
  const { t } = useLanguage();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeStats, setEmployeeStats] = useState<EmployeeStats[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [totalStats, setTotalStats] = useState({
    totalEmployees: 0,
    totalWorkDays: 0,
    totalEarnings: 0,
    totalAdvances: 0,
    netEarnings: 0,
  });

  const loadData = useCallback(async () => {
    try {
      const employeeList = await employeeStorage.getAll();
      setEmployees(employeeList);

      const stats = await Promise.all(
        employeeList.map(employee => calculateEmployeeStats(employee))
      );
      setEmployeeStats(stats);

      // Calculate totals
      const totals = stats.reduce(
        (acc, stat) => ({
          totalEmployees: employeeList.length,
          totalWorkDays: acc.totalWorkDays + stat.currentMonth.workDays,
          totalEarnings: acc.totalEarnings + stat.currentMonth.totalEarnings,
          totalAdvances: acc.totalAdvances + (employees.find(e => e.id === stat.employeeId)?.advances || 0),
          netEarnings: acc.netEarnings + (stat.currentMonth.totalEarnings - (employees.find(e => e.id === stat.employeeId)?.advances || 0)),
        }),
        { totalEmployees: 0, totalWorkDays: 0, totalEarnings: 0, totalAdvances: 0, netEarnings: 0 }
      );
      setTotalStats(totals);
    } catch (error) {
      console.error("Error loading reports data:", error);
    }
  }, [employees]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const renderStatCard = (title: string, value: string, icon: string, color: string) => (
    <LinearGradient
      colors={paperTheme.dark 
        ? [paperTheme.colors.surface, paperTheme.colors.surfaceVariant] 
        : ["#ffffff", "#f8f9ff"]
      }
      style={[styles.statCard, isTablet && styles.statCardTablet]}
    >
      <View style={styles.statCardContent}>
        <View style={[styles.iconContainer, { backgroundColor: color }]}>
          <MaterialCommunityIcons name={icon as any} size={24} color="#ffffff" />
        </View>
        <View style={styles.statTextContainer}>
          <Text style={[styles.statValue, { color: paperTheme.colors.onSurface }]}>
            {value}
          </Text>
          <Text style={[styles.statTitle, { color: paperTheme.colors.onSurfaceVariant }]}>
            {title}
          </Text>
        </View>
      </View>
    </LinearGradient>
  );

  return (
    <View style={[styles.container, { backgroundColor: paperTheme.colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={["#667eea", "#764ba2", "#f093fb"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, isTablet && styles.headerTablet]}
      >
        <View style={styles.headerContent}>
          <View style={styles.brandSection}>
            <Surface style={styles.logoContainer} elevation={2}>
              <MaterialCommunityIcons name="chart-line" size={32} color="#667eea" />
            </Surface>
            <View style={styles.brandInfo}>
              <Text style={styles.companyName}>{t("companyName")}</Text>
              <Text style={styles.tagline}>Reports & Analytics</Text>
            </View>
          </View>
        </View>

        <View style={styles.welcomeSection}>
          <Text style={[styles.dashboardTitle, isTablet && styles.dashboardTitleTablet]}>
            REPORTS
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          isTablet && styles.scrollContentTablet,
          isLargeScreen && styles.scrollContentLarge,
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Overview Stats */}
        <View style={styles.statsGrid}>
          {renderStatCard(
            "Total Employees",
            totalStats.totalEmployees.toString(),
            "account-group",
            "#667eea"
          )}
          {renderStatCard(
            "Total Work Days",
            totalStats.totalWorkDays.toString(),
            "calendar-check",
            "#10b981"
          )}
          {renderStatCard(
            "Total Earnings",
            formatCurrency(totalStats.totalEarnings),
            "cash-multiple",
            "#f59e0b"
          )}
          {renderStatCard(
            "Net Earnings",
            formatCurrency(totalStats.netEarnings),
            "cash-check",
            "#8b5cf6"
          )}
        </View>

        {/* Employee Performance */}
        <Card style={[styles.performanceCard, isTablet && styles.performanceCardTablet]}>
          <Card.Content>
            <Title style={[styles.sectionTitle, { color: paperTheme.colors.onSurface }]}>
              Employee Performance (Current Month)
            </Title>
            {employeeStats.map((stat) => {
              const employee = employees.find(e => e.id === stat.employeeId);
              if (!employee) return null;
              
              return (
                <View key={stat.employeeId} style={styles.performanceItem}>
                  <View style={styles.performanceHeader}>
                    <Text style={[styles.employeeName, { color: paperTheme.colors.onSurface }]}>
                      {employee.name}
                    </Text>
                    <Text style={[styles.dailyRate, { color: paperTheme.colors.primary }]}>
                      {formatCurrency(employee.dailyRate)}/day
                    </Text>
                  </View>
                  <View style={styles.performanceStats}>
                    <View style={styles.performanceStat}>
                      <MaterialCommunityIcons 
                        name="calendar-check" 
                        size={16} 
                        color={paperTheme.colors.secondary} 
                      />
                      <Text style={[styles.performanceStatText, { color: paperTheme.colors.onSurface }]}>
                        {stat.currentMonth.workDays} days
                      </Text>
                    </View>
                    <View style={styles.performanceStat}>
                      <MaterialCommunityIcons 
                        name="cash" 
                        size={16} 
                        color="#10b981" 
                      />
                      <Text style={[styles.performanceStatText, { color: paperTheme.colors.onSurface }]}>
                        {formatCurrency(stat.currentMonth.totalEarnings)}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerTablet: {
    paddingTop: 80,
    paddingBottom: 40,
    paddingHorizontal: 40,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  brandInfo: {
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
  tagline: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: 2,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  welcomeSection: {
    alignItems: "center",
  },
  dashboardTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffffff",
    letterSpacing: 2,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  dashboardTitleTablet: {
    fontSize: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  scrollContentTablet: {
    padding: 32,
  },
  scrollContentLarge: {
    maxWidth: 1200,
    alignSelf: "center",
    width: "100%",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  statCard: {
    width: "48%",
    marginBottom: 16,
    borderRadius: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  statCardTablet: {
    borderRadius: 24,
  },
  statCardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  statTextContainer: {
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    fontWeight: "500",
  },
  performanceCard: {
    borderRadius: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  performanceCardTablet: {
    borderRadius: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  performanceItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  performanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: "600",
  },
  dailyRate: {
    fontSize: 14,
    fontWeight: "500",
  },
  performanceStats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  performanceStat: {
    flexDirection: "row",
    alignItems: "center",
  },
  performanceStatText: {
    fontSize: 14,
    marginLeft: 6,
  },
});
