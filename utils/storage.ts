import AsyncStorage from '@react-native-async-storage/async-storage';
import { Employee, Client, WorkRecord, AppSettings, Language, Theme } from '../types';

// Storage keys
const STORAGE_KEYS = {
  EMPLOYEES: 'employees',
  CLIENTS: 'clients',
  WORK_RECORDS: 'work_records',
  SETTINGS: 'app_settings',
};

// Generate unique ID
export const generateId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

// Generic storage class
class Storage<T extends { id: string }> {
  constructor(private key: string) {}

  async getAll(): Promise<T[]> {
    try {
      const data = await AsyncStorage.getItem(this.key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Error getting ${this.key}:`, error);
      return [];
    }
  }

  async getById(id: string): Promise<T | null> {
    try {
      const items = await this.getAll();
      return items.find(item => item.id === id) || null;
    } catch (error) {
      console.error(`Error getting ${this.key} by id:`, error);
      return null;
    }
  }

  async add(item: T): Promise<void> {
    try {
      const items = await this.getAll();
      items.push(item);
      await AsyncStorage.setItem(this.key, JSON.stringify(items));
    } catch (error) {
      console.error(`Error adding ${this.key}:`, error);
      throw error;
    }
  }

  async update(updatedItem: T): Promise<void> {
    try {
      const items = await this.getAll();
      const index = items.findIndex(item => item.id === updatedItem.id);
      if (index !== -1) {
        items[index] = updatedItem;
        await AsyncStorage.setItem(this.key, JSON.stringify(items));
      }
    } catch (error) {
      console.error(`Error updating ${this.key}:`, error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const items = await this.getAll();
      const filteredItems = items.filter(item => item.id !== id);
      await AsyncStorage.setItem(this.key, JSON.stringify(filteredItems));
    } catch (error) {
      console.error(`Error deleting ${this.key}:`, error);
      throw error;
    }
  }
}

// Employee storage
export const employeeStorage = new Storage<Employee>(STORAGE_KEYS.EMPLOYEES);

// Client storage
export const clientStorage = new Storage<Client>(STORAGE_KEYS.CLIENTS);

// Work record storage with additional methods
class WorkRecordStorage extends Storage<WorkRecord> {
  async getByEmployee(employeeId: string): Promise<WorkRecord[]> {
    try {
      const records = await this.getAll();
      return records.filter(record => record.employeeId === employeeId);
    } catch (error) {
      console.error('Error getting work records by employee:', error);
      return [];
    }
  }

  async getByDateRange(employeeId: string, startDate: string, endDate: string): Promise<WorkRecord[]> {
    try {
      const records = await this.getByEmployee(employeeId);
      return records.filter(record => 
        record.date >= startDate && record.date <= endDate
      );
    } catch (error) {
      console.error('Error getting work records by date range:', error);
      return [];
    }
  }
}

export const workRecordStorage = new WorkRecordStorage(STORAGE_KEYS.WORK_RECORDS);

// Settings storage
class SettingsStorage {
  private key = STORAGE_KEYS.SETTINGS;

  async get(): Promise<AppSettings> {
    try {
      const data = await AsyncStorage.getItem(this.key);
      const defaultSettings: AppSettings = {
        language: 'en',
        theme: 'system',
      };
      return data ? { ...defaultSettings, ...JSON.parse(data) } : defaultSettings;
    } catch (error) {
      console.error('Error getting settings:', error);
      return {
        language: 'en',
        theme: 'system',
      };
    }
  }

  async update(settings: Partial<AppSettings>): Promise<void> {
    try {
      const currentSettings = await this.get();
      const updatedSettings = { ...currentSettings, ...settings };
      await AsyncStorage.setItem(this.key, JSON.stringify(updatedSettings));
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  }

  async updateLanguage(language: Language): Promise<void> {
    await this.update({ language });
  }

  async updateTheme(theme: Theme): Promise<void> {
    await this.update({ theme });
  }
}

export const settingsStorage = new SettingsStorage();
