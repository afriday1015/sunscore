/**
 * Current time hook - updates every minute
 */
import { useState, useEffect } from 'react';

export function useCurrentTime(): Date {
  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date());
    };

    // Calculate ms until next minute
    const now = new Date();
    const msUntilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();

    // Update at next minute boundary
    const timeout = setTimeout(() => {
      updateTime();
      // Then update every minute
      const interval = setInterval(updateTime, 60000);
      return () => clearInterval(interval);
    }, msUntilNextMinute);

    return () => clearTimeout(timeout);
  }, []);

  return currentTime;
}
