/**
 * Web location adapter using browser geolocation API
 */
import { LocationAdapter, LocationResult } from '../types';

export class WebLocationAdapter implements LocationAdapter {
  getCurrentPosition(): Promise<LocationResult> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          reject(this.mapError(error));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  }

  watchPosition(callback: (result: LocationResult) => void): () => void {
    if (!navigator.geolocation) {
      return () => {};
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        callback({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      () => {
        // Silently ignore watch errors
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

  private mapError(error: GeolocationPositionError): Error {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return new Error('Location access denied');
      case error.POSITION_UNAVAILABLE:
        return new Error('Location unavailable');
      case error.TIMEOUT:
        return new Error('Location request timed out');
      default:
        return new Error('Unknown location error');
    }
  }
}
