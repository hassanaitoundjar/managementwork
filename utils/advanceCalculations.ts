import { WorkRecord } from '../types';

/**
 * Calculate total advances for an employee from their work records
 */
export const calculateTotalAdvancesFromRecords = (workRecords: WorkRecord[]): number => {
  return workRecords.reduce((total, record) => {
    return total + (record.dailyAdvance || 0);
  }, 0);
};

/**
 * Calculate advances for a specific month
 */
export const calculateMonthlyAdvances = (workRecords: WorkRecord[], year: number, month: number): number => {
  return workRecords
    .filter(record => {
      const recordDate = new Date(record.date);
      return recordDate.getFullYear() === year && recordDate.getMonth() === month;
    })
    .reduce((total, record) => {
      return total + (record.dailyAdvance || 0);
    }, 0);
};

/**
 * Sync employee's total advances with actual work record advances
 * This helps fix any inconsistencies
 */
export const syncEmployeeAdvances = (workRecords: WorkRecord[]): number => {
  return calculateTotalAdvancesFromRecords(workRecords);
};
