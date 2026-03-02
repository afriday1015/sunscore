/**
 * Top bar component
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getMonthName, formatTime } from '@sunscore/domain';
import type { HeadingState } from '@sunscore/adapters';
import { LocationQualityIndicator } from './LocationQualityIndicator';
import { colors, typography, spacing, layout } from '../theme';

interface TopBarProps {
  month: number; // 1-12
  selectedTime: Date;
  headingState: HeadingState;
  locationAccuracy: number | null;
}

export function TopBar({
  month,
  selectedTime,
  headingState,
  locationAccuracy
}: TopBarProps): React.ReactElement {
  const monthName = getMonthName(month);
  const timeString = formatTime(selectedTime);

  const headingLabel = headingState === 'live' ? 'Live' : headingState === 'mock' ? 'Mock' : 'Off';

  return (
    <View style={styles.container}>
      <LocationQualityIndicator accuracy={locationAccuracy} />
      <View style={styles.center}>
        <Text style={styles.monthText}>{monthName}</Text>
        <Text style={styles.timeText}>{timeString}</Text>
      </View>
      <Text style={styles.headingState}>{headingLabel}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: layout.topBarHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background
  },
  center: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md
  },
  monthText: {
    ...typography.body,
    color: colors.textSecondary
  },
  timeText: {
    ...typography.largeNumber,
    color: colors.textPrimary
  },
  headingState: {
    ...typography.label,
    color: colors.textMuted
  }
});
