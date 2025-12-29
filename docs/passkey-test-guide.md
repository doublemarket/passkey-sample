# Passkey Feature Test Guide

This document describes how to test the passkey features implemented in Phase 3.

## Prerequisites

### Hardware requirements
- **iOS**: iOS device with Face ID or Touch ID (iOS 16.0+)
- **Android**: Android device with biometric authentication (Android 9.0+)

**Important**: Passkeys must be tested on physical devices. Simulators may have limited functionality.

### Software requirements
- Node.js 20+
- Xcode (for iOS)
- Android Studio (for Android)

## Setup steps

### 1. Start the backend server

```bash
# Move to backend directory
cd passkey-auth-app/backend

# Install dependencies (first time only)
npm install

# Start the dev server
npm run dev
```

When the server starts, you should see logs similar to:

```
✅ Database initialized successfully
🚀 HTTPS Server is running on https://localhost:3000
```

### 2. Start the mobile app

#### iOS

```bash
# Move to mobile app directory
cd PasskeyAuthApp

# Install dependencies (first time only)
npm install

# Install iOS Pods (first time only)
cd ios
bundle install
bundle exec pod install
cd ..

# Start the iOS app
npm run ios

# Or start on a specific device
npm run ios -- --device "Device Name"
```

#### Android

```bash
# Move to mobile app directory
cd PasskeyAuthApp

# Install dependencies (first time only)
npm install

# Start the Android app
npm run android:local
```

## Test scenarios

### Scenario 1: Password registration → Passkey login
In this scenario, you register with a password, then add a passkey, and log in with the passkey.

#### Steps:
1. Launch the app and tap **Register**
2. Enter:
   - Username: `testuser1`
   - Password: `password123`
   - Confirm Password: `password123`
3. Tap **Register**
4. When the completion alert appears, tap **OK**
5. Log in with the password on the login screen
6. On the home screen, tap **Register Passkey**
7. Complete biometric authentication (Face ID/Touch ID)
8. Confirm the passkey registration alert
9. Tap **Log Out** to return to the login screen
10. Tap **Log In with Passkey**
11. Complete biometric authentication
12. Confirm a successful login (authentication method shows **Passkey**)

#### Expected results:
- ✅ Passkey registration succeeds
- ✅ Passkey login works without entering a username
- ✅ The home screen shows **Passkey** as the authentication method

### Scenario 2: Register with passkey → Passkey login
In this scenario, you register and create a passkey at the same time.

#### Steps:
1. Launch the app and tap **Register**
2. Enter:
   - Username: `testuser2`
   - Password: `password456`
   - Confirm Password: `password456`
3. Turn **Register a passkey** ON
4. Tap **Register**
5. Complete biometric authentication (Face ID/Touch ID)
6. Confirm the completion alert ("Account and passkey created")
7. Tap **Log In with Passkey** on the login screen
8. Complete biometric authentication
9. Confirm a successful login

#### Expected results:
- ✅ Account and passkey are created together
- ✅ Passkey login works immediately
- ✅ Login works without entering a password

### Scenario 3: Switch between password login and passkey login
In this scenario, you log in with password and passkey for the same user.

#### Steps:
1. Log in with `testuser1` using the password (from Scenario 1)
2. Confirm the home screen shows **Password** as the authentication method
3. Log out
4. Tap **Log In with Passkey** and authenticate with biometrics
5. Confirm the home screen shows **Passkey** as the authentication method

#### Expected results:
- ✅ Both authentication methods work for the same user
- ✅ The authentication method is displayed correctly

### Scenario 4: Error handling

#### 4-1. Biometric authentication canceled
1. During passkey registration or login, tap **Cancel** on the biometric prompt
2. Confirm an appropriate error message is shown

#### 4-2. Passkey unsupported device
When testing on a simulator:
1. Launch the app in the simulator
2. Tap **Log In with Passkey**
3. Confirm the "Passkey Not Supported" alert appears

#### Expected results:
- ✅ Appropriate error messages are shown
- ✅ The app does not crash

## Debugging

### Check backend logs
The backend server logs should look similar to:

```
POST /api/passkey/register/start 200 32ms
POST /api/passkey/register/finish 200 485ms
POST /api/passkey/login/start 200 18ms
POST /api/passkey/login/finish 200 402ms
```

### Check mobile app logs
1. Open Xcode
2. Select the device
3. Check the console output

## Common issues and fixes

#### Issue 1: "Passkey Not Supported" error
**Cause**: Running on a simulator or biometric auth is not configured
**Fix**: Use a physical device and enable Face ID/Touch ID or biometrics

#### Issue 2: "Invalid challenge" error
**Cause**: The challenge expired (5 minutes)
**Fix**: Retry passkey registration/authentication from the beginning

#### Issue 3: Network error
**Cause**: Backend server is not running or cannot be reached
**Fix**:
1. Confirm the backend server is running
2. Verify `mobile.apiBaseUrl` in `config/local.json`
3. On a physical device, confirm it is on the same network as the host

#### Issue 4: "credential_id not found" error
**Cause**: Trying passkey login without a registered passkey
**Fix**: Register a passkey before logging in

## Verify API endpoints

### Passkey registration start

```bash
curl -k -X POST https://localhost:3000/api/passkey/register/start \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser1"}'
```

### Check session

```bash
curl -k https://localhost:3000/api/auth/session
```

## Performance tests

### Measure registration time
1. Measure the time from tapping **Register Passkey** to completion
2. Expected: within 3 seconds

### Measure login time
1. Measure the time from tapping **Log In with Passkey** to home screen display
2. Expected: within 2 seconds

## Security checklist

- [ ] Passwords are stored hashed
- [ ] Challenges are invalidated after one use
- [ ] Challenges expire after 5 minutes
- [ ] Only public keys are stored on the server
- [ ] Biometric authentication is required
- [ ] Sessions are properly managed

## Troubleshooting

### Reset the database
If issues occur, reset the database:

```bash
rm passkey-auth-app/backend/data/database.sqlite
```

This deletes all users and passkey data.

### Reset the app
Clear the mobile app cache:

```bash
# iOS
xcrun simctl erase all

# Android
adb shell pm clear com.example.passkeyauthapp
```

## Next steps
After completing Phase 3 tests, confirm:

1. ✅ All test scenarios succeeded
2. ✅ Error handling is appropriate
3. ✅ User experience is good
4. ✅ Security requirements are met

If issues are found, review logs and update code as needed.
