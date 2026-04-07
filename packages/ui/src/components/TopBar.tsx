/**
 * Top bar component
 *
 * 2-layer header structure:
 *  - Base layer holds the left month label (grouped with the MonthSlider column)
 *  - Absolute overlay layer holds the centered time and the right status badge
 *
 * The time is always centered to the full container width regardless of the
 * left/right content length, so it never feels visually pushed off-center.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getShortMonthName, formatTime } from '@sunscore/domain';
import type { HeadingState } from '@sunscore/adapters';
import { colors, typography, spacing, layout } from '../theme';

interface TopBarProps {
  month: number; // 1-12
  selectedTime: Date;
  headingState: HeadingState;
}

export function TopBar({
  month,
  selectedTime,
  headingState
}: TopBarProps): React.ReactElement {
  const monthLabel = getShortMonthName(month);
  const timeString = formatTime(selectedTime);
  const headingLabel =
    headingState === 'live' ? 'Live' : headingState === 'mock' ? 'Mock' : 'Off';
  const isHeadingActive = headingState === 'live' || headingState === 'mock';

  return (
    <View style={styles.container}>
      {/* Left: month label — sits above the MonthSlider column as its current value */}
      <View style={styles.monthColumn} pointerEvents="none">
        <Text style={styles.monthText} numberOfLines={1}>
          {monthLabel}
        </Text>
      </View>

      {/* Center overlay: absolutely centered time, independent of left/right */}
      <View style={styles.timeOverlay} pointerEvents="none">
        <Text style={styles.timeText} numberOfLines={1}>
          {timeString}
        </Text>
      </View>

      {/* Right overlay: text-only heading tag, always rendered to keep balance.
          Intentionally has no dot — the dotted indicator is reserved for the
          location status at the bottom (LocationLabel) to avoid role overlap.
          'Off' state is shown with reduced opacity to read as inactive. */}
      <View style={styles.statusOverlay} pointerEvents="none">
        <Text
          style={[styles.statusTagText, !isHeadingActive && styles.statusTagInactive]}
        >
          {headingLabel}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: layout.topBarHeight,
    backgroundColor: colors.background,
    position: 'relative'
  },

  // Left month label — width matches MonthSlider to feel like the same column
  monthColumn: {
    width: layout.monthSliderWidth,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: spacing.xs
  },
  monthText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
    letterSpacing: 0.5,
    textAlign: 'center',
    maxWidth: layout.monthSliderWidth - spacing.xs
  },

  // Absolute centered time
  timeOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center'
  },
  timeText: {
    ...typography.largeNumber,
    color: colors.textPrimary
  },

  // Right subtle heading tag — text only, no dot (dot is reserved for LocationLabel).
  // Bottom-aligned with the same paddingBottom as monthColumn so the left month
  // label and the right status tag share the same baseline.
  statusOverlay: {
    position: 'absolute',
    right: spacing.md,
    top: 0,
    bottom: 0,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    paddingBottom: spacing.xs
  },
  statusTagText: {
    ...typography.body,
    color: colors.textMuted,
    letterSpacing: 1
  },
  statusTagInactive: {
    opacity: 0.5
  }
});
