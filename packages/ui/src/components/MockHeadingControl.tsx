/**
 * Mock heading control for debug/development
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../theme';

interface MockHeadingControlProps {
  value: number;
  onChange: (value: number) => void;
  visible: boolean;
}

export function MockHeadingControl({
  value,
  onChange,
  visible
}: MockHeadingControlProps): React.ReactElement | null {
  if (!visible) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Mock Heading (Debug): {Math.round(value)}</Text>
      <View style={styles.sliderContainer}>
        <input
          type="range"
          min={0}
          max={360}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={styles.slider as React.CSSProperties}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
    margin: spacing.sm
  },
  label: {
    ...typography.label,
    color: colors.textMuted,
    marginBottom: spacing.xs
  },
  sliderContainer: {
    width: '100%'
  },
  slider: {
    width: '100%',
    height: 20
  }
});
