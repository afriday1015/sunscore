/**
 * Main App component for SunScore native
 */
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, Text } from 'react-native';
import {
  TopBar,
  MonthSlider,
  Radar,
  SunScoreBar,
  TimeSlider,
  PeakTimeDisplay,
  ErrorScreen,
  colors,
  spacing,
  layout
} from '@sunscore/ui';
import { changeMonth, snapToTenMinutes } from '@sunscore/domain';
import {
  NativeLocationAdapter,
  NativeHeadingAdapter,
  type LocationResult,
  type HeadingState
} from '@sunscore/adapters';
import { useSunCalculations } from './hooks/useSunCalculations';

const locationAdapter = new NativeLocationAdapter();
const headingAdapter = new NativeHeadingAdapter();

export function App(): React.ReactElement {
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [location, setLocation] = useState<LocationResult | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [heading, setHeading] = useState(0);
  const [headingState, setHeadingState] = useState<HeadingState>('off');
  const [selectedDate, setSelectedDate] = useState(() => snapToTenMinutes(new Date()));

  const selectedMonth = selectedDate.getMonth() + 1;

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Fetch location
  useEffect(() => {
    const fetchLocation = async () => {
      setLocationLoading(true);
      try {
        const result = await locationAdapter.getCurrentPosition();
        setLocation(result);
        setLocationError(null);
      } catch (err) {
        setLocationError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLocationLoading(false);
      }
    };

    fetchLocation();

    const unwatch = locationAdapter.watchPosition((result) => {
      setLocation(result);
    });

    return () => {
      unwatch();
    };
  }, []);

  // Watch heading
  useEffect(() => {
    const unwatch = headingAdapter.watchHeading((degrees) => {
      setHeading(degrees);
      setHeadingState(headingAdapter.getHeadingState());
    });

    return () => {
      unwatch();
    };
  }, []);

  // Sun calculations
  const locationData = useMemo(() => {
    if (!location) return null;
    return { latitude: location.lat, longitude: location.lon };
  }, [location?.lat, location?.lon]);

  const sunCalcs = useSunCalculations(locationData, selectedDate, heading);

  // Handle month change
  const handleMonthChange = useCallback((month: number) => {
    setSelectedDate(prev => changeMonth(prev, month));
  }, []);

  // Handle time change
  const handleTimeChange = useCallback((time: Date) => {
    setSelectedDate(prev => {
      const newDate = new Date(prev);
      newDate.setHours(time.getHours());
      newDate.setMinutes(time.getMinutes());
      newDate.setSeconds(0);
      newDate.setMilliseconds(0);
      return newDate;
    });
  }, []);

  // Retry location
  const handleRetry = useCallback(async () => {
    setLocationLoading(true);
    try {
      const result = await locationAdapter.getCurrentPosition();
      setLocation(result);
      setLocationError(null);
    } catch (err) {
      setLocationError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLocationLoading(false);
    }
  }, []);

  // Show loading state
  if (locationLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading location...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state
  if (locationError) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorScreen
          message={locationError}
          actionLabel="Retry"
          onAction={handleRetry}
        />
      </SafeAreaView>
    );
  }

  // Location required
  if (!location || !sunCalcs) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorScreen
          message="Location required"
          actionLabel="Retry"
          onAction={handleRetry}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar */}
      <TopBar
        month={selectedMonth}
        selectedTime={selectedDate}
        headingState={headingState}
        locationAccuracy={location.accuracy}
      />

      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Month Slider */}
        <MonthSlider
          value={selectedMonth}
          onChange={handleMonthChange}
        />

        {/* Radar and Score */}
        <View style={styles.centerContent}>
          <Radar
            sunBearing={sunCalcs.sunPosition.bearingDeg}
            sunAltitude={sunCalcs.sunPosition.altitudeDeg}
            deviceHeading={heading}
            trajectory={sunCalcs.trajectory}
          />

          <SunScoreBar score={sunCalcs.sunScore} />
        </View>
      </View>

      {/* Time Controls */}
      <View style={styles.timeControls}>
        <TimeSlider
          value={selectedDate}
          onChange={handleTimeChange}
          currentTime={currentTime}
          peakTime={sunCalcs.peakTime.time}
        />

        <PeakTimeDisplay peakTime={sunCalcs.peakTime.time} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  loadingText: {
    color: colors.textSecondary
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row'
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  timeControls: {
    borderTopWidth: 1,
    borderTopColor: colors.border
  }
});
