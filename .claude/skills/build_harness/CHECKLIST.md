# SunScore 하네스 구현 체크리스트

> **용도**: 진행 상황 추적. 각 Step 완료 시 체크 + 커밋 해시 기록.
> **참조**: [PLAN.md](./PLAN.md) — 상세 작업 내용 및 DESIGN.md 라인/섹션 참조

---

## Phase 0 — 사전 준비

- [ ] **0-1** `master` → `main` 브랜치 마이그레이션 | 커밋: ``
- [ ] **0-2** `.gitignore`에 `.worktrees/` 추가 | 커밋: ``
- [ ] **0-3** 디렉터리 구조 생성 (Phase 1~7에서 자동 포함) | —

## Phase 1 — Biome 도입

- [ ] **1-1** Biome 2.4.12 설치 + `biome.json` 생성 | 커밋: ``
- [ ] **1-2** 기존 코드 포맷/린트 적용 + `.git-blame-ignore-revs` | 커밋: ``
- [ ] **1-3** npm 스크립트 + VS Code 설정 | 커밋: ``

## Phase 2 — 하네스 hook 기반 구조

- [ ] **2-1** `biome-on-edit.sh` (PostToolUse: Edit/Write) | 커밋: ``
- [ ] **2-2** `biome-pre-commit.sh` 커밋 게이트 (biome→tsc→jest) | 커밋: ``
- [ ] **2-3** `pre-commit-branch-guard.sh` + `pre-push-guard.sh` | 커밋: ``
- [ ] **2-4** `.claude/settings.json` hook 등록 | 커밋: ``

## Phase 3 — TDD 강제 체계

- [ ] **3-1** domain/adapters jest 설정 정비 | 커밋: ``
- [ ] **3-2** TDD 강제 hook 구현 | 커밋: ``

## Phase 4 — 모듈 역할 경계 강제

- [ ] **4-1** `module-role-check.sh` (새 코드 차단) | 커밋: ``
- [ ] **4-2** 기존 위반 코드 감지 메커니즘 | 커밋: ``

## Phase 5 — 브랜치 보호 규칙

- [ ] **5-1** `.github/rulesets/main.json` + `scripts/apply-ruleset.sh` | 커밋: ``
- [ ] **5-2** GitHub 저장소 설정 (squash merge + auto-delete) | (원격 설정, 커밋 없음)

## Phase 6 — PR 워크플로우

- [ ] **6-1** `.github/PULL_REQUEST_TEMPLATE.md` | 커밋: ``
- [ ] **6-2** `.claude/skills/create-pr/SKILL.md` | 커밋: ``
- [ ] **6-3** 브랜치 네이밍 검증 hook | 커밋: ``

## Phase 7 — 브랜치 수명 관리 hook

- [ ] **7-1** SessionStart prune + orphan worktree 알림 | 커밋: ``
- [ ] **7-2** 장기 브랜치 임계 모니터링 | 커밋: ``

## Phase 8 — DEFERRED_RULES 트래커

- [ ] **8-1** `DEFERRED_RULES.md` 초안 작성 | 커밋: ``
- [ ] **8-2** `deferred-rules-check.sh` SessionStart hook | 커밋: ``

## Phase 9 — E2E 검증

- [ ] **9-1** Solo 모드 파이프라인 검증 | 이슈: ``
- [ ] **9-2** Team 모드 파이프라인 검증 | 이슈: ``
- [ ] **9-3** 검증 결과 기록 → 세션 03 이관 | —

---

## 진행 기록

| 날짜 | Step | 메모 |
|------|------|------|
| | | |
