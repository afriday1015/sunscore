/**
 * Angle utility functions
 * All angles in degrees (0-360)
 */

const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

/**
 * Normalize angle to 0-360 range
 */
export function normalize(angle: number): number {
  return ((angle % 360) + 360) % 360;
}

/**
 * Convert degrees to radians
 */
export function toRadians(degrees: number): number {
  return degrees * DEG_TO_RAD;
}

/**
 * Convert radians to degrees
 */
export function toDegrees(radians: number): number {
  return radians * RAD_TO_DEG;
}

/**
 * Calculate the smallest angle difference between two angles
 * Returns a value between 0 and 180
 */
export function smallestAngleDiff(a: number, b: number): number {
  const diff = ((b - a + 180) % 360) - 180;
  return Math.abs(diff < -180 ? diff + 360 : diff);
}
