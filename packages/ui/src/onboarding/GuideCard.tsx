import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  LayoutChangeEvent,
} from 'react-native';
import type { TargetRect } from './types';
import { colors } from '../theme';

interface GuideCardProps {
  text: string | string[];
  stepIndex: number;
  totalSteps: number;
  isLastStep: boolean;
  cardPosition: 'above' | 'below' | 'right';
  targetRect: TargetRect;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  onComplete: (permanent: boolean) => void;
}

const CARD_WIDTH = 290;
const CARD_GAP = 16;
const SCREEN_PADDING = 16;
const SPOTLIGHT_PADDING = 8;

export function GuideCard({
  text,
  stepIndex,
  totalSteps,
  isLastStep,
  cardPosition,
  targetRect,
  onNext,
  onPrev,
  onSkip,
  onComplete,
}: GuideCardProps): React.ReactElement {
  const [checked, setChecked] = useState(false);
  const [cardHeight, setCardHeight] = useState(220);
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  const paragraphs = Array.isArray(text) ? text : [text];
  const isFirstStep = stepIndex === 0;

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    const h = e.nativeEvent.layout.height;
    if (h > 0) setCardHeight(h);
  }, []);

  // Compute card position — ensure gap from spotlight area (target + padding)
  let cardTop = 0;
  let cardLeft = 0;

  const spotTop = targetRect.y - SPOTLIGHT_PADDING;
  const spotBottom = targetRect.y + targetRect.height + SPOTLIGHT_PADDING;

  if (cardPosition === 'below') {
    cardTop = spotBottom + CARD_GAP;
    cardLeft = targetRect.x + targetRect.width / 2 - CARD_WIDTH / 2;
  } else if (cardPosition === 'above') {
    cardTop = spotTop - CARD_GAP - cardHeight;
    cardLeft = targetRect.x + targetRect.width / 2 - CARD_WIDTH / 2;
  } else {
    // right
    cardLeft = targetRect.x + targetRect.width + SPOTLIGHT_PADDING + CARD_GAP;
    cardTop = targetRect.y + targetRect.height / 2 - cardHeight / 2;
  }

  // Clamp to screen bounds
  cardLeft = Math.max(SCREEN_PADDING, Math.min(cardLeft, screenWidth - CARD_WIDTH - SCREEN_PADDING));
  cardTop = Math.max(SCREEN_PADDING, Math.min(cardTop, screenHeight - cardHeight - SCREEN_PADDING));

  return (
    <View
      style={[styles.card, { top: cardTop, left: cardLeft, width: CARD_WIDTH }]}
      onLayout={handleLayout}
    >
      {/* Skip link - not on last step */}
      {!isLastStep && (
        <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
          <Text style={styles.skipText}>{'건너뛰기 \u203A'}</Text>
        </TouchableOpacity>
      )}

      {/* Text content */}
      <View style={styles.textContainer}>
        {paragraphs.map((p, i) => (
          <Text key={i} style={styles.paragraph}>
            {p}
          </Text>
        ))}
      </View>

      {/* Step indicator */}
      <Text style={styles.stepIndicator}>
        {stepIndex + 1} / {totalSteps}
      </Text>

      {/* Last step: checkbox + complete button */}
      {isLastStep ? (
        <View>
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setChecked(!checked)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
              {checked && <Text style={styles.checkmark}>{'\u2713'}</Text>}
            </View>
            <Text style={styles.checkboxLabel}>사용법을 완전히 이해했어요</Text>
          </TouchableOpacity>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.navButton, styles.prevButton]}
              onPress={onPrev}
              activeOpacity={0.8}
            >
              <Text style={styles.prevButtonText}>이전</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.navButton, styles.nextButton]}
              onPress={() => onComplete(checked)}
              activeOpacity={0.8}
            >
              <Text style={styles.nextButtonText}>시작하기</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.buttonRow}>
          {!isFirstStep && (
            <TouchableOpacity
              style={[styles.navButton, styles.prevButton]}
              onPress={onPrev}
              activeOpacity={0.8}
            >
              <Text style={styles.prevButtonText}>이전</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.navButton, styles.nextButton, isFirstStep && styles.navButtonFull]}
            onPress={onNext}
            activeOpacity={0.8}
          >
            <Text style={styles.nextButtonText}>다음</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  skipButton: {
    position: 'absolute',
    top: 14,
    right: 16,
    zIndex: 1,
  },
  skipText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  textContainer: {
    marginTop: 12,
    marginBottom: 14,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textPrimary,
    marginBottom: 6,
  },
  stepIndicator: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  navButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  navButtonFull: {
    flex: 1,
  },
  prevButton: {
    backgroundColor: colors.border,
  },
  prevButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  nextButton: {
    backgroundColor: colors.sunAccent,
  },
  nextButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: colors.sunAccent,
    borderColor: colors.sunAccent,
  },
  checkmark: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  checkboxLabel: {
    fontSize: 14,
    color: colors.textPrimary,
  },
});
