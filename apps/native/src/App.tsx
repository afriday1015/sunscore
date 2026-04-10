/**
 * Main App component for SunScore native
 */
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { View, StyleSheet, SafeAreaView, Text } from 'react-native';
import {
  TopBar,
  MonthSlider,
  Radar,
  SunScoreBar,
  TimeSlider,
  PeakTimeDisplay,
  ErrorScreen,
  OnboardingOverlay,
  useOnboarding,
  ONBOARDING_STEPS,
  colors,
  spacing,
  layout
} from '@sunscore/ui';
import { changeMonth, snapToTenMinutes } from '@sunscore/domain';
import {
  NativeLocationAdapter,
  NativeHeadingAdapter,
  NativeStorageAdapter,
  type LocationResult,
  type HeadingState
} from '@sunscore/adapters';
import { useSunCalculations } from './hooks/useSunCalculations';

const locationAdapter = new NativeLocationAdapter();
const headingAdapter = new NativeHeadingAdapter();
const storageAdapter = new NativeStorageAdapter();

export function App(): React.ReactElement {
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [location, setLocation] = useState<LocationResult | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [heading, setHeading] = useState(0);
  const [headingState, setHeadingState] = useState<HeadingState>('off');
  const [selectedDate, setSelectedDate] = useState(() => snapToTenMinutes(new Date()));

  const selectedMonth = selectedDate.getMonth() + 1;

  // Onboarding
  const { showOnboarding, completeOnboarding, skipOnboarding } = useOnboarding(storageAdapter);
  const monthSelectorRef = useRef<View>(null);
  const currentMonthLabelRef = useRef<View>(null);
  const radarViewRef = useRef<View>(null);
  const sunscoreBarRef = useRef<View>(null);
  const quickTimeButtonsRef = useRef<View>(null);
  const timeSliderRef = useRef<View>(null);
  const compassRef = useRef<View>(null);

  const targetRefs = useMemo(() => ({
    'month-selector': monthSelectorRef,
    'current-month-label': currentMonthLabelRef,
    'radar-view': radarViewRef,
    'sunscore-bar': sunscoreBarRef,
    'quick-time-buttons': quickTimeButtonsRef,
    'time-slider': timeSliderRef,
    'compass-permission-or-bottom-guide': compassRef,
  }), []);

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
        monthLabelRef={currentMonthLabelRef}
      />

      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Month Slider */}
        <View ref={monthSelectorRef} collapsable={false}>
          <MonthSlider
            value={selectedMonth}
            onChange={handleMonthChange}
          />
        </View>

        {/* Radar and Score */}
        <View style={styles.centerContent}>
          <View ref={radarViewRef} collapsable={false}>
            <Radar
              sunBearing={sunCalcs.sunPosition.bearingDeg}
              sunAltitude={sunCalcs.sunPosition.altitudeDeg}
              deviceHeading={heading}
              trajectory={sunCalcs.trajectory}
            />
          </View>

          <View ref={sunscoreBarRef} collapsable={false}>
            <SunScoreBar score={sunCalcs.sunScore} />
          </View>
        </View>
      </View>

      {/* Time Controls */}
      <View style={styles.timeControls}>
        <TimeSlider
          value={selectedDate}
          onChange={handleTimeChange}
          currentTime={currentTime}
          peakTime={sunCalcs.peakTime.time}
          quickButtonsRef={quickTimeButtonsRef}
          timelineRef={timeSliderRef}
        />

        <View ref={compassRef} collapsable={false}>
          <PeakTimeDisplay peakTime={sunCalcs.peakTime.time} />
        </View>
      </View>

      <OnboardingOverlay
        steps={ONBOARDING_STEPS}
        targetRefs={targetRefs}
        visible={showOnboarding}
        onComplete={completeOnboarding}
        onSkip={skipOnboarding}
      />
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
