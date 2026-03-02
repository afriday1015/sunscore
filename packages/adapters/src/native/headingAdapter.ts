/**
 * Native heading adapter using react-native-compass-heading
 * This is a placeholder - requires react-native-compass-heading package
 */
import { HeadingAdapter, HeadingState } from '../types';

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

export class NativeHeadingAdapter implements HeadingAdapter {
  private state: HeadingState = 'off';
  private stabilizer = new HeadingStabilizer();
  private unsubscribe: (() => void) | null = null;

  getHeadingState(): HeadingState {
    return this.state;
  }

  watchHeading(callback: (degrees: number) => void): () => void {
    // Placeholder implementation
    // In production, use react-native-compass-heading:
    //
    // import CompassHeading from 'react-native-compass-heading';
    //
    // CompassHeading.start(3, ({ heading }) => {
    //   const stabilized = this.stabilizer.addSample(heading);
    //   callback(stabilized);
    // });
    //
    // this.state = 'live';
    //
    // return () => {
    //   CompassHeading.stop();
    //   this.state = 'off';
    // };

    // For now, return a static heading
    this.state = 'mock';
    callback(0);

    return () => {
      this.state = 'off';
      this.stabilizer.reset();
    };
  }
}
