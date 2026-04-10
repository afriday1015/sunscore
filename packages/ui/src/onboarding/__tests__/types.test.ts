import { ONBOARDING_STEPS, OnboardingStep } from '../types';

describe('ONBOARDING_STEPS', () => {
  it('should contain exactly 6 steps', () => {
    expect(ONBOARDING_STEPS).toHaveLength(6);
  });

  it('each step has required properties', () => {
    for (const step of ONBOARDING_STEPS) {
      expect(step).toHaveProperty('id');
      expect(step).toHaveProperty('targetId');
      expect(step).toHaveProperty('text');
      expect(step).toHaveProperty('cardPosition');

      expect(typeof step.id).toBe('string');
      expect(step.id.length).toBeGreaterThan(0);

      // targetId can be string or string[]
      if (typeof step.targetId === 'string') {
        expect(step.targetId.length).toBeGreaterThan(0);
      } else {
        expect(Array.isArray(step.targetId)).toBe(true);
        expect(step.targetId.length).toBeGreaterThan(0);
        for (const id of step.targetId) {
          expect(typeof id).toBe('string');
          expect(id.length).toBeGreaterThan(0);
        }
      }

      expect(['above', 'below', 'right']).toContain(step.cardPosition);
    }
  });

  it('all text values are non-empty strings or arrays of non-empty strings', () => {
    for (const step of ONBOARDING_STEPS) {
      if (typeof step.text === 'string') {
        expect(step.text.length).toBeGreaterThan(0);
      } else {
        expect(Array.isArray(step.text)).toBe(true);
        expect(step.text.length).toBeGreaterThan(0);
        for (const line of step.text) {
          expect(typeof line).toBe('string');
          expect(line.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it('step ids are unique', () => {
    const ids = ONBOARDING_STEPS.map((s: OnboardingStep) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('target ids match expected values', () => {
    const expectedTargetIds = [
      ['current-month-label', 'month-selector'],
      'radar-view',
      'sunscore-bar',
      'quick-time-buttons',
      'time-slider',
      'compass-permission-or-bottom-guide',
    ];
    const actualTargetIds = ONBOARDING_STEPS.map((s: OnboardingStep) => s.targetId);
    expect(actualTargetIds).toEqual(expectedTargetIds);
  });
});
