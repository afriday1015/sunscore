# SunScore Git Commit Convention

이 문서는 SunScore 프로젝트의 공식 git commit 규칙이다.
모든 커밋은 이 규칙을 따른다.

---

## 형식

```
<type>(<scope>): <subject>

[body]

[footer]
```

- **type**: 변경의 성격
- **scope**: 변경이 영향을 미치는 패키지 또는 앱 (선택)
- **subject**: 변경 내용 요약 (명령형, 소문자, 마침표 없음)
- **body**: 변경 이유, 방식 설명 (선택, 72자 줄바꿈)
- **footer**: Breaking change 또는 이슈 참조 (선택)

---

## Type

| type | 사용 시점 |
|------|----------|
| `feat` | 새로운 기능 추가 |
| `fix` | 버그 수정 |
| `refactor` | 동작 변경 없는 코드 구조 개선 |
| `style` | 포맷팅, 세미콜론 등 로직 무관한 변경 |
| `perf` | 성능 개선 |
| `test` | 테스트 추가 또는 수정 |
| `docs` | 문서 추가 또는 수정 |
| `chore` | 빌드 설정, 도구, 의존성 관리 등 |
| `build` | 빌드 시스템 또는 외부 의존성 변경 |
| `ci` | CI/CD 설정 변경 |
| `revert` | 이전 커밋 되돌리기 |

---

## Scope

SunScore 모노레포 패키지 구조에 따라 scope를 지정한다.

| scope | 경로 | 설명 |
|-------|------|------|
| `domain` | `packages/domain` | 순수 TypeScript 도메인 로직 (SunScore 계산, 태양 위치 등) |
| `adapters` | `packages/adapters` | 플랫폼 어댑터 (GPS, DeviceOrientation 등) |
| `ui` | `packages/ui` | 공유 UI 컴포넌트 |
| `web` | `apps/web` | 웹 앱 |
| `native` | `apps/native` | React Native 모바일 앱 |
| `deps` | 루트 또는 패키지 | 의존성 추가/업데이트/제거 |
| `config` | 루트 또는 패키지 | TypeScript, 빌드, 환경 설정 변경 |
| `root` | 루트 | 모노레포 루트 레벨 변경 |

scope를 생략해도 되는 경우:
- 여러 패키지에 걸친 변경 (cross-cutting)
- 특정 패키지에 귀속되지 않는 변경

---

## Subject 작성 규칙

- 영어 또는 한국어 모두 허용
- 명령형으로 작성 (예: `add`, `fix`, `remove` / `추가`, `수정`, `제거`)
- 첫 글자 소문자 (영어의 경우)
- 끝에 마침표(`.`) 없음
- 50자 이내 권장

---

## Body 작성 규칙

- 생략 가능하지만, 이유가 명확하지 않은 변경은 반드시 작성
- 빈 줄로 subject와 구분
- **무엇을** 했는지보다 **왜** 했는지를 설명
- 72자 이내로 줄바꿈

---

## Footer 작성 규칙

- Breaking change: `BREAKING CHANGE: <설명>` 로 시작
- 이슈 참조: `Closes #123`, `Refs #456`

---

## 예시

### 기능 추가

```
feat(domain): add altitudeFactor step-based calculation

연속 곡선 대신 구간 기반 모델(0/0.4/0.7/1.0)로 변경.
단순성과 설명 가능성을 우선한다는 설계 원칙에 따른 결정.
```

```
feat(web): add DeviceOrientation API integration with mock fallback
```

```
feat(ui): add SunScore gauge bar component with amber fill
```

### 버그 수정

```
fix(domain): clamp sunScore to [0, 1] range

directionFactor와 altitudeFactor 곱이 음수가 되는 엣지 케이스 방어.
```

```
fix(adapters): handle GPS permission denied on iOS

권한 거부 시 앱이 멈추는 문제 수정. 에러를 무시하지 않고
heading 상태를 Off로 전환하도록 처리.
```

### 리팩터링

```
refactor(domain): extract sunPosition calculation to pure function
```

### 설정/빌드

```
chore(deps): upgrade suncalc to 1.9.0
```

```
chore(config): add tsconfig path aliases for packages
```

### 문서

```
docs: add GIT_COMMIT_CONVENTION
```

### 여러 패키지에 걸친 변경

```
refactor: move heading smoothing logic from web to adapters
```

---

## Breaking Change 예시

```
feat(domain): change SunScore return type from number to SunScoreResult

BREAKING CHANGE: getSunScore() 반환 타입이 number에서 SunScoreResult로 변경됨.
호출부에서 .value 속성으로 접근해야 함.
```

---

## 원칙

1. **한 커밋은 한 가지 변경**만 담는다.
2. **빌드가 깨지는 상태로 커밋하지 않는다.**
3. **디버그용 console.log, 임시 코드는 커밋하지 않는다.**
4. **커밋 메시지는 코드 리뷰어가 변경 이유를 이해할 수 있도록 작성한다.**
5. **scope는 변경이 실제로 영향을 미치는 패키지 기준으로 지정한다.**
