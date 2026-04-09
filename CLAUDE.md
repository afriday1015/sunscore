# SunScore — Claude Code 세션 지침

## 프로젝트 개요

SunScore는 사용자가 바라보는 방향 기준으로 직사광선 강도를 직관적으로 판단할 수 있도록 돕는 모바일/웹 앱이다.

- 정밀 천문 관측 도구가 아님
- 건물 차폐, 지형, 반사광, 날씨는 고려하지 않음
- 현실적으로 납득 가능한 근사치 제공이 목표

## 기술 스택

- **언어**: TypeScript (strict)
- **모바일**: React Native 0.73
- **웹**: React 18 + React Native Web
- **태양 계산**: suncalc
- **모노레포**: npm workspaces

## 패키지 구조

```
sunscore/
├── apps/
│   ├── native/    # React Native 모바일 앱
│   └── web/       # 웹 앱
└── packages/
    ├── domain/    # 순수 TypeScript 도메인 로직 (UI/플랫폼 무의존)
    ├── adapters/  # GPS, DeviceOrientation 등 플랫폼 어댑터
    └── ui/        # 공유 UI 컴포넌트
```

## 핵심 설계 원칙

- **도메인 순수성**: `packages/domain`은 React Native, Web, 외부 라이브러리에 의존하지 않는다
- **단순성 우선**: 복잡한 수학적 최적화보다 설명 가능한 단순한 모델을 선택한다
- **UI에서 계산 금지**: 모든 수학 계산은 domain 레이어에서 수행한다
- **각도 단위 통일**: 모든 각도 값은 degree 기준

## SunScore 계산 모델 (변경 금지)

```
SunScore = altitudeFactor × directionFactor

directionFactor = max(0, cos(smallestAngleDiff(sunBearing, deviceHeading)))

altitudeFactor:
  altitude <= 0°        → 0
  0° < altitude < 10°   → 0.4
  10° ≤ altitude < 30°  → 0.7
  altitude ≥ 30°        → 1.0

sunScore = clamp(altitudeFactor × directionFactor, 0, 1)
```

## 디자인 시스템 (변경 금지)

- 배경: `#F8F6F2` (따뜻한 오프화이트)
- Sun Accent: `#F4B95A`
- 시간대별 색 온도 변화: 5% 이하 overlay만 허용
- **금지**: 과한 그라데이션, Glow 효과, 감성 과잉

## Git Commit 규칙

**→ [GIT_COMMIT_CONVENTION.md](./GIT_COMMIT_CONVENTION.md) 참조**

커밋 전 반드시 이 파일을 확인하고 형식을 준수한다.

핵심 요약:
- 형식: `<type>(<scope>): <subject>`
- scope: `domain` | `adapters` | `ui` | `web` | `native` | `deps` | `config` | `root`
- 한 커밋 = 한 가지 변경
- 빌드가 깨지는 상태로 커밋 금지

## 작업 위임 규칙 (Solo / Team 모드)

SunScore는 두 가지 작업 모드를 지원한다.

### 기본: Solo 모드
- 사용자의 일반 요청("~해주세요", "~수정해주세요")은 메인 세션이 직접 처리한다.
- 단순 변경, 1~2 파일 수정, 빠른 질의응답에 적합.

### 명시적 호출: `/run_team` 모드
- 사용자가 `/run_team`을 명시하면 풀 팀 워크플로우를 가동한다.
- 오케스트레이션은 `.claude/skills/run_team/SKILL.md`에 정의되어 있으며, 메인 세션은 그 단계를 EXACTLY 따른다.
- 모델 티어 인자: `/run_team A` (전부 opus), `/run_team B` (혼합), `/run_team C` (전부 sonnet). 인자가 없으면 `AskUserQuestion`으로 묻는다. 기본값은 A.

### 팀 구성 (`.claude/agents/`)
- `sunscore-architect` — 계획 수립 및 실패 복구 계획 (코드 변경 X)
- `domain-engineer` — `packages/domain` 전담
- `adapters-engineer` — `packages/adapters` 전담
- `ui-engineer` — `packages/ui` 공유 컴포넌트 전담
- `web-engineer` — `apps/web` 전담
- `native-engineer` — `apps/native` 전담
- `test-engineer` — 변경 코드에 대한 테스트 작성·실행
- `sunscore-reviewer` — CLAUDE.md 원칙·레이어 경계 검증 (코드 변경 X)

### 실행 순서 (의존성 기반)
1. `sunscore-architect` 계획 수립
2. `domain-engineer` → `adapters-engineer` → `ui-engineer` 순차
3. `web-engineer`와 `native-engineer`는 둘 다 필요하면 **병렬 호출** (한 메시지에 Agent 호출 2개)
4. `test-engineer`
5. `sunscore-reviewer`

### 실패 루프 (최대 3회)
- test 또는 review FAIL → `sunscore-architect`가 실패 원인 분석 및 수정 계획 수립 → 해당 engineer 재호출 → test 재실행 → review 재검증
- 3회 초과 시 사용자에게 escalate (시도 이력, 마지막 실패 원인, 권장 액션 포함)

### 자동 커밋 금지
- `/run_team` 플로우 완료 후에도 메인 세션은 사용자 승인 없이 커밋하지 않는다.

## 구현 제외 사항

다음은 구현하지 않는다:
- 날씨/구름 모델
- 건물/지형 차폐 시뮬레이션
- 반사광 계산
- 점수 해석 라벨 (Good/Weak 등)
- Season Mode 토글
- 복잡한 고도 곡선 모델
