import { Employee, EmployeeStats } from '../types';
import { workRecordStorage } from './storage';

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
  const last15DaysEarnings = last15DaysWorkDays * employee.dailyRate;

  // Calculate stats for current month
  const currentMonthWorkDays = currentMonthRecords.filter(record => !record.isAbsence).length;
  const currentMonthEarnings = currentMonthWorkDays * employee.dailyRate;

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
  const totalEarnings = workDays * employee.dailyRate;
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
