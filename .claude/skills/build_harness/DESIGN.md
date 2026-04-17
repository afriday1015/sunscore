# SunScore 하네스 설계

> **출처**: 하네스 설계 세션 02 (2026-04-15) — 세션 01 미결 사항 5개의 최종 결정과 파생 설계.
> **성격**: 논의 과정은 제거하고 **확정된 설계만** 기록. 회의록 전문은 저장소 외부(`/opt/workspace/harness/DESIGN_SESSION_02.md`)에 보관된다.
> **번호 체계**: 원 세션의 §3.x / §4 / §5 번호를 그대로 보존한다. [PLAN.md](./PLAN.md)는 본 문서의 섹션 번호로 설계 근거를 참조한다.

---

## 3. 결정 요약

| 항목 | 결정값 | 상세 |
|------|--------|------|
| 6.1 트리거 | **(a) 수동 + 이슈 분류 하네스** | §3.1 |
| 6.2 프롬프트 생성 | **(b) 원본 주입 + Claude 해석 (hook은 최소 가공)** | §3.2 |
| 6.3 TDD 범위 | **(a+) domain + adapters 전체 TDD 강제, ui 비강제** | §3.3 |
| 6.4 컨벤션 도구 | **(b) Biome 2.4.12 + 활동량 기반 유보 규칙 트래커** | §3.4 |
| 6.5 브랜치 전략 | **(a) GitHub Flow + 9개 하위 결정 확정** | §3.5 |

---

### 3.1 트리거 방식 — 수동 + 이슈 분류 하네스

**결정**: (a) 수동 트리거 + 이슈 분류 하네스

**분류 규칙 (하네스에 박제될 규칙)**:
1. 라벨 우선 — `scope:trivial` / `scope:small` → solo, `scope:team` / `scope:large` → team
2. 라벨 없을 때 본문 휴리스틱:
   - 변경 예상 파일 수 ≥ 3 → team
   - 여러 레이어 키워드 교차 (domain + ui 등) → team
   - "리팩토링" / "새 기능" / "통합" 키워드 → team
   - 그 외 → solo
3. 애매하면 `ask` 반환 → 메인 세션이 사용자 확인

**구현 위치**: `.claude/hooks/classify-issue.sh` (SessionStart hook에서 호출)

**동작 흐름**:
```
이슈 #N 처리 요청
   ↓
SessionStart hook
   ├─ gh issue view N --json labels,title,body
   ├─ classify-issue.sh 실행 → "solo" | "team" | "ask"
   └─ 결과를 메인 세션 컨텍스트로 주입
   ↓
메인 세션
   solo → 직접 작업
   team → /run_team 호출
   ask  → 사용자에게 확인
```

**파생 원칙**: 하네스의 일반적 역할은 "판단 규칙을 시스템에 박제하여 Claude의 그때그때 판단에 맡기지 않는 장치". **Claude의 자율성과 규칙의 일관성 사이의 경계선**을 긋는 것이 하네스 (→ §4 P1).

---

### 3.2 프롬프트 생성 방식 — 최소 가공 컨텍스트 주입

**결정**: (b) SessionStart hook으로 이슈 원문을 최소 가공하여 주입. Claude가 해석·계획.

**"최소 가공"의 구체 범위**:

| 항목 | 처리 | 이유 |
|------|------|------|
| 제목 | 원문 그대로 | 해석 여지 없음 |
| 본문 | 원문 그대로 | 해석은 Claude 몫 |
| 라벨 | 배열 → 쉼표 구분 문자열 | 가독성 개선 |
| 이슈 번호 | 추가 | 브랜치명/PR 링크용 |
| 분류 결과 | `classify-issue.sh` 출력 덧붙이기 | §3.1 합의 |
| 코멘트 스레드 | 포함 (최신 → 과거) | 진행 경과·추가 맥락 |
| gh CLI 메타 | 제거 (state/author/assignees 등) | 컨텍스트 낭비 |

**주입 컨텍스트 포맷**:

```markdown
## 현재 처리 중인 이슈 (자동 주입)

**이슈 번호**: #42
**제목**: 해질녘 오버레이가 너무 진함
**라벨**: bug, scope:team
**하네스 분류 결과**: team

### 본문
(이슈 본문 원문)

### 코멘트 (최신 → 과거)
- @user (2026-04-14): ...
- @user (2026-04-13): ...

---
위 정보를 근거로 작업을 진행하라.
분류가 `team`이면 /run_team 플로우를 따를 것.
분류가 `solo`면 메인 세션이 직접 처리할 것.
분류가 `ask`면 사용자에게 처리 방식 확인할 것.
```

**구현 위치**: `.claude/hooks/inject-issue-context.sh` (또는 `classify-issue.sh`와 통합)

**hook의 책임 경계**:
- [금지] 프롬프트 생성기: 이슈 내용을 기반으로 **작업 지시서** 작성 — 하지 않음
- [허용] 컨텍스트 공급기: 이슈 원문 + 메타 + 분류 결과를 **정돈해서 주입** — 이것만 함

**파생 원칙**: "hook = 컨텍스트 공급기, 프롬프트 생성기 아님" (→ §4 P2).

---

### 3.3 TDD 적용 범위 — domain + adapters 강제

**TDD 강제 범위**:
```
[강제]   packages/domain/**     — 전체 TDD 강제
[강제]   packages/adapters/**   — 전체 TDD 강제
[비강제] packages/ui/**         — 현재 순수 로직 혼재 인지, 향후 리팩토링 대상
[비강제] apps/web/**
[비강제] apps/native/**
```

**하네스 TDD 강제 동작**:
- domain/adapters 파일 수정 시 → 관련 테스트 존재 확인 → 없으면 Red 단계부터 요구
- 수정 후 자동 테스트 실행 → 실패 시 커밋 차단

**파생 설계 — 모듈 역할 경계 강제**:
본 결정 논의 중 "코드가 자기 모듈의 역할에 맞지 않는 위치에 있다"는 문제가 발견됨(`packages/ui/src/utils/` 아래 순수 함수 존재). 하네스가 **사전 차단 + 지속 개선**하도록 §5에서 별도 상세화.

---

### 3.4 컨벤션 도구 — Biome

#### 3.4.1 최종 확정 — Biome 도구 설정

**A. 버전**
- **`2.4.12` 정확 고정** (캐럿 없이). CI/로컬 동기화 보장.
- 업그레이드 정책: §3.4.4.

**B. `biome.json` 위치**
- **루트 `/biome.json` 1개**. 패키지별 `biome.json` 생성 금지. 패키지별 차이는 `overrides`로 처리.

**C. 최종 `biome.json` 내용**

```json
{
  "$schema": "https://biomejs.dev/schemas/2.4.12/schema.json",
  "vcs": { "enabled": true, "clientKind": "git", "useIgnoreFile": true },
  "files": {
    "includes": ["**"],
    "ignore": ["dist", "build", "node_modules", "coverage", "*.generated.*"]
  },
  "assist": {
    "actions": {
      "source": { "organizeImports": "on" }
    }
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "correctness": {
        "noUnusedImports": "error",
        "noUnusedVariables": "warn"
      },
      "suspicious": { "noConsoleLog": "warn" }
    }
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 120
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "jsxQuoteStyle": "double",
      "semicolons": "always",
      "trailingCommas": "all"
    }
  },
  "overrides": [
    {
      "includes": ["packages/domain/**"],
      "linter": {
        "rules": {
          "correctness": {
            "noRestrictedImports": {
              "level": "error",
              "options": {
                "paths": {
                  "react": "domain은 React 의존 금지 (도메인 순수성)",
                  "react-native": "domain은 RN 의존 금지",
                  "@sunscore/adapters": "역방향 의존 금지",
                  "@sunscore/ui": "ui 의존 금지"
                }
              }
            }
          }
        }
      }
    },
    {
      "includes": ["packages/adapters/**"],
      "linter": {
        "rules": {
          "correctness": {
            "noRestrictedImports": {
              "level": "error",
              "options": {
                "paths": {
                  "react": "adapters는 React 의존 금지",
                  "react-native": "adapters는 RN 직접 의존 금지",
                  "@sunscore/ui": "ui 의존 금지"
                }
              }
            }
          }
        }
      }
    }
  ]
}
```

**D. 포맷 설정 근거 (전부 기존 코드 실측 일치)**

| 항목 | 값 | 검증 |
|------|-----|------|
| 들여쓰기 | space 2 | 전 파일 일치 |
| 줄길이 | 120 | 최장 101자 |
| TS 따옴표 | single | 전 import single |
| JSX 따옴표 | double | App.tsx 등 double |
| 세미콜론 | always | 도메인 100% 일치 |
| 후행 쉼표 | all | 731건 사용 중 |

#### 3.4.2 npm 스크립트

루트 `package.json`에 추가:
```json
"scripts": {
  "format": "biome format --write .",
  "lint": "biome lint .",
  "check": "biome check .",
  "check:fix": "biome check --write ."
}
```

#### 3.4.3 하네스 hook 연동

**파일 구성**
```
.claude/hooks/
  ├─ biome-on-edit.sh         (PostToolUse: Edit|Write)
  ├─ biome-pre-commit.sh      (PreToolUse: Bash git commit)
  ├─ module-role-check.sh     (PreToolUse: Edit|Write — §5와 공유)
  └─ deferred-rules-check.sh  (SessionStart)
```

**동작 정의**

| Hook | 트리거 | 명령 | 실패 시 |
|------|--------|------|--------|
| `biome-on-edit.sh` | 파일 수정 직후 | 1) `biome format --write <파일>` → 2) `biome lint --write <파일>` → 3) `biome lint <파일>` 경고 출력 | 차단 없음 |
| `biome-pre-commit.sh` | 커밋 시도 시 | `biome check --staged` → `tsc --noEmit` → `jest --onlyChanged` | 어느 단계든 실패 시 커밋 차단 |
| `module-role-check.sh` | Edit 전 | AST 기반 §5 모듈 역할 경계 검증 (Biome 미커버 영역) | 위반 시 Edit 차단 |
| `deferred-rules-check.sh` | 세션 시작 시 | DEFERRED_RULES.md 조건 점검 → 충족 시 승격 알림 | 알림만 (차단 없음) |

**커밋 게이트 순서 (빠른 실패 우선)**
```
1. biome check --staged     (~30ms)
2. tsc --noEmit             (~수 초)
3. jest --onlyChanged       (~수십 초)
→ 빠른 검사가 먼저, 느린 검사는 나중
```

**§5 모듈 역할 경계 — Biome vs hook 역할 분담**

| 항목 | 처리 주체 | 이유 |
|------|----------|------|
| import 기반 레이어 경계 (domain에서 react import 등) | Biome `noRestrictedImports` | 선언적, IDE 피드백 |
| 함수 구현 내용 기반 검증 (ui/utils에 Math 연산 직접 등) | hook (`module-role-check.sh`) | AST 파싱 필요, Biome 미커버 |

#### 3.4.4 버전 업그레이드 정책

| 변경 | 처리 |
|------|------|
| 패치 (2.4.12 → 2.4.13) | 1개월 주기 평가, 이슈 없으면 반영 |
| 마이너 (2.4.x → 2.5.x) | 규칙 변경 영향 검토 후 의도적 반영 |
| 메이저 (2.x → 3.x) | 별도 마이그레이션 세션 필요 |

DEFERRED_RULES.md에 "Biome 버전 검토" 항목으로 주기 관리.

#### 3.4.5 IDE 통합 (VS Code)

**`.vscode/extensions.json`**
```json
{ "recommendations": ["biomejs.biome"] }
```

**`.vscode/settings.json`**
```json
{
  "editor.defaultFormatter": "biomejs.biome",
  "editor.formatOnSave": true,
  "[typescript]":       { "editor.defaultFormatter": "biomejs.biome" },
  "[typescriptreact]":  { "editor.defaultFormatter": "biomejs.biome" },
  "[json]":             { "editor.defaultFormatter": "biomejs.biome" }
}
```

#### 3.4.6 마이그레이션 절차

```
1. npm i -D -E @biomejs/biome@2.4.12        (정확 버전 설치)
2. biome.json 생성 (§3.4.1 C 내용)
3. biome check .                             (드라이런)
4. 위반 규모 확인 → 필요 시 규칙 조정
5. biome check --write .                     (실제 적용)
6. git commit "chore(config): add biome with enforcement rules"
7. 별도 커밋: "style: apply biome format to codebase"
8. 7번 커밋 해시를 /.git-blame-ignore-revs 에 기록
9. git config blame.ignoreRevsFile .git-blame-ignore-revs (로컬 1회)
10. .vscode/ 설정 추가
```

**`.git-blame-ignore-revs` 형식**
```
# Initial biome formatting — 2026-04-16
<커밋 해시>
```

#### 3.4.7 DEFERRED_RULES.md 트래커

**파일 위치**
`.claude/DEFERRED_RULES.md` (sunscore 저장소 루트 기준)

**초기 유보 규칙 (활동량 기반 조건)**

| 규칙 | 초기 상태 | 승격 조건 |
|------|----------|----------|
| `style/useNamingConvention` | off | 네이밍 감사(§3.4.8) 완료 + 이후 **10 PR 머지** 동안 위반 0건 |
| `correctness/noUnusedVariables` (warn→error) | warn | **직전 20커밋** 중 10+ 커밋이 TS/TSX 수정 포함하며 warn 0건 |
| `suspicious/noConsoleLog` (warn→error) | warn | geocoding.ts logger 대체 완료 + **5 PR** 재발 없음 |
| `complexity/noExcessiveCognitiveComplexity` | 미포함 | reviewer 지적 3회 이상 시 도입 검토 |

**파일 형식 예시**
```markdown
## correctness/noUnusedVariables (warn → error)

- 현재 상태: warn
- 승격 조건:
  1. 직전 20 TS 커밋 동안 warn 0건
- 활동 측정:
  - 마지막 점검: <커밋 해시> (<ISO 날짜>)
  - 현재 카운트: 0 / 20 TS 커밋
- 재검토 주체: deferred-rules-check.sh (SessionStart hook)
```

**갱신 주체·방법**
```
SessionStart hook (deferred-rules-check.sh) 동작:
  1. DEFERRED_RULES.md 파싱 — 각 규칙의 "마지막 점검" 커밋 해시 추출
  2. git log <last-checked>..HEAD 분석
  3. 각 규칙별 조건에 맞게 카운트 갱신
  4. DEFERRED_RULES.md 재작성 (카운트 + 마지막 점검 커밋 갱신)
  5. 조건 충족 시 메인 세션에 "[유보 규칙 승격 제안]" 메시지 주입
```

**활동 측정 기준**
- TS/TSX 수정 포함 커밋만 카운트 (JSON/md만 고친 커밋은 제외)
- 규칙별 관련 변경이 있는 PR만 카운트
- 시간 기반 조건 금지 (개발 중단 시 허위 승격 방지)

#### 3.4.8 "네이밍 감사" 정의

`useNamingConvention` 승격 조건의 전제.

```
절차:
  1. biome lint --rule=style/useNamingConvention . 실행 (임시 활성화)
  2. 위반 목록을 DEFERRED_RULES.md 섹션에 첨부
  3. 카테고리별 판정:
     - "진짜 이상한 네이밍"       → 리팩토링 이슈로 생성 후 수정
     - "규칙이 과한 경우"          → biome.json에 규칙 예외 설정
     - "SunScore 고유 관례"       → 예외 설정 + 주석으로 근거 명시
  4. 모든 항목 처리 완료 시 감사 종료 → DEFERRED_RULES.md에 "감사 완료" 표시
  5. 이후 PR 카운트 시작
```

#### 3.4.9 재검토 트리거 (3단계 결합)

| 단계 | 방식 | 예시 |
|------|------|------|
| (A) 트리거 기반 | 상황 발생 시 즉시 | reviewer 패턴 3회 지적 → 관련 규칙 활성화 |
| (B) 마일스톤 기반 | Layer 완료 시점 | Layer 1 구현 완료 시 유보 목록 전체 재검토 |
| (C) 활동량 기반 | 커밋/PR 수 도달 시 | §3.4.7 표의 조건 자동 점검 |

---

### 3.5 브랜치 전략 — GitHub Flow + 9개 하위 결정

#### 3.5.1 기본 브랜치 이름

**확정**: `master` → **`main` 변경**. 실행 시점은 Layer 1 구현 직전 (관련 hook 작성 + CLAUDE.md 참조 갱신과 한 커밋으로 묶기 위함).

마이그레이션 절차:
```
1. git branch -m master main
2. git push -u origin main
3. gh repo edit --default-branch main
4. git push origin --delete master
5. CLAUDE.md / hook / 문서의 "master" 참조 grep → 업데이트
6. git config --global init.defaultBranch main (선택)
```

근거:
- 1인 저장소 + 외부 참조 부재 → 마이그레이션 비용 최소
- `gh` CLI 기본 동작이 `main` 가정 → 하네스 스크립트 단순화
- 지금 안 옮기면 히스토리 누적으로 동기 약화

#### 3.5.2 브랜치 네이밍 규칙

**확정**: `<type>/issue-<N>-<kebab-desc>`

| 하위 | 값 |
|------|-----|
| 정규식 | `^(feat\|fix\|refactor\|chore\|docs\|test\|perf\|style\|ci\|build)/issue-(\d+)-[a-z0-9-]+$` |
| 허용 type | commit convention 전부 (`revert` 제외) |
| 설명 표기 | kebab-case, 3~5 단어 권장 |
| 길이 | 60자 이내 권장 (강제 없음, hook이 warning) |
| 이슈 없는 예외 | `chore/no-issue-<slug>` 만 허용, PR body에 근거 기재 |

예: `feat/issue-42-evening-overlay`, `fix/issue-17-compass-drift`

근거:
- `issue-<N>` 고정 토큰 → 설명 변화와 무관한 번호 파싱
- commit convention 어휘 재사용 → 학습 비용 0
- 예외 구멍을 명시 prefix(`no-issue`)로 열어 규칙 붕괴 방지

#### 3.5.3 직접 커밋 허용 여부

**확정**: **(a) 순수 GitHub Flow** — main 직접 커밋 금지, Claude 동일 규칙 적용.

예외 3가지 (식별: `hotfix:` 커밋 prefix 또는 명시 환경 변수):
1. 초기 부트스트랩 (하네스 자체가 없는 시점)
2. `.claude/hooks/` 자체 수정 (chicken-and-egg 방지)
3. 긴급 핫픽스 (`hotfix:` prefix, 사후 이슈 백필 의무)

근거:
- 하네스 철학 "판단 박제"와 정합
- 1인 개발에서 PR = 리뷰 장치가 아니라 **Biome/tsc/test/reviewer hook의 마지막 관문**
- 예외 3가지를 명시하여 "규칙이 예외 상황에서 무너지는" 문제 사전 차단

#### 3.5.4 머지 방식

**확정**: **(a) Squash merge**

| 세부 | 값 |
|------|-----|
| 기본 방식 | squash |
| PR 제목 | commit convention 강제 (`<type>(<scope>): <subject>`) → squash 커밋 제목 |
| PR body | squash 커밋 body로 복사 |
| 예외 | `merge:rebase` 라벨 있을 때만 rebase merge 허용 |
| Merge commit | 완전 금지 |
| 강제 수단 | GitHub 저장소 설정(merge commit 비활성) + hook 제목 정규식 검증 |

근거:
- "1 이슈 = 1 의미 단위" 원칙이 main 히스토리에 그대로 반영
- 브랜치 WIP 커밋(`wip`, `fix typo`)의 main 유입 차단
- `git bisect` 단위가 이슈 단위 = 디버깅 단순

#### 3.5.5 `/run_team` 실행 위치

**확정**: **(b) Team 모드만 worktree**

| 세부 | 값 |
|------|-----|
| Solo 모드 | 루트 디렉터리 유지, 브랜치 전환만 |
| Team 모드 | `.worktrees/issue-<N>/` 경로에 worktree 생성 |
| 생성 주체 | `/run_team` skill 첫 단계 |
| node_modules | `npm ci --prefer-offline` (worktree 생성 직후) |
| 메인 세션 위치 | 루트 (하위 에이전트만 worktree 내에서 동작) |
| 삭제 시점 | 머지 후 사용자 수동 + SessionStart orphan 알림 (자동 삭제 금지) |
| `.gitignore` | `.worktrees/` 추가 |

**(c) 모든 이슈 worktree로의 승격 조건**은 DEFERRED_RULES.md에 기재:
- 실제 "여러 이슈 병렬 진행이 일상"이 되는 시점 포착
- 활동량 기반 조건 (예: 월 평균 동시 활성 이슈 3개 이상 도달)

근거:
- Team 모드에서만 격리 효과 최대 (8 에이전트 동시 편집)
- Solo 모드의 즉시성 보존
- 자동 삭제 금지는 risky actions 원칙 준수

#### 3.5.6 브랜치 보호 규칙

**확정**: **(c) hook + GitHub 이중 강제**

| 규칙 | 값 |
|------|-----|
| main 직접 push 차단 | on (PR 경유 강제) |
| Force push to main 차단 | on |
| main 삭제 차단 | on |
| Linear history 요구 | on |
| Required status checks | `biome`, `tsc`, `jest` 3종 |
| PR approval 수 | 0 (1인 개발) |
| Require conversation resolution | off |
| Signed commits | DEFERRED (외부 기여 PR 수신 시점 재검토) |
| Require branches up to date | on |
| Admin bypass | §3.5.3 예외 3가지에만 사용, bypass 기록 GitHub에 보존 |

관리 수단:
- `.github/rulesets/main.json` 파일로 코드화 → `gh api --method PUT /repos/:owner/:repo/rulesets/...` 로 적용
- 스크립트: `scripts/apply-ruleset.sh`
- 정확한 `actor_id` 값(admin)은 Layer 1 구현 시 `gh api` 호출로 확인 후 고정

hook 레이어:
- `.claude/hooks/pre-commit-branch-guard.sh`: 커밋 대상 브랜치 = main 이면 차단
- `.claude/hooks/pre-push-guard.sh`: main 대상 force push 차단

근거:
- hook(UX) + GitHub(최종 방어선) = 이중 안전망
- 규칙 파일화 → drift 방지 + 재현성
- signed commits는 §3.4.7 DEFERRED 패턴 재사용

#### 3.5.7 PR 생성 주체

**확정**: **(c) 하이브리드 — `/create-pr` 스킬로 구현**

`.claude/skills/create-pr/SKILL.md` 동작 개요:
```
입력: 현재 브랜치 + 최근 커밋 + (있으면) /run_team 리포트
절차:
  1. 브랜치명에서 <type>, issue-<N> 파싱
  2. commit convention 제목 정규식 검증
  3. PR body 템플릿 자동 채움
  4. 라벨 자동 계산 (scope:*, type:*)
  5. gh pr create --title ... --body ... --assignee @me --label ...
  6. test_engineer/reviewer FAIL 기록 발견 시 --draft 플래그 추가
  7. 결과 URL 출력
```

| 세부 | 값 |
|------|-----|
| 트리거 | 사용자가 `/create-pr` 명시 호출 (자동 생성 금지) |
| PR 제목 | commit convention 강제 |
| PR body 템플릿 | `.github/PULL_REQUEST_TEMPLATE.md` 고정, Claude가 채움 |
| 이슈 연결 | 브랜치에서 번호 파싱 → `Closes #<N>` 자동 삽입 (`no-issue` 제외) |
| 라벨 자동 | `scope:solo/team`(classify 결과), `type:*`(브랜치 prefix) |
| `merge:rebase` 라벨 | 자동 부여 금지 — 사용자 명시만 |
| Draft vs Ready | 기본 Ready, `/run_team` FAIL 기록 있으면 draft |
| Assignee | `@me` (self-assign) |

근거:
- CLAUDE.md "자동 커밋 금지"를 PR까지 확장
- Claude가 초안 품질 담당, 사용자는 최종 트리거
- 기계적으로 결정 가능한 항목만 자동화(제목·라벨·이슈 연결)

#### 3.5.8 브랜치 수명

**확정**: **머지 시 원격 자동 삭제 + 로컬 SessionStart hook 승인형 prune**

| 세부 | 값 |
|------|-----|
| 원격 브랜치 | GitHub 설정 `delete_branch_on_merge: true` |
| 로컬 브랜치 | SessionStart hook이 `git fetch --prune` → gone+merged 탐지 → 사용자 승인 후 일괄 `git branch -d` |
| 워크트리 연동 | 로컬 브랜치 삭제 시점에 `.worktrees/issue-<N>/` 존재하면 함께 정리 제안 |
| 롤백 정책 | main revert 커밋이 기본, 브랜치 복원은 GitHub PR 페이지 "Restore branch" 예외만 |

근거:
- squash merge 시점에 피처 브랜치 고유 가치 소실
- GitHub이 PR 페이지에 복원 버튼 포함 → 삭제는 안전
- 자동 삭제가 아닌 "승인형 prune"으로 WIP 브랜치 보호
- 워크트리 정리를 브랜치 정리와 통합 → §3.5.5 "수동 정리" 부담 완화

#### 3.5.9 장기 브랜치 허용 여부

**확정**: **(b) 명시적 예외 + 엄격 관리**

| 세부 | 값 |
|------|-----|
| 허용 prefix | `spike/<slug>` (이슈 없는 탐색), `exp/issue-<N>-<slug>` (특정 이슈의 대안 탐색) |
| 수명 한도 | **main에 5 PR 머지 경과 시 경고, 15 PR 경과 시 강제 확인** |
| main 동기화 | **main에 3 PR 미동기화 시 rebase 권장, 10 PR 시 경고** |
| 동시 개수 | 3개 초과 경고 (강제 없음) |
| 종결 절차 | (A) 성공→정식 feat 브랜치로 재구현 / (B) 기각→closed 이슈 / (C) 보류→재검토 마커 |
| 결과 보존 | 모든 종결은 이슈로 귀결 — "삭제되더라도 결론은 남는다" |

**주의**: 시간 기반 임계는 모두 활동량 기반으로 전환. §3.4.7 DEFERRED_RULES에서 확립된 동일 원칙이 본 항목에서 **하네스 전체 원칙으로 승격** (§3.5.10-A).

근거:
- 실험의 현실을 인정하되 prefix로 "정상 흐름 아님" 가시화
- 강제 삭제 없음 — risky actions 원칙
- 모든 종결을 이슈화하여 §3.1 이슈 기반 워크플로우와 정합

---

### 3.5.10 파생 산출물 — 하네스 전체에 반영될 원칙

#### (A) 활동량 기반 트리거 원칙

> **하네스의 모든 자동 트리거는 "활동량 기반"으로 측정한다.**
>
> **Why**: 개발 일시 중단 시 허위 경고/승격 방지. 시간 단위(일/주/월) 측정은 실제 개발 속도와 무관하게 임계를 넘어 노이즈를 유발.
>
> **How to apply**: 시간 대신 커밋 수·PR 머지 수·TS/TSX 수정 커밋 수 등으로 임계 설정. 시간 기반이 본질적 필요(예: 의존성 보안 점검 주기)일 때만 예외 허용.

- §3.4.7 DEFERRED_RULES 승격 조건에서 최초 등장
- §3.5.9 장기 브랜치 임계 설계에서 재등장 → **원칙 승격**
- 적용 대상: Layer 1 hook 전반, Layer 2 커밋 게이트, Layer 4 이슈 자동화

#### (B) 단일 이슈 파이프라인 확립

```
이슈 생성 → 브랜치(<type>/issue-<N>-<desc>) → (worktree 선택적 생성) →
커밋 → PR 초안(/create-pr) → Required status checks →
Squash merge → 원격 브랜치 auto-delete → 로컬 prune + 워크트리 정리
```

각 단계의 책임 주체와 도구:

| 단계 | 주체 | 도구 |
|------|------|------|
| 이슈 생성 | 사용자 | GitHub UI |
| 브랜치 생성 | 사용자 | git/gh |
| 분류 (solo/team) | hook | `classify-issue.sh` |
| 컨텍스트 주입 | hook | `inject-issue-context.sh` |
| Worktree | `/run_team` skill | `git worktree add` |
| 구현 | Claude (solo/team) | 메인 세션 / engineer agents |
| 테스트 | test-engineer | jest |
| PR 생성 | 사용자 트리거 + Claude 실행 | `/create-pr` skill |
| 머지 | 사용자 | GitHub UI (ruleset 통과 시) |
| 정리 | hook | SessionStart prune |

Layer 3 (브랜치 전략) 구현 시 이 파이프라인을 축으로 hook·skill·설정 파일이 배치됨.

#### (C) 예외 구멍의 일관된 패턴

항목별 예외 장치가 공통 구조를 가짐:

| 위치 | 예외 |
|------|------|
| §3.5.2 네이밍 | `chore/no-issue-<slug>` |
| §3.5.3 직접 커밋 | 부트스트랩 / hook 자체 수정 / `hotfix:` |
| §3.5.4 머지 방식 | `merge:rebase` 라벨 |
| §3.5.9 장기 브랜치 | `spike/*`, `exp/*` prefix |

공통 패턴:
- **명시적 식별자** (prefix / 라벨 / 커밋 메시지 prefix) — 묵시적 예외 금지
- **사후 기록 의무** (PR body 근거 / 이슈 백필 / 종결 이슈)
- **hook이 식별자를 인지하고 규칙 스킵**

이 패턴은 Layer 2~4 설계에서 새 예외 상황이 발생할 때마다 재사용된다.

---

## 4. 하네스 원칙 요약

§3의 5개 결정 과정에서 7개의 하네스 공통 원칙이 도출되었다. Layer 1~4 설계·구현 전반에 걸쳐 판단 기준으로 재사용된다.

| # | 원칙 | 정의 | 도출 위치 | 적용 범위 |
|---|------|------|----------|----------|
| P1 | 판단 박제 | 하네스 = "Claude의 자율성"과 "규칙의 일관성" 사이의 경계선. 일관성이 필요한 판단은 시스템에 박제 | §3.1 | 전체 Layer |
| P2 | hook = 컨텍스트 공급기 | hook은 재료를 정돈해서 주입만. 프롬프트 생성(해석·계획)은 Claude 몫 | §3.2 | Layer 1 hook, Layer 4 |
| P3 | 모듈 역할 경계 강제 | 새 코드 → 차단, 기존 코드 → 감지+이슈화. 허용/금지 매트릭스 기반 | §3.3 → §5 | Layer 1 hook |
| P4 | 점진적 규칙 승격 (DEFERRED) | recommended로 시작, 활동량 조건 충족 시 승격. 뺄셈보다 덧셈 | §3.4.7 | Biome 규칙, 전체 설정 |
| P5 | 활동량 기반 트리거 | 시간 대신 커밋·PR·TS 수정 횟수로 임계 측정. 시간 기반은 예외만 허용 | §3.5.10-A | 전체 Layer |
| P6 | 단일 이슈 파이프라인 | 이슈→브랜치→커밋→PR→머지→정리의 일관된 흐름. 각 단계에 책임 주체·도구 명시 | §3.5.10-B | Layer 3 |
| P7 | 예외 구멍 패턴 | 명시적 식별자(prefix/라벨) + 사후 기록 의무 + hook 인지. 묵시적 예외 금지 | §3.5.10-C | 전체 Layer |

### 원칙 간 관계

```
P1 판단 박제 (상위 철학)
 ├─ P2 hook 책임 경계 (판단 vs 자율의 구체 경계)
 ├─ P3 모듈 역할 경계 (코드 위치의 박제)
 ├─ P4 점진적 승격 (규칙 강도의 박제)
 ├─ P5 활동량 기반 (측정 방식의 박제)
 └─ P7 예외 구멍 (예외 처리의 박제)
P6 단일 이슈 파이프라인 (P1~P7이 실현되는 축)
```

---

## 5. 모듈 역할 경계 강제 + 지속적 리팩토링

### 5.1 문제 배경

§3.3 논의 중 발견된 현상:

| 파일 | 현재 위치 | 실제 역할 | 있어야 할 곳 |
|------|----------|----------|-------------|
| `directionLabels.ts` | `packages/ui/src/utils/` | 각도 → 한국어 방향 (순수 함수) | `packages/domain/` |
| `formatLocationAddress.ts` | `packages/ui/src/utils/` | 주소 포맷팅 (순수 함수) | `packages/domain/` |
| `useEveningIntensity.ts` | `packages/ui/src/hooks/` | domain 래핑 + 조건 분기 | 조건 분기 → `domain`, hook 껍데기 → `ui` |

CLAUDE.md의 "UI에서 계산 금지, 모든 계산은 domain에서" 원칙에 위배되는 코드가 이미 존재. 하네스 없이 개발하면 **원칙이 선언에 그치고 코드에서 지켜지지 않는다**는 증거.

### 5.2 하네스가 담당할 두 가지 역할

#### (A) 사전 차단 — 새 코드가 잘못된 위치에 작성되는 것 방지

Layer 1(코드 가드레일)에 포함. 기존 설계의 "레이어 경계 검증"을 확장:

```
기존 규칙: domain에서 react/adapters/ui import 차단
확장 규칙: ui에서 순수 계산 로직 작성 차단
```

**모듈별 허용/금지 매트릭스**:

| 패키지 | 허용 | 금지 |
|--------|------|------|
| `domain` | 순수 TS, suncalc | React, RN, adapters, ui, 플랫폼 API |
| `adapters` | 순수 TS, 플랫폼 API, domain 타입 | React, RN, ui |
| `ui` | React, RN, domain 호출, adapters 호출 | 순수 계산 로직 직접 구현 (domain으로 위임해야 함) |
| `apps/web` | 위 모든 패키지 import | 순수 계산 직접 구현 |
| `apps/native` | 위 모든 패키지 import | 순수 계산 직접 구현 |

**구현 방식**: `PreToolUse(Edit)` hook에서 파일 경로 + 변경 내용을 분석하여 위반 패턴 차단.

차단 예시:
- `packages/ui/src/utils/` 에 새 순수 함수 작성 시도 → "이 로직은 domain에 작성하세요" 메시지와 함께 차단
- `packages/ui/` 에서 수학 연산(Math.sin, Math.cos 등) 직접 사용 → 경고

#### (B) 지속적 리팩토링 — 기존 위반 코드를 점진적으로 정리

하네스가 강제하는 것이 아니라, **발견 → 이슈화 → 처리**를 자동화하는 구조:

```
1. PostToolUse(Edit|Write) hook 또는 세션 시작 시
   → 모듈 역할 위반 스캔 실행
   → 위반 목록을 컨텍스트에 주입 (차단은 안 함 — 기존 코드이므로)

2. 위반 목록이 일정 수 이상이면
   → "리팩토링 이슈 생성 권장" 메시지 출력

3. 리팩토링 이슈 처리 시
   → 하네스의 TDD 강제 + 레이어 검증이 리팩토링 품질 보장
```

**핵심 구분**:
- 새 코드 → **차단** (잘못된 위치 사전 방지)
- 기존 코드 → **감지 + 이슈화** (점진적 개선 유도, 일괄 차단은 개발 마비 유발)

### 5.3 세션 01 로드맵과의 관계

본 항목은 Layer 1(코드 가드레일)의 "(a) 레이어 경계 검증"을 확장한 것. 별도 Layer가 아니라 **Layer 1 내부의 하위 항목**으로 편입:

```
Layer 1: 코드 가드레일
  (a) 레이어 경계 검증 — import 차단 (기존)
  (a') 모듈 역할 경계 강제 — 순수 로직 위치 검증 (신규 추가)
  (a'') 기존 위반 코드 감지 + 리팩토링 유도 (신규 추가)
  (b) 타입 체크
  (c) 테스트 자동 실행
  (d) 위험 명령 차단
```

---

## 6. 구현 시 재조정 항목

본 설계는 확정이나, 다음 항목은 **Layer 1/3 구현 시 실제 동작 확인 후 재조정**한다.

### Biome / 코드 가드레일 (§3.4 계열)

- hook 스크립트 구현 방식 결정 (bash vs node, 에러 메시지 형식)
- `module-role-check.sh` AST 파싱 방식 (TypeScript compiler API vs regex fallback)
- DEFERRED_RULES.md 파서 정확도 검증
- 커밋 게이트 성능 측정 (느리면 `--onlyChanged` 범위 조정)
- VS Code Biome 확장 실제 동작 확인
- "네이밍 감사"(§3.4.8) 실행 — 위반 규모에 따라 절차 재조정

### 브랜치 전략 (§3.5 계열)

- `main` 브랜치 마이그레이션 실행 타이밍 + `master` 참조 일괄 갱신
- `.github/rulesets/main.json`의 정확한 `actor_id` (admin) 값 — `gh api` 조회 후 확정
- `scripts/apply-ruleset.sh` 구현 및 dry-run
- `/create-pr` skill 상세 구현 (초안 생성 품질 튜닝)
- `.claude/hooks/pre-commit-branch-guard.sh`, `pre-push-guard.sh` 실제 구현
- SessionStart hook의 gone/merged 탐지 성능 (저장소 커짐에 따라 조정)
- `npm ci --prefer-offline` 실제 소요 시간 실측 — 1분 초과 시 대체 방안 검토
- 장기 브랜치 임계(5/15, 3/10 PR)의 감도 — 실운영 후 조정
- `.github/PULL_REQUEST_TEMPLATE.md` 초안 — Layer 3 구현 직전 최종 확정
