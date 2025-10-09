import { Employee, EmployeeStats, WorkRecord, WorkShift } from '../types';
import { workRecordStorage } from './storage';

// Calculate total hours from shift data
export const calculateShiftHours = (shift: WorkShift): number => {
  if (shift.allDay) {
    return 8; // Standard full day = 8 hours
  }
  
  let totalHours = 0;
  if (shift.morning) totalHours += 4; // Morning shift = 4 hours
  if (shift.evening) totalHours += 4; // Evening shift = 4 hours
  
  return totalHours;
};

// Calculate total hours for a work record (supports both shift and legacy systems)
export const calculateRecordHours = (record: WorkRecord): number => {
  let totalHours = 0;
  
  // New shift system
  if (record.clientShifts) {
    Object.values(record.clientShifts).forEach(shift => {
      totalHours += calculateShiftHours(shift);
    });
  }
  
  // Legacy hours system (for backward compatibility)
  if (record.clientHours && totalHours === 0) {
    Object.values(record.clientHours).forEach(hours => {
      totalHours += hours;
    });
  }
  
  return totalHours;
};

// Calculate daily earnings based on shifts worked
export const calculateDailyEarnings = (record: WorkRecord, dailyRate: number): number => {
  if (record.isAbsence) {
    return 0;
  }

  // Check if using new shift system
  if (record.clientShifts && Object.keys(record.clientShifts).length > 0) {
    let hasFullDay = false;
    let hasMorning = false;
    let hasEvening = false;
    
    // Check all shifts for the day
    Object.values(record.clientShifts).forEach(shift => {
      if (shift.allDay) {
        hasFullDay = true;
      }
      if (shift.morning) {
        hasMorning = true;
      }
      if (shift.evening) {
        hasEvening = true;
      }
    });
    
    // Calculate earnings based on shifts
    if (hasFullDay || (hasMorning && hasEvening)) {
      return dailyRate; // Full day rate
    } else if (hasMorning || hasEvening) {
      return dailyRate / 2; // Half day rate
    } else {
      return 0; // No shifts selected
    }
  }
  
  // Legacy system - assume full day if any work recorded
  if (record.clientHours && Object.keys(record.clientHours).length > 0) {
    return dailyRate;
  }
  
  // Default to full day if client is assigned but no specific hours/shifts
  if (record.clientIds && record.clientIds.length > 0) {
    return dailyRate;
  }
  
  return 0;
};

export const calculateEmployeeStats = async (employee: Employee): Promise<EmployeeStats> => {
  const today = new Date();
  const last15DaysStart = new Date(today);
  last15DaysStart.setDate(today.getDate() - 15);

  const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  // Get work records for last 15 days
  const last15DaysRecords = await workRecordStorage.getByDateRange(
    employee.id,
    formatDate(last15DaysStart),
    formatDate(today)
  );

  // Get work records for current month
  const currentMonthRecords = await workRecordStorage.getByDateRange(
    employee.id,
    formatDate(currentMonthStart),
    formatDate(today)
  );

  // Calculate stats for last 15 days
  const last15DaysWorkDays = last15DaysRecords.filter(record => !record.isAbsence).length;
  const last15DaysEarnings = last15DaysRecords.reduce((total, record) => {
    return total + calculateDailyEarnings(record, employee.dailyRate);
  }, 0);

  // Calculate stats for current month
  const currentMonthWorkDays = currentMonthRecords.filter(record => !record.isAbsence).length;
  const currentMonthEarnings = currentMonthRecords.reduce((total, record) => {
    return total + calculateDailyEarnings(record, employee.dailyRate);
  }, 0);

  return {
    employeeId: employee.id,
    last15Days: {
      workDays: last15DaysWorkDays,
      totalEarnings: last15DaysEarnings,
    },
    currentMonth: {
      workDays: currentMonthWorkDays,
      totalEarnings: currentMonthEarnings,
    },
  };
};

export const calculateMonthlyStats = async (employee: Employee, year: number, month: number) => {
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const monthRecords = await workRecordStorage.getByDateRange(
    employee.id,
    formatDate(monthStart),
    formatDate(monthEnd)
  );

  const workDays = monthRecords.filter(record => !record.isAbsence).length;
  const totalEarnings = monthRecords.reduce((total, record) => {
    return total + calculateDailyEarnings(record, employee.dailyRate);
  }, 0);
  const absenceDays = monthRecords.filter(record => record.isAbsence).length;

  return {
    workDays,
    totalEarnings,
    absenceDays,
    totalRecords: monthRecords.length,
  };
};

export const getWorkDaysInMonth = (year: number, month: number): number => {
  const date = new Date(year, month, 1);
  let workDays = 0;

  while (date.getMonth() === month) {
    const dayOfWeek = date.getDay();
    // Count Monday to Friday as work days (1-5)
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      workDays++;
    }
    date.setDate(date.getDate() + 1);
  }

  return workDays;
};

export const formatCurrency = (amount: number, currency: string = 'MAD'): string => {
  return `${amount.toFixed(2)} ${currency}`;
};

export const getDateRangeArray = (startDate: string, endDate: string): string[] => {
  const dates: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  while (start <= end) {
    dates.push(start.toISOString().split('T')[0]);
    start.setDate(start.getDate() + 1);
  }

  return dates;
};

export const isWeekend = (dateString: string): boolean => {
  const date = new Date(dateString + 'T00:00:00');
  const dayOfWeek = date.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6; // Sunday = 0, Saturday = 6
};
