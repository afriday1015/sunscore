/**
 * Month slider component
 * Vertical slider for month selection (1-12)
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { getShortMonthName } from '@sunscore/domain';
import { colors, typography, spacing, layout } from '../theme';

interface MonthSliderProps {
  value: number; // 1-12
  onChange: (month: number) => void;
}

export function MonthSlider({
  value,
  onChange
}: MonthSliderProps): React.ReactElement {
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <View style={styles.container}>
      {months.map((month) => (
        <TouchableOpacity
          key={month}
          style={[
            styles.monthItem,
            month === value && styles.monthItemActive
          ]}
          onPress={() => onChange(month)}
        >
          <Text
            style={[
              styles.monthText,
              month === value && styles.monthTextActive
            ]}
          >
            {month}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: layout.monthSliderWidth,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: colors.background
  },
  monthItem: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  monthItemActive: {
    backgroundColor: colors.sunAccent
  },
  monthText: {
    ...typography.label,
    color: colors.textMuted
  },
  monthTextActive: {
    color: colors.textPrimary,
    fontWeight: '600'
  }
});
