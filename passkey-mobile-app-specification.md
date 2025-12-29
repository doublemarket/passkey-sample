# Mobile Application Specification for Passkey Login Verification

## 1. Project Overview

### 1.1 Purpose
A minimal mobile application to verify the behavior of WebAuthn/FIDO2-compliant passkeys.

### 1.2 Target platforms
- iOS (recommended: iOS 16.0+)
- Android (recommended: Android 9.0 / API Level 28+)

### 1.3 Technology stack

#### Frontend
- **Framework**: React Native (cross-platform)
- **Language**: TypeScript
- **State management**: React Hooks (useState, useEffect)
- **Navigation**: React Navigation

#### Backend
- **Framework**: Node.js + Express
- **Language**: TypeScript
- **Authentication library**: @simplewebauthn/server (WebAuthn implementation)
- **Database**: SQLite (local development, simple implementation)
- **Session management**: express-session

#### Passkey-related libraries
- **iOS/Android**: @simplewebauthn/browser (React Native wrapper)
- **Alternative**: react-native-passkey (native module)

**Note**: A backend is required for passkey implementation. The WebAuthn/FIDO2 protocol requires server-side handling such as challenge generation/verification, public key storage, and credential management.

---

## 2. Functional requirements

English and Japanese are supported in the app.

### 2.1 Screen structure

#### 2.1.1 Welcome screen
- **Purpose**: Initial screen on app launch
- **Elements**:
  - App title
  - Language selector
    - Users can choose English or Japanese as a display language. The default selection is based on the device language configuration.
  - **Log In** button
  - **Register** button

#### 2.1.2 Registration screen
- **Purpose**: Register a new user
- **Elements**:
  - Username input field
  - Password input field
  - **Register** button
  - **Register a passkey** checkbox (optional)
  - **Back to login** link

#### 2.1.3 Login screen
- **Purpose**: Authenticate an existing user
- **Elements**:
  - Username input field
  - Password input field
  - **Log In** button
  - **Log In with Passkey** button
  - **Go to Register** link

#### 2.1.4 Passkey management screen
- **Purpose**: Add a passkey
- **Elements**:
  - Current username display
  - **Register Passkey** button
  - **Log Out** button

#### 2.1.5 Login success screen
- **Purpose**: Confirm successful authentication
- **Elements**:
  - **Login Successful** message
  - Authentication method display (**Password** or **Passkey**)
  - Username display
  - Authentication timestamp display
  - **Passkey Management** button (only if no passkey is registered)
  - **Log Out** button

---

## 3. Detailed functional specification

### 3.1 User registration

#### 3.1.1 Password registration flow
```
1. User enters username and password on the registration screen
2. Tap the Register button
3. Send registration request to the backend
   POST /api/auth/register
   Body: { username: string, password: string }
4. Backend processes:
   - Check for duplicate username
   - Hash password (bcrypt)
   - Save to database
5. On success: navigate to login screen and show a toast "Registration complete"
6. On failure: show an error message
```

#### 3.1.2 Registration with passkey flow
```
1. User turns ON the "Register a passkey" checkbox
2. After password registration completes, proceed to the passkey registration flow
3. Passkey registration (see 3.2)
4. On success: navigate to login success screen
```

### 3.2 Passkey registration

#### 3.2.1 Registration flow
```
1. User taps the "Register Passkey" button
2. Send registration start request to the backend
   POST /api/passkey/register/start
   Body: { username: string }
3. Backend generates a WebAuthn registration challenge and returns it
   Response: {
     challenge: string (Base64),
     rp: { id: string, name: string },
     user: { id: string, name: string, displayName: string },
     pubKeyCredParams: [...],
     timeout: number,
     attestation: "none"
   }
4. Frontend invokes the platform authenticator
   - iOS: Face ID / Touch ID
   - Android: Biometric API
5. User completes biometric authentication
6. Authenticator returns the public key credential
7. Send registration finish request to the backend
   POST /api/passkey/register/finish
   Body: { username: string, credential: PublicKeyCredential }
8. Backend verifies and stores:
   - Challenge verification
   - Public key storage
   - Credential ID storage
9. On success: show a "Passkey registration complete" message
10. On failure: show an error message
```

### 3.3 Login

#### 3.3.1 Password login flow
```
1. User enters username and password on the login screen
2. Tap the Log In button
3. Send authentication request to the backend
   POST /api/auth/login
   Body: { username: string, password: string }
4. Backend verifies:
   - User exists
   - Password hash matches
5. On success:
   - Issue session token
   - Navigate to login success screen
   - Show authentication method: "Password"
6. On failure: show an error message
```

#### 3.3.2 Passkey login flow
```
1. User taps the "Log In with Passkey" button
2. Send authentication start request to the backend
   POST /api/passkey/login/start
   Body: {} (usernameless authentication)
3. Backend generates a WebAuthn authentication challenge
   Response: {
     challenge: string (Base64),
     rpId: string,
     allowCredentials: [], // empty for usernameless
     timeout: number,
     userVerification: "required"
   }
4. Frontend invokes the platform authenticator
5. User completes biometric authentication
6. Authenticator returns the signed credential
7. Send authentication finish request to the backend
   POST /api/passkey/login/finish
   Body: { credential: PublicKeyCredential }
8. Backend verifies:
   - Challenge verification
   - Signature verification
   - User identification
9. On success:
   - Issue session token
   - Navigate to login success screen
   - Show authentication method: "Passkey"
10. On failure: show an error message
```

### 3.4 Logout
```
1. User taps the Log Out button
2. Send logout request to the backend
   POST /api/auth/logout
3. Destroy session
4. Navigate to the welcome screen
```

---

## 4. Backend API specification

### 4.1 Endpoint list

#### 4.1.1 Authentication
| Endpoint | Method | Description |
|----------|--------|-------------|
| /api/auth/register | POST | Register user |
| /api/auth/login | POST | Password login |
| /api/auth/logout | POST | Logout |
| /api/auth/session | GET | Check session |

#### 4.1.2 Passkey
| Endpoint | Method | Description |
|----------|--------|-------------|
| /api/passkey/register/start | POST | Start passkey registration |
| /api/passkey/register/finish | POST | Finish passkey registration |
| /api/passkey/login/start | POST | Start passkey login |
| /api/passkey/login/finish | POST | Finish passkey login |

### 4.2 Data model

#### 4.2.1 Users table
```sql
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### 4.2.2 Passkeys table
```sql
CREATE TABLE passkeys (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    credential_id TEXT UNIQUE NOT NULL,
    public_key TEXT NOT NULL,
    counter INTEGER DEFAULT 0,
    transports TEXT, -- JSON array
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### 4.2.3 Challenges table (temporary challenge storage)
```sql
CREATE TABLE challenges (
    id TEXT PRIMARY KEY,
    challenge TEXT NOT NULL,
    user_id TEXT,
    type TEXT NOT NULL, -- 'registration' or 'authentication'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL
);
```

---

## 5. Non-functional requirements

### 5.1 Security
- Passwords are hashed with bcrypt (salt rounds: 10)
- HTTPS is required (self-signed certificates allowed for development)
- Session timeout: 24 hours
- Challenge expiration: 5 minutes
- WebAuthn RP ID must match the backend domain

### 5.2 Error handling
- Appropriate messages for network errors
- Handle biometric authentication cancellation
- Timeout handling
- Clear validation error messaging

### 5.3 Usability
- Loading indicator display
- Toast feedback messages
- Real-time input validation
- Platform-specific UI/UX optimization

---

## 6. Development environment setup requirements

### 6.1 Frontend
```bash
# Required packages
- react-native (latest)
- @react-navigation/native
- @react-navigation/stack
- @simplewebauthn/browser
- axios (HTTP client)
- react-native-keychain (optional: session token storage)
```

### 6.2 Backend
```bash
# Required packages
- express
- @simplewebauthn/server
- bcrypt
- express-session
- better-sqlite3
- cors
- uuid
```

### 6.3 Development tools
- Node.js 18+
- React Native CLI
- Xcode (iOS)
- Android Studio (Android)
- Physical device or simulator (physical devices recommended for passkey testing)

---

## 7. Test scenarios

### 7.1 Basic flows
1. **Register → Password login**
   - Register with username and password
   - Log out
   - Log in with the same credentials

2. **Register → Add passkey → Passkey login**
   - Register with username and password
   - Register a passkey
   - Log out
   - Log in with passkey

3. **Register with passkey → Passkey login**
   - Register with "Register a passkey" ON
   - Log out
   - Log in with passkey

### 7.2 Error cases
1. Register with a duplicate username
2. Login with an incorrect password
3. Cancel biometric authentication
4. Network error behavior

---

## 8. Implementation priority

### Phase 1: Basic authentication
1. Backend foundation (Express + SQLite)
2. User registration API
3. Password login API
4. Frontend screens (welcome, register, login, success)

### Phase 2: Passkey features
1. Passkey registration API (start/finish)
2. Passkey login API (start/finish)
3. Frontend passkey integration
4. Passkey management screen

### Phase 3: Optimization
1. Improved error handling
2. UI/UX improvements
3. Platform-specific adjustments

---

## 9. References

### 9.1 WebAuthn specifications
- W3C WebAuthn Level 2: https://www.w3.org/TR/webauthn-2/
- FIDO2 CTAP: https://fidoalliance.org/specs/

### 9.2 Platform documentation
- iOS Passkeys: https://developer.apple.com/documentation/authenticationservices/public-private_key_authentication/supporting_passkeys
- Android Credential Manager: https://developer.android.com/training/sign-in/passkeys

### 9.3 Library documentation
- SimpleWebAuthn: https://simplewebauthn.dev/

---

## 10. Notes

- This specification assumes implementation with Claude Code
- If library compatibility issues arise, evaluate alternatives
- Production requires correct domain and HTTPS configuration
- Physical devices are strongly recommended for passkey validation (simulators may be limited)
