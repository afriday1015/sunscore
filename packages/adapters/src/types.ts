/**
 * Adapter interface types
 */

export interface LocationResult {
  lat: number;
  lon: number;
  accuracy: number;
}

export interface LocationAdapter {
  getCurrentPosition(): Promise<LocationResult>;
  watchPosition(callback: (result: LocationResult) => void): () => void;
}

export type HeadingState = 'live' | 'mock' | 'off';

export interface HeadingAdapter {
  watchHeading(callback: (degrees: number) => void): () => void;
  getHeadingState(): HeadingState;
  requestPermission?(): Promise<boolean>;
  setMockHeading?(degrees: number): void;
}
