# SunScore 하네스 구현 계획서

> **목적**: [DESIGN.md](./DESIGN.md)의 설계를 단계별로 구현하기 위한 Claude 작업 지침서
> **참조 형식**: `DESIGN.md §X.Y (Lxxx-yyy)` — 라인 범위로 바로 읽고, 어긋나면 섹션 앵커(`#### X.Y`)로 리커버.
> **원칙**: 각 Phase는 독립 실행 가능. Phase 내 Step은 순서대로 진행. 한 Step = 한 커밋 단위.

---

## 전체 구조

```
Phase 0  사전 준비 (main 마이그레이션 + 기반 파일)
Phase 1  Biome 도입
Phase 2  하네스 hook 기반 구조
Phase 3  TDD 강제 체계
Phase 4  모듈 역할 경계 강제
Phase 5  브랜치 보호 규칙
Phase 6  PR 워크플로우 (/create-pr skill + 템플릿)
Phase 7  브랜치 수명 관리 hook
Phase 8  DEFERRED_RULES 트래커
Phase 9  End-to-end 검증
```

---

## Phase 0 — 사전 준비

> main 브랜치 마이그레이션과 기반 설정. 다른 모든 Phase의 전제.

### Step 0-1. `master` → `main` 브랜치 마이그레이션

| 항목 | 값 |
|------|-----|
| 설계 참조 | DESIGN.md §3.5.1 (L397-414) |
| 산출물 | 기본 브랜치가 `main`으로 변경됨 |
| 커밋 | `chore(root): rename default branch master to main` |

**작업 내용**:
1. `git branch -m master main`
2. `git push -u origin main`
3. `gh repo edit --default-branch main`
4. `git push origin --delete master`
5. 프로젝트 전체에서 `master` 참조 grep → 갱신 (CLAUDE.md, hook, 문서)
6. `git config --global init.defaultBranch main` (선택)

**주의**: DESIGN.md §3.5.1 — "Layer 1 구현 직전에 관련 hook 작성 + CLAUDE.md 참조 갱신과 한 커밋으로 묶기"

### Step 0-2. `.gitignore` 업데이트

| 항목 | 값 |
|------|-----|
| 설계 참조 | DESIGN.md §3.5.5 (L467-488) |
| 산출물 | `.gitignore`에 `.worktrees/` 추가 |
| 커밋 | `chore(config): add .worktrees to gitignore` |

### Step 0-3. 디렉터리 구조 생성

| 항목 | 값 |
|------|-----|
| 설계 참조 | DESIGN.md §3.4.3 (L243-276) |
| 산출물 | `.claude/hooks/`, `.github/rulesets/`, `scripts/` 디렉터리 |
| 커밋 | Phase 1~7 각 Step에서 파일 생성 시 자동으로 포함 (별도 커밋 불필요) |

---

## Phase 1 — Biome 도입

> 컨벤션 도구 설치 + 기존 코드 포맷 적용. Layer 1의 기반.

### Step 1-1. Biome 설치 + biome.json 생성

| 항목 | 값 |
|------|-----|
| 설계 참조 | DESIGN.md §3.4.1 (L127-229) — 전체 biome.json 내용 |
| 설계 참조 | DESIGN.md §3.4.6 (L306-325) — 마이그레이션 절차 1~4단계 |
| 산출물 | `package.json` devDep에 `@biomejs/biome@2.4.12`, 루트 `biome.json` |
| 커밋 | `chore(config): add biome 2.4.12 with enforcement rules` |

**biome.json 핵심 설정** (DESIGN.md §3.4.1-C, L137-228):
- formatter: space 2, lineWidth 120, single quote, double JSX quote, semicolons always, trailing commas all
- linter: recommended + `noUnusedImports: error` + `noUnusedVariables: warn` + `noConsoleLog: warn`
- overrides: domain(`noRestrictedImports` — react, react-native, @sunscore/adapters, @sunscore/ui 차단)
- overrides: adapters(`noRestrictedImports` — react, react-native, @sunscore/ui 차단)

**검증**: `biome check .` 드라이런 → 위반 규모 확인 (DESIGN.md §3.4.6 절차 3~4단계)

### Step 1-2. 기존 코드에 Biome 포맷/린트 적용

| 항목 | 값 |
|------|-----|
| 설계 참조 | DESIGN.md §3.4.6 (L306-325) — 마이그레이션 절차 5~8단계 |
| 산출물 | 전 파일 포맷 적용됨 |
| 커밋 | `style: apply biome format to codebase` |

**후처리**:
- `.git-blame-ignore-revs`에 이 커밋 해시 기록 (DESIGN.md §3.4.6 절차 8단계)
- `git config blame.ignoreRevsFile .git-blame-ignore-revs`

### Step 1-3. npm 스크립트 + VS Code 설정

| 항목 | 값 |
|------|-----|
| 설계 참조 | DESIGN.md §3.4.2 (L231-241) — npm scripts |
| 설계 참조 | DESIGN.md §3.4.5 (L288-304) — VS Code 설정 |
| 산출물 | `package.json` scripts, `.vscode/settings.json`, `.vscode/extensions.json` |
| 커밋 | `chore(config): add biome npm scripts and vscode integration` |

**npm scripts** (DESIGN.md §3.4.2):
```
format, lint, check, check:fix
```

---

## Phase 2 — 하네스 hook 기반 구조

> `.claude/hooks/` 파일 생성. 후속 Phase에서 각 hook의 로직을 채움.

### Step 2-1. Biome on-edit hook

| 항목 | 값 |
|------|-----|
| 설계 참조 | DESIGN.md §3.4.3 (L243-276) — biome-on-edit.sh 동작 정의 |
| 트리거 | PostToolUse: Edit, Write |
| 산출물 | `.claude/hooks/biome-on-edit.sh` |
| 커밋 | `feat(config): add biome-on-edit hook for auto format on save` |

**동작**: 파일 수정 직후 → `biome format --write <파일>` → `biome lint --write <파일>` → 경고 출력. 차단 없음.

### Step 2-2. Biome pre-commit hook (커밋 게이트)

| 항목 | 값 |
|------|-----|
| 설계 참조 | DESIGN.md §3.4.3 (L243-276) — 커밋 게이트 순서 |
| 트리거 | PreToolUse: Bash(`git commit`) |
| 산출물 | `.claude/hooks/biome-pre-commit.sh` |
| 커밋 | `feat(config): add biome pre-commit gate (biome + tsc + jest)` |

**게이트 순서** (DESIGN.md §3.4.3):
```
1. biome check --staged     (~30ms)
2. tsc --noEmit             (~수 초)
3. jest --onlyChanged       (~수십 초)
```
어느 단계든 실패 시 커밋 차단.

### Step 2-3. 브랜치 가드 hook (main 직접 커밋/push 차단)

| 항목 | 값 |
|------|-----|
| 설계 참조 | DESIGN.md §3.5.3 (L435-447) — 직접 커밋 금지 + 예외 3가지 |
| 설계 참조 | DESIGN.md §3.5.6 (L490-519) — hook 레이어 파일명 |
| 트리거 | pre-commit: 브랜치=main이면 차단 / pre-push: main force push 차단 |
| 산출물 | `.claude/hooks/pre-commit-branch-guard.sh`, `.claude/hooks/pre-push-guard.sh` |
| 커밋 | `feat(config): add branch guard hooks for main protection` |

**예외** (DESIGN.md §3.5.3):
1. 초기 부트스트랩 (하네스 자체가 없는 시점)
2. `.claude/hooks/` 자체 수정 (chicken-and-egg)
3. 긴급 핫픽스 (`hotfix:` prefix)

### Step 2-4. `.claude/settings.json` hook 등록

| 항목 | 값 |
|------|-----|
| 설계 참조 | (본 계획에서 settings.json 구조 확정) |
| 산출물 | `.claude/settings.json`에 hook 트리거 매핑 |
| 커밋 | `chore(config): register hooks in claude settings` |

**참고**: `/opt/workspace/harness/HOOKS_CONCEPT.md`가 이미 존재함 — 실제 Claude Code hooks 형식과 대조 필요.

---

## Phase 3 — TDD 강제 체계

> domain + adapters 파일 수정 시 테스트 존재 확인 + 자동 실행.

### Step 3-1. domain 테스트 기반 확인 + jest 설정 정비

| 항목 | 값 |
|------|-----|
| 설계 참조 | DESIGN.md §3.3 (L105-123) — TDD 강제 범위 확정 |
| 산출물 | `packages/domain/jest.config.ts` 정비 (이미 존재), 테스트 실행 확인 |
| 커밋 | 필요 시 `chore(domain): fix jest config for tdd enforcement` |

**TDD 강제 대상** (DESIGN.md §3.3):
```
[강제]   packages/domain/**
[강제]   packages/adapters/**
[비강제] packages/ui/**
[비강제] apps/web/**
[비강제] apps/native/**
```

### Step 3-2. TDD 강제 hook 구현

| 항목 | 값 |
|------|-----|
| 설계 참조 | DESIGN.md §3.3 (L105-123) — 하네스 TDD 동작 |
| 트리거 | PostToolUse: Edit (domain/adapters 파일 대상) |
| 산출물 | `.claude/hooks/tdd-enforce.sh` (또는 기존 hook에 통합) |
| 커밋 | `feat(config): add tdd enforcement hook for domain and adapters` |

**동작** (DESIGN.md §3.3):
- domain/adapters 파일 수정 시 → 관련 테스트 존재 확인 → 없으면 Red 단계부터 요구
- 수정 후 자동 테스트 실행 → 실패 시 커밋 차단 (Phase 2-2의 jest 게이트와 연동)

---

## Phase 4 — 모듈 역할 경계 강제

> ui에서 순수 계산 작성 차단 + 기존 위반 감지.

### Step 4-1. module-role-check hook

| 항목 | 값 |
|------|-----|
| 설계 참조 | DESIGN.md §5.2 (A) (L696-719) — 사전 차단 규칙 |
| 설계 참조 | DESIGN.md §3.4.3 (L243-276) — Biome vs hook 역할 분담 |
| 트리거 | PreToolUse: Edit, Write |
| 산출물 | `.claude/hooks/module-role-check.sh` |
| 커밋 | `feat(config): add module role boundary check hook` |

**허용/금지 매트릭스** (DESIGN.md §5.2 (A)):

| 패키지 | 허용 | 금지 |
|--------|------|------|
| domain | 순수 TS, suncalc | React, RN, adapters, ui, 플랫폼 API |
| adapters | 순수 TS, 플랫폼 API, domain 타입 | React, RN, ui |
| ui | React, RN, domain/adapters 호출 | 순수 계산 직접 구현 |
| apps/* | 모든 패키지 import | 순수 계산 직접 구현 |

**역할 분담** (DESIGN.md §3.4.3):
- import 기반 → Biome `noRestrictedImports` (Phase 1에서 이미 설정)
- 함수 내용 기반 (Math 연산 등) → 이 hook (AST or regex)

### Step 4-2. 기존 위반 코드 감지 메커니즘

| 항목 | 값 |
|------|-----|
| 설계 참조 | DESIGN.md §5.2 (B) (L721-739) — 지속적 리팩토링 |
| 트리거 | SessionStart 또는 PostToolUse |
| 산출물 | 위반 감지 스캔 + 이슈 생성 권장 메시지 |
| 커밋 | `feat(config): add existing violation detection for module roles` |

**핵심 구분** (DESIGN.md §5.2 (B)):
- 새 코드 → **차단** (Step 4-1)
- 기존 코드 → **감지 + 이슈화** (이 Step)

**현재 알려진 위반** (DESIGN.md §5.1, L682-692):
- `packages/ui/src/utils/directionLabels.ts` → domain으로 이동 대상
- `packages/ui/src/utils/formatLocationAddress.ts` → domain으로 이동 대상
- `packages/ui/src/hooks/useEveningIntensity.ts` → 분기 로직 domain 분리 대상

---

## Phase 5 — 브랜치 보호 규칙

> GitHub 원격 보호 + 로컬 hook 이중 강제.

### Step 5-1. GitHub Ruleset 파일 작성 + 적용 스크립트

| 항목 | 값 |
|------|-----|
| 설계 참조 | DESIGN.md §3.5.6 (L490-519) — 전체 보호 규칙 표 |
| 산출물 | `.github/rulesets/main.json`, `scripts/apply-ruleset.sh` |
| 커밋 | `feat(config): add github branch protection ruleset for main` |

**규칙 요약** (DESIGN.md §3.5.6):
- main 직접 push 차단 [on]
- Force push 차단 [on]
- main 삭제 차단 [on]
- Linear history [on]
- Required checks: `biome`, `tsc`, `jest`
- Signed commits: DEFERRED
- Require up to date [on]

**적용**: `gh api --method PUT /repos/:owner/:repo/rulesets/...` (DESIGN.md §3.5.6)
**주의**: `actor_id`는 `gh api` 조회 후 확정 (DESIGN.md §3.5.6)

### Step 5-2. GitHub 저장소 설정 (merge 방식)

| 항목 | 값 |
|------|-----|
| 설계 참조 | DESIGN.md §3.5.4 (L449-465) — squash merge 확정 |
| 설계 참조 | DESIGN.md §3.5.8 (L554-569) — delete_branch_on_merge |
| 산출물 | `gh api` 또는 `gh repo edit`로 설정 적용 |
| 커밋 | 코드 변경 없음 (원격 설정만) |

**설정**:
- Merge commit 비활성, Squash merge 기본
- `delete_branch_on_merge: true` (DESIGN.md §3.5.8)
- `merge:rebase` 라벨 있을 때만 rebase merge 허용 (DESIGN.md §3.5.4)

---

## Phase 6 — PR 워크플로우

> `/create-pr` 스킬 + PR 템플릿 + 브랜치 네이밍 검증.

### Step 6-1. PR 템플릿

| 항목 | 값 |
|------|-----|
| 설계 참조 | DESIGN.md §3.5.7 (L521-552) — PR body 템플릿 |
| 산출물 | `.github/PULL_REQUEST_TEMPLATE.md` |
| 커밋 | `chore(config): add pull request template` |

### Step 6-2. `/create-pr` 스킬

| 항목 | 값 |
|------|-----|
| 설계 참조 | DESIGN.md §3.5.7 (L521-552) — 전체 스킬 설계 |
| 산출물 | `.claude/skills/create-pr/SKILL.md` |
| 커밋 | `feat(config): add /create-pr skill for automated PR creation` |

**스킬 동작** (DESIGN.md §3.5.7):
```
1. 브랜치명에서 <type>, issue-<N> 파싱
2. commit convention 제목 정규식 검증
3. PR body 템플릿 자동 채움
4. 라벨 자동 계산 (scope:*, type:*)
5. gh pr create --title ... --body ... --assignee @me --label ...
6. test_engineer/reviewer FAIL 기록 발견 시 --draft 플래그 추가
7. 결과 URL 출력
```

**세부 규칙** (DESIGN.md §3.5.7):
- 트리거: 사용자 `/create-pr` 명시 호출만 (자동 금지)
- 이슈 연결: `Closes #<N>` 자동 삽입 (`no-issue` 제외)
- Draft vs Ready: 기본 Ready, `/run_team` FAIL 있으면 draft

### Step 6-3. 브랜치 네이밍 검증 hook

| 항목 | 값 |
|------|-----|
| 설계 참조 | DESIGN.md §3.5.2 (L416-433) — 네이밍 규칙 + 정규식 |
| 트리거 | 브랜치 생성 시 또는 첫 커밋 시 |
| 산출물 | 기존 `pre-commit-branch-guard.sh` 확장 또는 별도 hook |
| 커밋 | `feat(config): add branch naming convention validation` |

**정규식** (DESIGN.md §3.5.2):
```
^(feat|fix|refactor|chore|docs|test|perf|style|ci|build)/issue-(\d+)-[a-z0-9-]+$
```
**예외**: `chore/no-issue-<slug>` 허용 (DESIGN.md §3.5.2)

---

## Phase 7 — 브랜치 수명 관리 hook

> SessionStart에서 stale 브랜치 정리 + 장기 브랜치 감시.

### Step 7-1. SessionStart prune + orphan worktree 알림

| 항목 | 값 |
|------|-----|
| 설계 참조 | DESIGN.md §3.5.8 (L554-569) — 브랜치 수명 확정 |
| 트리거 | SessionStart |
| 산출물 | `.claude/hooks/session-start-prune.sh` |
| 커밋 | `feat(config): add session start branch prune and worktree cleanup hook` |

**동작** (DESIGN.md §3.5.8):
1. `git fetch --prune`
2. gone+merged 브랜치 탐지
3. 사용자 승인 후 `git branch -d` (자동 삭제 금지)
4. `.worktrees/issue-<N>/` 존재하면 함께 정리 제안

### Step 7-2. 장기 브랜치 임계 모니터링

| 항목 | 값 |
|------|-----|
| 설계 참조 | DESIGN.md §3.5.9 (L571-591) — 장기 브랜치 규칙 |
| 트리거 | SessionStart |
| 산출물 | Step 7-1 hook에 통합 또는 별도 |
| 커밋 | `feat(config): add long-lived branch threshold monitoring` |

**임계값** (DESIGN.md §3.5.9):
- 수명: main에 5 PR 머지 경과 → 경고, 15 PR → 강제 확인
- 동기화: 3 PR 미동기화 → rebase 권장, 10 PR → 경고
- 동시 개수: 3개 초과 → 경고

**허용 prefix** (DESIGN.md §3.5.9): `spike/<slug>`, `exp/issue-<N>-<slug>`

---

## Phase 8 — DEFERRED_RULES 트래커

> 유보 규칙의 활동량 기반 자동 점검 + 승격 알림.

### Step 8-1. DEFERRED_RULES.md 초안 작성

| 항목 | 값 |
|------|-----|
| 설계 참조 | DESIGN.md §3.4.7 (L327-367) — 트래커 설계 전체 |
| 산출물 | `.claude/DEFERRED_RULES.md` |
| 커밋 | `docs: add DEFERRED_RULES tracker with activity-based conditions` |

**초기 유보 규칙** (DESIGN.md §3.4.7):

| 규칙 | 승격 조건 |
|------|----------|
| `useNamingConvention` | 네이밍 감사 완료 + 10 PR 위반 0건 |
| `noUnusedVariables` warn→error | 직전 20 TS 커밋 중 warn 0건 |
| `noConsoleLog` warn→error | geocoding.ts logger 대체 + 5 PR 재발 없음 |
| `noExcessiveCognitiveComplexity` | reviewer 지적 3회 이상 시 도입 검토 |

**추가 유보 항목** (DESIGN.md 본문 산재):
- Signed commits (§3.5.6)
- Worktree (c) 전면 전환 (§3.5.5)

### Step 8-2. deferred-rules-check hook

| 항목 | 값 |
|------|-----|
| 설계 참조 | DESIGN.md §3.4.3 (L243-276) + §3.4.7 (L327-367) — hook 동작 |
| 트리거 | SessionStart |
| 산출물 | `.claude/hooks/deferred-rules-check.sh` |
| 커밋 | `feat(config): add deferred rules check hook on session start` |

**동작** (DESIGN.md §3.4.7):
```
1. DEFERRED_RULES.md 파싱 — 마지막 점검 커밋 해시 추출
2. git log <last-checked>..HEAD 분석
3. 규칙별 조건 카운트 갱신
4. DEFERRED_RULES.md 재작성
5. 조건 충족 시 "[유보 규칙 승격 제안]" 메시지 주입
```

---

## Phase 9 — End-to-end 검증

> 실제 이슈 1~2건으로 전체 파이프라인 동작 확인.

### Step 9-1. 파이프라인 검증 (Solo 모드)

| 항목 | 값 |
|------|-----|
| 설계 참조 | DESIGN.md §3.5.10 (B) (L607-630) — 단일 이슈 파이프라인 |

**검증 시나리오**: Trivial/Small 이슈 1건
```
이슈 생성 → 브랜치 생성(네이밍 검증) → Solo 작업 →
Biome on-edit 동작 확인 → 커밋 게이트 통과 확인 →
/create-pr 실행 → Squash merge → 자동 삭제 → 로컬 prune
```

### Step 9-2. 파이프라인 검증 (Team 모드)

**검증 시나리오**: Medium 이슈 1건
```
이슈 생성 → 브랜치 생성 → /run_team 호출 →
worktree 생성 확인 → 에이전트 파이프라인 동작 →
/create-pr 실행 → Squash merge → worktree 정리 제안
```

### Step 9-3. 검증 결과 기록

| 항목 | 값 |
|------|-----|
| 산출물 | 검증 결과를 세션 03으로 이관할 노트 |

---

## Phase 간 의존성

```
Phase 0 (main 마이그레이션)
  │
  ├─→ Phase 1 (Biome) ─→ Phase 2 (hooks) ─┬─→ Phase 3 (TDD)
  │                                         ├─→ Phase 4 (모듈 경계)
  │                                         └─→ Phase 8 (DEFERRED)
  │
  ├─→ Phase 5 (브랜치 보호)
  ├─→ Phase 6 (PR 워크플로우)
  └─→ Phase 7 (브랜치 수명)
          │
          └─── 전부 완료 ──→ Phase 9 (E2E 검증)
```

**병렬 가능 그룹**:
- Phase 1 → 2 → {3, 4, 8} 은 순차
- Phase 5, 6, 7 은 Phase 0 이후 독립 진행 가능
- Phase 9는 전체 완료 후

---

## DESIGN.md 참조 인덱스 (빠른 조회용)

| 섹션 | 라인 | 관련 Phase |
|------|------|-----------|
| §3.1 트리거 방식 | L21-53 | (Phase 9 검증 시 참조) |
| §3.2 프롬프트 생성 | L55-103 | (Layer 4 — 본 계획 범위 밖) |
| §3.3 TDD 범위 | L105-123 | Phase 3 |
| §3.4.1 Biome 설정 | L127-229 | Phase 1-1 |
| §3.4.2 npm 스크립트 | L231-241 | Phase 1-3 |
| §3.4.3 hook 연동 | L243-276 | Phase 2 |
| §3.4.4 버전 정책 | L278-286 | (운영 시 참조) |
| §3.4.5 VS Code | L288-304 | Phase 1-3 |
| §3.4.6 마이그레이션 | L306-325 | Phase 1-1, 1-2 |
| §3.4.7 DEFERRED | L327-367 | Phase 8 |
| §3.4.8 네이밍 감사 | L369-383 | Phase 8 (감사 실행 시) |
| §3.4.9 재검토 트리거 | L385-393 | (운영 시 참조) |
| §3.5.1 기본 브랜치 | L397-414 | Phase 0-1 |
| §3.5.2 네이밍 규칙 | L416-433 | Phase 6-3 |
| §3.5.3 직접 커밋 금지 | L435-447 | Phase 2-3 |
| §3.5.4 머지 방식 | L449-465 | Phase 5-2 |
| §3.5.5 worktree | L467-488 | Phase 0-2, 9-2 |
| §3.5.6 보호 규칙 | L490-519 | Phase 5-1, 2-3 |
| §3.5.7 PR 생성 | L521-552 | Phase 6 |
| §3.5.8 브랜치 수명 | L554-569 | Phase 7-1 |
| §3.5.9 장기 브랜치 | L571-591 | Phase 7-2 |
| §3.5.10 파생 원칙 | L593-650 | 전 Phase 공통 |
| §4 원칙 요약 | L652-678 | 전 Phase 판단 기준 |
| §5 모듈 역할 경계 | L680-755 | Phase 4 |
| §6 구현 시 재조정 항목 | L757-779 | Phase 9 완료 후 점검 |

**주의**: DESIGN.md 편집 시 라인 번호 드리프트 가능. 라인으로 읽어서 섹션 헤더가 보이지 않으면 `^#### <번호>` 앵커로 Grep 후 재조회.

---

## 하네스 원칙 빠른 참조 (DESIGN.md §4에서 발췌)

구현 중 판단이 필요할 때 아래 원칙을 기준으로 한다.

| # | 원칙 | 한 줄 판단 기준 |
|---|------|----------------|
| P1 | 판단 박제 | "이 규칙이 매번 Claude의 판단에 맡겨져도 괜찮은가?" → 아니면 박제 |
| P2 | hook = 공급기 | "hook이 해석/계획을 하고 있는가?" → 하고 있으면 범위 초과 |
| P3 | 모듈 경계 | "이 코드가 자기 패키지의 역할에 맞는가?" → 아니면 차단 또는 이슈화 |
| P4 | 점진 승격 | "이 규칙을 처음부터 error로 넣어야 하는가?" → 아니면 DEFERRED |
| P5 | 활동량 기반 | "시간 단위 임계를 쓰고 있는가?" → 쓰고 있으면 활동량으로 전환 |
| P6 | 이슈 파이프라인 | "이 작업이 이슈에서 출발하는가?" → 아니면 파이프라인 밖 |
| P7 | 예외 구멍 | "예외를 묵시적으로 허용하고 있는가?" → 명시 식별자 필요 |
