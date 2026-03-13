/**
 * Location address formatting utility
 * Converts raw address components into a Korean address string
 * Format: "{시/도} {시/군/구} {동/읍/면}"
 */

export interface RawAddressComponents {
  province?: string;      // 시/도
  city?: string;          // 시/군/구
  neighborhood?: string;  // 동/읍/면
}

/**
 * Format raw address components into a Korean address string.
 * Components are joined with a single space, from most general to most specific.
 *
 * @param components - Raw address components from geocoding API
 * @returns Formatted address string, or empty string if formatting fails
 */
export function formatLocationAddress(
  components: RawAddressComponents | null | undefined
): string {
  if (!components || !components.province) {
    return '';  // Indicates formatting failure
  }

  const parts: string[] = [components.province];

  if (components.city) {
    parts.push(components.city);
  }

  if (components.neighborhood) {
    parts.push(components.neighborhood);
  }

  return parts.join(' ');
}
