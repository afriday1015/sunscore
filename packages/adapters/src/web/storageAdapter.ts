import { StorageAdapter } from '../types';

export class WebStorageAdapter implements StorageAdapter {
  async getItem(key: string): Promise<string | null> {
    return window.localStorage.getItem(key);
  }

  async setItem(key: string, value: string): Promise<void> {
    window.localStorage.setItem(key, value);
  }
}
