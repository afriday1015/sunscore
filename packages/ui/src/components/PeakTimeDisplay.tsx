/**
 * Peak time display component
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatTime } from '@sunscore/domain';
import { colors, typography, spacing } from '../theme';

interface PeakTimeDisplayProps {
  peakTime: Date | null;
}

export function PeakTimeDisplay({
  peakTime
}: PeakTimeDisplayProps): React.ReactElement {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Peak: {peakTime ? formatTime(peakTime) : '--:--'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.sm
  },
  text: {
    ...typography.label,
    color: colors.textMuted
  }
});
