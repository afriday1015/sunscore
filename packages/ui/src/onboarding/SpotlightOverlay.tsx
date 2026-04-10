import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import type { TargetRect } from './types';

interface SpotlightOverlayProps {
  targetRect: TargetRect | null;
  padding?: number;
}

const DIM_COLOR = 'rgba(0, 0, 0, 0.6)';
const CUTOUT_BORDER_RADIUS = 12;

export function SpotlightOverlay({
  targetRect,
  padding = 8,
}: SpotlightOverlayProps): React.ReactElement {
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  if (!targetRect) {
    return (
      <View style={[styles.fullScreen, { width: screenWidth, height: screenHeight }]} pointerEvents="box-none">
        <View style={[styles.dim, { width: screenWidth, height: screenHeight }]} />
      </View>
    );
  }

  const cutX = targetRect.x - padding;
  const cutY = targetRect.y - padding;
  const cutW = targetRect.width + padding * 2;
  const cutH = targetRect.height + padding * 2;

  return (
    <View style={[styles.fullScreen, { width: screenWidth, height: screenHeight }]} pointerEvents="box-none">
      {/* Top strip */}
      <View style={[styles.dim, { top: 0, left: 0, right: 0, height: Math.max(0, cutY) }]} />
      {/* Bottom strip */}
      <View
        style={[
          styles.dim,
          {
            top: cutY + cutH,
            left: 0,
            right: 0,
            height: Math.max(0, screenHeight - cutY - cutH),
          },
        ]}
      />
      {/* Left strip */}
      <View
        style={[
          styles.dim,
          {
            top: cutY,
            left: 0,
            width: Math.max(0, cutX),
            height: cutH,
          },
        ]}
      />
      {/* Right strip */}
      <View
        style={[
          styles.dim,
          {
            top: cutY,
            left: cutX + cutW,
            width: Math.max(0, screenWidth - cutX - cutW),
            height: cutH,
          },
        ]}
      />
      {/* Rounded border overlay around cutout */}
      <View
        style={{
          position: 'absolute',
          top: cutY,
          left: cutX,
          width: cutW,
          height: cutH,
          borderRadius: CUTOUT_BORDER_RADIUS,
          borderWidth: 2,
          borderColor: 'rgba(255, 255, 255, 0.5)',
        }}
        pointerEvents="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  dim: {
    position: 'absolute',
    backgroundColor: DIM_COLOR,
  },
});
