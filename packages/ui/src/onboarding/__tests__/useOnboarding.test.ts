import { renderHook, act } from '@testing-library/react';
import { useOnboarding } from '../useOnboarding';

interface MockStorage {
  getItem: jest.Mock<Promise<string | null>, [string]>;
  setItem: jest.Mock<Promise<void>, [string, string]>;
}

function createMockStorage(initialValue: string | null = null): MockStorage {
  return {
    getItem: jest.fn<Promise<string | null>, [string]>().mockResolvedValue(initialValue),
    setItem: jest.fn<Promise<void>, [string, string]>().mockResolvedValue(undefined),
  };
}

const STORAGE_KEY = 'sunscore.onboarding.v1.completed';

describe('useOnboarding', () => {
  it('reads the storage key on initial load', async () => {
    const storage = createMockStorage(null);

    renderHook(() => useOnboarding(storage));

    expect(storage.getItem).toHaveBeenCalledWith(STORAGE_KEY);
  });

  it('sets showOnboarding to false when storage returns "true"', async () => {
    const storage = createMockStorage('true');

    const { result } = renderHook(() => useOnboarding(storage));

    // Wait for the async effect to complete
    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.showOnboarding).toBe(false);
    expect(result.current.loading).toBe(false);
  });

  it('sets showOnboarding to true when storage returns null', async () => {
    const storage = createMockStorage(null);

    const { result } = renderHook(() => useOnboarding(storage));

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.showOnboarding).toBe(true);
    expect(result.current.loading).toBe(false);
  });

  it('loading is true initially', () => {
    const storage = createMockStorage(null);

    const { result } = renderHook(() => useOnboarding(storage));

    // Before the effect resolves, loading should be true
    expect(result.current.loading).toBe(true);
  });

  it('completeOnboarding(true) writes to storage and hides onboarding', async () => {
    const storage = createMockStorage(null);

    const { result } = renderHook(() => useOnboarding(storage));

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.showOnboarding).toBe(true);

    act(() => {
      result.current.completeOnboarding(true);
    });

    expect(result.current.showOnboarding).toBe(false);
    expect(storage.setItem).toHaveBeenCalledWith(STORAGE_KEY, 'true');
  });

  it('completeOnboarding(false) does NOT write to storage, just hides onboarding', async () => {
    const storage = createMockStorage(null);

    const { result } = renderHook(() => useOnboarding(storage));

    await act(async () => {
      await Promise.resolve();
    });

    act(() => {
      result.current.completeOnboarding(false);
    });

    expect(result.current.showOnboarding).toBe(false);
    expect(storage.setItem).not.toHaveBeenCalled();
  });

  it('skipOnboarding does NOT write to storage, just hides onboarding', async () => {
    const storage = createMockStorage(null);

    const { result } = renderHook(() => useOnboarding(storage));

    await act(async () => {
      await Promise.resolve();
    });

    act(() => {
      result.current.skipOnboarding();
    });

    expect(result.current.showOnboarding).toBe(false);
    expect(storage.setItem).not.toHaveBeenCalled();
  });
});
