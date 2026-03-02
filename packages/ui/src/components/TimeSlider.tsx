/**
 * Time slider component
 * Horizontal scrollable timeline with quick buttons
 */
import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { formatTime } from '@sunscore/domain';
import { colors, typography, spacing, layout } from '../theme';

interface TimeSliderProps {
  value: Date;
  onChange: (time: Date) => void;
  currentTime: Date;
  peakTime: Date | null;
}

const SLOT_WIDTH = 20;
const SLOTS_PER_HOUR = 6;
const TOTAL_SLOTS = 24 * SLOTS_PER_HOUR;
const QUICK_HOURS = [10, 12, 14, 16];

export function TimeSlider({
  value,
  onChange,
  currentTime,
  peakTime
}: TimeSliderProps): React.ReactElement {
  const scrollRef = useRef<ScrollView>(null);

  const currentSlot = (value.getHours() * 60 + value.getMinutes()) / 10;
  const currentTimeSlot = (currentTime.getHours() * 60 + currentTime.getMinutes()) / 10;
  const peakTimeSlot = peakTime
    ? (peakTime.getHours() * 60 + peakTime.getMinutes()) / 10
    : null;

  useEffect(() => {
    // Scroll to current value
    const screenWidth = Dimensions.get('window').width;
    const offset = currentSlot * SLOT_WIDTH - screenWidth / 2 + SLOT_WIDTH / 2;
    scrollRef.current?.scrollTo({ x: Math.max(0, offset), animated: false });
  }, []);

  const handleSlotPress = (slot: number) => {
    const totalMinutes = slot * 10;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const newTime = new Date(value);
    newTime.setHours(hours);
    newTime.setMinutes(minutes);
    onChange(newTime);
  };

  const handleQuickPress = (hour: number) => {
    const newTime = new Date(value);
    newTime.setHours(hour);
    newTime.setMinutes(0);
    onChange(newTime);
  };

  const handleNowPress = () => {
    const now = new Date();
    const minutes = Math.round(now.getMinutes() / 10) * 10;
    const newTime = new Date(now);
    newTime.setMinutes(minutes);
    newTime.setSeconds(0);
    newTime.setMilliseconds(0);
    onChange(newTime);

    // Scroll to current time
    const slot = (newTime.getHours() * 60 + newTime.getMinutes()) / 10;
    const screenWidth = Dimensions.get('window').width;
    const offset = slot * SLOT_WIDTH - screenWidth / 2 + SLOT_WIDTH / 2;
    scrollRef.current?.scrollTo({ x: Math.max(0, offset), animated: true });
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
        >
          {Array.from({ length: TOTAL_SLOTS }, (_, slot) => {
            const isHour = slot % SLOTS_PER_HOUR === 0;
            const hour = Math.floor(slot / SLOTS_PER_HOUR);
            const isSelected = slot === Math.floor(currentSlot);
            const isCurrentTime = slot === Math.floor(currentTimeSlot);
            const isPeakTime = peakTimeSlot !== null && slot === Math.floor(peakTimeSlot);

            return (
              <TouchableOpacity
                key={slot}
                style={[styles.slot, isSelected && styles.slotSelected]}
                onPress={() => handleSlotPress(slot)}
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
                {isCurrentTime && <View style={styles.currentTimeMarker} />}
                {isPeakTime && <View style={styles.peakTimeMarker} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

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
  slotSelected: {
    backgroundColor: 'rgba(244, 185, 90, 0.2)'
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
  currentTimeMarker: {
    position: 'absolute',
    top: 0,
    width: 2,
    height: 32,
    backgroundColor: colors.sunAccent
  },
  peakTimeMarker: {
    position: 'absolute',
    top: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.sunAccent,
    transform: [{ rotate: '45deg' }]
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
