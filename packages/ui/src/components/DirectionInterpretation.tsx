/**
 * Direction interpretation sentence component
 * Displays a deterministic one-line sentence describing:
 * - Which direction the user is facing (absolute)
 * - Where the sun is relative to the user (relative)
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../theme';
import { getAbsoluteDirectionLabel, getRelativePositionLabel } from '../utils/directionLabels';

interface DirectionInterpretationProps {
  deviceHeadingDeg: number;
  sunBearingDeg: number;
  sunAltitudeDeg: number;
  visible: boolean; // show only when heading is available
}

export function DirectionInterpretation({
  deviceHeadingDeg,
  sunBearingDeg,
  sunAltitudeDeg,
  visible
}: DirectionInterpretationProps): React.ReactElement | null {
  if (!visible) {
    return null;
  }

  const absoluteDirection = getAbsoluteDirectionLabel(deviceHeadingDeg);
  const relativeBearing = ((sunBearingDeg - deviceHeadingDeg) % 360 + 360) % 360;
  const relativePosition = getRelativePositionLabel(relativeBearing);

  const sentence = sunAltitudeDeg > 0
    ? `${absoluteDirection} 방향을 보고 있으며, 해는 ${relativePosition}에 있습니다.`
    : `${absoluteDirection} 방향을 보고 있으며, 현재 해는 보이지 않습니다.`;

  return (
    <View style={styles.container}>
      <Text style={styles.text} numberOfLines={1} adjustsFontSizeToFit>{sentence}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.sunAccent,
    borderRadius: 10,
    alignItems: 'center'
  },
  text: {
    ...typography.body,
    fontSize: 13,
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 18
  }
});
