# Passkey Auth Backend

Backend API (Node.js + Express) for passkey verification.
Use it together with the mobile app for end-to-end validation.

## Prerequisites

- Node.js 20+
- npm

## Local configuration

Environment-specific values live in `config/local.json` (gitignored).
Copy `config/local.example.json` to get started.

```bash
cp ../config/local.example.json ../config/local.json
```

Key fields:
- `backend.rpId`
- `backend.origin`
- `backend.corsOrigins`
- `backend.appleTeamId`
- `backend.appleBundleId`
- `backend.androidPackageName`
- `backend.androidSha256CertFingerprints`

## Setup

```bash
cd passkey-auth-app/backend
npm install
```

## Run

```bash
npm run dev
```

## Tests

```bash
# Run from the repository root
node --test passkey-auth-app/backend/tests/models.test.js
```

## API endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Password login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/session` - Check session
- `GET /health` - Health check

### Passkey
- `POST /api/passkey/register/start`
- `POST /api/passkey/register/finish`
- `POST /api/passkey/login/start`
- `POST /api/passkey/login/finish`

## Data store

SQLite is used (`passkey-auth-app/backend/data/`).

## Additional docs

- Quickstart: `docs/quickstart.md`
- Test guide: `docs/passkey-test-guide.md`
