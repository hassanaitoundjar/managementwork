import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback, useState } from "react";
import { Alert, Dimensions, ScrollView, StyleSheet, View } from "react-native";
import {
  Button,
  Card,
  FAB,
  Modal,
  Paragraph,
  Portal,
  Searchbar,
  Surface,
  Text,
  TextInput,
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
import { employeeStorage, generateId } from "../../utils/storage";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const isTablet = screenWidth >= 768;
const isLargeScreen = screenWidth >= 1024;

export default function EmployeesScreen() {
  const { paperTheme, isDark } = useTheme();
  const { t } = useLanguage();
  const componentColors = getComponentColors(isDark);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeStats, setEmployeeStats] = useState<EmployeeStats[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    dailyRate: "",
  });

  const loadEmployees = async () => {
    try {
      const employeeList = await employeeStorage.getAll();
      setEmployees(employeeList);

      // Calculate stats for each employee
      const stats = await Promise.all(
        employeeList.map((employee) => calculateEmployeeStats(employee))
      );
      setEmployeeStats(stats);
    } catch (error) {
      console.error("Error loading employees:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadEmployees();
    }, [])
  );

  const filteredEmployees = employees.filter((employee) =>
    employee.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resetForm = () => {
    setFormData({ name: "", dailyRate: "" });
    setEditingEmployee(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (employee: Employee) => {
    setFormData({
      name: employee.name,
      dailyRate: employee.dailyRate.toString(),
    });
    setEditingEmployee(employee);
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    resetForm();
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert(t("error"), t("nameRequired"));
      return;
    }

    const dailyRate = parseFloat(formData.dailyRate);
    if (isNaN(dailyRate) || dailyRate <= 0) {
      Alert.alert(t("error"), t("rateInvalid"));
      return;
    }

    try {
      if (editingEmployee) {
        // Update existing employee
        const updatedEmployee: Employee = {
          ...editingEmployee,
          name: formData.name.trim(),
          dailyRate,
        };
        await employeeStorage.update(updatedEmployee);
        Alert.alert(t("success"), t("employeeUpdated"));
      } else {
        // Add new employee
        const newEmployee: Employee = {
          id: generateId(),
          name: formData.name.trim(),
          dailyRate,
          createdAt: new Date().toISOString(),
        };
        await employeeStorage.add(newEmployee);
        Alert.alert(t("success"), t("employeeAdded"));
      }

      closeModal();
      await loadEmployees();
    } catch (error) {
      console.error("Error saving employee:", error);
      Alert.alert(t("error"), "Failed to save employee");
    }
  };

  const handleDelete = (employee: Employee) => {
    Alert.alert(t("deleteEmployee"), t("confirmDelete"), [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("delete"),
        style: "destructive",
        onPress: async () => {
          try {
            await employeeStorage.delete(employee.id);
            Alert.alert(t("success"), t("employeeDeleted"));
            await loadEmployees();
          } catch (error) {
            console.error("Error deleting employee:", error);
            Alert.alert(t("error"), "Failed to delete employee");
          }
        },
      },
    ]);
  };

  const openEmployeeCalendar = (employee: Employee) => {
    router.push({
      pathname: "/modal",
      params: { employeeId: employee.id, employeeName: employee.name },
    });
  };

  const renderEmployeeCard = (employee: Employee) => {
    const stats = employeeStats.find((s) => s.employeeId === employee.id);

    return (
      <Card
        key={employee.id}
        style={[
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
          <Card.Content style={styles.modernCardContent}>
            {/* Employee Header with Avatar */}
            <View style={styles.modernCardHeader}>
              <View style={styles.avatarContainer}>
                <LinearGradient
                  colors={BrandColors.gradientPrimary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.avatarGradient}
                >
                  <MaterialCommunityIcons
                    name="account"
                    size={28}
                    color="#ffffff"
                  />
                </LinearGradient>
              </View>

              <View style={styles.modernEmployeeInfo}>
                <Text
                  style={[
                    styles.modernEmployeeName,
                    { color: paperTheme.colors.onSurface },
                  ]}
                >
                  {employee.name}
                </Text>
                <View style={styles.rateContainer}>
                  <MaterialCommunityIcons
                    name="cash"
                    size={16}
                    color={paperTheme.colors.primary}
                  />
                  <Text
                    style={[
                      styles.modernDailyRate,
                      { color: paperTheme.colors.primary },
                    ]}
                  >
                    {formatCurrency(employee.dailyRate)}/day
                  </Text>
                </View>
              </View>
            </View>

            {/* Employee Stats */}
            <View
              style={[
                styles.employeeStats,
                {
                  backgroundColor: paperTheme.dark
                    ? "rgba(255, 255, 255, 0.05)"
                    : "rgba(255, 255, 255, 0.7)",
                },
              ]}
            >
              <View style={styles.statItem}>
                <MaterialCommunityIcons
                  name="calendar-check"
                  size={18}
                  color={paperTheme.colors.primary}
                />
                <Text
                  style={[
                    styles.statLabel,
                    { color: paperTheme.colors.onSurface },
                  ]}
                >
                  {t("thisMonth")}
                </Text>
                <Text
                  style={[
                    styles.statValue,
                    { color: paperTheme.colors.onSurface },
                  ]}
                >
                  {stats?.currentMonth.workDays || 0} days
                </Text>
              </View>
              <View
                style={[
                  styles.statDivider,
                  {
                    backgroundColor: paperTheme.dark
                      ? "rgba(255, 255, 255, 0.1)"
                      : "rgba(0, 0, 0, 0.1)",
                  },
                ]}
              />
              <View style={styles.statItem}>
                <MaterialCommunityIcons
                  name="trending-up"
                  size={18}
                  color="#10b981"
                />
                <Text
                  style={[
                    styles.statLabel,
                    { color: paperTheme.colors.onSurface },
                  ]}
                >
                  {t("earnings")}
                </Text>
                <Text
                  style={[
                    styles.statValue,
                    { color: paperTheme.colors.onSurface },
                  ]}
                >
                  {formatCurrency(stats?.currentMonth.totalEarnings || 0)}
                </Text>
              </View>
              <View
                style={[
                  styles.statDivider,
                  {
                    backgroundColor: paperTheme.dark
                      ? "rgba(255, 255, 255, 0.1)"
                      : "rgba(0, 0, 0, 0.1)",
                  },
                ]}
              />
              <View style={styles.statItem}>
                <MaterialCommunityIcons
                  name="cash-minus"
                  size={18}
                  color="#ef4444"
                />
                <Text
                  style={[
                    styles.statLabel,
                    { color: paperTheme.colors.onSurface },
                  ]}
                >
                  {t("advances")}
                </Text>
                <Text
                  style={[
                    styles.statValue,
                    { color: paperTheme.colors.onSurface },
                  ]}
                >
                  {formatCurrency(employee.advances || 0)}
                </Text>
              </View>
            </View>
          </Card.Content>

          {/* Modern Action Buttons */}
          <View style={styles.modernCardActions}>
            <Button
              mode="contained"
              onPress={() => openEmployeeCalendar(employee)}
              style={[styles.modernActionButton, styles.primaryButton]}
              icon="calendar"
              labelStyle={styles.primaryButtonText}
              buttonColor={paperTheme.colors.primary}
            >
              {t("workCalendar")}
            </Button>

            <View style={styles.secondaryActions}>
              <Button
                mode="outlined"
                onPress={() => openEditModal(employee)}
                style={[
                  styles.secondaryButton,
                  { borderColor: paperTheme.colors.outline },
                ]}
                icon="pencil"
                compact
                textColor={paperTheme.colors.primary}
              >
                {t("edit")}
              </Button>
              <Button
                mode="outlined"
                onPress={() => handleDelete(employee)}
                style={[
                  styles.secondaryButton,
                  styles.deleteButton,
                  { borderColor: "#fecaca" },
                ]}
                icon="delete"
                compact
                textColor="#ef4444"
              >
                {t("delete")}
              </Button>
            </View>
          </View>
        </LinearGradient>
      </Card>
    );
  };

  const renderEmptyState = () => (
    <Card style={styles.emptyCard} mode="elevated">
      <Card.Content style={styles.emptyContent}>
        <MaterialCommunityIcons
          name="account-plus"
          size={64}
          color={paperTheme.colors.onSurfaceVariant}
        />
        <Title style={styles.emptyTitle}>{t("noEmployees")}</Title>
        <Paragraph style={styles.emptyText}>{t("addFirstEmployee")}</Paragraph>
      </Card.Content>
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
                name="account-group"
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
                name="account-multiple"
                size={20}
                color={paperTheme.colors.primary}
              />
              <Text style={styles.statNumber}>{employees.length}</Text>
              <Text style={styles.headerStatLabel}>{t("totalEmployees")}</Text>
            </Surface>
          </View>
        </View>

        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>{t("manageYour")}</Text>
          <Text style={styles.dashboardTitle}>{t("employees")}</Text>
        </View>

        <Searchbar
          placeholder={t("searchEmployees")}
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.modernSearchbar}
          iconColor={BrandColors.primary}
        />
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {filteredEmployees.length === 0 ? (
          searchQuery ? (
            <Text style={styles.noResults}>No employees found</Text>
          ) : (
            renderEmptyState()
          )
        ) : (
          filteredEmployees.map(renderEmployeeCard)
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: BrandColors.primary }]}
        onPress={openAddModal}
        label={t("addEmployee")}
        mode="elevated"
      />

      <Portal>
        <Modal
          visible={showAddModal}
          onDismiss={closeModal}
          contentContainerStyle={[
            styles.modal,
            { backgroundColor: paperTheme.colors.surface },
          ]}
        >
          <Title
            style={[styles.modalTitle, { color: paperTheme.colors.onSurface }]}
          >
            {editingEmployee ? t("editEmployee") : t("addEmployee")}
          </Title>

          <TextInput
            label={t("employeeName")}
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            style={styles.input}
            mode="outlined"
            textColor={paperTheme.colors.onSurface}
          />

          <TextInput
            label={t("dailyRate")}
            value={formData.dailyRate}
            onChangeText={(text) =>
              setFormData({ ...formData, dailyRate: text })
            }
            style={styles.input}
            mode="outlined"
            keyboardType="numeric"
            left={<TextInput.Icon icon="cash" />}
            textColor={paperTheme.colors.onSurface}
          />

          <View style={styles.modalActions}>
            <Button
              onPress={closeModal}
              style={styles.modalButton}
              textColor={paperTheme.colors.onSurface}
            >
              {t("cancel")}
            </Button>
            <Button
              mode="contained"
              onPress={handleSave}
              style={styles.modalButton}
              buttonColor={paperTheme.colors.primary}
            >
              {t("save")}
            </Button>
          </View>
        </Modal>
      </Portal>
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
    marginBottom: 16,
  },
  searchbar: {
    marginBottom: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: isTablet ? 32 : 20,
    paddingTop: 0,
    maxWidth: isLargeScreen ? 1200 : "100%",
    alignSelf: isLargeScreen ? "center" : "stretch",
  },
  employeeCard: {
    marginBottom: isTablet ? 24 : 20,
    borderRadius: isTablet ? 24 : 20,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    backgroundColor: "#ffffff",
    overflow: "hidden",
    maxWidth: isLargeScreen ? 600 : "100%",
    alignSelf: isLargeScreen ? "center" : "stretch",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  employeeInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
  },
  employeeDetails: {
    marginLeft: 12,
    flex: 1,
  },
  employeeName: {
    fontSize: 18,
    marginBottom: 4,
  },
  dailyRate: {
    fontSize: 14,
    fontWeight: "600",
  },
  cardActions: {
    marginLeft: 12,
  },
  actionButton: {
    marginBottom: 8,
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
  noResults: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
  },
  modal: {
    margin: 20,
    padding: 20,
    borderRadius: 8,
  },
  modalTitle: {
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 20,
  },
  modalButton: {
    marginLeft: 8,
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
    marginBottom: 20,
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
  modernSearchbar: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 25,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  // Modern Card Design Styles
  cardGradient: {
    borderRadius: 20,
  },
  modernCardContent: {
    padding: 0,
  },
  modernCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: isTablet ? 24 : 20,
    paddingBottom: isTablet ? 20 : 16,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatarGradient: {
    width: isTablet ? 64 : 56,
    height: isTablet ? 64 : 56,
    borderRadius: isTablet ? 32 : 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: BrandColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  modernEmployeeInfo: {
    flex: 1,
  },
  modernEmployeeName: {
    fontSize: isTablet ? 24 : 20,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  rateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  modernDailyRate: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: "600",
    color: BrandColors.primary,
    marginLeft: 6,
  },
  employeeStats: {
    flexDirection: "row",
    paddingHorizontal: isTablet ? 24 : 20,
    paddingVertical: isTablet ? 20 : 16,
    backgroundColor: "rgba(102, 126, 234, 0.05)",
    marginHorizontal: isTablet ? 24 : 20,
    borderRadius: isTablet ? 20 : 16,
    marginBottom: isTablet ? 24 : 20,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    backgroundColor: "rgba(102, 126, 234, 0.2)",
    marginHorizontal: 12,
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
    marginTop: 4,
    textAlign: "center",
  },
  statValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1f2937",
    marginTop: 2,
    textAlign: "center",
  },
  modernCardActions: {
    paddingHorizontal: isTablet ? 24 : 20,
    paddingBottom: isTablet ? 24 : 20,
  },
  modernActionButton: {
    borderRadius: 16,
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: BrandColors.primary,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontWeight: "600",
  },
  secondaryActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  secondaryButton: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 12,
    borderColor: "#e5e7eb",
  },
  deleteButton: {
    borderColor: "#fecaca",
  },
});
