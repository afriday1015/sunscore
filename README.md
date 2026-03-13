# SunScore

A React Native + react-native-web application that shows the relative direct sunlight intensity in the direction the device is facing.

## Features

- Real-time sun position calculation based on location and time
- SunScore: measures how directly you're facing the sun
- Daily sun trajectory visualization on a radar compass
- Peak sunlight time calculation for your current heading
- Month and time controls for exploring different scenarios
- User-facing reference line on radar for directional clarity
- Direction interpretation sentence (Korean) showing facing direction and sun position
- Reverse geocoding location label with Korean address display

## Project Structure

```
sunscore/
  apps/
    native/     # React Native CLI app
    web/        # Vite + react-native-web app
  packages/
    domain/     # Pure TypeScript sun calculations (no React)
    adapters/   # Platform-specific APIs (location, heading)
    ui/         # Shared React Native components
```

## Tech Stack

- **Native**: React Native CLI (no Expo), TypeScript
- **Web**: react-native-web, Vite
- **Shared**: suncalc, react-native-svg

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
cd sunscore
npm install
```

### Running the Web App

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

### Running the Native App

```bash
# iOS
cd apps/native
npx pod-install
npx react-native run-ios

# Android
cd apps/native
npx react-native run-android
```

## Architecture

### Domain Package

Contains all sun-related calculations with zero React dependencies:

- Sun position (azimuth, altitude) using suncalc
- SunScore calculation (altitudeFactor x directionFactor)
- Peak time calculation
- Daily trajectory generation

### Adapters Package

Platform-specific implementations:

- Location adapter (browser geolocation / React Native)
- Heading adapter (DeviceOrientation / react-native-compass-heading)

### UI Package

Shared React Native components:

- Radar compass with sun trajectory and user-facing reference line
- Direction interpretation sentence component
- Location label with reverse geocoding support
- Time slider with quick buttons
- Month slider
- SunScore bar

### Direction Interpretation

Provides a one-line Korean sentence describing:
- Which absolute direction the user is facing (8 directions)
- Where the sun is relative to the user (8 positions)

Uses `directionLabels` utility for deterministic 8-segment mapping.

### Location Label

Displays the user's current location as a Korean address below the interpretation sentence:
- Success: "{시/도} {시/군/구} {동/읍/면}" (e.g., "서울특별시 중구 명동")
- Geocoding failure: "현재 위치 기준"
- No location: "위치 확인 불가"

## SunScore Formula

```
SunScore = altitudeFactor x directionFactor
```

**directionFactor**: How directly you're facing the sun (0-1)
- Based on cosine of angle between device heading and sun bearing

**altitudeFactor**: Step function based on sun altitude
- altitude <= 0: 0 (sun below horizon)
- altitude < 10: 0.4
- altitude < 30: 0.7
- altitude >= 30: 1.0

## License

MIT

---

# SunScore (한국어)

기기가 향하고 있는 방향의 상대적인 직사광선 강도를 보여주는 React Native + react-native-web 애플리케이션입니다.

## 기능

- 위치와 시간 기반 실시간 태양 위치 계산
- SunScore: 태양을 얼마나 직접 바라보고 있는지 측정
- 레이더 나침반에 일일 태양 궤적 시각화
- 현재 향하고 있는 방향의 피크 일조 시간 계산
- 다양한 시나리오 탐색을 위한 월/시간 컨트롤
- 레이더 사용자 방향 참조선 (빨간색 가이드라인)
- 방향 해설 문구: 사용자가 바라보는 방향과 태양 상대 위치를 한국어로 표시
- 역지오코딩 기반 위치 라벨: 현재 위치를 한국어 주소로 표시

## 프로젝트 구조

```
sunscore/
  apps/
    native/     # React Native CLI 앱
    web/        # Vite + react-native-web 앱
  packages/
    domain/     # 순수 TypeScript 태양 계산 (React 미포함)
    adapters/   # 플랫폼별 API (위치, 방향)
    ui/         # 공유 React Native 컴포넌트
```

## 기술 스택

- **Native**: React Native CLI (Expo 미사용), TypeScript
- **Web**: react-native-web, Vite
- **공유**: suncalc, react-native-svg

## 시작하기

### 사전 요구사항

- Node.js 18+
- npm 9+

### 설치

```bash
cd sunscore
npm install
```

### 웹 앱 실행

```bash
npm run dev
```

브라우저에서 http://localhost:5173 을 열어주세요.

### 네이티브 앱 실행

```bash
# iOS
cd apps/native
npx pod-install
npx react-native run-ios

# Android
cd apps/native
npx react-native run-android
```

## 아키텍처

### Domain 패키지

React 의존성 없이 모든 태양 관련 계산을 포함합니다:

- suncalc를 사용한 태양 위치 (방위각, 고도)
- SunScore 계산 (altitudeFactor x directionFactor)
- 피크 시간 계산
- 일일 궤적 생성

### Adapters 패키지

플랫폼별 구현:

- 위치 어댑터 (브라우저 geolocation / React Native)
- 방향 어댑터 (DeviceOrientation / react-native-compass-heading)

### UI 패키지

공유 React Native 컴포넌트:

- 태양 궤적과 사용자 방향 참조선이 포함된 레이더 나침반
- 방향 해설 문구 컴포넌트
- 역지오코딩 위치 라벨 컴포넌트
- 빠른 버튼이 있는 시간 슬라이더
- 월 슬라이더
- SunScore 바

### 방향 해설

사용자에게 한 줄의 한국어 문장으로 다음을 알려줍니다:
- 현재 바라보고 있는 절대 방향 (8방위: 북쪽, 북동쪽, 동쪽 등)
- 태양의 상대적 위치 (8위치: 정면, 오른쪽 앞, 오른쪽 등)

`directionLabels` 유틸리티를 사용한 결정적 8분할 매핑.

### 위치 라벨

해설 문구 아래에 현재 위치를 한국어 주소로 표시합니다:
- 성공: "{시/도} {시/군/구} {동/읍/면}" (예: "서울특별시 중구 명동")
- 지오코딩 실패: "현재 위치 기준"
- 위치 없음: "위치 확인 불가"

## SunScore 공식

```
SunScore = altitudeFactor x directionFactor
```

**directionFactor**: 태양을 얼마나 직접 바라보고 있는지 (0-1)
- 기기 방향과 태양 방위각 사이 각도의 코사인 기반

**altitudeFactor**: 태양 고도에 따른 단계 함수
- altitude <= 0: 0 (태양이 수평선 아래)
- altitude < 10: 0.4
- altitude < 30: 0.7
- altitude >= 30: 1.0

## 라이선스

MIT
