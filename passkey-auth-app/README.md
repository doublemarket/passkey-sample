# Passkey Auth Backend

Passkey検証用のバックエンドAPI（Node.js + Express）です。
モバイルアプリと組み合わせて動作確認します。

## 前提条件

- Node.js 20+
- npm

## ローカル設定

環境固有の値は `config/local.json` に集約します（git管理対象外）。
初回は `config/local.example.json` をコピーして作成してください。

```bash
cp ../config/local.example.json ../config/local.json
```

主に使用される項目:
- `backend.rpId`
- `backend.origin`
- `backend.corsOrigins`
- `backend.appleTeamId`
- `backend.appleBundleId`
- `backend.androidPackageName`
- `backend.androidSha256CertFingerprints`

## セットアップ

```bash
cd passkey-auth-app/backend
npm install
```

## 起動

```bash
npm run dev
```

## テスト

```bash
# リポジトリルートから実行
node --test passkey-auth-app/backend/tests/models.test.js
```

## API エンドポイント

### 認証関連
- `POST /api/auth/register` - ユーザー登録
- `POST /api/auth/login` - パスワードログイン
- `POST /api/auth/logout` - ログアウト
- `GET /api/auth/session` - セッション確認
- `GET /health` - ヘルスチェック

### Passkey関連
- `POST /api/passkey/register/start`
- `POST /api/passkey/register/finish`
- `POST /api/passkey/login/start`
- `POST /api/passkey/login/finish`

## データストア

SQLiteを使用します（`passkey-auth-app/backend/data/`）。

## 詳細ドキュメント

- クイックスタート: `docs/quickstart.md`
- テスト手順: `docs/passkey-test-guide.md`
