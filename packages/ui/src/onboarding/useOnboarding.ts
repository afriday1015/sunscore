import { useState, useEffect, useCallback } from 'react';

interface OnboardingStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
}

interface UseOnboardingResult {
  showOnboarding: boolean;
  completeOnboarding: (permanent: boolean) => void;
  skipOnboarding: () => void;
  loading: boolean;
}

const STORAGE_KEY = 'sunscore.onboarding.v1.completed';

export function useOnboarding(storage: OnboardingStorage): UseOnboardingResult {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    storage.getItem(STORAGE_KEY).then((value) => {
      if (cancelled) return;
      if (value === 'true') {
        setShowOnboarding(false);
      } else {
        setShowOnboarding(true);
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [storage]);

  const completeOnboarding = useCallback(
    (permanent: boolean) => {
      setShowOnboarding(false);
      if (permanent) {
        storage.setItem(STORAGE_KEY, 'true');
      }
    },
    [storage],
  );

  const skipOnboarding = useCallback(() => {
    setShowOnboarding(false);
  }, []);

  return {
    showOnboarding,
    completeOnboarding,
    skipOnboarding,
    loading,
  };
}
