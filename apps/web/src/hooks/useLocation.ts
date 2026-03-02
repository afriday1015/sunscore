/**
 * Location hook for web
 */
import { useState, useEffect, useCallback } from 'react';
import { WebLocationAdapter, type LocationResult } from '@sunscore/adapters';

interface UseLocationState {
  location: LocationResult | null;
  error: string | null;
  loading: boolean;
  retry: () => void;
}

const locationAdapter = new WebLocationAdapter();

export function useLocation(): UseLocationState {
  const [location, setLocation] = useState<LocationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLocation = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await locationAdapter.getCurrentPosition();
      setLocation(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocation();

    // Watch for location updates
    const unwatch = locationAdapter.watchPosition((result) => {
      setLocation(result);
    });

    return () => {
      unwatch();
    };
  }, [fetchLocation]);

  return {
    location,
    error,
    loading,
    retry: fetchLocation
  };
}
