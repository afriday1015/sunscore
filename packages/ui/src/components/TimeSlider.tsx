/**
 * Time slider component
 * Horizontal scrollable timeline with center indicator for time selection
 */
import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent
} from 'react-native';
import { formatTime } from '@sunscore/domain';
import { colors, typography, spacing, layout } from '../theme';

interface TimeSliderProps {
  value: Date;
  onChange: (time: Date) => void;
  peakTime: Date | null;
}

const SLOT_WIDTH = 20;
const SLOTS_PER_HOUR = 6;
const TOTAL_SLOTS = 24 * SLOTS_PER_HOUR;
const QUICK_HOURS = [10, 12, 14, 16];

export function TimeSlider({
  value,
  onChange,
  peakTime
}: TimeSliderProps): React.ReactElement {
  const scrollRef = useRef<ScrollView>(null);

  const currentSlot = (value.getHours() * 60 + value.getMinutes()) / 10;
  const peakTimeSlot = peakTime
    ? (peakTime.getHours() * 60 + peakTime.getMinutes()) / 10
    : null;

  useEffect(() => {
    // Scroll so current value is under the center indicator
    // With paddingHorizontal = screenWidth/2, slot n is centered at offsetX = n * SLOT_WIDTH
    const offset = currentSlot * SLOT_WIDTH;
    scrollRef.current?.scrollTo({ x: Math.max(0, offset), animated: false });
  }, []);

  /**
   * Scroll the timeline so the given hour:minute appears under the center indicator.
   */
  const scrollToTime = (hours: number, minutes: number = 0) => {
    const slot = (hours * 60 + minutes) / 10;
    const targetOffset = slot * SLOT_WIDTH;
    scrollRef.current?.scrollTo({ x: Math.max(0, targetOffset), animated: true });
  };

  /**
   * Continuous scroll handler — updates selected time to the slot under the center indicator.
   * No debounce: instant feedback during scroll.
   */
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;

    // With paddingHorizontal = screenWidth/2, offsetX maps directly to slot index:
    // slot n is centered when offsetX = n * SLOT_WIDTH
    const slot = Math.floor(offsetX / SLOT_WIDTH);
    const clampedSlot = Math.max(0, Math.min(TOTAL_SLOTS - 1, slot));

    const totalMinutes = clampedSlot * 10;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    const newTime = new Date(value);
    newTime.setHours(hours);
    newTime.setMinutes(minutes);
    onChange(newTime);
  };

  /**
   * Snap to the nearest 10-minute slot after momentum scroll ends.
   */
  const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;

    const slot = Math.round(offsetX / SLOT_WIDTH);
    const clampedSlot = Math.max(0, Math.min(TOTAL_SLOTS - 1, slot));

    const targetOffset = clampedSlot * SLOT_WIDTH;
    scrollRef.current?.scrollTo({ x: Math.max(0, targetOffset), animated: true });
  };

  const handleQuickPress = (hour: number) => {
    scrollToTime(hour, 0);
  };

  const handleNowPress = () => {
    const now = new Date();
    const minutes = Math.round(now.getMinutes() / 10) * 10;
    scrollToTime(now.getHours(), minutes);
  };

  return (
    <View style={styles.container}>
      {/* Quick buttons */}
      <View style={styles.quickButtons}>
        {QUICK_HOURS.map((hour) => (
          <TouchableOpacity
            key={hour}
            style={styles.quickButton}
            onPress={() => handleQuickPress(hour)}
          >
            <Text style={styles.quickButtonText}>{hour}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Timeline */}
      <View style={styles.timelineContainer}>
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.timelineContent}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          snapToInterval={SLOT_WIDTH}
          decelerationRate="fast"
        >
          {Array.from({ length: TOTAL_SLOTS }, (_, slot) => {
            const isHour = slot % SLOTS_PER_HOUR === 0;
            const hour = Math.floor(slot / SLOTS_PER_HOUR);
            const isPeakTime = peakTimeSlot !== null && slot === Math.floor(peakTimeSlot);

            return (
              // No tap-to-select: selection is driven by scroll position
              <View
                key={slot}
                style={styles.slot}
              >
                <View
                  style={[
                    styles.tick,
                    isHour ? styles.tickHour : styles.tickMinor
                  ]}
                />
                {isHour && (
                  <Text style={styles.hourLabel}>
                    {hour.toString().padStart(2, '0')}
                  </Text>
                )}
                {isPeakTime && <View style={styles.peakTimeMarker} />}
              </View>
            );
          })}
        </ScrollView>

        {/* Fixed center indicator — the selected time is always the slot under this */}
        <View
          style={styles.centerIndicatorContainer}
          accessible={true}
          accessibilityLabel="Selected time indicator"
          accessibilityHint="Scroll the timeline to change the selected time"
          pointerEvents="none"
        >
          <View style={styles.centerTriangle} />
          <View style={styles.centerLine} />
        </View>

        {/* Now button */}
        <TouchableOpacity style={styles.nowButton} onPress={handleNowPress}>
          <Text style={styles.nowButtonText}>Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: layout.timeSliderHeight,
    backgroundColor: colors.background
  },
  quickButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs
  },
  quickButton: {
    width: layout.minTouchTarget,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.sliderTrack,
    alignItems: 'center',
    justifyContent: 'center'
  },
  quickButtonText: {
    ...typography.label,
    color: colors.textSecondary
  },
  timelineContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  timelineContent: {
    paddingHorizontal: Dimensions.get('window').width / 2
  },
  slot: {
    width: SLOT_WIDTH,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: spacing.sm
  },
  tick: {
    width: 1,
    backgroundColor: colors.border
  },
  tickHour: {
    height: 16
  },
  tickMinor: {
    height: 8
  },
  hourLabel: {
    ...typography.small,
    color: colors.textMuted,
    marginTop: 2
  },
  // Peak time marker — amber diamond, scrolls with timeline
  peakTimeMarker: {
    position: 'absolute',
    top: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F4B95A',
    transform: [{ rotate: '45deg' }],
    zIndex: 5
  },
  // Fixed center indicator — shows which time is selected, does not scroll
  centerIndicatorContainer: {
    position: 'absolute',
    left: '50%' as unknown as number,
    marginLeft: -1, // half of line width to truly center
    top: 0,
    height: '100%' as unknown as number,
    zIndex: 10,
    alignItems: 'center'
  },
  centerTriangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#E74C3C',
    alignSelf: 'center',
    marginBottom: 2
  },
  centerLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E74C3C'
  },
  nowButton: {
    width: layout.minTouchTarget,
    height: layout.minTouchTarget,
    borderRadius: 22,
    backgroundColor: colors.sunAccent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm
  },
  nowButtonText: {
    ...typography.label,
    color: colors.textPrimary,
    fontWeight: '600'
  }
});
