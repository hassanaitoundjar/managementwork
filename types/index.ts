// Theme types
export interface AppSettings {
    language: 'en' | 'ar' | 'fr';
    theme: 'light' | 'dark' | 'system';
}

export type Language = 'en' | 'ar' | 'fr';
export type Theme = 'light' | 'dark' | 'system';

// Employee types
export interface Employee {
    id: string;
    name: string;
    dailyRate: number;
    advances?: number;
    createdAt: string;
}

// Client types
export interface Client {
    id: string;
    name: string;
    location: string;
    createdAt: string;
}

// Work shift types
export interface WorkShift {
    morning?: boolean; // Morning shift
    evening?: boolean; // Evening shift
    allDay?: boolean; // Full day work
}

// Work record types
export interface WorkRecord {
    id: string;
    employeeId: string;
    date: string; // YYYY-MM-DD format
    clientIds: string[];
    clientHours?: { [clientId: string]: number }; // Legacy support
    clientShifts?: { [clientId: string]: WorkShift }; // New shift system
    isAbsence: boolean;
    dailyAdvance?: number; // Daily advance amount for this specific day
    createdAt: string;
}

// Statistics types
export interface EmployeeStats {
    employeeId: string;
    last15Days: {
        workDays: number;
        totalEarnings: number;
    };
    currentMonth: {
        workDays: number;
        totalEarnings: number;
    };
}

export interface MonthlyStats {
    workDays: number;
    totalEarnings: number;
    absenceDays: number;
}

// Settings types (already defined above)

// Storage types
export interface StorageItem {
    id: string;
    createdAt: string;
}
