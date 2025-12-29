# Passkey機能テストガイド

このドキュメントでは、Phase 3で実装したPasskey機能のテスト方法を説明します。

## 前提条件

### ハードウェア要件
- **iOS**: Face ID または Touch ID 搭載のiOSデバイス（iOS 16.0以降）
- **Android**: 生体認証機能を持つAndroidデバイス（Android 9.0以降）

**重要**: Passkeyは実機での動作が必須です。シミュレータでは一部機能が制限される可能性があります。

### ソフトウェア要件
- Node.js 20以上
- Xcode（iOS開発用）
- Android Studio（Android開発用）

## セットアップ手順

### 1. バックエンドサーバーの起動

```bash
# バックエンドディレクトリに移動
cd passkey-auth-app/backend

# 依存パッケージのインストール（初回のみ）
npm install

# 開発サーバーを起動
npm run dev
```

サーバーが起動すると以下のように表示されます:
```
🚀 Server is running on http://localhost:3000
📝 Environment: development
✅ Database initialized successfully
```

### 2. モバイルアプリの起動

#### iOS の場合

```bash
# モバイルアプリディレクトリに移動
cd PasskeyAuthApp

# 依存パッケージのインストール（初回のみ）
npm install

# iOS Podsのインストール（初回のみ）
cd ios && pod install && cd ..

# iOSアプリを起動
npm run ios
# または特定のデバイスで起動
npm run ios -- --device "デバイス名"
```

#### Android の場合

```bash
# モバイルアプリディレクトリに移動
cd PasskeyAuthApp

# 依存パッケージのインストール（初回のみ）
npm install

# Androidアプリを起動
npm run android
```

## テストシナリオ

### シナリオ1: パスワード登録 → Passkeyログイン

このシナリオでは、通常のパスワード登録後にPasskeyを追加登録し、Passkeyでログインします。

#### 手順:
1. アプリを起動し、「新規登録」をタップ
2. 以下の情報を入力:
   - ユーザー名: `testuser1`
   - パスワード: `password123`
   - パスワード（確認）: `password123`
3. 「登録」ボタンをタップ
4. 登録完了のアラートが表示されたら「OK」をタップ
5. ログイン画面でパスワード認証してログイン
6. ホーム画面で「Passkeyを追加登録」ボタンをタップ
7. Face ID/Touch IDで生体認証を実行
8. Passkey登録完了のアラートを確認
9. 「ログアウト」してログイン画面に戻る
10. 「Passkeyでログイン」ボタンをタップ
11. Face ID/Touch IDで生体認証を実行
12. ログイン成功を確認（認証方法が「Passkey認証」と表示される）

#### 期待される結果:
- ✅ Passkey登録が成功する
- ✅ Passkeyでユーザー名入力なしでログインできる
- ✅ ホーム画面で「Passkey認証」と表示される

---

### シナリオ2: Passkey同時登録 → Passkeyログイン

このシナリオでは、新規登録時にPasskeyも同時に登録します。

#### 手順:
1. アプリを起動し、「新規登録」をタップ
2. 以下の情報を入力:
   - ユーザー名: `testuser2`
   - パスワード: `password456`
   - パスワード（確認）: `password456`
3. 「Passkeyを登録」スイッチをONにする
4. 「登録」ボタンをタップ
5. Face ID/Touch IDで生体認証を実行
6. 登録完了のアラートを確認（「アカウントとPasskeyが作成されました」）
7. ログイン画面で「Passkeyでログイン」をタップ
8. Face ID/Touch IDで生体認証を実行
9. ログイン成功を確認

#### 期待される結果:
- ✅ アカウントとPasskeyが同時に作成される
- ✅ 初回からPasskeyでログインできる
- ✅ パスワード入力なしでログインできる

---

### シナリオ3: パスワードログイン → Passkeyログインの切り替え

このシナリオでは、同じユーザーでパスワードログインとPasskeyログインの両方を試します。

#### 手順:
1. シナリオ1で作成した `testuser1` でパスワードログイン
2. ホーム画面で認証方法が「パスワード認証」であることを確認
3. ログアウト
4. 「Passkeyでログイン」をタップして生体認証でログイン
5. ホーム画面で認証方法が「Passkey認証」であることを確認

#### 期待される結果:
- ✅ 同じユーザーで両方の認証方法が使用できる
- ✅ 認証方法が正しく表示される

---

### シナリオ4: エラーハンドリング

このシナリオでは、エラーケースを確認します。

#### 4-1. 生体認証のキャンセル
1. Passkey登録または認証時に生体認証プロンプトで「キャンセル」をタップ
2. 適切なエラーメッセージが表示されることを確認

#### 4-2. Passkey非対応デバイス
シミュレータでテストする場合:
1. シミュレータでアプリを起動
2. 「Passkeyでログイン」をタップ
3. 「Passkey未対応」のアラートが表示されることを確認

#### 期待される結果:
- ✅ 適切なエラーメッセージが表示される
- ✅ アプリがクラッシュしない

---

## デバッグ方法

### バックエンドログの確認

バックエンドサーバーのコンソールに以下のようなログが出力されます:

```
Passkey registration options: { ... }
Passkey registration credential: { ... }
Passkey registration result: { verified: true }
```

### モバイルアプリのログ確認

#### iOS
1. Xcodeを開く
2. Window → Devices and Simulators
3. デバイスを選択し、コンソールを確認

#### Android
```bash
adb logcat | grep ReactNativeJS
```

### よくある問題と解決方法

#### 問題1: "Passkey未対応" エラー
**原因**: シミュレータで実行している、または生体認証が設定されていない
**解決**: 実機を使用し、Face ID/Touch IDまたは生体認証を設定する

#### 問題2: "無効なチャレンジです" エラー
**原因**: チャレンジの有効期限切れ（5分）
**解決**: Passkey登録/認証を最初からやり直す

#### 問題3: ネットワークエラー
**原因**: バックエンドサーバーが起動していない、または接続できない
**解決**: 
1. バックエンドサーバーが起動していることを確認
2. `config/local.json` の `mobile.apiBaseUrl` が正しいか確認
3. 実機の場合、PCと同じネットワークに接続されているか確認

#### 問題4: "credential_id が見つかりません" エラー
**原因**: Passkeyが登録されていないユーザーでPasskeyログインを試行している
**解決**: 先にPasskeyを登録してからログインする

---

## API エンドポイントの確認

### Passkey登録開始
```bash
curl -X POST http://localhost:3000/api/passkey/register/start \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser1"}'
```

### セッション確認
```bash
curl http://localhost:3000/api/auth/session \
  -H "Cookie: connect.sid=YOUR_SESSION_ID"
```

---

## パフォーマンステスト

### 登録時間の測定
1. Passkey登録ボタンをタップしてから完了までの時間を測定
2. 期待値: 3秒以内

### ログイン時間の測定
1. Passkeyログインボタンをタップしてからホーム画面表示までの時間を測定
2. 期待値: 2秒以内

---

## セキュリティチェックリスト

- [ ] パスワードがハッシュ化されて保存されている
- [ ] チャレンジが一度使用されたら無効になる
- [ ] チャレンジが5分で期限切れになる
- [ ] 公開鍵のみがサーバーに保存される
- [ ] 生体認証が必須になっている
- [ ] セッションが適切に管理されている

---

## トラブルシューティング

### データベースのリセット

問題が発生した場合、データベースをリセットできます:

```bash
cd passkey-auth-app/backend
rm -rf data/database.sqlite*
npm run dev
```

これにより、すべてのユーザーとPasskeyデータが削除されます。

### アプリのリセット

モバイルアプリのキャッシュをクリア:

#### iOS
```bash
cd PasskeyAuthApp/ios
rm -rf build
cd ..
npm run ios
```

#### Android
```bash
cd PasskeyAuthApp/android
./gradlew clean
cd ..
npm run android
```

---

## 次のステップ

Phase 3のテストが完了したら、以下を確認してください:

1. ✅ すべてのテストシナリオが成功
2. ✅ エラーハンドリングが適切
3. ✅ ユーザーエクスペリエンスが良好
4. ✅ セキュリティ要件を満たしている

問題が見つかった場合は、ログを確認し、必要に応じてコードを修正してください。
