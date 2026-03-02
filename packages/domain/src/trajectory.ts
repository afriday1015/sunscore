/**
 * Daily sun trajectory calculation
 */
import { getSunPosition, Location } from './sunPosition';
import { normalize } from './angles';

export interface TrajectoryPoint {
  /** Time of this point */
  time: Date;
  /** Sun bearing in degrees (0-360) */
  bearingDeg: number;
  /** Sun altitude in degrees (-90 to 90) */
  altitudeDeg: number;
  /** Relative bearing to device heading */
  relativeBearingDeg: number;
  /** Whether the sun is above the horizon */
  isVisible: boolean;
}

/**
 * Calculate daily sun trajectory
 * Returns points sampled every 30 minutes
 */
export function calculateTrajectory(
  location: Location,
  date: Date,
  deviceHeading: number
): TrajectoryPoint[] {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const points: TrajectoryPoint[] = [];

  // Sample every 30 minutes (48 points)
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = new Date(year, month, day, hour, minute);
      const sunPos = getSunPosition(location, time);
      const relativeBearingDeg = normalize(sunPos.bearingDeg - deviceHeading);

      points.push({
        time,
        bearingDeg: sunPos.bearingDeg,
        altitudeDeg: sunPos.altitudeDeg,
        relativeBearingDeg,
        isVisible: sunPos.altitudeDeg > 0
      });
    }
  }

  return points;
}

/**
 * Filter trajectory to only visible points (altitude > 0)
 */
export function getVisibleTrajectory(
  trajectory: TrajectoryPoint[]
): TrajectoryPoint[] {
  return trajectory.filter(point => point.isVisible);
}
