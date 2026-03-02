/**
 * SunScore calculation
 *
 * SunScore represents the relative direct sunlight intensity
 * in the direction the device is facing.
 *
 * SunScore = altitudeFactor x directionFactor
 */
import { smallestAngleDiff, toRadians } from './angles';

/**
 * Calculate direction factor based on angle between sun and device heading
 * Returns 0-1 where 1 = directly facing the sun
 */
export function calculateDirectionFactor(
  sunBearing: number,
  deviceHeading: number
): number {
  const delta = smallestAngleDiff(sunBearing, deviceHeading);
  const deltaRad = toRadians(delta);
  return Math.max(0, Math.cos(deltaRad));
}

/**
 * Calculate altitude factor using discrete step function
 * Returns 0, 0.4, 0.7, or 1.0
 */
export function calculateAltitudeFactor(altitude: number): number {
  if (altitude <= 0) return 0;
  if (altitude < 10) return 0.4;
  if (altitude < 30) return 0.7;
  return 1.0;
}

/**
 * Calculate the final SunScore
 * Returns value between 0 and 1
 */
export function calculateSunScore(
  sunBearing: number,
  sunAltitude: number,
  deviceHeading: number
): number {
  const altFactor = calculateAltitudeFactor(sunAltitude);
  const dirFactor = calculateDirectionFactor(sunBearing, deviceHeading);
  return Math.max(0, Math.min(1, altFactor * dirFactor));
}
