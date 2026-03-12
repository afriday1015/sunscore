/**
 * Main App component for SunScore web
 */
import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import {
  TopBar,
  MonthSlider,
  Radar,
  SunScoreBar,
  TimeSlider,
  PeakTimeDisplay,
  ErrorScreen,
  MockHeadingControl,
  colors,
  spacing,
  layout
} from '@sunscore/ui';
import { changeMonth, snapToTenMinutes, setTime } from '@sunscore/domain';
import {
  useLocation,
  useHeading,
  useSunCalculations,
  useCurrentTime
} from './hooks';

const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

export function App(): React.ReactElement {
  const currentTime = useCurrentTime();
  const { location, error: locationError, loading: locationLoading, retry } = useLocation();
  const { heading, headingState, setMockHeading, requestPermission } = useHeading();

  // Initialize selected date to current time
  const [selectedDate, setSelectedDate] = useState(() => snapToTenMinutes(new Date()));

  // Extract month from selected date
  const selectedMonth = selectedDate.getMonth() + 1;

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

  // Show loading state
  if (locationLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <View style={styles.loadingText}>Loading location...</View>
        </View>
      </View>
    );
  }

  // Show error state
  if (locationError) {
    return (
      <ErrorScreen
        message={locationError}
        actionLabel="Retry"
        onAction={retry}
      />
    );
  }

  // Location required
  if (!location || !sunCalcs) {
    return (
      <ErrorScreen
        message="Location required"
        actionLabel="Retry"
        onAction={retry}
      />
    );
  }

  return (
    <View style={styles.container}>
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

      {/* Orientation permission button (mobile only) */}
      {isMobile && headingState === 'permission-needed' && (
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>나침반 방향 허용</Text>
        </TouchableOpacity>
      )}

      {/* Mock Heading Control (desktop only) */}
      {!isMobile && (
        <MockHeadingControl
          value={heading}
          onChange={setMockHeading}
          visible={headingState === 'mock'}
        />
      )}
    </View>
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
  },
  permissionButton: {
    margin: 12,
    padding: 14,
    backgroundColor: colors.sunAccent,
    borderRadius: 10,
    alignItems: 'center'
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  }
});
