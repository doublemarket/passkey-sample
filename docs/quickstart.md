# Quickstart Guide

## Phase 1 Complete: Password Authentication
React Native mobile app and backend API implementation are complete.

## Confirm prerequisites
To run the mobile app, you need one of the following development environments:

### Option 1: Android development environment (recommended)
- **Android Studio**: [Download](https://developer.android.com/studio)
- Installing Android Studio enables the `adb` command
- Create an emulator in AVD Manager

### Option 2: iOS development environment (macOS only, more complex)
- **Xcode**: Install from the App Store
- Proper Ruby version management is required

### Option 3: Test on a physical device
If you have an iPhone or Android device:
1. Open `config/local.json`
2. Update `mobile.apiBaseUrl` to your computer's local IP address:

```json
"mobile": {
  "apiBaseUrl": "http://192.168.1.100:3000"
}
```

3. Connect your device via USB and run `npm run ios` or `npm run android:local`

## Startup steps

### 1. Start the backend server

```bash
# Terminal 1
cd passkey-auth-app/backend
npm install
npm run dev
```

The backend runs at `http://localhost:3000`.

### 2. Start the mobile app

⚠️ **Recommendation: Use the Android emulator**

iOS development requires CocoaPods, Xcode, and specific Ruby versions, which can be more complex.
We recommend validating on the Android emulator first.

#### ✅ Android emulator (recommended)

```bash
# Terminal 2
cd PasskeyAuthApp
npm install

# Port forwarding (required)
adb reverse tcp:3000 tcp:3000

# Start the app
npm run android:local
```

**Prerequisite**: Android Studio is installed and an emulator is created.

#### iOS simulator (advanced)

```bash
# Terminal 2
cd PasskeyAuthApp
npm install

# Install iOS Pods (first time only)
cd ios
# If CocoaPods is not installed:
# sudo gem install cocoapods
pod install
cd ..

# Start the app
npm run ios
```

**Note**: If you have issues installing CocoaPods, use one of the following:

**Option 1: Launch from Xcode**

```bash
# Start Metro bundler
npm start

# Open Xcode in another terminal
open ios/PasskeyAuthApp.xcworkspace

# Click ▶️ to run
```

**Option 2: Try Android instead (recommended)**
If the iOS setup fails, use the Android emulator.

## Test flow

### 1. Register a new user
1. Tap **Register** on the welcome screen
2. Enter the following:
   - Username: `testuser`
   - Password: `password123`
   - Confirm Password: `password123`
3. Tap **Register**
4. A completion dialog appears and you are redirected to the login screen

### 2. Log in
1. Enter the following on the login screen:
   - Username: `testuser`
   - Password: `password123`
2. Tap **Log In**
3. The home screen shows:
   - Authentication method: Password
   - Username: testuser
   - Authentication time
   - User ID

### 3. Log out
1. Tap **Log Out** on the home screen
2. Confirm **Log Out**
3. Return to the welcome screen

## Troubleshooting

### iOS Pods installation error

### Android cannot connect to the backend
```bash
# Confirm port forwarding
adb reverse tcp:3000 tcp:3000
```

### Metro bundler error

## Implemented features

✅ Welcome screen
✅ Registration screen (with validation)
✅ Login screen
✅ Home screen (post-authentication)
✅ Session management
✅ Error handling
✅ Loading indicator

## Planned in Phase 2

⏳ Passkey registration
⏳ Passkey login
⏳ Biometric authentication
⏳ Passkey management screen

## File structure

```
passkey-sample/
├── passkey-auth-app/          # Backend
│   └── backend/
│       ├── data/              # SQLite database
│       └── src/
└── PasskeyAuthApp/            # Mobile app
    ├── components/            # UI components
    ├── contexts/              # State management
    ├── navigation/            # Navigation
    ├── screens/               # Screens
    ├── services/              # API client
    └── types/                 # Type definitions
```

## Additional docs

- Mobile app: `PasskeyAuthApp/README.md`
- Backend: `passkey-auth-app/README.md`
- Specification: `passkey-mobile-app-specification.md`
