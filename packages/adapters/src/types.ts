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

export type HeadingState = 'live' | 'mock' | 'off' | 'permission-needed';

export interface HeadingAdapter {
  watchHeading(callback: (degrees: number) => void): () => void;
  getHeadingState(): HeadingState;
  requestPermission?(): Promise<boolean>;
  setMockHeading?(degrees: number): void;
}

export interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
}
