/**
 * Peak time calculation
 *
 * Peak time = time of day with maximum SunScore
 */
import { getSunPosition, Location } from './sunPosition';
import { calculateSunScore } from './sunScore';

export interface PeakTimeResult {
  time: Date;
  score: number;
}

/**
 * Calculate the peak SunScore time for a given day
 * Scans the day in 10-minute increments (144 samples)
 */
export function calculatePeakTime(
  location: Location,
  date: Date,
  deviceHeading: number
): PeakTimeResult {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  let peakTime = new Date(year, month, day, 12, 0);
  let peakScore = 0;

  // Scan from 00:00 to 23:50 in 10-minute increments
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 10) {
      const testTime = new Date(year, month, day, hour, minute);
      const sunPos = getSunPosition(location, testTime);
      const score = calculateSunScore(
        sunPos.bearingDeg,
        sunPos.altitudeDeg,
        deviceHeading
      );

      if (score > peakScore) {
        peakScore = score;
        peakTime = testTime;
      }
    }
  }

  return {
    time: peakTime,
    score: peakScore
  };
}

/**
 * Create a cache key for peak time memoization
 */
export function createPeakTimeCacheKey(
  month: number,
  lat: number,
  lon: number,
  heading: number
): string {
  // Round to reasonable precision
  const roundedLat = Math.round(lat * 100) / 100;
  const roundedLon = Math.round(lon * 100) / 100;
  const roundedHeading = Math.round(heading / 15) * 15;
  return `${month}-${roundedLat}-${roundedLon}-${roundedHeading}`;
}

/**
 * Check if location has changed significantly (>100m)
 */
export function hasLocationChanged(
  oldLat: number,
  oldLon: number,
  newLat: number,
  newLon: number
): boolean {
  // Approximate check using degrees (~111km per degree at equator)
  const latDiff = Math.abs(newLat - oldLat);
  const lonDiff = Math.abs(newLon - oldLon);
  // 100m ≈ 0.0009 degrees
  return latDiff > 0.0009 || lonDiff > 0.0009;
}

/**
 * Check if heading has changed significantly (>15°)
 */
export function hasHeadingChanged(
  oldHeading: number,
  newHeading: number
): boolean {
  const diff = Math.abs(newHeading - oldHeading);
  return diff > 15 && diff < 345; // Handle wrap-around
}
