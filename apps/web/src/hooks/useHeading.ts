/**
 * Heading hook for web
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { WebHeadingAdapter, type HeadingState } from '@sunscore/adapters';

interface UseHeadingResult {
  heading: number;
  headingState: HeadingState;
  setMockHeading: (degrees: number) => void;
  requestPermission: () => Promise<void>;
}

export function useHeading(): UseHeadingResult {
  const [heading, setHeading] = useState(0);
  const [headingState, setHeadingState] = useState<HeadingState>('off');
  const adapterRef = useRef<WebHeadingAdapter | null>(null);

  useEffect(() => {
    const adapter = new WebHeadingAdapter();
    adapterRef.current = adapter;

    const unwatch = adapter.watchHeading((degrees) => {
      setHeading(degrees);
      setHeadingState(adapter.getHeadingState());
    });

    // Sync initial adapter state (e.g., 'permission-needed' on iOS)
    setHeadingState(adapter.getHeadingState());

    return () => {
      unwatch();
    };
  }, []);

  const setMockHeading = useCallback((degrees: number) => {
    if (adapterRef.current) {
      adapterRef.current.setMockHeading(degrees);
      setHeading(degrees);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (adapterRef.current && adapterRef.current.requestPermission) {
      await adapterRef.current.requestPermission();
      setHeadingState(adapterRef.current.getHeadingState());
    }
  }, []);

  return {
    heading,
    headingState,
    setMockHeading,
    requestPermission
  };
}
