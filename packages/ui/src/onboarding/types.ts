export interface OnboardingStep {
  id: string;
  /** Single target or multiple targets to merge into one spotlight area */
  targetId: string | string[];
  text: string | string[];
  cardPosition: 'above' | 'below' | 'right';
  /** Override spotlight padding for this step (default 8) */
  spotlightPadding?: number;
}

export interface TargetRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'month-selector',
    targetId: ['current-month-label', 'month-selector'],
    text: '왼쪽 숫자를 눌러 월을 바꿔보세요.',
    cardPosition: 'right',
    spotlightPadding: 5,
  },
  {
    id: 'radar-view',
    targetId: 'radar-view',
    text: '가운데 화면에서 시간과 방향에 따른 해의 위치를 볼 수 있어요.',
    cardPosition: 'below',
  },
  {
    id: 'sunscore-bar',
    targetId: 'sunscore-bar',
    text: '현재 조건에서 햇빛이 얼마나 직접 들어오는지 점수로 보여줍니다.',
    cardPosition: 'below',
  },
  {
    id: 'quick-time-buttons',
    targetId: 'quick-time-buttons',
    text: '대표 시간 버튼으로 원하는 시간대로 빠르게 이동할 수 있어요.',
    cardPosition: 'above',
  },
  {
    id: 'time-slider',
    targetId: 'time-slider',
    text: [
      '아래 타임라인을 움직여 시간을 바꿔보세요.',
      '함께 표시되는 추천 시간으로 햇빛이 잘 드는 때도 참고할 수 있어요.',
    ],
    cardPosition: 'above',
  },
  {
    id: 'compass-permission',
    targetId: 'compass-permission-or-bottom-guide',
    text: [
      '나침반 사용을 허용하면 현재 바라보는 방향을 기준으로 결과를 더 정확하게 볼 수 있어요.',
      '권한을 허용하지 않아도 월과 시간에 따른 해의 위치는 먼저 확인할 수 있습니다.',
    ],
    cardPosition: 'above',
  },
];
