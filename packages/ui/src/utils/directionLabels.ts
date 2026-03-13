/**
 * Direction label utilities
 * Converts heading/bearing angles into Korean direction labels
 * using 8-direction segmentation (45° per segment)
 */

/**
 * Convert absolute heading (0-360°) to Korean direction label.
 * Uses 8-direction segmentation with 45° per segment.
 *
 * @param headingDeg - Device heading in degrees (0 = North, 90 = East)
 * @returns Korean direction label (e.g. '북쪽', '남서쪽')
 */
export function getAbsoluteDirectionLabel(headingDeg: number): string {
  // Normalize to 0-360 range
  const normalized = ((headingDeg % 360) + 360) % 360;

  // 8-direction boundaries (45° per segment)
  if (normalized >= 337.5 || normalized < 22.5) {
    return '북쪽';
  } else if (normalized >= 22.5 && normalized < 67.5) {
    return '북동쪽';
  } else if (normalized >= 67.5 && normalized < 112.5) {
    return '동쪽';
  } else if (normalized >= 112.5 && normalized < 157.5) {
    return '남동쪽';
  } else if (normalized >= 157.5 && normalized < 202.5) {
    return '남쪽';
  } else if (normalized >= 202.5 && normalized < 247.5) {
    return '남서쪽';
  } else if (normalized >= 247.5 && normalized < 292.5) {
    return '서쪽';
  } else {
    return '북서쪽';
  }
}

/**
 * Convert relative bearing (0-360°) to Korean position label.
 * Uses 8-position segmentation relative to the user's facing direction.
 * 0° = directly ahead, 90° = right, 180° = behind, 270° = left.
 *
 * @param relativeBearingDeg - Bearing relative to user's facing direction
 * @returns Korean position label (e.g. '정면', '왼쪽 앞')
 */
export function getRelativePositionLabel(relativeBearingDeg: number): string {
  // Normalize to 0-360 range
  const normalized = ((relativeBearingDeg % 360) + 360) % 360;

  // 8-position boundaries (45° per segment)
  if (normalized >= 337.5 || normalized < 22.5) {
    return '정면';
  } else if (normalized >= 22.5 && normalized < 67.5) {
    return '오른쪽 앞';
  } else if (normalized >= 67.5 && normalized < 112.5) {
    return '오른쪽';
  } else if (normalized >= 112.5 && normalized < 157.5) {
    return '오른쪽 뒤';
  } else if (normalized >= 157.5 && normalized < 202.5) {
    return '뒤';
  } else if (normalized >= 202.5 && normalized < 247.5) {
    return '왼쪽 뒤';
  } else if (normalized >= 247.5 && normalized < 292.5) {
    return '왼쪽';
  } else {
    return '왼쪽 앞';
  }
}
