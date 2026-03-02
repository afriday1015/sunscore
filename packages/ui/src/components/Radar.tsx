/**
 * Radar compass component
 * Shows sun position and daily trajectory
 */
import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Circle, Path, Text as SvgText, Line, G } from 'react-native-svg';
import {
  projectToRadar,
  generateTrajectoryPath,
  type TrajectoryPoint,
  type RadarConfig
} from '@sunscore/domain';
import { colors, spacing } from '../theme';

interface RadarProps {
  sunBearing: number;
  sunAltitude: number;
  deviceHeading: number;
  trajectory: TrajectoryPoint[];
  size?: number;
}

const CARDINAL_DIRECTIONS = ['N', 'E', 'S', 'W'];

export function Radar({
  sunBearing,
  sunAltitude,
  deviceHeading,
  trajectory,
  size: propSize
}: RadarProps): React.ReactElement {
  const screenWidth = Dimensions.get('window').width;
  const size = propSize || Math.min(screenWidth - 96, 300);
  const center = size / 2;
  const maxRadius = (size - 40) / 2;

  const config: RadarConfig = {
    centerX: center,
    centerY: center,
    maxRadius
  };

  // Calculate sun position relative to device heading
  const relativeBearing = ((sunBearing - deviceHeading) % 360 + 360) % 360;
  const sunPos = sunAltitude > 0
    ? projectToRadar(relativeBearing, sunAltitude, config)
    : null;

  // Generate trajectory path
  const trajectoryPath = generateTrajectoryPath(
    trajectory.map(p => ({
      relativeBearingDeg: ((p.bearingDeg - deviceHeading) % 360 + 360) % 360,
      altitudeDeg: p.altitudeDeg,
      isVisible: p.isVisible
    })),
    config
  );

  // Calculate cardinal direction positions (rotated with device heading)
  const getCardinalPosition = (index: number) => {
    // N=0, E=90, S=180, W=270 in absolute terms
    const absoluteAngle = index * 90;
    // Convert to relative bearing
    const relativeBearingDeg = ((absoluteAngle - deviceHeading) % 360 + 360) % 360;
    // Convert to radians for positioning
    const theta = ((relativeBearingDeg - 90) * Math.PI) / 180;
    const radius = maxRadius + 15;
    return {
      x: center + radius * Math.cos(theta),
      y: center + radius * Math.sin(theta)
    };
  };

  // Generate degree marks
  const degreeMarks = Array.from({ length: 12 }, (_, i) => {
    const absoluteAngle = i * 30;
    const relativeBearingDeg = ((absoluteAngle - deviceHeading) % 360 + 360) % 360;
    const theta = ((relativeBearingDeg - 90) * Math.PI) / 180;
    const innerRadius = maxRadius - 5;
    const outerRadius = maxRadius;
    return {
      x1: center + innerRadius * Math.cos(theta),
      y1: center + innerRadius * Math.sin(theta),
      x2: center + outerRadius * Math.cos(theta),
      y2: center + outerRadius * Math.sin(theta)
    };
  });

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        {/* Background circles */}
        <Circle
          cx={center}
          cy={center}
          r={maxRadius}
          stroke={colors.border}
          strokeWidth={1}
          fill="none"
        />
        <Circle
          cx={center}
          cy={center}
          r={maxRadius * 0.66}
          stroke={colors.border}
          strokeWidth={0.5}
          strokeDasharray="4 4"
          fill="none"
        />
        <Circle
          cx={center}
          cy={center}
          r={maxRadius * 0.33}
          stroke={colors.border}
          strokeWidth={0.5}
          strokeDasharray="4 4"
          fill="none"
        />

        {/* Degree marks */}
        {degreeMarks.map((mark, i) => (
          <Line
            key={i}
            x1={mark.x1}
            y1={mark.y1}
            x2={mark.x2}
            y2={mark.y2}
            stroke={colors.border}
            strokeWidth={1}
          />
        ))}

        {/* Cardinal directions */}
        {CARDINAL_DIRECTIONS.map((dir, i) => {
          const pos = getCardinalPosition(i);
          return (
            <SvgText
              key={dir}
              x={pos.x}
              y={pos.y}
              fontSize={12}
              fill={colors.textMuted}
              textAnchor="middle"
              alignmentBaseline="middle"
            >
              {dir}
            </SvgText>
          );
        })}

        {/* Trajectory curve */}
        {trajectoryPath && (
          <Path
            d={trajectoryPath}
            stroke={colors.sunAccent}
            strokeWidth={1}
            fill="none"
            opacity={0.2}
          />
        )}

        {/* Sun marker */}
        {sunPos && (
          <G>
            <Circle
              cx={sunPos.x}
              cy={sunPos.y}
              r={12}
              fill={colors.sunAccent}
            />
          </G>
        )}

        {/* Center point */}
        <Circle
          cx={center}
          cy={center}
          r={3}
          fill={colors.textMuted}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md
  }
});
