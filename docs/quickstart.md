# クイックスタートガイド

## Phase 1完了: パスワード認証機能

React NativeモバイルアプリケーションとバックエンドAPIの実装が完了しました。

## 前提条件の確認

モバイルアプリを実行するには、以下のいずれかの開発環境が必要です:

### オプション1: Android開発環境（推奨）
- **Android Studio**: [ダウンロード](https://developer.android.com/studio)
- Android Studioをインストールすると`adb`コマンドが使用可能になります
- AVD Manager でエミュレータを作成してください

### オプション2: iOS開発環境（macOSのみ、複雑）
- **Xcode**: App Storeからインストール
- **CocoaPods**: `sudo gem install cocoapods`
- 適切なRubyバージョン管理が必要

### オプション3: 実機でテスト
実機（iPhoneまたはAndroid）がある場合:
1. `config/local.json`を開く
2. `mobile.apiBaseUrl`をコンピューターのローカルIPアドレスに変更:
   ```json
   {
     "mobile": {
       "apiBaseUrl": "http://192.168.1.XXX:3000"
     }
   }
   ```
3. 実機をUSB接続して`npm run ios`または`npm run android:local`

---

## 起動手順

### 1. バックエンドサーバーの起動

```bash
# ターミナル1
cd passkey-auth-app/backend
npm run dev
```

バックエンドが `http://localhost:3000` で起動します。

### 2. モバイルアプリの起動

⚠️ **推奨: Androidエミュレータを使用してください**

iOS開発にはCocoaPods、Xcode、適切なRubyバージョンなど複雑な環境設定が必要です。
まずはAndroidエミュレータで動作確認することを強くお勧めします。

#### ✅ Android エミュレータの場合（推奨）

```bash
# ターミナル2
cd PasskeyAuthApp

# ポートフォワーディング（必須）
adb reverse tcp:3000 tcp:3000

# アプリの起動
npm run android:local
```

**前提条件**: Android Studioがインストールされ、エミュレータが作成されていること

---

#### iOS シミュレータの場合（上級者向け）

```bash
# ターミナル2
cd PasskeyAuthApp

# iOS Podsのインストール（初回のみ）
# CocoaPodsがインストールされていない場合:
sudo gem install cocoapods

# Podsのインストール
cd ios
pod install
cd ..

# アプリの起動
npm run ios
```

**注意**: CocoaPodsのインストールに問題がある場合、以下の方法でアプリを起動できます:

**方法1: Xcodeから直接起動**
```bash
cd PasskeyAuthApp
# Metro bundlerを起動
npm start
# 別のターミナルでXcodeを開く
open ios/PasskeyAuthApp.xcworkspace
# Xcodeで ▶️ ボタンをクリックして起動
```

**方法2: Androidで試す（推奨）**
上記のiOSセットアップでエラーが発生する場合は、Androidエミュレータを使用してください。

## テストフロー

### 1. 新規ユーザー登録

1. アプリが起動したら「新規登録」をタップ
2. 以下を入力:
   - ユーザー名: `testuser`
   - パスワード: `password123`
   - パスワード（確認）: `password123`
3. 「登録」ボタンをタップ
4. 登録完了ダイアログが表示され、ログイン画面に遷移

### 2. ログイン

1. ログイン画面で以下を入力:
   - ユーザー名: `testuser`
   - パスワード: `password123`
2. 「ログイン」ボタンをタップ
3. ホーム画面に遷移し、以下が表示されます:
   - 認証方法: パスワード認証
   - ユーザー名: testuser
   - 認証日時
   - ユーザーID

### 3. ログアウト

1. ホーム画面で「ログアウト」ボタンをタップ
2. 確認ダイアログで「ログアウト」を選択
3. ウェルカム画面に戻る

## トラブルシューティング

### iOS Pods インストールエラー

```bash
cd PasskeyAuthApp/ios
pod repo update
pod install --repo-update
cd ..
```

### Androidでバックエンドに接続できない

```bash
# ポートフォワーディングを確認
adb reverse tcp:3000 tcp:3000
```

### Metro bundlerエラー

```bash
cd PasskeyAuthApp
npm start -- --reset-cache
```

## 実装済み機能

✅ ウェルカム画面
✅ 新規登録画面（バリデーション付き）
✅ ログイン画面
✅ ホーム画面（認証後）
✅ セッション管理
✅ エラーハンドリング
✅ ローディングインジケーター

## Phase 2で実装予定

⏳ Passkey登録機能
⏳ Passkeyログイン機能
⏳ 生体認証統合
⏳ Passkey管理画面

## ファイル構成

```
passkey-sample/
├── passkey-auth-app/          # バックエンド
│   └── backend/
│       ├── src/
│       ├── data/              # SQLiteデータベース
│       └── package.json
└── PasskeyAuthApp/            # モバイルアプリ
    ├── src/
    │   ├── components/        # UIコンポーネント
    │   ├── contexts/          # 状態管理
    │   ├── navigation/        # ナビゲーション
    │   ├── screens/           # 画面
    │   ├── services/          # APIクライアント
    │   └── types/             # 型定義
    ├── android/
    ├── ios/
    └── App.tsx
```

## 詳細ドキュメント

- モバイルアプリ: `PasskeyAuthApp/README.md`
- バックエンド: `passkey-auth-app/README.md`
- 仕様書: `passkey-mobile-app-specification.md`
