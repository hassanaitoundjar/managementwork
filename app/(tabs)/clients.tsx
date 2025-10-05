import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
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
import { Client } from "../../types";
import { BrandColors, getComponentColors } from "../../constants/colors";
import { clientStorage, generateId } from "../../utils/storage";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const isTablet = screenWidth >= 768;
const isLargeScreen = screenWidth >= 1024;

export default function ClientsScreen() {
  const { paperTheme, isDark } = useTheme();
  const { t } = useLanguage();
  const componentColors = getComponentColors(isDark);
  const [clients, setClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
  });

  const loadClients = async () => {
    try {
      const clientList = await clientStorage.getAll();
      setClients(clientList);
    } catch (error) {
      console.error("Error loading clients:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadClients();
    }, [])
  );

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resetForm = () => {
    setFormData({ name: "", location: "" });
    setEditingClient(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (client: Client) => {
    setFormData({
      name: client.name,
      location: client.location || "",
    });
    setEditingClient(client);
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

    if (!formData.location.trim()) {
      Alert.alert(t("error"), t("locationRequired"));
      return;
    }

    try {
      if (editingClient) {
        // Update existing client
        const updatedClient: Client = {
          ...editingClient,
          name: formData.name.trim(),
          location: formData.location.trim(),
        };
        await clientStorage.update(updatedClient);
        Alert.alert(t("success"), t("clientUpdated"));
      } else {
        // Add new client
        const newClient: Client = {
          id: generateId(),
          name: formData.name.trim(),
          location: formData.location.trim(),
          createdAt: new Date().toISOString(),
        };
        await clientStorage.add(newClient);
        Alert.alert(t("success"), t("clientAdded"));
      }

      closeModal();
      loadClients();
    } catch (error) {
      console.error("Error saving client:", error);
      Alert.alert(t("error"), t("failedToSaveClient"));
    }
  };

  const handleDelete = (client: Client) => {
    Alert.alert(t("deleteClient"), t("confirmDelete"), [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("delete"),
        style: "destructive",
        onPress: async () => {
          try {
            await clientStorage.delete(client.id);
            Alert.alert(t("success"), t("clientDeleted"));
            loadClients();
          } catch (error) {
            console.error("Error deleting client:", error);
            Alert.alert(t("error"), t("failedToDeleteClient"));
          }
        },
      },
    ]);
  };

  const renderClientCard = (client: Client) => (
    <Card
      key={client.id}
      style={[
        styles.modernClientCard,
        { backgroundColor: paperTheme.colors.surface },
      ]}
      mode="elevated"
    >
      <LinearGradient
        colors={componentColors.card.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.clientCardGradient}
      >
        <Card.Content style={styles.modernCardContent}>
          {/* Client Header with Avatar */}
          <View style={styles.modernCardHeader}>
            <View style={styles.clientAvatarContainer}>
              <LinearGradient
                colors={BrandColors.gradientPrimary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.clientAvatarGradient}
              >
                <MaterialCommunityIcons
                  name="briefcase"
                  size={28}
                  color="#ffffff"
                />
              </LinearGradient>
            </View>

            <View style={styles.modernClientInfo}>
              <Text
                style={[
                  styles.modernClientName,
                  { color: paperTheme.colors.onSurface },
                ]}
              >
                {client.name}
              </Text>
              <View style={styles.clientTypeContainer}>
                <MaterialCommunityIcons
                  name="briefcase-variant"
                  size={16}
                  color={paperTheme.colors.primary}
                />
                <Text
                  style={[
                    styles.clientTypeText,
                    { color: paperTheme.colors.primary },
                  ]}
                >
                  {t("businessClient")}
                </Text>
              </View>
            </View>
          </View>

          {/* Client Location Details */}
          <View style={styles.clientContactSection}>
            <View
              style={[
                styles.modernContactRow,
                {
                  backgroundColor: paperTheme.dark
                    ? "rgba(255, 255, 255, 0.1)"
                    : "rgba(255, 255, 255, 0.7)",
                },
              ]}
            >
              <MaterialCommunityIcons
                name="map-marker"
                size={18}
                color={paperTheme.colors.primary}
              />
              <Text
                style={[
                  styles.modernContactText,
                  { color: paperTheme.colors.onSurface },
                ]}
              >
                {client.location}
              </Text>
            </View>
          </View>
        </Card.Content>

        {/* Modern Action Buttons */}
        <View style={styles.modernClientActions}>
          <Button
            mode="outlined"
            onPress={() => openEditModal(client)}
            style={[
              styles.modernSecondaryButton,
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
            onPress={() => handleDelete(client)}
            style={[
              styles.modernSecondaryButton,
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
      </LinearGradient>
    </Card>
  );

  const renderEmptyState = () => (
    <Card style={styles.emptyCard} mode="elevated">
      <Card.Content style={styles.emptyContent}>
        <MaterialCommunityIcons
          name="briefcase-plus"
          size={64}
          color={paperTheme.colors.onSurfaceVariant}
        />
        <Title style={styles.emptyTitle}>{t("noClients")}</Title>
        <Paragraph style={styles.emptyText}>
          Add your first client to get started
        </Paragraph>
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
                name="briefcase-account"
                size={32}
                color="#ffffff"
              />
            </View>
            <View style={styles.brandText}>
              <Text style={styles.companyName}>{t("companyName")}</Text>
              <Text style={styles.companyTagline}>{t("clientManagement")}</Text>
            </View>
          </View>

          <View style={styles.headerStats}>
            <Surface style={styles.statCard} elevation={2}>
              <MaterialCommunityIcons
                name="briefcase-variant"
                size={20}
                color={paperTheme.colors.primary}
              />
              <Text style={styles.statNumber}>{clients.length}</Text>
              <Text style={styles.headerStatLabel}>{t("clients")}</Text>
            </Surface>
          </View>
        </View>

        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>{t("manageYour")}</Text>
          <Text style={styles.dashboardTitle}>{t("clients")}</Text>
        </View>

        <Searchbar
          placeholder={t("searchClients")}
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
        {filteredClients.length === 0 ? (
          searchQuery ? (
            <Text style={styles.noResults}>No clients found</Text>
          ) : (
            renderEmptyState()
          )
        ) : (
          filteredClients.map(renderClientCard)
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: BrandColors.primary }]}
        onPress={openAddModal}
        label={t("addClient")}
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
            {editingClient ? t("editClient") : t("addClient")}
          </Title>

          <TextInput
            label={t("clientName")}
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            style={styles.input}
            mode="outlined"
            left={<TextInput.Icon icon="briefcase" />}
            textColor={paperTheme.colors.onSurface}
          />

          <TextInput
            label={t("location")}
            value={formData.location}
            onChangeText={(text) =>
              setFormData({ ...formData, location: text })
            }
            style={styles.input}
            mode="outlined"
            left={<TextInput.Icon icon="map-marker" />}
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
    padding: 20,
    paddingTop: 0,
  },
  clientCard: {
    marginBottom: 16,
  },
  modernClientCard: {
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
  clientInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
  },
  clientDetails: {
    marginLeft: 12,
    flex: 1,
  },
  clientName: {
    fontSize: 18,
    marginBottom: 8,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  contactText: {
    marginLeft: 8,
    fontSize: 14,
    flex: 1,
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
  // Modern Client Card Styles
  clientCardGradient: {
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
  clientAvatarContainer: {
    marginRight: 16,
  },
  clientAvatarGradient: {
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
  modernClientInfo: {
    flex: 1,
  },
  modernClientName: {
    fontSize: isTablet ? 24 : 20,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  clientTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  clientTypeText: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: "600",
    color: BrandColors.primary,
    marginLeft: 6,
  },
  clientContactSection: {
    paddingHorizontal: isTablet ? 24 : 20,
    paddingBottom: isTablet ? 20 : 16,
  },
  modernContactRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  modernContactText: {
    marginLeft: 12,
    fontSize: isTablet ? 16 : 14,
    color: "#374151",
    flex: 1,
  },
  modernClientActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: isTablet ? 24 : 20,
    paddingBottom: isTablet ? 24 : 20,
  },
  modernSecondaryButton: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 12,
    borderColor: "#e5e7eb",
  },
  deleteButton: {
    borderColor: "#fecaca",
  },
});
