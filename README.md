# Passkey Sample

Passkey対応のモバイルアプリ（React Native）とバックエンド（Node.js/Express）を含むサンプルです。
環境固有の設定は `config/local.json` に集約し、公開リポジトリに含めない運用を前提にしています。

## リポジトリ構成

- `PasskeyAuthApp/` : モバイルアプリ
- `passkey-auth-app/backend/` : バックエンドAPI
- `config/local.json` : 環境固有設定（git管理対象外）
- `passkey-mobile-app-specification.md` : 仕様（変更しない）
- `docs/` : セットアップ/テスト手順

## クイックスタート

1) ローカル設定を作成
```bash
cp config/local.example.json config/local.json
```

2) バックエンド起動
```bash
cd passkey-auth-app/backend
npm install
npm run dev
```

3) モバイルアプリ起動
```bash
cd PasskeyAuthApp
npm install
npm run ios    # iOS
npm run android:local   # Android
```

## ドキュメント

- モバイルアプリ: `PasskeyAuthApp/README.md`
- バックエンド: `passkey-auth-app/README.md`
- 仕様: `passkey-mobile-app-specification.md`
- クイックスタート: `docs/quickstart.md`
