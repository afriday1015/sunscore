import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import type { OnboardingStep, TargetRect } from './types';
import { SpotlightOverlay } from './SpotlightOverlay';
import { GuideCard } from './GuideCard';

interface OnboardingOverlayProps {
  steps: OnboardingStep[];
  targetRefs: Record<string, React.RefObject<View>>;
  visible: boolean;
  onComplete: (permanent: boolean) => void;
  onSkip: () => void;
}

export function OnboardingOverlay({
  steps,
  targetRefs,
  visible,
  onComplete,
  onSkip,
}: OnboardingOverlayProps): React.ReactElement | null {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);

  const currentStep = steps[currentStepIndex];

  const measureTarget = useCallback(() => {
    if (!currentStep) return;

    const ids = Array.isArray(currentStep.targetId)
      ? currentStep.targetId
      : [currentStep.targetId];

    // Measure all targets and merge into a bounding rect
    let pending = ids.length;
    const rects: TargetRect[] = [];

    const tryResolve = () => {
      pending--;
      if (pending > 0) return;
      if (rects.length === 0) {
        setTargetRect(null);
        return;
      }
      const minX = Math.min(...rects.map(r => r.x));
      const minY = Math.min(...rects.map(r => r.y));
      const maxX = Math.max(...rects.map(r => r.x + r.width));
      const maxY = Math.max(...rects.map(r => r.y + r.height));
      setTargetRect({ x: minX, y: minY, width: maxX - minX, height: maxY - minY });
    };

    for (const id of ids) {
      const ref = targetRefs[id];
      if (ref?.current) {
        ref.current.measureInWindow(
          (x: number, y: number, width: number, height: number) => {
            if (width > 0 && height > 0) {
              rects.push({ x, y, width, height });
            }
            tryResolve();
          },
        );
      } else {
        tryResolve();
      }
    }
  }, [currentStep, targetRefs]);

  useEffect(() => {
    if (!visible) return;
    // Small delay to allow layout to settle after step change
    const timer = setTimeout(measureTarget, 100);
    return () => clearTimeout(timer);
  }, [visible, currentStepIndex, measureTarget]);

  if (!visible) return null;
  if (!currentStep) return null;

  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setTargetRect(null);
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setTargetRect(null);
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleSkip = () => {
    setCurrentStepIndex(0);
    onSkip();
  };

  const handleComplete = (permanent: boolean) => {
    setCurrentStepIndex(0);
    onComplete(permanent);
  };

  return (
    <View
      style={[styles.root, { width: screenWidth, height: screenHeight }]}
      pointerEvents="box-none"
    >
      <SpotlightOverlay targetRect={targetRect} padding={currentStep.spotlightPadding} />
      {targetRect && (
        <GuideCard
          text={currentStep.text}
          stepIndex={currentStepIndex}
          totalSteps={steps.length}
          isLastStep={currentStepIndex === steps.length - 1}
          cardPosition={currentStep.cardPosition}
          targetRect={targetRect}
          onNext={handleNext}
          onPrev={handlePrev}
          onSkip={handleSkip}
          onComplete={handleComplete}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1000,
  },
});
