# Passkeyログイン検証用モバイルアプリケーション仕様書

## 1. プロジェクト概要

### 1.1 目的
WebAuthn/FIDO2準拠のPasskey機能の挙動を検証するための最小限のモバイルアプリケーション

### 1.2 対象プラットフォーム
- iOS (iOS 16.0以降を推奨)
- Android (Android 9.0 / API Level 28以降を推奨)

### 1.3 技術スタック

#### フロントエンド
- **フレームワーク**: React Native (クロスプラットフォーム開発)
- **言語**: TypeScript
- **状態管理**: React Hooks (useState, useEffect)
- **ナビゲーション**: React Navigation

#### バックエンド
- **フレームワーク**: Node.js + Express
- **言語**: TypeScript
- **認証ライブラリ**: @simplewebauthn/server (WebAuthn実装)
- **データベース**: SQLite (ローカル開発用、シンプルな実装)
- **セッション管理**: express-session

#### Passkey関連ライブラリ
- **iOS/Android**: @simplewebauthn/browser (React Native用ラッパー)
- **代替案**: react-native-passkey (ネイティブモジュール)

**注**: Passkeyの実装にはバックエンドが必須です。WebAuthn/FIDO2プロトコルでは、チャレンジの生成・検証、公開鍵の保存、認証情報の管理などサーバーサイド処理が不可欠です。

---

## 2. 機能要件

### 2.1 画面構成

#### 2.1.1 ウェルカム画面
- **目的**: アプリ起動時の初期画面
- **要素**:
  - アプリタイトル
  - 「ログイン」ボタン
  - 「新規登録」ボタン

#### 2.1.2 新規登録画面
- **目的**: 新規ユーザーの登録
- **要素**:
  - ユーザー名入力フィールド
  - パスワード入力フィールド
  - 「登録」ボタン
  - 「Passkeyを登録」チェックボックス (オプション)
  - 「ログイン画面へ戻る」リンク

#### 2.1.3 ログイン画面
- **目的**: 既存ユーザーの認証
- **要素**:
  - ユーザー名入力フィールド
  - パスワード入力フィールド
  - 「ログイン」ボタン
  - 「Passkeyでログイン」ボタン
  - 「新規登録へ」リンク

#### 2.1.4 Passkey管理画面
- **目的**: Passkeyの追加登録
- **要素**:
  - 現在のユーザー名表示
  - 「Passkeyを追加登録」ボタン
  - 「ログアウト」ボタン

#### 2.1.5 ログイン成功画面
- **目的**: 認証成功の確認
- **要素**:
  - 「ログイン成功」メッセージ
  - 認証方法の表示 (「パスワード認証」or「Passkey認証」)
  - ユーザー名の表示
  - 認証日時の表示
  - 「Passkey管理」ボタン (Passkeyが未登録の場合のみ表示)
  - 「ログアウト」ボタン

---

## 3. 詳細機能仕様

### 3.1 ユーザー登録機能

#### 3.1.1 パスワード登録フロー
```
1. ユーザーが新規登録画面でユーザー名とパスワードを入力
2. 「登録」ボタンをタップ
3. バックエンドに登録リクエスト送信
   POST /api/auth/register
   Body: { username: string, password: string }
4. バックエンドで以下を処理:
   - ユーザー名の重複チェック
   - パスワードのハッシュ化 (bcrypt使用)
   - データベースへ保存
5. 成功時: ログイン画面へ遷移してトースト表示「登録完了」
6. 失敗時: エラーメッセージ表示
```

#### 3.1.2 Passkey同時登録フロー
```
1. ユーザーが「Passkeyを登録」チェックボックスをONにして登録
2. パスワード登録完了後、自動的にPasskey登録フローへ
3. Passkey登録処理 (3.2参照)
4. 成功時: ログイン成功画面へ遷移
```

### 3.2 Passkey登録機能

#### 3.2.1 登録フロー
```
1. ユーザーが「Passkeyを追加登録」ボタンをタップ
2. バックエンドに登録開始リクエスト
   POST /api/passkey/register/start
   Body: { username: string }
3. バックエンドがWebAuthn登録チャレンジを生成して返却
   Response: {
     challenge: string (Base64),
     rp: { id: string, name: string },
     user: { id: string, name: string, displayName: string },
     pubKeyCredParams: [...],
     timeout: number,
     attestation: "none"
   }
4. フロントエンドでプラットフォーム認証器を呼び出し
   - iOS: Face ID / Touch ID
   - Android: Biometric API
5. ユーザーが生体認証を実行
6. 認証器から公開鍵認証情報を取得
7. バックエンドに登録完了リクエスト
   POST /api/passkey/register/finish
   Body: { username: string, credential: PublicKeyCredential }
8. バックエンドで検証・保存:
   - チャレンジの検証
   - 公開鍵の保存
   - credentialIdの保存
9. 成功時: 「Passkey登録完了」メッセージ表示
10. 失敗時: エラーメッセージ表示
```

### 3.3 ログイン機能

#### 3.3.1 パスワードログインフロー
```
1. ユーザーがログイン画面でユーザー名とパスワードを入力
2. 「ログイン」ボタンをタップ
3. バックエンドに認証リクエスト
   POST /api/auth/login
   Body: { username: string, password: string }
4. バックエンドで検証:
   - ユーザー存在確認
   - パスワードハッシュ照合
5. 成功時:
   - セッショントークン発行
   - ログイン成功画面へ遷移
   - 認証方法: 「パスワード認証」表示
6. 失敗時: エラーメッセージ表示
```

#### 3.3.2 Passkeyログインフロー
```
1. ユーザーが「Passkeyでログイン」ボタンをタップ
2. バックエンドに認証開始リクエスト
   POST /api/passkey/login/start
   Body: {} (ユーザー名不要: usernameless認証)
3. バックエンドがWebAuthn認証チャレンジを生成
   Response: {
     challenge: string (Base64),
     rpId: string,
     allowCredentials: [], // 空配列でusernameless
     timeout: number,
     userVerification: "required"
   }
4. フロントエンドでプラットフォーム認証器を呼び出し
5. ユーザーが生体認証を実行
6. 認証器から署名付き認証情報を取得
7. バックエンドに認証完了リクエスト
   POST /api/passkey/login/finish
   Body: { credential: PublicKeyCredential }
8. バックエンドで検証:
   - チャレンジの検証
   - 署名の検証
   - ユーザー特定
9. 成功時:
   - セッショントークン発行
   - ログイン成功画面へ遷移
   - 認証方法: 「Passkey認証」表示
10. 失敗時: エラーメッセージ表示
```

### 3.4 ログアウト機能
```
1. ユーザーが「ログアウト」ボタンをタップ
2. バックエンドにログアウトリクエスト
   POST /api/auth/logout
3. セッション破棄
4. ウェルカム画面へ遷移
```

---

## 4. バックエンドAPI仕様

### 4.1 エンドポイント一覧

#### 4.1.1 認証関連
| エンドポイント | メソッド | 説明 |
|--------------|---------|------|
| /api/auth/register | POST | ユーザー新規登録 |
| /api/auth/login | POST | パスワードログイン |
| /api/auth/logout | POST | ログアウト |
| /api/auth/session | GET | セッション確認 |

#### 4.1.2 Passkey関連
| エンドポイント | メソッド | 説明 |
|--------------|---------|------|
| /api/passkey/register/start | POST | Passkey登録開始 |
| /api/passkey/register/finish | POST | Passkey登録完了 |
| /api/passkey/login/start | POST | Passkeyログイン開始 |
| /api/passkey/login/finish | POST | Passkeyログイン完了 |

### 4.2 データモデル

#### 4.2.1 Usersテーブル
```sql
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### 4.2.2 Passkeysテーブル
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

#### 4.2.3 Challengesテーブル (一時的なチャレンジ保存)
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

## 5. 非機能要件

### 5.1 セキュリティ
- パスワードはbcryptでハッシュ化 (saltラウンド: 10)
- HTTPS通信必須 (開発環境では自己署名証明書可)
- セッションタイムアウト: 24時間
- チャレンジの有効期限: 5分
- WebAuthn RPIDはバックエンドのドメインと一致させる

### 5.2 エラーハンドリング
- ネットワークエラー時の適切なメッセージ表示
- 生体認証キャンセル時のハンドリング
- タイムアウト処理
- バリデーションエラーの明確な表示

### 5.3 ユーザビリティ
- ローディングインジケーター表示
- トーストメッセージでのフィードバック
- 入力フィールドのバリデーション (リアルタイム)
- プラットフォーム別のUI/UX最適化

---

## 6. 開発環境セットアップ要件

### 6.1 フロントエンド
```bash
# 必要なパッケージ
- react-native (最新版)
- @react-navigation/native
- @react-navigation/stack
- @simplewebauthn/browser
- axios (HTTP通信)
- react-native-keychain (オプション: セッショントークン保存)
```

### 6.2 バックエンド
```bash
# 必要なパッケージ
- express
- @simplewebauthn/server
- bcrypt
- express-session
- better-sqlite3
- cors
- uuid
```

### 6.3 開発ツール
- Node.js 18以上
- React Native CLI
- Xcode (iOS開発用)
- Android Studio (Android開発用)
- 実機またはシミュレータ (Passkeyテストには実機推奨)

---

## 7. テストシナリオ

### 7.1 基本フロー
1. **新規登録 → パスワードログイン**
   - ユーザー名・パスワードで登録
   - ログアウト
   - 同じ認証情報でログイン

2. **新規登録 → Passkey追加 → Passkeyログイン**
   - ユーザー名・パスワードで登録
   - Passkey追加登録
   - ログアウト
   - Passkeyでログイン

3. **新規登録時にPasskey同時登録 → Passkeyログイン**
   - 「Passkeyを登録」ONで新規登録
   - ログアウト
   - Passkeyでログイン

### 7.2 エラーケース
1. 重複ユーザー名での登録
2. 誤ったパスワードでのログイン
3. 生体認証のキャンセル
4. ネットワークエラー時の挙動

---

## 8. 実装優先順位

### Phase 1: 基本認証
1. バックエンド基盤構築 (Express + SQLite)
2. ユーザー登録API
3. パスワードログインAPI
4. フロントエンド画面実装 (ウェルカム、登録、ログイン、成功)

### Phase 2: Passkey機能
1. Passkey登録API (start/finish)
2. PasskeyログインAPI (start/finish)
3. フロントエンドPasskey統合
4. Passkey管理画面

### Phase 3: 最適化
1. エラーハンドリング強化
2. UI/UX改善
3. プラットフォーム別調整

---

## 9. 参考情報

### 9.1 WebAuthn仕様
- W3C WebAuthn Level 2: https://www.w3.org/TR/webauthn-2/
- FIDO2 CTAP: https://fidoalliance.org/specs/

### 9.2 プラットフォーム別ドキュメント
- iOS Passkeys: https://developer.apple.com/documentation/authenticationservices/public-private_key_authentication/supporting_passkeys
- Android Credential Manager: https://developer.android.com/training/sign-in/passkeys

### 9.3 ライブラリドキュメント
- SimpleWebAuthn: https://simplewebauthn.dev/

---

## 10. 備考

- この仕様書はClaude Codeでの実装を前提としています
- 実装時にライブラリの互換性問題が発生した場合は代替案を検討
- 本番環境では適切なドメイン・HTTPS設定が必要
- Passkeyの動作確認には実機が強く推奨されます (シミュレータでは制限あり)
