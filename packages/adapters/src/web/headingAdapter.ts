/**
 * Web heading adapter using DeviceOrientationEvent
 * Falls back to mock heading when not available
 */
import { HeadingAdapter, HeadingState } from '../types';

interface DeviceOrientationEventWithWebkit extends DeviceOrientationEvent {
  webkitCompassHeading?: number;
}

/**
 * Heading stabilizer using circular average
 */
class HeadingStabilizer {
  private samples: number[] = [];
  private maxSamples = 3;

  addSample(heading: number): number {
    this.samples.push(heading);
    if (this.samples.length > this.maxSamples) {
      this.samples.shift();
    }
    return this.getCircularAverage();
  }

  private getCircularAverage(): number {
    if (this.samples.length === 0) return 0;

    const sinSum = this.samples.reduce(
      (sum, h) => sum + Math.sin((h * Math.PI) / 180),
      0
    );
    const cosSum = this.samples.reduce(
      (sum, h) => sum + Math.cos((h * Math.PI) / 180),
      0
    );

    let avg =
      Math.atan2(
        sinSum / this.samples.length,
        cosSum / this.samples.length
      ) *
      (180 / Math.PI);

    if (avg < 0) avg += 360;
    return avg;
  }

  reset(): void {
    this.samples = [];
  }
}

export class WebHeadingAdapter implements HeadingAdapter {
  private state: HeadingState = 'off';
  private mockHeading = 0;
  private stabilizer = new HeadingStabilizer();
  private validReadingCount = 0;
  private lastCallbackTime = 0;
  private debounceMs = 100;
  private currentCallback: ((degrees: number) => void) | null = null;
  private eventHandler: ((event: DeviceOrientationEvent) => void) | null = null;

  getHeadingState(): HeadingState {
    return this.state;
  }

  setMockHeading(degrees: number): void {
    this.mockHeading = degrees;
    if (this.state === 'mock' && this.currentCallback) {
      this.currentCallback(degrees);
    }
  }

  async requestPermission(): Promise<boolean> {
    // Check if DeviceOrientationEvent is supported
    if (typeof DeviceOrientationEvent === 'undefined') {
      this.state = 'mock';
      return false;
    }

    // iOS 13+ requires permission request
    const DeviceOrientationEventTyped = DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<string>;
    };

    if (typeof DeviceOrientationEventTyped.requestPermission === 'function') {
      try {
        const permission = await DeviceOrientationEventTyped.requestPermission();
        if (permission === 'granted') {
          return true;
        }
        this.state = 'mock';
        return false;
      } catch {
        this.state = 'mock';
        return false;
      }
    }

    // Android/Desktop - permission not required
    return true;
  }

  watchHeading(callback: (degrees: number) => void): () => void {
    this.currentCallback = callback;

    // If we don't have live heading, use mock
    if (this.state === 'mock' || this.state === 'off') {
      this.startMockFallback(callback);
    }

    // Try to use device orientation
    if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
      this.eventHandler = (event: DeviceOrientationEvent) => {
        this.handleOrientationEvent(event, callback);
      };

      window.addEventListener('deviceorientation', this.eventHandler);

      // Set timeout to fallback to mock if no valid readings
      setTimeout(() => {
        if (this.validReadingCount < 3 && this.state !== 'live') {
          this.state = 'mock';
          callback(this.mockHeading);
        }
      }, 5000);
    } else {
      this.state = 'mock';
      callback(this.mockHeading);
    }

    return () => {
      this.cleanup();
    };
  }

  private handleOrientationEvent(
    event: DeviceOrientationEvent,
    callback: (degrees: number) => void
  ): void {
    const now = Date.now();
    if (now - this.lastCallbackTime < this.debounceMs) {
      return;
    }

    let heading: number | null = null;

    // Try webkitCompassHeading first (iOS)
    const eventWithWebkit = event as DeviceOrientationEventWithWebkit;
    if (typeof eventWithWebkit.webkitCompassHeading === 'number') {
      heading = eventWithWebkit.webkitCompassHeading;
    }
    // Fall back to alpha (Android)
    else if (typeof event.alpha === 'number') {
      // Alpha is 0-360, but 0 points to the direction the device was facing when orientation was first detected
      // For compass heading, we need to convert based on screen orientation
      heading = (360 - event.alpha) % 360;
    }

    // Validate heading
    if (heading === null || isNaN(heading)) {
      return;
    }

    this.validReadingCount++;

    // After 3 valid readings, switch to live mode
    if (this.validReadingCount >= 3) {
      this.state = 'live';
    }

    // Stabilize the heading
    const stabilizedHeading = this.stabilizer.addSample(heading);

    this.lastCallbackTime = now;
    callback(stabilizedHeading);
  }

  private startMockFallback(callback: (degrees: number) => void): void {
    this.state = 'mock';
    callback(this.mockHeading);
  }

  private cleanup(): void {
    if (this.eventHandler) {
      window.removeEventListener('deviceorientation', this.eventHandler);
      this.eventHandler = null;
    }
    this.currentCallback = null;
    this.validReadingCount = 0;
    this.stabilizer.reset();
  }
}
