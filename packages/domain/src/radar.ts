/**
 * Radar projection utilities
 */
import { normalize, toRadians } from './angles';

export interface RadarPoint {
  x: number;
  y: number;
}

export interface RadarConfig {
  centerX: number;
  centerY: number;
  maxRadius: number;
}

/**
 * Convert altitude to radius on radar
 * Higher altitude = closer to center
 * Altitude 90° (zenith) = center (radius 0)
 * Altitude 0° (horizon) = edge (radius maxRadius)
 */
export function altitudeToRadius(
  altitude: number,
  maxRadius: number
): number {
  const clampedAlt = Math.max(0, Math.min(90, altitude));
  return maxRadius * (1 - clampedAlt / 90);
}

/**
 * Calculate relative bearing (sun bearing relative to device heading)
 */
export function calculateRelativeBearing(
  sunBearing: number,
  deviceHeading: number
): number {
  return normalize(sunBearing - deviceHeading);
}

/**
 * Project sun position to radar coordinates
 */
export function projectToRadar(
  relativeBearing: number,
  altitude: number,
  config: RadarConfig
): RadarPoint {
  const radius = altitudeToRadius(altitude, config.maxRadius);

  // Convert bearing to cartesian angle
  // Bearing: 0 = top (north), 90 = right (east), etc.
  // Cartesian: 0 = right, 90 = top
  // So: theta = bearing - 90 (in degrees)
  const theta = toRadians(relativeBearing - 90);

  const x = config.centerX + radius * Math.cos(theta);
  const y = config.centerY + radius * Math.sin(theta);

  return { x, y };
}

/**
 * Generate SVG path for trajectory curve
 */
export function generateTrajectoryPath(
  points: Array<{ relativeBearingDeg: number; altitudeDeg: number; isVisible: boolean }>,
  config: RadarConfig
): string {
  const visiblePoints = points.filter(p => p.isVisible);

  if (visiblePoints.length < 2) {
    return '';
  }

  const projected = visiblePoints.map(p =>
    projectToRadar(p.relativeBearingDeg, p.altitudeDeg, config)
  );

  // Create smooth path using quadratic bezier curves
  let path = `M ${projected[0].x} ${projected[0].y}`;

  for (let i = 1; i < projected.length; i++) {
    const prev = projected[i - 1];
    const curr = projected[i];

    // Simple line to for now (could be enhanced with bezier for smoother curve)
    path += ` L ${curr.x} ${curr.y}`;
  }

  return path;
}
