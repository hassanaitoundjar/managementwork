import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Alert, Dimensions, ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, RadioButton, Surface, Text } from "react-native-paper";
import { useLanguage } from "../../contexts/LanguageContext";
import { useTheme } from "../../contexts/ThemeContext";
import { Language, Theme } from "../../types";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const isTablet = screenWidth >= 768;
const isLargeScreen = screenWidth >= 1024;

export default function SettingsScreen() {
  const { paperTheme, theme, toggleTheme, setTheme } = useTheme();
  const { t, language, setLanguage } = useLanguage();

  const handleLanguageChange = async (newLanguage: Language) => {
    try {
      await setLanguage(newLanguage);
      Alert.alert(t("success"), t("settingsSaved"));
    } catch (error) {
      console.error("Error changing language:", error);
      Alert.alert(t("error"), t("failedToChangeLanguage"));
    }
  };

  const handleThemeChange = async (newTheme: Theme) => {
    try {
      await setTheme(newTheme);
      Alert.alert(t("success"), t("settingsSaved"));
    } catch (error) {
      console.error("Error changing theme:", error);
      Alert.alert(t("error"), "Failed to change theme");
    }
  };

  const getLanguageDisplayName = (lang: Language): string => {
    switch (lang) {
      case "en":
        return t("english");
      case "es":
        return t("spanish");
      case "ar":
        return t("arabic");
      case "fr":
        return t("french");
      default:
        return lang;
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: paperTheme.colors.background },
      ]}
    >
      {/* Modern Header with Company Branding */}
      <LinearGradient
        colors={["#667eea", "#764ba2", "#f093fb"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.modernHeader}
      >
        <View style={styles.headerContent}>
          <View style={styles.brandSection}>
            <View style={styles.logoContainer}>
              <MaterialCommunityIcons name="cog" size={32} color="#ffffff" />
            </View>
            <View style={styles.brandText}>
              <Text style={styles.companyName}>Shihabfalling</Text>
              <Text style={styles.companyTagline}>App Settings</Text>
            </View>
          </View>

          <View style={styles.headerStats}>
            <Surface style={styles.statCard} elevation={2}>
              <MaterialCommunityIcons
                name={theme === "light" ? "weather-sunny" : "weather-night"}
                size={20}
                color={paperTheme.colors.primary}
              />
              <Text style={styles.statNumber}>
                {theme === "light" ? "Light" : "Dark"}
              </Text>
              <Text style={styles.headerStatLabel}>Theme</Text>
            </Surface>
          </View>
        </View>

        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Configure your</Text>
          <Text style={styles.dashboardTitle}>{t("settings")}</Text>
        </View>
      </LinearGradient>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Modern Language Settings */}
        <Card
          style={[
            styles.modernSettingsCard,
            { backgroundColor: paperTheme.colors.surface },
          ]}
          mode="elevated"
        >
          <LinearGradient
            colors={
              theme === "dark"
                ? [paperTheme.colors.surface, paperTheme.colors.surfaceVariant]
                : ["#ffffff", "#f8f9ff"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.settingsCardGradient}
          >
            <Card.Content style={styles.modernCardContent}>
              <View style={styles.modernCardHeader}>
                <View style={styles.settingsIconContainer}>
                  <LinearGradient
                    colors={["#667eea", "#764ba2"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.settingsIconGradient}
                  >
                    <MaterialCommunityIcons
                      name="translate"
                      size={24}
                      color="#ffffff"
                    />
                  </LinearGradient>
                </View>
                <Text
                  style={[
                    styles.modernCardTitle,
                    { color: paperTheme.colors.onSurface },
                  ]}
                >
                  {t("language")}
                </Text>
              </View>

              <View style={styles.modernSettingsContent}>
                <RadioButton.Group
                  onValueChange={(value) =>
                    handleLanguageChange(value as Language)
                  }
                  value={language}
                >
                  <View
                    style={[
                      styles.modernRadioItem,
                      {
                        backgroundColor:
                          theme === "dark"
                            ? "rgba(255, 255, 255, 0.1)"
                            : "rgba(255, 255, 255, 0.7)",
                      },
                    ]}
                  >
                    <RadioButton.Item
                      label={t("english")}
                      value="en"
                      position="leading"
                      labelStyle={[
                        styles.modernRadioLabel,
                        { color: paperTheme.colors.onSurface },
                      ]}
                    />
                  </View>
                  <View
                    style={[
                      styles.modernRadioItem,
                      {
                        backgroundColor:
                          theme === "dark"
                            ? "rgba(255, 255, 255, 0.1)"
                            : "rgba(255, 255, 255, 0.7)",
                      },
                    ]}
                  >
                    <RadioButton.Item
                      label={t("spanish")}
                      value="es"
                      position="leading"
                      labelStyle={[
                        styles.modernRadioLabel,
                        { color: paperTheme.colors.onSurface },
                      ]}
                    />
                  </View>
                  <View
                    style={[
                      styles.modernRadioItem,
                      {
                        backgroundColor:
                          theme === "dark"
                            ? "rgba(255, 255, 255, 0.1)"
                            : "rgba(255, 255, 255, 0.7)",
                      },
                    ]}
                  >
                    <RadioButton.Item
                      label={t("arabic")}
                      value="ar"
                      position="leading"
                      labelStyle={[
                        styles.modernRadioLabel,
                        { color: paperTheme.colors.onSurface },
                      ]}
                    />
                  </View>
                  <View
                    style={[
                      styles.modernRadioItem,
                      {
                        backgroundColor:
                          theme === "dark"
                            ? "rgba(255, 255, 255, 0.1)"
                            : "rgba(255, 255, 255, 0.7)",
                      },
                    ]}
                  >
                    <RadioButton.Item
                      label={t("french")}
                      value="fr"
                      position="leading"
                      labelStyle={[
                        styles.modernRadioLabel,
                        { color: paperTheme.colors.onSurface },
                      ]}
                    />
                  </View>
                </RadioButton.Group>
              </View>
            </Card.Content>
          </LinearGradient>
        </Card>

        {/* Modern Theme Settings */}
        <Card
          style={[
            styles.modernSettingsCard,
            { backgroundColor: paperTheme.colors.surface },
          ]}
          mode="elevated"
        >
          <LinearGradient
            colors={
              theme === "dark"
                ? [paperTheme.colors.surface, paperTheme.colors.surfaceVariant]
                : ["#ffffff", "#f8f9ff"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.settingsCardGradient}
          >
            <Card.Content style={styles.modernCardContent}>
              <View style={styles.modernCardHeader}>
                <View style={styles.settingsIconContainer}>
                  <LinearGradient
                    colors={["#667eea", "#764ba2"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.settingsIconGradient}
                  >
                    <MaterialCommunityIcons
                      name="palette"
                      size={24}
                      color="#ffffff"
                    />
                  </LinearGradient>
                </View>
                <Text
                  style={[
                    styles.modernCardTitle,
                    { color: paperTheme.colors.onSurface },
                  ]}
                >
                  {t("theme")}
                </Text>
              </View>

              <View style={styles.modernSettingsContent}>
                <RadioButton.Group
                  onValueChange={(value) => handleThemeChange(value as Theme)}
                  value={theme}
                >
                  <View
                    style={[
                      styles.modernRadioItem,
                      {
                        backgroundColor:
                          theme === "dark"
                            ? "rgba(255, 255, 255, 0.1)"
                            : "rgba(255, 255, 255, 0.7)",
                      },
                    ]}
                  >
                    <RadioButton.Item
                      label={t("lightTheme")}
                      value="light"
                      position="leading"
                      labelStyle={[
                        styles.modernRadioLabel,
                        { color: paperTheme.colors.onSurface },
                      ]}
                    />
                  </View>
                  <View
                    style={[
                      styles.modernRadioItem,
                      {
                        backgroundColor:
                          theme === "dark"
                            ? "rgba(255, 255, 255, 0.1)"
                            : "rgba(255, 255, 255, 0.7)",
                      },
                    ]}
                  >
                    <RadioButton.Item
                      label={t("darkTheme")}
                      value="dark"
                      position="leading"
                      labelStyle={[
                        styles.modernRadioLabel,
                        { color: paperTheme.colors.onSurface },
                      ]}
                    />
                  </View>
                </RadioButton.Group>

                <View
                  style={[
                    styles.quickToggle,
                    {
                      borderTopColor:
                        theme === "dark"
                          ? "rgba(255,255,255,0.1)"
                          : "rgba(0,0,0,0.1)",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.quickToggleText,
                      { color: paperTheme.colors.onSurface },
                    ]}
                  >
                    Quick toggle:
                  </Text>
                  <Button
                    mode="outlined"
                    onPress={toggleTheme}
                    icon={theme === "light" ? "weather-night" : "weather-sunny"}
                    style={styles.toggleButton}
                    textColor={paperTheme.colors.primary}
                  >
                    Switch to{" "}
                    {theme === "light" ? t("darkTheme") : t("lightTheme")}
                  </Button>
                </View>
              </View>
            </Card.Content>
          </LinearGradient>
        </Card>

        {/* Modern App Information */}
        <Card
          style={[
            styles.modernSettingsCard,
            { backgroundColor: paperTheme.colors.surface },
          ]}
          mode="elevated"
        >
          <LinearGradient
            colors={
              theme === "dark"
                ? [paperTheme.colors.surface, paperTheme.colors.surfaceVariant]
                : ["#ffffff", "#f8f9ff"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.settingsCardGradient}
          >
            <Card.Content style={styles.modernCardContent}>
              <View style={styles.modernCardHeader}>
                <View style={styles.settingsIconContainer}>
                  <LinearGradient
                    colors={["#667eea", "#764ba2"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.settingsIconGradient}
                  >
                    <MaterialCommunityIcons
                      name="information"
                      size={24}
                      color="#ffffff"
                    />
                  </LinearGradient>
                </View>
                <Text
                  style={[
                    styles.modernCardTitle,
                    { color: paperTheme.colors.onSurface },
                  ]}
                >
                  App Information
                </Text>
              </View>

              <View style={styles.modernSettingsContent}>
                <View style={styles.infoRow}>
                  <Text
                    style={[
                      styles.infoLabel,
                      { color: paperTheme.colors.onSurface },
                    ]}
                  >
                    App Name:
                  </Text>
                  <Text
                    style={[
                      styles.infoValue,
                      { color: paperTheme.colors.onSurface },
                    ]}
                  >
                    Shihabfalling Calendar
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Text
                    style={[
                      styles.infoLabel,
                      { color: paperTheme.colors.onSurface },
                    ]}
                  >
                    Version:
                  </Text>
                  <Text
                    style={[
                      styles.infoValue,
                      { color: paperTheme.colors.onSurface },
                    ]}
                  >
                    1.0.0
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Text
                    style={[
                      styles.infoLabel,
                      { color: paperTheme.colors.onSurface },
                    ]}
                  >
                    Storage:
                  </Text>
                  <Text
                    style={[
                      styles.infoValue,
                      { color: paperTheme.colors.onSurface },
                    ]}
                  >
                    Local Device (AsyncStorage)
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Text
                    style={[
                      styles.infoLabel,
                      { color: paperTheme.colors.onSurface },
                    ]}
                  >
                    Features:
                  </Text>
                  <Text
                    style={[
                      styles.infoValue,
                      { color: paperTheme.colors.onSurface },
                    ]}
                  >
                    Employee Management, Work Calendar, Client Management,
                    Multi-language Support
                  </Text>
                </View>
              </View>
            </Card.Content>
          </LinearGradient>
        </Card>

        {/* Modern Current Settings Summary */}
        <Card
          style={[
            styles.modernSettingsCard,
            { backgroundColor: paperTheme.colors.surface },
          ]}
          mode="elevated"
        >
          <LinearGradient
            colors={
              theme === "dark"
                ? [paperTheme.colors.surface, paperTheme.colors.surfaceVariant]
                : ["#ffffff", "#f8f9ff"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.settingsCardGradient}
          >
            <Card.Content style={styles.modernCardContent}>
              <View style={styles.modernCardHeader}>
                <View style={styles.settingsIconContainer}>
                  <LinearGradient
                    colors={["#667eea", "#764ba2"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.settingsIconGradient}
                  >
                    <MaterialCommunityIcons
                      name="cog"
                      size={24}
                      color="#ffffff"
                    />
                  </LinearGradient>
                </View>
                <Text
                  style={[
                    styles.modernCardTitle,
                    { color: paperTheme.colors.onSurface },
                  ]}
                >
                  Current Settings
                </Text>
              </View>

              <View style={styles.modernSettingsContent}>
                <View style={styles.summaryRow}>
                  <View style={styles.summaryItem}>
                    <MaterialCommunityIcons
                      name="translate"
                      size={20}
                      color={paperTheme.colors.primary}
                    />
                    <Text
                      style={[
                        styles.summaryLabel,
                        { color: paperTheme.colors.onSurface },
                      ]}
                    >
                      {t("language")}:
                    </Text>
                    <Text
                      style={[
                        styles.summaryValue,
                        { color: paperTheme.colors.onSurface },
                      ]}
                    >
                      {getLanguageDisplayName(language)}
                    </Text>
                  </View>
                </View>

                <View style={styles.summaryRow}>
                  <View style={styles.summaryItem}>
                    <MaterialCommunityIcons
                      name={
                        theme === "light" ? "weather-sunny" : "weather-night"
                      }
                      size={20}
                      color={paperTheme.colors.primary}
                    />
                    <Text
                      style={[
                        styles.summaryLabel,
                        { color: paperTheme.colors.onSurface },
                      ]}
                    >
                      {t("theme")}:
                    </Text>
                    <Text
                      style={[
                        styles.summaryValue,
                        { color: paperTheme.colors.onSurface },
                      ]}
                    >
                      {theme === "light" ? t("lightTheme") : t("darkTheme")}
                    </Text>
                  </View>
                </View>
              </View>
            </Card.Content>
          </LinearGradient>
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
  settingsCard: {
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: {
    marginLeft: 12,
    fontSize: 18,
  },
  divider: {
    marginVertical: 12,
  },
  radioItem: {
    marginVertical: 4,
  },
  radioLabel: {
    fontSize: 16,
  },
  quickToggle: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  quickToggleText: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: "500",
  },
  toggleButton: {
    alignSelf: "flex-start",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    flex: 2,
    textAlign: "right",
  },
  summaryRow: {
    marginBottom: 12,
  },
  summaryItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
    marginRight: 8,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "bold",
  },
  // Modern 2025 Design Styles
  modernHeader: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: isTablet ? 32 : 20,
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
    fontSize: 16,
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
  // Modern Settings Card Styles
  modernSettingsCard: {
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
  settingsCardGradient: {
    borderRadius: isTablet ? 24 : 20,
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
  settingsIconContainer: {
    marginRight: 16,
  },
  settingsIconGradient: {
    width: isTablet ? 56 : 48,
    height: isTablet ? 56 : 48,
    borderRadius: isTablet ? 28 : 24,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  modernCardTitle: {
    fontSize: isTablet ? 22 : 18,
    fontWeight: "bold",
    color: "#1f2937",
    flex: 1,
  },
  modernSettingsContent: {
    paddingHorizontal: isTablet ? 24 : 20,
    paddingBottom: isTablet ? 24 : 20,
  },
  modernRadioItem: {
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    marginVertical: 4,
    borderRadius: 12,
    overflow: "hidden",
  },
  modernRadioLabel: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: "500",
  },
});
