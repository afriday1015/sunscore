/**
 * Magnetic declination correction
 *
 * Device compasses (iOS webkitCompassHeading, Android DeviceOrientation alpha,
 * most native compass APIs) report headings relative to *magnetic* north.
 * suncalc returns sun bearings relative to *true* (geographic) north.
 *
 * To compare them on the same axis, we add the local magnetic declination
 * to the magnetic heading to obtain a true-north heading.
 *
 *   trueHeading = magneticHeading + declination
 *
 * Declination depends on location (lat/lon) and date, and is computed from
 * the World Magnetic Model (WMM) via the `geomagnetism` package.
 */
import geomagnetism from 'geomagnetism';
import { normalize } from './angles';
import type { Location } from './sunPosition';

/**
 * Get the magnetic declination at a given location and date, in degrees.
 * Positive = magnetic north is east of true north.
 * Negative = magnetic north is west of true north.
 */
export function getMagneticDeclination(
  location: Location,
  date: Date = new Date()
): number {
  const model = geomagnetism.model(date);
  const point = model.point([location.latitude, location.longitude]);
  return point.decl;
}

/**
 * Convert a magnetic-north heading to a true-north heading by applying
 * the local magnetic declination.
 */
export function magneticToTrueHeading(
  magneticHeadingDeg: number,
  location: Location,
  date: Date = new Date()
): number {
  const declination = getMagneticDeclination(location, date);
  return normalize(magneticHeadingDeg + declination);
}
