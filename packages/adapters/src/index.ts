/**
 * Adapters package exports
 */

// Types
export type {
  LocationResult,
  LocationAdapter,
  HeadingState,
  HeadingAdapter
} from './types';

// Web adapters
export { WebLocationAdapter } from './web/locationAdapter';
export { WebHeadingAdapter } from './web/headingAdapter';

// Native adapters
export { NativeLocationAdapter } from './native/locationAdapter';
export { NativeHeadingAdapter } from './native/headingAdapter';
