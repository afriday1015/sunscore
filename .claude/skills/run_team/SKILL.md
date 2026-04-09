---
name: run_team
description: Run a SunScore feature/bugfix request through the full team workflow — sunscore-architect plans, the relevant engineer agents (domain/adapters/ui/web/native) implement in dependency order, test-engineer writes and runs tests, and sunscore-reviewer validates against CLAUDE.md rules. Use this when the user invokes /run_team explicitly. Default mode for SunScore is solo (main session direct); /run_team is opt-in.
---

# /run_team — SunScore team workflow

You are running the SunScore multi-agent team workflow. Follow this orchestration EXACTLY.

## Step 0 — Parse arguments

The user invoked `/run_team` with optional arguments. Parse:

- `/run_team A <request>` or `/run_team opus <request>` → all agents use **opus**
- `/run_team B <request>` or `/run_team mixed <request>` → architect/reviewer = **opus**, engineers = **sonnet**
- `/run_team C <request>` or `/run_team sonnet <request>` → all agents use **sonnet**
- `/run_team <request>` (no model arg) → **ASK the user** via `AskUserQuestion` which model tier to use, with options:
  - "A — All Opus (highest quality, slower/costlier)" [default]
  - "B — Mixed (Opus for architect & reviewer, Sonnet for engineers)"
  - "C — All Sonnet (fastest/cheapest)"

If the user provides no request text at all, ask them what they want done.

Store the chosen model tier. You will pass it as the `model` parameter on every `Agent` tool call below.

## Step 1 — Architect plans

Invoke the `sunscore-architect` agent (foreground) with:
- The user's request verbatim
- Instruction to produce a dependency-ordered execution plan listing which engineer agents to invoke and what each should do

Wait for the plan. If the architect reports a conflict with frozen rules or excluded scope, STOP and surface that to the user — do not proceed.

## Step 2 — Execute engineers in dependency order

Follow the architect's plan strictly. Standard order:

1. `domain-engineer` (if domain changes)
2. `adapters-engineer` (if adapters changes)
3. `ui-engineer` (if shared UI changes)
4. `web-engineer` and `native-engineer` — **call in parallel** (single message, multiple Agent tool calls) if both are in the plan
5. Skip any agent the plan does not require

For each engineer call:
- Pass the architect's brief for that engineer verbatim
- Pass the chosen `model` tier
- Wait for the engineer's change report before moving to the next dependent step

## Step 3 — Test

Invoke `test-engineer` with:
- Summary of what each engineer changed (collected from their reports)
- The chosen model tier

Wait for the test result.

- If **PASS**, proceed to Step 4.
- If **FAIL**, go to Step 5 (failure loop).

## Step 4 — Review

Invoke `sunscore-reviewer` with:
- The architect's plan
- All engineer change reports
- The test results
- The chosen model tier

Wait for the verdict.

- If **PASS**, proceed to Step 6 (report to user).
- If **FAIL**, go to Step 5 (failure loop).

## Step 5 — Failure loop (max 3 attempts total)

Track an `attempt` counter starting at 1 for the first run. On any test or review failure:

1. Invoke `sunscore-architect` again in **failure-recovery mode**, passing:
   - Original plan
   - Engineer reports
   - Test or review failure details
   - Current attempt number
2. Architect produces a **revised fix plan** identifying root cause and which engineer(s) to re-invoke.
3. Re-invoke the named engineer(s) with the architect's fix brief.
4. Re-run `test-engineer`.
5. Re-run `sunscore-reviewer` if tests pass.
6. Increment `attempt`. If `attempt > 3` and still failing, **STOP** and escalate to the user with:
   - Attempt history
   - Last failure details
   - Architect's recommendation for next steps

## Step 6 — Report to user

When tests pass AND review passes:

1. Summarize what was done (files changed, key decisions).
2. List which agents ran and the chosen model tier.
3. Show the reviewer's PASS verdict.
4. **DO NOT commit automatically.** Ask the user if they want to commit, and if yes, follow the project's commit convention (`GIT_COMMIT_CONVENTION.md`).

## Hard rules for the orchestrator (you, the main session)

- **Always pass the chosen `model` tier** to every `Agent` tool call.
- **Never skip the architect** — even small changes go through planning when `/run_team` is invoked. (For trivial changes the user should use solo mode without `/run_team`.)
- **Never let an engineer touch a layer it doesn't own.** If the architect's plan asks an engineer to cross boundaries, push back to the architect for revision.
- **Run web-engineer and native-engineer in parallel** when both are needed, via a single message with two Agent tool calls.
- **Do not write code yourself** during `/run_team` flow. You only orchestrate.
- **Do not commit without explicit user approval.**
