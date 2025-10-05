import i18n from "i18next";
import React, { createContext, useContext, useEffect, useState } from "react";
import { initReactI18next } from "react-i18next";
import { Language } from "../types";
import { settingsStorage } from "../utils/storage";

// Translation resources
const resources = {
  en: {
    translation: {
      // Navigation
      home: "Home",
      employees: "Employees",
      clients: "Clients",
      settings: "Settings",

      // Home/Dashboard
      dashboard: "Dashboard",
      totalWorkedDays: "Total Worked Days",
      totalEarnings: "Total Earnings",
      last15Days: "Last 15 Days",
      currentMonth: "Current Month",
      noEmployees: "No employees added yet",
      addFirstEmployee: "Add your first employee to get started",

      // Employees
      addEmployee: "Add Employee",
      employeeName: "Employee Name",
      dailyRate: "Daily Rate",
      searchEmployees: "Search employees...",
      editEmployee: "Edit Employee",
      deleteEmployee: "Delete Employee",
      confirmDelete: "Are you sure you want to delete this employee?",
      workCalendar: "Work Calendar",
      addWorkDay: "Add Work Day",
      markAbsence: "Mark Absence",
      selectClients: "Select Clients",
      workDays: "Work Days",
      workDay: "Work Day",
      absenceDays: "Absence Days",
      monthlyEarnings: "Monthly Earnings",
      advancesGiven: "Advances Given",
      netEarnings: "Net Earnings",
      clientManagement: "Client Management",
      totalClients: "Total Clients",
      totalEmployees: "Total Employees",
      manageYour: "Manage your",

      // Clients
      addClient: "Add Client",
      clientName: "Client Name",
      contactInfo: "Contact Info",
      email: "Email",
      phone: "Phone",
      searchClients: "Search clients...",
      editClient: "Edit Client",
      deleteClient: "Delete Client",
      noClients: "No clients added yet",

      // Settings
      language: "Language",
      theme: "Theme",
      lightTheme: "Light",
      darkTheme: "Dark",
      english: "English",
      arabic: "Arabic",
      french: "French",

      // Common
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      add: "Add",
      search: "Search",
      filter: "Filter",
      close: "Close",
      confirm: "Confirm",
      yes: "Yes",
      no: "No",
      loading: "Loading...",
      error: "Error",
      success: "Success",
      required: "Required",
      optional: "Optional",

      // Validation
      nameRequired: "Name is required",
      rateRequired: "Daily rate is required",
      rateInvalid: "Please enter a valid rate",
      contactRequired: "Contact info is required",

      // Messages
      employeeAdded: "Employee added successfully",
      employeeUpdated: "Employee updated successfully",
      employeeDeleted: "Employee deleted successfully",
      clientAdded: "Client added successfully",
      clientUpdated: "Client updated successfully",
      clientDeleted: "Client deleted successfully",
      workDayAdded: "Work day added successfully",
      workDayUpdated: "Work day updated successfully",
      settingsSaved: "Settings saved successfully",

      // Additional translations
      day: "day",
      companyName: "Shihabfalling",
      employeeManagement: "Employee Management System",
      appSettings: "App Settings",
      light: "Light",
      dark: "Dark",
      themeLabel: "Theme",
      welcomeTo: "Welcome to your",
      configureYour: "Configure your",
      locationRequired: "Location is required",
      failedToChangeLanguage: "Failed to change language",
      failedToChangeTheme: "Failed to change theme",
      failedToSaveClient: "Failed to save client",
      failedToDeleteClient: "Failed to delete client",
      businessClient: "Business Client",
      thisMonth: "This Month",
      earnings: "Earnings",
      advances: "Advances",
      clearDay: "Clear Day",
      hoursWorked: "Hours worked",
      location: "Location",
      dailyAdvance: "Daily Advance",
      advanceAmount: "Advance Amount",
      enterAdvanceAmount: "Enter advance amount",
      advanceNote: "This advance will be deducted from monthly earnings",
    },
  },
  ar: {
    translation: {
      // Navigation
      home: "الرئيسية",
      employees: "الموظفون",
      clients: "العملاء",
      settings: "الإعدادات",

      // Home/Dashboard
      dashboard: "لوحة التحكم",
      totalWorkedDays: "إجمالي أيام العمل",
      totalEarnings: "إجمالي الأرباح",
      last15Days: "آخر 15 يوم",
      currentMonth: "الشهر الحالي",
      noEmployees: "لم يتم إضافة موظفين بعد",
      addFirstEmployee: "أضف موظفك الأول للبدء",

      // Employees
      addEmployee: "إضافة موظف",
      employeeName: "اسم الموظف",
      dailyRate: "الأجر اليومي",
      searchEmployees: "البحث عن موظفين...",
      editEmployee: "تعديل الموظف",
      deleteEmployee: "حذف الموظف",
      confirmDelete: "هل أنت متأكد من أنك تريد حذف هذا الموظف؟",
      workCalendar: "تقويم العمل",
      addWorkDay: "إضافة يوم عمل",
      markAbsence: "تسجيل غياب",
      selectClients: "اختيار العملاء",
      notes: "ملاحظات",
      workDays: "أيام العمل",
      workDay: "يوم العمل",
      absenceDays: "أيام الغياب",
      monthlyEarnings: "الأرباح الشهرية",
      advancesGiven: "السلف المدفوعة",
      netEarnings: "صافي الأرباح",
      clientManagement: "إدارة العملاء",
      totalClients: "إجمالي العملاء",
      totalEmployees: "إجمالي الموظفين",
      manageYour: "إدارة",

      // Clients
      addClient: "إضافة عميل",
      clientName: "اسم العميل",
      contactInfo: "معلومات الاتصال",
      email: "البريد الإلكتروني",
      phone: "الهاتف",
      searchClients: "البحث عن عملاء...",
      editClient: "تعديل العميل",
      deleteClient: "حذف العميل",
      noClients: "لم يتم إضافة عملاء بعد",

      // Settings
      language: "اللغة",
      theme: "المظهر",
      lightTheme: "فاتح",
      darkTheme: "داكن",
      english: "الإنجليزية",
      arabic: "العربية",
      french: "الفرنسية",

      // Common
      save: "حفظ",
      cancel: "إلغاء",
      delete: "حذف",
      edit: "تعديل",
      add: "إضافة",
      search: "بحث",
      filter: "تصفية",
      close: "إغلاق",
      confirm: "تأكيد",
      yes: "نعم",
      no: "لا",
      loading: "جاري التحميل...",
      error: "خطأ",
      success: "نجح",
      required: "مطلوب",
      optional: "اختياري",

      // Validation
      nameRequired: "الاسم مطلوب",
      rateRequired: "الأجر اليومي مطلوب",
      rateInvalid: "يرجى إدخال أجر صحيح",
      contactRequired: "معلومات الاتصال مطلوبة",

      // Messages
      employeeAdded: "تم إضافة الموظف بنجاح",
      employeeUpdated: "تم تحديث الموظف بنجاح",
      employeeDeleted: "تم حذف الموظف بنجاح",
      clientAdded: "تم إضافة العميل بنجاح",
      clientUpdated: "تم تحديث العميل بنجاح",
      clientDeleted: "تم حذف العميل بنجاح",
      workDayAdded: "تم إضافة يوم العمل بنجاح",
      workDayUpdated: "تم تحديث يوم العمل بنجاح",
      settingsSaved: "تم حفظ الإعدادات بنجاح",

      // Additional translations
      day: "يوم",
      companyName: "شهاب فولينغ",
      employeeManagement: "نظام إدارة الموظفين",
      appSettings: "إعدادات التطبيق",
      light: "فاتح",
      dark: "داكن",
      themeLabel: "المظهر",
      welcomeTo: "مرحباً بك في",
      configureYour: "اضبط",
      locationRequired: "الموقع مطلوب",
      failedToChangeLanguage: "فشل في تغيير اللغة",
      failedToChangeTheme: "فشل في تغيير المظهر",
      failedToSaveClient: "فشل في حفظ العميل",
      failedToDeleteClient: "فشل في حذف العميل",
      businessClient: "عميل تجاري",
      thisMonth: "هذا الشهر",
      earnings: "الأرباح",
      advances: "السلف",
      clearDay: "مسح اليوم",
      hoursWorked: "ساعات العمل",
      location: "الموقع",
      dailyAdvance: "السلفة اليومية",
      advanceAmount: "مبلغ السلفة",
      enterAdvanceAmount: "أدخل مبلغ السلفة",
      advanceNote: "ستُخصم هذه السلفة من الأرباح الشهرية",
    },
  },
  fr: {
    translation: {
      // Navigation
      home: "Accueil",
      employees: "Employés",
      clients: "Clients",
      settings: "Paramètres",

      // Home/Dashboard
      dashboard: "Tableau de Bord",
      totalWorkedDays: "Total des Jours Travaillés",
      totalEarnings: "Gains Totaux",
      last15Days: "15 Derniers Jours",
      currentMonth: "Mois Actuel",
      noEmployees: "Aucun employé ajouté pour le moment",
      addFirstEmployee: "Ajoutez votre premier employé pour commencer",

      // Employees
      addEmployee: "Ajouter un Employé",
      employeeName: "Nom de l'Employé",
      dailyRate: "Tarif Journalier",
      searchEmployees: "Rechercher des employés...",
      editEmployee: "Modifier l'Employé",
      deleteEmployee: "Supprimer l'Employé",
      confirmDelete: "Êtes-vous sûr de vouloir supprimer cet employé?",
      workCalendar: "Calendrier de Travail",
      addWorkDay: "Ajouter un Jour de Travail",
      markAbsence: "Marquer une Absence",
      selectClients: "Sélectionner les Clients",
      notes: "Notes",
      workDays: "Jours de Travail",
      workDay: "Jour de Travail",
      absenceDays: "Jours d'Absence",
      monthlyEarnings: "Gains Mensuels",
      advancesGiven: "Avances Données",
      netEarnings: "Gains Nets",
      clientManagement: "Gestion des Clients",
      totalClients: "Total des Clients",
      totalEmployees: "Total des Employés",
      manageYour: "Gérez vos",

      // Clients
      addClient: "Ajouter un Client",
      clientName: "Nom du Client",
      contactInfo: "Informations de Contact",
      email: "Email",
      searchClients: "Rechercher des clients...",
      editClient: "Modifier le Client",
      deleteClient: "Supprimer le Client",
      noClients: "Aucun client ajouté pour le moment",
      Totalclient: "Total des Clients",

      // Settings
      language: "Langue",
      theme: "Thème",
      lightTheme: "Clair",
      darkTheme: "Sombre",
      english: "Anglais",
      arabic: "Arabe",
      french: "Français",

      // Common
      save: "Enregistrer",
      cancel: "Annuler",
      delete: "Supprimer",
      edit: "Modifier",
      add: "Ajouter",
      search: "Rechercher",
      filter: "Filtrer",
      close: "Fermer",
      confirm: "Confirmer",
      yes: "Oui",
      no: "Non",
      loading: "Chargement...",
      error: "Erreur",
      success: "Succès",
      required: "Requis",
      optional: "Optionnel",

      // Validation
      nameRequired: "Le nom est requis",
      rateRequired: "Le tarif journalier est requis",
      rateInvalid: "Veuillez entrer un tarif valide",
      contactRequired: "Les informations de contact sont requises",

      // Messages
      employeeAdded: "Employé ajouté avec succès",
      employeeUpdated: "Employé mis à jour avec succès",
      employeeDeleted: "Employé supprimé avec succès",
      clientAdded: "Client ajouté avec succès",
      clientUpdated: "Client mis à jour avec succès",
      clientDeleted: "Client supprimé avec succès",
      workDayAdded: "Jour de travail ajouté avec succès",
      workDayUpdated: "Jour de travail mis à jour avec succès",
      settingsSaved: "Paramètres enregistrés avec succès",

      // Additional translations
      day: "jour",
      companyName: "Shihabfalling",
      employeeManagement: "Système de Gestion des Employés",
      appSettings: "Paramètres de l'App",
      light: "Clair",
      dark: "Sombre",
      themeLabel: "Thème",
      welcomeTo: "Bienvenue dans votre",
      configureYour: "Configurez votre",
      locationRequired: "L'emplacement est requis",
      failedToChangeLanguage: "Échec du changement de langue",
      failedToChangeTheme: "Échec du changement de thème",
      failedToSaveClient: "Échec de l'enregistrement du client",
      failedToDeleteClient: "Échec de la suppression du client",
      businessClient: "Client Professionnel",
      thisMonth: "Ce Mois",
      earnings: "Gains",
      advances: "Avances",
      clearDay: "Effacer le Jour",
      hoursWorked: "Heures travaillées",
      location: "Emplacement",
      dailyAdvance: "Avance Quotidienne",
      advanceAmount: "Montant de l'Avance",
      enterAdvanceAmount: "Entrez le montant de l'avance",
      advanceNote: "Cette avance sera déduite des gains mensuels",
    },
  },
};

// Initialize i18n
i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
}) => {
  const [language, setLanguageState] = useState<Language>("en");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const settings = await settingsStorage.get();
      setLanguageState(settings.language);
      i18n.changeLanguage(settings.language);
    } catch (error) {
      console.error("Error loading language:", error);
    } finally {
      setIsLoaded(true);
    }
  };

  const setLanguage = async (newLanguage: Language) => {
    try {
      setLanguageState(newLanguage);
      i18n.changeLanguage(newLanguage);
      await settingsStorage.updateLanguage(newLanguage);
    } catch (error) {
      console.error("Error saving language:", error);
    }
  };

  const t = (key: string): string => {
    return i18n.t(key);
  };

  if (!isLoaded) {
    return null; // or a loading spinner
  }

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
