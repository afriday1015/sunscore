/**
 * Native storage adapter using @react-native-async-storage/async-storage
 *
 * The consuming app (apps/native) must install @react-native-async-storage/async-storage.
 * We declare a minimal interface here so the adapters package compiles
 * without pulling RN-only dependencies into the web bundle.
 */
import { StorageAdapter } from '../types';

interface AsyncStorageStatic {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
}

// eslint-disable-next-line @typescript-eslint/no-var-requires
let AsyncStorage: AsyncStorageStatic;

try {
  // Resolved at runtime by the React Native bundler
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch {
  // Fallback: should never be reached in a properly configured native app
  AsyncStorage = {
    async getItem() {
      return null;
    },
    async setItem() {
      // noop
    }
  };
}

export class NativeStorageAdapter implements StorageAdapter {
  async getItem(key: string): Promise<string | null> {
    return AsyncStorage.getItem(key);
  }

  async setItem(key: string, value: string): Promise<void> {
    await AsyncStorage.setItem(key, value);
  }
}
