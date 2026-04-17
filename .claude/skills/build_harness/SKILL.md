---
name: build_harness
description: Execute the next step in the SunScore harness implementation plan. Reads the checklist to find incomplete steps, reads the plan for details and DESIGN.md line/section references, executes the work, then updates the checklist. Use /build_harness for next step, /build_harness <step> for a specific step (e.g. "2-3"), or /build_harness status for progress summary.
---

# /build_harness — SunScore 하네스 구현 실행기

하네스 구현 계획(PLAN.md)의 Step을 하나씩 실행하고 체크리스트(CHECKLIST.md)를 갱신하는 스킬.

## 파일 위치 (고정)

```
./CHECKLIST.md  — 진행 상황 추적
./PLAN.md       — Step별 상세 작업 + DESIGN.md 라인/섹션 참조
./DESIGN.md     — 설계 확정본 (필요 시만 참조)
```

## Step 0 — 인자 파싱

사용자가 `/build_harness`를 호출하면 인자를 파싱한다:

- `/build_harness` (인자 없음) → **다음 미완료 Step 자동 진행**
- `/build_harness <Phase>-<Step>` (예: `2-3`) → **해당 Step 지정 진행**
- `/build_harness status` → **현재 진행 상황 요약 후 종료** (작업 실행 없음)

## Step 1 — 상태 파악

1. **CHECKLIST 읽기**: `./CHECKLIST.md`를 읽어서 모든 `- [ ]`, `- [x]` 항목을 파악한다.
2. **대상 Step 결정**:
   - 인자 없음: 첫 번째 `- [ ]` 항목이 대상
   - 인자 있음: 해당 번호의 항목이 대상
   - `status`: 아래 형식으로 요약 출력 후 **종료**

### `status` 출력 형식

```
## 하네스 구현 진행 상황

완료: N / 26 Steps
현재 Phase: Phase X — <이름>
다음 Step: X-Y <설명>

### Phase별 현황
Phase 0 사전 준비        [##....] 1/3
Phase 1 Biome 도입       [......] 0/3
...
```

## Step 2 — 계획 읽기

1. **PLAN 읽기**: `./PLAN.md`에서 대상 Step 섹션을 찾아 읽는다.
   - DESIGN.md 참조(`§X.Y (Lxxx-yyy)`), 산출물, 커밋 메시지, 작업 내용, 주의사항을 확인한다.
2. **DESIGN.md 참조** (필요 시만): PLAN에 명시된 라인 범위를 읽는다.
   - PLAN의 작업 내용만으로 충분하면 DESIGN.md를 읽지 않는다.
   - 라인 드리프트로 섹션 헤더가 보이지 않으면 `^#### <번호>` 앵커로 Grep 후 재조회한다.
   - 판단이 애매하거나 설계 근거 확인이 필요할 때만 해당 라인을 읽는다.

## Step 3 — 의존성 확인

실행 전 의존성을 점검한다:

```
Phase 0 → Phase 1 → Phase 2 → {Phase 3, Phase 4, Phase 8} (병렬 가능)
Phase 0 → {Phase 5, Phase 6, Phase 7} (병렬 가능)
전부 완료 → Phase 9
```

- 선행 Phase가 미완료이면 사용자에게 알리고 확인을 받는다.
- 같은 Phase 내 Step은 번호 순서대로 진행한다.

## Step 4 — 실행

1. **작업 수행**: PLAN에 기술된 작업을 실행한다.
   - 파일 생성/수정, 설치, 설정 변경 등
   - 커밋 메시지는 PLAN에 명시된 것을 사용 (GIT_COMMIT_CONVENTION.md 준수)
2. **검증**: 작업 완료 후 동작을 확인한다.
   - Biome 관련: `biome check` 실행
   - Hook 관련: 트리거 조건 시뮬레이션
   - 설정 관련: 파일 존재 + 구문 유효성
3. **커밋하지 않는다**: 작업 완료 후 사용자에게 결과를 보여주고 커밋 여부를 묻는다.

## Step 5 — 체크리스트 갱신

사용자가 커밋을 승인하면 (또는 커밋 불필요 Step이면):

1. `./CHECKLIST.md`에서 해당 Step의 `- [ ]`를 `- [x]`로 변경
2. 커밋 해시를 기록: `커밋: `` → `커밋: `abc1234``
3. 진행 기록 테이블에 날짜 + Step + 메모 추가

## Step 6 — 보고

작업 완료 후 사용자에게 보고한다:

```
## Step X-Y 완료

**작업**: <한 줄 요약>
**산출물**: <생성/수정된 파일 목록>
**커밋**: <해시> (또는 "사용자 보류")

**다음 Step**: X-Z — <설명>
진행하려면 `/build_harness`를 다시 호출하세요.
```

## 판단 기준 — 하네스 원칙 (PLAN 말미 발췌)

실행 중 판단이 필요하면 아래 원칙을 따른다:

| # | 원칙 | 판단 기준 |
|---|------|----------|
| P1 | 판단 박제 | "이 규칙이 매번 Claude 판단에 맡겨져도 괜찮은가?" → 아니면 박제 |
| P2 | hook = 공급기 | "hook이 해석/계획을 하고 있는가?" → 범위 초과 |
| P3 | 모듈 경계 | "이 코드가 자기 패키지 역할에 맞는가?" |
| P4 | 점진 승격 | "처음부터 error로 넣어야 하는가?" → 아니면 DEFERRED |
| P5 | 활동량 기반 | "시간 단위 임계를 쓰고 있는가?" → 활동량으로 전환 |
| P6 | 이슈 파이프라인 | "이 작업이 이슈에서 출발하는가?" |
| P7 | 예외 구멍 | "예외를 묵시적으로 허용하고 있는가?" → 명시 식별자 필요 |

## Hard rules

- **한 번에 1 Step만 실행한다.** 여러 Step을 연속 실행하지 않는다.
- **커밋은 사용자 승인 후에만 한다.**
- **PLAN에 명시되지 않은 추가 작업을 하지 않는다.** 필요하면 사용자에게 PLAN 업데이트를 제안한다.
- **DESIGN.md는 최소한으로 읽는다.** PLAN으로 충분하면 DESIGN.md를 열지 않는다.
- **Phase 9 (E2E 검증)은 모든 Phase 완료 후에만 실행한다.**
- **CHECKLIST 갱신을 빠뜨리지 않는다.** Step 완료 시 반드시 체크 + 커밋 해시 기록.
