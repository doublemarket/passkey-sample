# Passkey Sample Mobile app

This includes a passkey-enabled mobile app (React Native) and a backend API (Node.js/Express). You can see how Passkey works by running this on your devices.
Environment-specific configuration lives in `config/local.json` and should not be committed to public repositories.

## Repository layout

- `PasskeyAuthApp/`: Mobile app
- `passkey-auth-app/backend/`: Backend API
- `config/local.json`: Environment-specific config (gitignored)
- `passkey-mobile-app-specification.md`: Specification
- `docs/`: Setup and test guides

## Quickstart

1) Create local config
```bash
cp config/local.example.json config/local.json
```

2) Start the backend
```bash
cd passkey-auth-app/backend
npm install
npm run dev
```

3) Start the mobile app
```bash
cd PasskeyAuthApp
npm install
npm run ios    # iOS
npm run android:local   # Android
```

## Documentation

- Mobile app: `PasskeyAuthApp/README.md`
- Backend: `passkey-auth-app/README.md`
- Specification: `passkey-mobile-app-specification.md`
- Quickstart: `docs/quickstart.md`
