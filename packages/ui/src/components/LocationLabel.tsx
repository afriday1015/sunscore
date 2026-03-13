/**
 * Location label component
 * Displays a small centered location label below the interpretation sentence
 * Shows the address the current result is based on
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../theme';

export type LocationDisplayState =
  | { type: 'success'; address: string }
  | { type: 'coordinates-only'; message: '현재 위치 기준' }
  | { type: 'unavailable'; message: '위치 확인 불가' };

interface LocationLabelProps {
  displayState: LocationDisplayState;
}

export function LocationLabel({
  displayState
}: LocationLabelProps): React.ReactElement {
  const text = displayState.type === 'success'
    ? displayState.address
    : displayState.message;

  return (
    <View
      style={styles.container}
      accessible={true}
      accessibilityLabel={`현재 위치: ${text}`}
      accessibilityRole="text"
    >
      <Text style={styles.text} numberOfLines={1} ellipsizeMode="middle">
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.xs,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    minHeight: 20,
  },
  text: {
    ...typography.small,
    color: colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
  }
});
