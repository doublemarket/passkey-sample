# PasskeyAuthApp (Mobile)

A React Native mobile app for passkey verification.
It works with the backend to validate password login and passkey registration/login flows.

## Prerequisites

- Node.js 20+
- npm
- iOS: Xcode / CocoaPods
- Android: Android Studio / JDK

## Local configuration

Environment-specific values live in `config/local.json` (gitignored).
Copy `config/local.example.json` to get started.

```bash
cp ../config/local.example.json ../config/local.json
```

Key fields:
- `mobile.apiBaseUrl`
- `backend.androidPackageName`
- `backend.iosBundleId`
- `backend.appleTeamId`

## Setup

```bash
cd PasskeyAuthApp
npm install
```

iOS:
```bash
cd ios
bundle install
bundle exec pod install
cd ..
```

## Run

### iOS

```bash
npm run ios
```

### Android

```bash
npm run android:local
```

For Android emulators connecting to localhost:
```bash
adb reverse tcp:3000 tcp:3000
```

## Tests

```bash
# Move to the mobile app directory
cd PasskeyAuthApp

# Run tests
npm test -- --runTestsByPath __tests__/services/api.test.ts
```

To run all tests:

```bash
cd PasskeyAuthApp
npm test
```

## Development notes

- `npm run ios` builds after generating `ios/Config/Local.xcconfig` from `config/local.json`.
- `npm run android:local` uses `backend.androidPackageName` from `config/local.json`.

## Additional docs

- iOS/Android setup details: `docs/ios-setup.md`
- Passkey setup for simulators: `docs/simulator-passkey-setup.md`
- Test guide: `docs/passkey-test-guide.md`
