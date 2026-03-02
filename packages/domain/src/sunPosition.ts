/**
 * Sun position calculation using suncalc
 */
import SunCalc from 'suncalc';
import { toDegrees, normalize } from './angles';

export interface SunPosition {
  /** Sun bearing in degrees (0-360, clockwise from North) */
  bearingDeg: number;
  /** Sun altitude in degrees (-90 to 90, 0 = horizon) */
  altitudeDeg: number;
}

export interface Location {
  latitude: number;
  longitude: number;
}

/**
 * Calculate sun position for a given location and time
 */
export function getSunPosition(
  location: Location,
  dateTime: Date
): SunPosition {
  const { azimuth, altitude } = SunCalc.getPosition(
    dateTime,
    location.latitude,
    location.longitude
  );

  // suncalc returns azimuth in radians, measured from south (0), clockwise
  // We need degrees from north (0), clockwise
  // South-based to North-based: add 180 degrees
  const bearingDeg = normalize(toDegrees(azimuth) + 180);

  // suncalc returns altitude in radians
  const altitudeDeg = toDegrees(altitude);

  return {
    bearingDeg,
    altitudeDeg
  };
}

/**
 * Get sun times for a given location and date
 */
export function getSunTimes(
  location: Location,
  date: Date
): SunCalc.GetTimesResult {
  return SunCalc.getTimes(date, location.latitude, location.longitude);
}
