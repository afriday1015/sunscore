/**
 * Radar compass component
 * Shows sun direction on outer edge and daily trajectory
 */
import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Circle, Path, Text as SvgText, Line, G } from 'react-native-svg';
import {
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

/**
 * Calculate sun marker position on the outer edge of the radar circle.
 * Direction is encoded as position on edge; altitude is encoded as size/opacity.
 */
function calculateSunPositionOnEdge(
  relativeBearingDeg: number,
  config: RadarConfig
): { x: number; y: number } {
  const theta = ((relativeBearingDeg - 90) * Math.PI) / 180;
  const radius = config.maxRadius; // Always on the outer edge

  return {
    x: config.centerX + radius * Math.cos(theta),
    y: config.centerY + radius * Math.sin(theta)
  };
}

/**
 * Derive sun marker visual properties from altitude.
 * Higher altitude → larger and more opaque marker.
 */
function getSunMarkerStyle(altitude: number): { radius: number; opacity: number } {
  if (altitude < 10) {
    return { radius: 8, opacity: 0.5 };
  } else if (altitude < 30) {
    return { radius: 10, opacity: 0.75 };
  } else {
    return { radius: 12, opacity: 1.0 };
  }
}

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

  // Calculate sun position on the outer edge based on direction relative to device heading
  const relativeBearing = ((sunBearing - deviceHeading) % 360 + 360) % 360;
  const sunPos = sunAltitude > 0
    ? calculateSunPositionOnEdge(relativeBearing, config)
    : null;

  // Derive size and opacity from altitude for secondary visual cue
  const sunStyle = getSunMarkerStyle(sunAltitude);

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

        {/* User-facing reference line */}
        <Line
          x1={center}
          y1={center}
          x2={center}
          y2={center - maxRadius}
          stroke="#E53935"
          strokeWidth={1.5}
          opacity={0.4}
        />

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

        {/* Trajectory curve — subtle background context only */}
        {trajectoryPath && (
          <Path
            d={trajectoryPath}
            stroke={colors.sunAccent}
            strokeWidth={1}
            fill="none"
            opacity={0.15}
          />
        )}

        {/* Sun marker — on outer edge, size/opacity reflect altitude */}
        {sunPos && (
          <G>
            {/* Sun rays */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
              const theta = (angle * Math.PI) / 180;
              const innerR = sunStyle.radius + 2;
              const outerR = sunStyle.radius + 6;
              return (
                <Line
                  key={angle}
                  x1={sunPos.x + innerR * Math.cos(theta)}
                  y1={sunPos.y + innerR * Math.sin(theta)}
                  x2={sunPos.x + outerR * Math.cos(theta)}
                  y2={sunPos.y + outerR * Math.sin(theta)}
                  stroke={colors.sunAccent}
                  strokeWidth={1}
                  opacity={sunStyle.opacity * 0.6}
                />
              );
            })}

            {/* Main sun circle */}
            <Circle
              cx={sunPos.x}
              cy={sunPos.y}
              r={sunStyle.radius}
              fill={colors.sunAccent}
              opacity={sunStyle.opacity}
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
