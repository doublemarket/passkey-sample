# PasskeyAuthApp (Mobile)

React Nativeで実装したPasskey検証用モバイルアプリです。
バックエンドと連携して、パスワードログインとPasskey登録/ログインの動作確認を行います。

## 前提条件

- Node.js 20+
- npm
- iOS: Xcode / CocoaPods
- Android: Android Studio / JDK

## ローカル設定

環境固有の値は `config/local.json` に集約します（git管理対象外）。
初回は `config/local.example.json` をコピーして作成してください。

```bash
cp ../config/local.example.json ../config/local.json
```

主に使用される項目:
- `mobile.apiBaseUrl`
- `backend.androidPackageName`
- `backend.iosBundleId`
- `backend.appleTeamId`

## セットアップ

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

## 起動

### iOS

```bash
npm run ios
```

### Android

```bash
npm run android:local
```

Androidエミュレータで localhost に接続する場合:
```bash
adb reverse tcp:3000 tcp:3000
```

## テスト

```bash
# モバイルアプリディレクトリに移動
cd PasskeyAuthApp

# テスト実行
npm test -- --runTestsByPath __tests__/services/api.test.ts
```

全テストを実行する場合は以下を使用します:

```bash
cd PasskeyAuthApp
npm test
```

## 開発メモ

- `npm run ios` は `config/local.json` から `ios/Config/Local.xcconfig` を生成してからビルドします。
- `npm run android:local` は `config/local.json` の `backend.androidPackageName` を使って起動します。

## 詳細ドキュメント

- iOS/Android のセットアップ詳細: `docs/ios-setup.md`
- シミュレータのPasskey設定: `docs/simulator-passkey-setup.md`
- テスト手順: `docs/passkey-test-guide.md`
