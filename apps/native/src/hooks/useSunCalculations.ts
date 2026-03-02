/**
 * Sun calculations hook for native
 */
import { useMemo } from 'react';
import {
  getSunPosition,
  calculateSunScore,
  calculatePeakTime,
  calculateTrajectory,
  type Location,
  type SunPosition,
  type PeakTimeResult,
  type TrajectoryPoint
} from '@sunscore/domain';

interface UseSunCalculationsResult {
  sunPosition: SunPosition;
  sunScore: number;
  peakTime: PeakTimeResult;
  trajectory: TrajectoryPoint[];
}

export function useSunCalculations(
  location: Location | null,
  selectedDate: Date,
  deviceHeading: number
): UseSunCalculationsResult | null {
  const result = useMemo(() => {
    if (!location) {
      return null;
    }

    const sunPosition = getSunPosition(location, selectedDate);

    const sunScore = calculateSunScore(
      sunPosition.bearingDeg,
      sunPosition.altitudeDeg,
      deviceHeading
    );

    const peakTime = calculatePeakTime(location, selectedDate, deviceHeading);

    const trajectory = calculateTrajectory(location, selectedDate, deviceHeading);

    return {
      sunPosition,
      sunScore,
      peakTime,
      trajectory
    };
  }, [
    location?.latitude,
    location?.longitude,
    selectedDate.getTime(),
    Math.round(deviceHeading / 5) * 5
  ]);

  return result;
}
