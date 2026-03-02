/**
 * Location quality utilities
 */

export type LocationQuality = 'precise' | 'approx' | 'weak';

/**
 * Get location quality category based on accuracy
 */
export function getLocationQuality(accuracy: number): LocationQuality {
  if (accuracy < 15) return 'precise';
  if (accuracy < 50) return 'approx';
  return 'weak';
}

/**
 * Get display label for location quality
 */
export function getLocationQualityLabel(quality: LocationQuality): string {
  switch (quality) {
    case 'precise': return 'Precise';
    case 'approx': return 'Approx';
    case 'weak': return 'Weak';
  }
}

/**
 * Get color for location quality indicator
 */
export function getLocationQualityColor(quality: LocationQuality): string {
  switch (quality) {
    case 'precise': return '#4CAF50'; // green
    case 'approx': return '#FFC107'; // yellow
    case 'weak': return '#FF9800'; // orange
  }
}
