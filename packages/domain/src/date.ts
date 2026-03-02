/**
 * Date utility functions
 */

/**
 * Change month while preserving day-of-month (clamped to valid range)
 * @param currentDate The current date
 * @param newMonth The new month (1-12)
 * @returns New Date with the month changed
 */
export function changeMonth(currentDate: Date, newMonth: number): Date {
  const year = currentDate.getFullYear();
  const day = currentDate.getDate();
  const hour = currentDate.getHours();
  const minute = currentDate.getMinutes();

  // Get last day of target month
  const lastDayOfMonth = new Date(year, newMonth, 0).getDate();
  const clampedDay = Math.min(day, lastDayOfMonth);

  return new Date(year, newMonth - 1, clampedDay, hour, minute);
}

/**
 * Snap time to nearest 10-minute increment
 */
export function snapToTenMinutes(date: Date): Date {
  const result = new Date(date);
  const minutes = result.getMinutes();
  const snappedMinutes = Math.round(minutes / 10) * 10;
  result.setMinutes(snappedMinutes);
  result.setSeconds(0);
  result.setMilliseconds(0);
  return result;
}

/**
 * Set time on a date while preserving the date
 */
export function setTime(date: Date, hours: number, minutes: number): Date {
  const result = new Date(date);
  result.setHours(hours);
  result.setMinutes(minutes);
  result.setSeconds(0);
  result.setMilliseconds(0);
  return result;
}

/**
 * Get current month (1-12)
 */
export function getCurrentMonth(): number {
  return new Date().getMonth() + 1;
}

/**
 * Format time as HH:mm
 */
export function formatTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Get month name from month number (1-12)
 */
export function getMonthName(month: number): string {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return monthNames[month - 1] || '';
}

/**
 * Get short month name from month number (1-12)
 */
export function getShortMonthName(month: number): string {
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  return monthNames[month - 1] || '';
}
