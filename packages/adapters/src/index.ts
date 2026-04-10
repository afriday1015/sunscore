/**
 * Adapters package exports
 */

// Types
export type {
  LocationResult,
  LocationAdapter,
  HeadingState,
  HeadingAdapter,
  StorageAdapter
} from './types';

// Web adapters
export { WebLocationAdapter } from './web/locationAdapter';
export { WebHeadingAdapter } from './web/headingAdapter';
export { WebStorageAdapter } from './web/storageAdapter';

// Native adapters
export { NativeLocationAdapter } from './native/locationAdapter';
export { NativeHeadingAdapter } from './native/headingAdapter';
export { NativeStorageAdapter } from './native/storageAdapter';
