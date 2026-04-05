/**
 * Top bar component
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getMonthName, formatTime } from '@sunscore/domain';
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
  const monthName = getMonthName(month);
  const timeString = formatTime(selectedTime);
  const headingLabel = headingState === 'live' ? 'Live' : headingState === 'mock' ? 'Mock' : 'Off';

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Text style={styles.monthText}>{monthName}</Text>
      </View>
      <Text style={styles.timeText}>{timeString}</Text>
      <View style={styles.right}>
        <Text style={styles.headingState}>{headingLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: layout.topBarHeight,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background
  },
  left: {
    flex: 1,
    alignItems: 'flex-start'
  },
  right: {
    flex: 1,
    alignItems: 'flex-end'
  },
  headingState: {
    ...typography.body,
    color: colors.textMuted
  },
  monthText: {
    ...typography.body,
    color: colors.textSecondary
  },
  timeText: {
    ...typography.largeNumber,
    color: colors.textPrimary
  }
});
