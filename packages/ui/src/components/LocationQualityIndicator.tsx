/**
 * Location quality indicator component
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  getLocationQuality,
  getLocationQualityLabel,
  getLocationQualityColor,
  type LocationQuality
} from '@sunscore/domain';
import { colors, typography, spacing } from '../theme';

interface LocationQualityIndicatorProps {
  accuracy: number | null;
}

export function LocationQualityIndicator({
  accuracy
}: LocationQualityIndicatorProps): React.ReactElement {
  if (accuracy === null) {
    return (
      <View style={styles.container}>
        <View style={[styles.dot, { backgroundColor: colors.textMuted }]} />
        <Text style={styles.label}>--</Text>
      </View>
    );
  }

  const quality = getLocationQuality(accuracy);
  const label = getLocationQualityLabel(quality);
  const color = getLocationQualityColor(quality);

  return (
    <View style={styles.container}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  label: {
    ...typography.label,
    color: colors.textSecondary
  }
});
