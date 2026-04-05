/**
 * Main App component for SunScore web
 */
import React, { useState, useCallback, useMemo, useEffect } from 'react';
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
  DirectionInterpretation,
  LocationLabel,
  formatLocationAddress,
  colors
} from '@sunscore/ui';
import type { LocationDisplayState } from '@sunscore/ui';
import { reverseGeocode } from './services/geocoding';
import { changeMonth, snapToTenMinutes } from '@sunscore/domain';
import {
  useLocation,
  useHeading,
  useSunCalculations
} from './hooks';

const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

export function App(): React.ReactElement {
  const { location, error: locationError, loading: locationLoading, retry } = useLocation();
  const { heading, headingState, setMockHeading, requestPermission } = useHeading();

  // Location display state for reverse geocoding
  const [locationDisplay, setLocationDisplay] = useState<LocationDisplayState>({
    type: 'unavailable',
    message: '위치 확인 불가'
  });

  // Update location display when location changes
  useEffect(() => {
    if (!location) {
      setLocationDisplay({ type: 'unavailable', message: '위치 확인 불가' });
      return;
    }

    let cancelled = false;

    reverseGeocode(location.lat, location.lon)
      .then(components => {
        if (cancelled) return;
        const address = formatLocationAddress(components);
        if (address) {
          setLocationDisplay({ type: 'success', address });
        } else {
          setLocationDisplay({ type: 'coordinates-only', message: '현재 위치 기준' });
        }
      })
      .catch(() => {
        if (cancelled) return;
        setLocationDisplay({ type: 'coordinates-only', message: '현재 위치 기준' });
      });

    return () => { cancelled = true; };
  }, [location?.lat, location?.lon]);

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
          <Text style={styles.loadingText}>Loading location...</Text>
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
          peakTime={sunCalcs.peakTime.time}
        />

        <PeakTimeDisplay peakTime={sunCalcs.peakTime.time} />
      </View>

      {/* Interpretation or Permission */}
      {isMobile ? (
        headingState === 'permission-needed' ? (
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>나침반 방향 허용</Text>
          </TouchableOpacity>
        ) : (
          <>
            <DirectionInterpretation
              deviceHeadingDeg={heading}
              sunBearingDeg={sunCalcs.sunPosition.bearingDeg}
              sunAltitudeDeg={sunCalcs.sunPosition.altitudeDeg}
              visible={headingState === 'live' || headingState === 'mock'}
            />
            <LocationLabel displayState={locationDisplay} />
          </>
        )
      ) : (
        <>
          <DirectionInterpretation
            deviceHeadingDeg={heading}
            sunBearingDeg={sunCalcs.sunPosition.bearingDeg}
            sunAltitudeDeg={sunCalcs.sunPosition.altitudeDeg}
            visible={headingState === 'live' || headingState === 'mock'}
          />
          <LocationLabel displayState={locationDisplay} />
        </>
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
