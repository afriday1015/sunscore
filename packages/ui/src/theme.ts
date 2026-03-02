/**
 * Design system theme
 * Soft Light Minimal
 */

export const colors = {
  // Background
  background: '#F8F6F2',

  // Sun accent
  sunAccent: '#F4B95A',

  // Location quality
  locationPrecise: '#4CAF50',
  locationApprox: '#FFC107',
  locationWeak: '#FF9800',

  // Text
  textPrimary: '#1A1A1A',
  textSecondary: '#666666',
  textMuted: '#999999',

  // UI elements
  border: '#E0E0E0',
  sliderTrack: '#E0E0E0',
  sliderThumb: '#FFFFFF'
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32
};

export const typography = {
  largeNumber: {
    fontSize: 32,
    fontWeight: '600' as const
  },
  mediumNumber: {
    fontSize: 24,
    fontWeight: '500' as const
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const
  },
  label: {
    fontSize: 12,
    fontWeight: '400' as const
  },
  small: {
    fontSize: 10,
    fontWeight: '400' as const
  }
};

export const layout = {
  topBarHeight: 56,
  sunScoreBarHeight: 40,
  timeSliderHeight: 100,
  peakDisplayHeight: 32,
  monthSliderWidth: 48,
  minTouchTarget: 44
};

export const animation = {
  duration: 300,
  easing: 'ease-out'
};
