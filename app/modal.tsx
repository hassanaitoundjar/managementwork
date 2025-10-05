import { Link } from "expo-router";
import { StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Calendar, DateData } from "react-native-calendars";
import {
  Button,
  Card,
  Checkbox,
  Chip,
  Modal,
  Portal,
  TextInput,
  Title,
} from "react-native-paper";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";
import { Client, Employee, WorkRecord } from "../types";
import { calculateMonthlyStats, formatCurrency } from "../utils/calculations";
import {
  clientStorage,
  employeeStorage,
  generateId,
  workRecordStorage,
} from "../utils/storage";

// Simple modal component (not used)
function ModalScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">This is a modal</ThemedText>
      <Link href="/" dismissTo style={styles.link}>
        <ThemedText type="link">Go to home screen</ThemedText>
      </Link>
    </ThemedView>
  );
}

// Styles moved to bottom of file

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const isTablet = screenWidth >= 768;
const isLargeScreen = screenWidth >= 1024;

export default function EmployeeCalendarModal() {
  const { paperTheme } = useTheme();
  const { t } = useLanguage();
  const { employeeId, employeeName } = useLocalSearchParams();

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [workRecords, setWorkRecords] = useState<WorkRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [showWorkDayModal, setShowWorkDayModal] = useState(false);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [isAbsence, setIsAbsence] = useState(false);
  const [currentMonth, setCurrentMonth] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
  });
  const [monthlyStats, setMonthlyStats] = useState<any>(null);
  const [showAdvanceModal, setShowAdvanceModal] = useState(false);
  const [advanceAmount, setAdvanceAmount] = useState("");
  const [clientHours, setClientHours] = useState<{
    [clientId: string]: string;
  }>({});

  useEffect(() => {
    loadData();
  }, [employeeId]);

  useEffect(() => {
    if (employee) {
      loadMonthlyStats();
    }
  }, [employee, currentMonth, workRecords]);

  const loadData = async () => {
    try {
      if (typeof employeeId === "string") {
        const emp = await employeeStorage.getById(employeeId);
        setEmployee(emp);

        const clientList = await clientStorage.getAll();
        console.log("Loaded clients:", clientList.length, clientList);
        setClients(clientList);

        const records = await workRecordStorage.getByEmployee(employeeId);
        setWorkRecords(records);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const loadMonthlyStats = async () => {
    if (employee) {
      try {
        const stats = await calculateMonthlyStats(
          employee,
          currentMonth.year,
          currentMonth.month
        );
        setMonthlyStats(stats);
      } catch (error) {
        console.error("Error loading monthly stats:", error);
      }
    }
  };

  const getMarkedDates = () => {
    const marked: { [key: string]: any } = {};

    workRecords.forEach((record) => {
      if (record.isAbsence) {
        marked[record.date] = {
          selected: true,
          selectedColor: paperTheme.colors.error,
          selectedTextColor: "#ffffff",
          customStyles: {
            container: {
              backgroundColor: paperTheme.colors.error,
              borderRadius: 8,
            },
            text: {
              color: "#ffffff",
              fontWeight: "bold",
            },
          },
        };
      } else if (record.clientIds.length > 0) {
        const clientCount = record.clientIds.length;
        const multipleClients = clientCount > 1;

        marked[record.date] = {
          selected: true,
          selectedColor: multipleClients
            ? paperTheme.colors.tertiary
            : paperTheme.colors.primary,
          selectedTextColor: "#ffffff",
          customStyles: {
            container: {
              backgroundColor: multipleClients
                ? paperTheme.colors.tertiary
                : paperTheme.colors.primary,
              borderRadius: 8,
              borderWidth: multipleClients ? 2 : 0,
              borderColor: paperTheme.colors.secondary,
            },
            text: {
              color: "#ffffff",
              fontWeight: "bold",
              fontSize: multipleClients ? 12 : 14,
            },
          },
          dots: multipleClients
            ? Array.from({ length: Math.min(clientCount, 3) }, (_, i) => ({
                color: paperTheme.colors.surface,
                selectedDotColor: paperTheme.colors.surface,
              }))
            : undefined,
        };
      }
    });

    if (selectedDate) {
      marked[selectedDate] = {
        ...marked[selectedDate],
        marked: true,
        dotColor: paperTheme.colors.secondary,
      };
    }

    return marked;
  };

  const onDayPress = (day: DateData) => {
    console.log(
      "Day pressed:",
      day.dateString,
      "Clients available:",
      clients.length
    );
    setSelectedDate(day.dateString);
    const existingRecord = workRecords.find(
      (record) => record.date === day.dateString
    );

    if (existingRecord) {
      setSelectedClients(existingRecord.clientIds);
      setIsAbsence(existingRecord.isAbsence);

      // Load existing client hours
      if (existingRecord.clientHours) {
        const hoursStrings: { [clientId: string]: string } = {};
        Object.entries(existingRecord.clientHours).forEach(
          ([clientId, hours]) => {
            hoursStrings[clientId] = hours.toString();
          }
        );
        setClientHours(hoursStrings);
      } else {
        setClientHours({});
      }

      console.log("Existing record found:", existingRecord);
    } else {
      setSelectedClients([]);
      setIsAbsence(false);
      setClientHours({});
      console.log("No existing record, creating new");
    }

    console.log("Selected date for inline editing:", day.dateString);
  };

  const toggleClientSelection = (clientId: string) => {
    setSelectedClients((prev) =>
      prev.includes(clientId)
        ? prev.filter((id) => id !== clientId)
        : [...prev, clientId]
    );
  };

  const handleAdvancePayment = async () => {
    if (!employee || !advanceAmount || isNaN(Number(advanceAmount))) {
      Alert.alert("Error", "Please enter a valid advance amount");
      return;
    }

    try {
      const amount = Number(advanceAmount);
      const currentAdvances = employee.advances || 0;
      const updatedEmployee = {
        ...employee,
        advances: currentAdvances + amount,
      };

      await employeeStorage.update(updatedEmployee);
      setEmployee(updatedEmployee);
      setAdvanceAmount("");
      setShowAdvanceModal(false);

      Alert.alert(
        "Success",
        `Advance of ${formatCurrency(amount)} added to ${employee.name}`
      );

      loadMonthlyStats(); // Refresh stats to show updated net earnings
    } catch (error) {
      console.error("Error adding advance:", error);
      Alert.alert("Error", "Failed to add advance payment");
    }
  };

  const handleSaveWorkDay = async () => {
    if (!selectedDate || !employee) return;

    try {
      const existingRecord = workRecords.find(
        (record) => record.date === selectedDate
      );

      if (isAbsence || selectedClients.length > 0) {
        // Convert client hours to numbers
        const hoursData: { [clientId: string]: number } = {};
        selectedClients.forEach((clientId) => {
          const hours = clientHours[clientId];
          if (hours && !isNaN(Number(hours))) {
            hoursData[clientId] = Number(hours);
          }
        });

        const workRecord: WorkRecord = {
          id: existingRecord?.id || generateId(),
          employeeId: employee.id,
          date: selectedDate,
          clientIds: isAbsence ? [] : selectedClients,
          clientHours: isAbsence ? undefined : hoursData,
          isAbsence,
          createdAt: existingRecord?.createdAt || new Date().toISOString(),
        };

        if (existingRecord) {
          await workRecordStorage.update(workRecord);
        } else {
          await workRecordStorage.add(workRecord);
        }

        Alert.alert(t("success"), t("workDayUpdated"));
      } else if (existingRecord) {
        // Remove the record if no clients selected and not an absence
        await workRecordStorage.delete(existingRecord.id);
        Alert.alert(t("success"), "Work day removed");
      }

      // Handle advance payment if entered
      if (
        advanceAmount &&
        !isNaN(Number(advanceAmount)) &&
        Number(advanceAmount) > 0
      ) {
        const amount = Number(advanceAmount);
        const currentAdvances = employee.advances || 0;
        const updatedEmployee = {
          ...employee,
          advances: currentAdvances + amount,
        };
        await employeeStorage.update(updatedEmployee);
        setEmployee(updatedEmployee);
        Alert.alert(
          "Success",
          `Work day saved and advance of ${formatCurrency(amount)} added`
        );
      } else {
        Alert.alert("Success", "Work day saved");
      }

      console.log("Saved work day, clearing selection");
      setSelectedDate("");
      setSelectedClients([]);
      setIsAbsence(false);
      setAdvanceAmount("");
      setClientHours({});
      loadData();
      loadMonthlyStats();
    } catch (error) {
      console.error("Error saving work day:", error);
      Alert.alert(t("error"), "Failed to save work day");
    }
  };

  const renderWorkDayModal = () => (
    <Portal>
      <Modal
        visible={showWorkDayModal}
        onDismiss={() => {
          console.log("Modal dismissed");
          setShowWorkDayModal(false);
        }}
        dismissable={true}
        dismissableBackButton={true}
        style={styles.modalOverlay}
        contentContainerStyle={[
          styles.modal,
          {
            backgroundColor: paperTheme.colors.surface,
            elevation: 10,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
          },
        ]}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <Title style={styles.modalTitle}>
            {selectedDate} - {t("addWorkDay")}
          </Title>

          <View style={styles.toggleContainer}>
            <Button
              mode={!isAbsence ? "contained" : "outlined"}
              onPress={() => setIsAbsence(false)}
              style={styles.toggleButton}
              icon="briefcase"
            >
              {t("workDay")}
            </Button>
            <Button
              mode={isAbsence ? "contained" : "outlined"}
              onPress={() => setIsAbsence(true)}
              style={styles.toggleButton}
              icon="calendar-remove"
            >
              {t("markAbsence")}
            </Button>
          </View>

          {!isAbsence && (
            <View style={styles.clientSelection}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text style={styles.sectionTitle}>
                  {t("selectClients")} ({clients.length})
                </Text>
                <Button
                  mode="outlined"
                  compact
                  onPress={loadData}
                  icon="refresh"
                >
                  Refresh
                </Button>
              </View>
              <View style={styles.chipContainer}>
                {clients.map((client) => {
                  console.log(
                    "Rendering client:",
                    client.name,
                    "Selected:",
                    selectedClients.includes(client.id)
                  );
                  return (
                    <Chip
                      key={client.id}
                      selected={selectedClients.includes(client.id)}
                      onPress={() => {
                        console.log("Client chip pressed:", client.name);
                        toggleClientSelection(client.id);
                      }}
                      style={styles.clientChip}
                      icon="briefcase"
                    >
                      {client.name}
                    </Chip>
                  );
                })}
              </View>
              {clients.length === 0 && (
                <View style={styles.noClientsContainer}>
                  <Text style={styles.noClientsText}>
                    No clients available. Add clients first.
                  </Text>
                  <Button
                    mode="contained"
                    onPress={() => {
                      setShowWorkDayModal(false);
                      router.push("/(tabs)/clients");
                    }}
                    style={{ marginTop: 10 }}
                    icon="plus"
                  >
                    Add Clients
                  </Button>
                </View>
              )}
            </View>
          )}

          <View style={styles.modalActions}>
            <Button
              onPress={() => {
                console.log("Cancel button pressed");
                setShowWorkDayModal(false);
              }}
              style={styles.modalButton}
            >
              {t("cancel")}
            </Button>
            <Button
              mode="contained"
              onPress={handleSaveWorkDay}
              style={styles.modalButton}
            >
              {t("save")}
            </Button>
          </View>
        </ScrollView>
      </Modal>
    </Portal>
  );

  if (!employee) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: paperTheme.colors.background },
        ]}
      >
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: paperTheme.colors.background },
      ]}
    >
      {/* Modern Header with Gradient */}
      <LinearGradient
        colors={["#667eea", "#764ba2", "#f093fb"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.modernHeader}
      >
        <View style={styles.headerContent}>
          {/* Back Button Section */}
          <View style={styles.headerTop}>
            <TouchableOpacity
              onPress={() => {
                console.log("Back button pressed - navigating back");
                router.back();
              }}
              style={styles.perfectBackButton}
            >
              <MaterialCommunityIcons
                name="arrow-left"
                size={24}
                color="#ffffff"
              />
              <Text style={styles.perfectBackText}>Back</Text>
            </TouchableOpacity>
          </View>

          {/* Employee Info Section */}
          <View style={styles.perfectEmployeeSection}>
            <View style={styles.perfectAvatarContainer}>
              <LinearGradient
                colors={["#ffffff", "rgba(255, 255, 255, 0.8)"]}
                style={styles.perfectAvatar}
              >
                <MaterialCommunityIcons
                  name="account"
                  size={isTablet ? 36 : 30}
                  color="#667eea"
                />
              </LinearGradient>
            </View>
            <View style={styles.perfectEmployeeInfo}>
              <Text style={styles.perfectEmployeeName}>{employee.name}</Text>
              <View style={styles.perfectSubtitleContainer}>
                <MaterialCommunityIcons
                  name="calendar-account"
                  size={16}
                  color="rgba(255, 255, 255, 0.9)"
                />
                <Text style={styles.perfectEmployeeSubtitle}>
                  {t("workCalendar")}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.modernScrollView}>
        {/* Modern Stats Card */}
        <Card
          style={[
            styles.modernStatsCard,
            { backgroundColor: paperTheme.colors.surface },
          ]}
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
            style={styles.statsGradient}
          >
            <Card.Content style={styles.modernStatsContent}>
              <Text
                style={[
                  styles.modernStatsTitle,
                  { color: paperTheme.colors.onSurface },
                ]}
              >
                {new Date(
                  currentMonth.year,
                  currentMonth.month
                ).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </Text>

              <View style={styles.modernStatsGrid}>
                <View style={styles.modernStatItem}>
                  <View
                    style={[
                      styles.statIconContainer,
                      { backgroundColor: "rgba(102, 126, 234, 0.1)" },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="calendar-check"
                      size={isTablet ? 28 : 24}
                      color="#667eea"
                    />
                  </View>
                  <Text
                    style={[
                      styles.modernStatLabel,
                      { color: paperTheme.colors.onSurface },
                    ]}
                  >
                    {t("workDays")}
                  </Text>
                  <Text
                    style={[
                      styles.modernStatValue,
                      { color: paperTheme.colors.onSurface },
                    ]}
                  >
                    {monthlyStats?.workDays || 0}
                  </Text>
                </View>

                <View style={styles.modernStatItem}>
                  <View
                    style={[
                      styles.statIconContainer,
                      { backgroundColor: "rgba(16, 185, 129, 0.1)" },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="trending-up"
                      size={isTablet ? 28 : 24}
                      color="#10b981"
                    />
                  </View>
                  <Text
                    style={[
                      styles.modernStatLabel,
                      { color: paperTheme.colors.onSurface },
                    ]}
                  >
                    {t("totalEarnings")}
                  </Text>
                  <Text style={[styles.modernStatValue, { color: "#10b981" }]}>
                    {formatCurrency(monthlyStats?.totalEarnings || 0)}
                  </Text>
                </View>

                <View style={styles.modernStatItem}>
                  <View
                    style={[
                      styles.statIconContainer,
                      { backgroundColor: "rgba(239, 68, 68, 0.1)" },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="cash-minus"
                      size={isTablet ? 28 : 24}
                      color="#ef4444"
                    />
                  </View>
                  <Text
                    style={[
                      styles.modernStatLabel,
                      { color: paperTheme.colors.onSurface },
                    ]}
                  >
                    {t("advances")}
                  </Text>
                  <Text style={[styles.modernStatValue, { color: "#ef4444" }]}>
                    -{formatCurrency(employee?.advances || 0)}
                  </Text>
                </View>

                <View style={styles.modernStatItem}>
                  <View
                    style={[
                      styles.statIconContainer,
                      { backgroundColor: "rgba(59, 130, 246, 0.1)" },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="cash-check"
                      size={isTablet ? 28 : 24}
                      color="#3b82f6"
                    />
                  </View>
                  <Text
                    style={[
                      styles.modernStatLabel,
                      { color: paperTheme.colors.onSurface },
                    ]}
                  >
                    {t("netEarnings")}
                  </Text>
                  <Text
                    style={[
                      styles.modernStatValue,
                      { color: "#3b82f6", fontWeight: "bold" },
                    ]}
                  >
                    {formatCurrency(
                      (monthlyStats?.totalEarnings || 0) -
                        (employee?.advances || 0)
                    )}
                  </Text>
                </View>
              </View>
            </Card.Content>
          </LinearGradient>
        </Card>

        {/* Modern Calendar Card */}
        <Card
          style={[
            styles.modernCalendarCard,
            { backgroundColor: paperTheme.colors.surface },
          ]}
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
            style={styles.calendarGradient}
          >
            <Card.Content style={styles.modernCalendarContent}>
              <Calendar
                onDayPress={onDayPress}
                markedDates={getMarkedDates()}
                dayComponent={({ date, state }) => {
                  const dateString = date?.dateString || "";
                  const dayRecord = workRecords.find(
                    (record) => record.date === dateString
                  );
                  const isToday =
                    dateString === new Date().toISOString().split("T")[0];
                  const isSelected = dateString === selectedDate;
                  const isPastDate = state === "disabled";

                  return (
                    <TouchableOpacity
                      style={[
                        styles.dayContainer,
                        isToday && styles.todayContainer,
                        isSelected && styles.selectedContainer,
                        dayRecord?.isAbsence && styles.absenceContainer,
                        isPastDate && styles.disabledContainer,
                      ]}
                      onPress={() => !isPastDate && date && onDayPress(date)}
                      disabled={isPastDate}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          isToday && styles.todayText,
                          isSelected && styles.selectedText,
                          dayRecord?.isAbsence && styles.absenceTextColor,
                          isPastDate && styles.disabledText,
                        ]}
                      >
                        {date?.day}
                      </Text>

                      <View style={styles.dayContent}>
                        {dayRecord ? (
                          dayRecord.isAbsence ? (
                            <Text style={styles.absenceLabel}>ABS</Text>
                          ) : dayRecord.clientIds.length > 0 ? (
                            <View style={styles.clientsContainer}>
                              {dayRecord.clientIds
                                .slice(0, 2)
                                .map((clientId) => {
                                  const client = clients.find(
                                    (c) => c.id === clientId
                                  );
                                  return (
                                    <Text
                                      key={clientId}
                                      style={styles.clientText}
                                    >
                                      {client?.name
                                        .substring(0, 3)
                                        .toUpperCase() || "CLT"}
                                    </Text>
                                  );
                                })}
                              {dayRecord.clientIds.length > 2 && (
                                <Text style={styles.moreText}>
                                  +{dayRecord.clientIds.length - 2}
                                </Text>
                              )}
                            </View>
                          ) : (
                            <MaterialCommunityIcons
                              name="plus"
                              size={12}
                              color={paperTheme.colors.primary}
                              style={styles.plusIcon}
                            />
                          )
                        ) : (
                          <MaterialCommunityIcons
                            name="plus"
                            size={12}
                            color={paperTheme.colors.primary}
                            style={styles.plusIcon}
                          />
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                }}
                theme={{
                  backgroundColor: paperTheme.colors.surface,
                  calendarBackground: paperTheme.colors.surface,
                  textSectionTitleColor: paperTheme.colors.onSurface,
                  selectedDayBackgroundColor: "transparent",
                  selectedDayTextColor: paperTheme.colors.onSurface,
                  todayTextColor: paperTheme.colors.primary,
                  dayTextColor: paperTheme.colors.onSurface,
                  textDisabledColor: paperTheme.colors.onSurfaceVariant,
                  arrowColor: paperTheme.colors.primary,
                  monthTextColor: paperTheme.colors.onSurface,
                  indicatorColor: paperTheme.colors.primary,
                }}
                onMonthChange={(month) => {
                  setCurrentMonth({ year: month.year, month: month.month - 1 });
                }}
              />
            </Card.Content>
          </LinearGradient>
        </Card>

        {/* Modern Work Day Selection Card - Inline */}
        {selectedDate && (
          <Card
            style={[
              styles.modernWorkDayCard,
              { backgroundColor: paperTheme.colors.surface },
            ]}
            mode="elevated"
          >
            <LinearGradient
              colors={
                paperTheme.dark
                  ? [
                      paperTheme.colors.surface,
                      paperTheme.colors.surfaceVariant,
                    ]
                  : ["#ffffff", "#f8f9ff"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.workDayGradient}
            >
              <Card.Content style={styles.modernWorkDayContent}>
                <Title
                  style={[
                    styles.workDayDetailsTitle,
                    { color: paperTheme.colors.onSurface },
                  ]}
                >
                  {selectedDate} - {t("addWorkDay")}
                </Title>

                <View style={styles.toggleContainer}>
                  <Button
                    mode={!isAbsence ? "contained" : "outlined"}
                    onPress={() => setIsAbsence(false)}
                    style={styles.toggleButton}
                    icon="briefcase"
                  >
                    {t("workDay")}
                  </Button>
                  <Button
                    mode={isAbsence ? "contained" : "outlined"}
                    onPress={() => setIsAbsence(true)}
                    style={styles.toggleButton}
                    icon="calendar-remove"
                  >
                    {t("markAbsence")}
                  </Button>
                </View>

                {!isAbsence && (
                  <View style={styles.clientSelection}>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Text style={styles.sectionTitle}>
                        {t("selectClients")} ({clients.length})
                      </Text>
                      <Button
                        mode="outlined"
                        compact
                        onPress={loadData}
                        icon="refresh"
                      >
                        Refresh
                      </Button>
                    </View>
                    <View style={styles.checkboxContainer}>
                      {clients.map((client) => {
                        console.log(
                          "Rendering client:",
                          client.name,
                          "Selected:",
                          selectedClients.includes(client.id)
                        );
                        return (
                          <View key={client.id} style={styles.checkboxItem}>
                            <Checkbox
                              status={
                                selectedClients.includes(client.id)
                                  ? "checked"
                                  : "unchecked"
                              }
                              onPress={() => {
                                console.log(
                                  "Client checkbox pressed:",
                                  client.name
                                );
                                toggleClientSelection(client.id);
                              }}
                            />
                            <View style={styles.checkboxLabel}>
                              <TouchableOpacity
                                style={styles.clientInfo}
                                onPress={() => {
                                  console.log(
                                    "Client label pressed:",
                                    client.name
                                  );
                                  toggleClientSelection(client.id);
                                }}
                              >
                                <Text
                                  style={[
                                    styles.clientName,
                                    { color: paperTheme.colors.onSurface },
                                  ]}
                                >
                                  {client.name}
                                </Text>
                                {client.location && (
                                  <Text
                                    style={[
                                      styles.clientContact,
                                      {
                                        color:
                                          paperTheme.colors.onSurfaceVariant,
                                      },
                                    ]}
                                  >
                                    📍 {client.location}
                                  </Text>
                                )}
                              </TouchableOpacity>

                              {/* Time input for selected clients */}
                              {selectedClients.includes(client.id) && (
                                <View style={styles.timeInputContainer}>
                                  <TextInput
                                    label={t("hoursWorked")}
                                    value={clientHours[client.id] || ""}
                                    onChangeText={(hours) => {
                                      setClientHours((prev) => ({
                                        ...prev,
                                        [client.id]: hours,
                                      }));
                                    }}
                                    keyboardType="numeric"
                                    mode="outlined"
                                    dense
                                    style={styles.timeInput}
                                    placeholder="0.0"
                                    right={<TextInput.Affix text="hrs" />}
                                  />
                                </View>
                              )}
                            </View>
                          </View>
                        );
                      })}
                    </View>
                    {clients.length === 0 && (
                      <View style={styles.noClientsContainer}>
                        <Text style={styles.noClientsText}>
                          No clients available. Add clients first.
                        </Text>
                        <Button
                          mode="contained"
                          onPress={() => {
                            router.push("/(tabs)/clients");
                          }}
                          style={{ marginTop: 10 }}
                          icon="plus"
                        >
                          Add Clients
                        </Button>
                      </View>
                    )}
                  </View>
                )}

                {/* Advance Money Section */}
                <View style={styles.advanceSection}>
                  <Text
                    style={[
                      styles.sectionTitle,
                      { color: paperTheme.colors.onSurface },
                    ]}
                  >
                    {t("dailyAdvance")}
                  </Text>
                  <TextInput
                    label={t("advanceAmount")}
                    value={advanceAmount}
                    onChangeText={setAdvanceAmount}
                    keyboardType="numeric"
                    mode="outlined"
                    left={<TextInput.Icon icon="cash" />}
                    style={styles.advanceInput}
                    placeholder={t("enterAdvanceAmount")}
                    textColor={paperTheme.colors.onSurface}
                  />
                  <Text
                    style={[
                      styles.advanceNote,
                      { color: paperTheme.colors.onSurfaceVariant },
                    ]}
                  >
                    {t("advanceNote")}
                  </Text>
                </View>

                <View style={styles.modalActions}>
                  <Button
                    onPress={() => {
                      console.log("Clear selection");
                      setSelectedDate("");
                      setSelectedClients([]);
                      setIsAbsence(false);
                      setAdvanceAmount("");
                      setClientHours({});
                    }}
                    style={styles.modalButton}
                    textColor={paperTheme.colors.onSurface}
                  >
                    {t("cancel")}
                  </Button>
                  <Button
                    onPress={async () => {
                      if (selectedDate) {
                        const existingRecord = workRecords.find(
                          (record) => record.date === selectedDate
                        );
                        if (existingRecord) {
                          await workRecordStorage.delete(existingRecord.id);
                          Alert.alert("Success", "Work day cleared");
                          setSelectedDate("");
                          setSelectedClients([]);
                          setIsAbsence(false);
                          setAdvanceAmount("");
                          loadData();
                        }
                      }
                    }}
                    mode="outlined"
                    style={styles.modalButton}
                    icon="calendar-remove"
                    textColor={paperTheme.colors.onSurface}
                  >
                    {t("clearDay")}
                  </Button>
                  <Button
                    mode="contained"
                    onPress={handleSaveWorkDay}
                    style={styles.modalButton}
                    buttonColor={paperTheme.colors.primary}
                  >
                    {t("save")}
                  </Button>
                </View>
              </Card.Content>
            </LinearGradient>
          </Card>
        )}
      </ScrollView>
      <StatusBar style="auto" />
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
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  statsCard: {
    marginBottom: 16,
  },
  statsTitle: {
    textAlign: "center",
    marginBottom: 8,
  },
  divider: {
    marginVertical: 12,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
    textAlign: "center",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 2,
  },
  calendarCard: {
    marginBottom: 16,
  },
  legendCard: {
    marginBottom: 16,
  },
  legendTitle: {
    fontSize: 16,
    marginBottom: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 9999,
  },
  modal: {
    margin: 20,
    padding: 20,
    borderRadius: 8,
    maxHeight: "85%",
    minHeight: 400,
    position: "relative",
    alignSelf: "center",
    width: "90%",
    maxWidth: 500,
  },
  modalTitle: {
    marginBottom: 20,
    textAlign: "center",
  },
  toggleContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  toggleButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  clientSelection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 10,
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 8,
    minHeight: 60,
  },
  clientChip: {
    margin: 4,
    minHeight: 40,
  },
  noClientsText: {
    textAlign: "center",
    fontStyle: "italic",
    marginTop: 20,
  },
  noClientsContainer: {
    alignItems: "center",
    padding: 20,
  },
  modalActions: {
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 20,
  },
  modalButton: {
    marginLeft: 8,
  },
  legendNote: {
    fontSize: 12,
    fontStyle: "italic",
    marginTop: 8,
    marginLeft: 4,
  },
  workDayDetailsCard: {
    marginBottom: 16,
  },
  workDayDetailsTitle: {
    fontSize: 16,
    marginBottom: 12,
  },
  noWorkText: {
    textAlign: "center",
    fontStyle: "italic",
    marginVertical: 8,
  },
  absenceInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },
  absenceText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "500",
  },
  clientsList: {
    marginTop: 8,
  },
  clientsHeader: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  clientItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 6,
  },
  clientName: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  clientContact: {
    fontSize: 12,
    fontStyle: "italic",
    marginLeft: 4,
  },
  earningsInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    padding: 8,
    backgroundColor: "rgba(0,0,0,0.03)",
    borderRadius: 6,
  },
  earningsText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "600",
  },
  // Custom day component styles
  dayContainer: {
    width: 40,
    height: 50,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: "transparent",
  },
  todayContainer: {
    backgroundColor: "rgba(99, 102, 241, 0.1)",
    borderWidth: 1,
    borderColor: "#6366f1",
  },
  selectedContainer: {
    backgroundColor: "rgba(99, 102, 241, 0.2)",
    borderWidth: 2,
    borderColor: "#6366f1",
  },
  disabledContainer: {
    opacity: 0.3,
  },
  dayText: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 2,
  },
  todayText: {
    color: "#6366f1",
    fontWeight: "bold",
  },
  selectedText: {
    color: "#6366f1",
    fontWeight: "bold",
  },
  disabledText: {
    color: "#9ca3af",
  },
  dayContent: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  clientsContainer: {
    width: "100%",
    alignItems: "center",
  },
  clientText: {
    color: "#10b981",
    fontSize: 8,
    fontWeight: "bold",
    marginVertical: 1,
    textAlign: "center",
  },

  moreText: {
    color: "#f59e0b",
    fontSize: 8,
    fontWeight: "bold",
    marginVertical: 1,
    textAlign: "center",
  },
  legendText: {
    fontSize: 12,
    fontWeight: "bold",
    marginRight: 12,
    minWidth: 30,
    textAlign: "center",
  },
  // New styles for enhanced calendar
  absenceContainer: {
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    borderWidth: 2,
    borderColor: "#ef4444",
  },
  absenceTextColor: {
    color: "#ef4444",
    fontWeight: "bold",
  },
  absenceLabel: {
    color: "#ef4444",
    fontSize: 8,
    fontWeight: "bold",
    textAlign: "center",
  },
  plusIcon: {
    opacity: 0.6,
  },
  advanceButton: {
    marginLeft: 8,
  },
  advanceSection: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "rgba(255, 193, 7, 0.1)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 193, 7, 0.3)",
  },
  advanceSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#f57c00",
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  advanceInput: {
    marginTop: 8,
    marginBottom: 8,
  },
  advanceNote: {
    fontSize: 12,
    fontStyle: "italic",
    color: "#f57c00",
    textAlign: "center",
  },
  checkboxContainer: {
    marginTop: 12,
  },
  checkboxItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  checkboxLabel: {
    flex: 1,
    marginLeft: 12,
  },
  clientInfo: {
    flex: 1,
  },
  timeInputContainer: {
    marginTop: 8,
    paddingLeft: 4,
  },
  timeInput: {
    fontSize: 14,
  },
  // Modern 2025 Design Styles
  modernHeader: {
    paddingTop: 50,
    paddingBottom: 40,
    paddingHorizontal: isTablet ? 32 : 24,
    minHeight: 200,
  },
  headerContent: {
    flex: 1,
    justifyContent: "space-between",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginBottom: 30,
  },
  perfectBackButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  perfectBackText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  perfectEmployeeSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  perfectAvatarContainer: {
    marginRight: 16,
  },
  perfectAvatar: {
    width: isTablet ? 64 : 56,
    height: isTablet ? 64 : 56,
    borderRadius: isTablet ? 32 : 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  perfectEmployeeInfo: {
    flex: 1,
  },
  perfectEmployeeName: {
    fontSize: isTablet ? 26 : 22,
    fontWeight: "bold",
    color: "#ffffff",
    letterSpacing: 0.5,
    textShadowColor: "rgba(0, 0, 0, 0.4)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    marginBottom: 6,
  },
  perfectSubtitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  perfectEmployeeSubtitle: {
    fontSize: isTablet ? 16 : 14,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "500",
    marginLeft: 6,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  employeeHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  employeeAvatarContainer: {
    marginRight: 16,
  },
  employeeAvatar: {
    width: isTablet ? 72 : 60,
    height: isTablet ? 72 : 60,
    borderRadius: isTablet ? 36 : 30,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: isTablet ? 28 : 24,
    fontWeight: "bold",
    color: "#ffffff",
    letterSpacing: 1,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  employeeSubtitle: {
    fontSize: isTablet ? 16 : 14,
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: 4,
    fontWeight: "500",
  },
  modernScrollView: {
    flex: 1,
    padding: isTablet ? 32 : 20,
    paddingTop: 0,
  },
  modernStatsCard: {
    marginBottom: isTablet ? 24 : 20,
    borderRadius: isTablet ? 24 : 20,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    overflow: "hidden",
  },
  statsGradient: {
    borderRadius: isTablet ? 24 : 20,
  },
  modernStatsContent: {
    padding: 0,
  },
  modernStatsTitle: {
    fontSize: isTablet ? 22 : 18,
    fontWeight: "bold",
    color: "#1f2937",
    textAlign: "center",
    marginBottom: isTablet ? 24 : 20,
    marginTop: isTablet ? 24 : 20,
  },
  modernStatsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: isTablet ? 24 : 20,
    paddingBottom: isTablet ? 24 : 20,
  },
  modernStatItem: {
    width: isTablet ? "48%" : "48%",
    alignItems: "center",
    marginBottom: isTablet ? 20 : 16,
    padding: isTablet ? 16 : 12,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: isTablet ? 16 : 12,
    borderWidth: 1,
    borderColor: "rgba(102, 126, 234, 0.1)",
  },
  statIconContainer: {
    width: isTablet ? 56 : 48,
    height: isTablet ? 56 : 48,
    borderRadius: isTablet ? 28 : 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  modernStatLabel: {
    fontSize: isTablet ? 14 : 12,
    color: "#6b7280",
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 4,
  },
  modernStatValue: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: "bold",
    color: "#1f2937",
    textAlign: "center",
  },
  modernCalendarCard: {
    marginBottom: isTablet ? 24 : 20,
    borderRadius: isTablet ? 24 : 20,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    overflow: "hidden",
  },
  calendarGradient: {
    borderRadius: isTablet ? 24 : 20,
  },
  modernCalendarContent: {
    padding: isTablet ? 16 : 12,
  },
  modernWorkDayCard: {
    marginBottom: isTablet ? 24 : 20,
    borderRadius: isTablet ? 24 : 20,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    overflow: "hidden",
  },
  workDayGradient: {
    borderRadius: isTablet ? 24 : 20,
  },
  modernWorkDayContent: {
    padding: 0,
  },
});
