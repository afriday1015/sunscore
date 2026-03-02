/**
 * Native location adapter using React Native Geolocation
 * This is a placeholder - requires @react-native-community/geolocation
 */
import { LocationAdapter, LocationResult } from '../types';

export class NativeLocationAdapter implements LocationAdapter {
  getCurrentPosition(): Promise<LocationResult> {
    return new Promise((resolve, reject) => {
      // Placeholder implementation
      // In production, use @react-native-community/geolocation
      // For now, use a default location (Seoul)
      if (typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              lat: position.coords.latitude,
              lon: position.coords.longitude,
              accuracy: position.coords.accuracy
            });
          },
          (error) => {
            reject(new Error(error.message));
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
          }
        );
      } else {
        reject(new Error('Geolocation not available'));
      }
    });
  }

  watchPosition(callback: (result: LocationResult) => void): () => void {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          callback({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        () => {
          // Silently ignore errors
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 5000
        }
      );

      return () => {
        navigator.geolocation.clearWatch(watchId);
      };
    }

    return () => {};
  }
}
