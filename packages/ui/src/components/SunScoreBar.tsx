/**
 * SunScore bar component
 * Horizontal pill-shaped progress bar
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../theme';

interface SunScoreBarProps {
  score: number; // 0-1
}

export function SunScoreBar({ score }: SunScoreBarProps): React.ReactElement {
  const clampedScore = Math.max(0, Math.min(1, score));
  const percentage = clampedScore * 100;

  return (
    <View style={styles.container}>
      <View style={styles.barContainer}>
        <View style={styles.barBackground}>
          <View
            style={[
              styles.barFill,
              { width: `${percentage}%` }
            ]}
          />
        </View>
      </View>
      <Text style={styles.scoreText}>{clampedScore.toFixed(2)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm
  },
  barContainer: {
    width: '80%',
    alignItems: 'center'
  },
  barBackground: {
    width: '100%',
    height: 10,
    backgroundColor: colors.sliderTrack,
    borderRadius: 5,
    overflow: 'hidden'
  },
  barFill: {
    height: '100%',
    backgroundColor: colors.sunAccent,
    borderRadius: 5
  },
  scoreText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs
  }
});
