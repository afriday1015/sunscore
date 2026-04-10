import { WebStorageAdapter } from '../web/storageAdapter';

describe('WebStorageAdapter', () => {
  let adapter: WebStorageAdapter;
  let mockGetItem: jest.Mock;
  let mockSetItem: jest.Mock;

  beforeEach(() => {
    mockGetItem = jest.fn();
    mockSetItem = jest.fn();

    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: mockGetItem,
        setItem: mockSetItem,
      },
      writable: true,
      configurable: true,
    });

    adapter = new WebStorageAdapter();
  });

  it('getItem returns the value from localStorage', async () => {
    mockGetItem.mockReturnValue('some-value');

    const result = await adapter.getItem('test-key');

    expect(mockGetItem).toHaveBeenCalledWith('test-key');
    expect(result).toBe('some-value');
  });

  it('getItem returns null when key does not exist', async () => {
    mockGetItem.mockReturnValue(null);

    const result = await adapter.getItem('missing-key');

    expect(mockGetItem).toHaveBeenCalledWith('missing-key');
    expect(result).toBeNull();
  });

  it('setItem writes value to localStorage', async () => {
    await adapter.setItem('test-key', 'test-value');

    expect(mockSetItem).toHaveBeenCalledWith('test-key', 'test-value');
  });

  it('getItem returns a promise', () => {
    mockGetItem.mockReturnValue('value');
    const result = adapter.getItem('key');
    expect(result).toBeInstanceOf(Promise);
  });

  it('setItem returns a promise', () => {
    const result = adapter.setItem('key', 'value');
    expect(result).toBeInstanceOf(Promise);
  });
});
