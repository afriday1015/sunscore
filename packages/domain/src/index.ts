/**
 * Domain package exports
 * Pure TypeScript sun calculations - no React dependencies
 */

// Angle utilities
export {
  normalize,
  toRadians,
  toDegrees,
  smallestAngleDiff
} from './angles';

// Date utilities
export {
  changeMonth,
  snapToTenMinutes,
  setTime,
  getCurrentMonth,
  formatTime,
  getMonthName,
  getShortMonthName
} from './date';

// Sun position
export {
  getSunPosition,
  getSunTimes,
  type SunPosition,
  type Location
} from './sunPosition';

// Magnetic declination
export {
  getMagneticDeclination,
  magneticToTrueHeading
} from './declination';

// SunScore calculation
export {
  calculateDirectionFactor,
  calculateAltitudeFactor,
  calculateSunScore
} from './sunScore';

// Peak time calculation
export {
  calculatePeakTime,
  createPeakTimeCacheKey,
  hasLocationChanged,
  hasHeadingChanged,
  type PeakTimeResult
} from './peakTime';

// Trajectory calculation
export {
  calculateTrajectory,
  getVisibleTrajectory,
  type TrajectoryPoint
} from './trajectory';

// Radar projection
export {
  altitudeToRadius,
  calculateRelativeBearing,
  projectToRadar,
  generateTrajectoryPath,
  type RadarPoint,
  type RadarConfig
} from './radar';

// Location utilities
export {
  getLocationQuality,
  getLocationQualityLabel,
  getLocationQualityColor,
  type LocationQuality
} from './location';
