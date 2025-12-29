# iOS アプリ起動手順

## 現在のエラーの解決方法

CocoaPodsのRuby互換性エラーが発生しています。以下の手順で解決します。

## ステップ1: CocoaPodsを直接インストール（bundler経由ではなく）

```bash
# システムのCocoaPodsをインストール
sudo gem install cocoapods

# バージョン確認
pod --version
```

## ステップ2: iOS依存関係のインストール

```bash
cd PasskeyAuthApp/ios

# 既存のPodsを削除（もしあれば）
rm -rf Pods
rm -rf Podfile.lock

# 直接podコマンドでインストール（bundler経由ではなく）
pod install

cd ..
```

**エラーが出る場合**: 以下を試してください

### 方法A: Podリポジトリを更新してから再試行

```bash
cd PasskeyAuthApp/ios
pod repo update
pod install
cd ..
```

### 方法B: Ruby バージョンの問題の場合

現在のRubyバージョンを確認:
```bash
ruby -v
```

rbenvを使用している場合、別のRubyバージョンを試す:
```bash
# rbenvでインストール可能なバージョンを確認
rbenv install -l

# 推奨: Ruby 3.1.x または 3.2.x
rbenv install 3.1.4
rbenv global 3.1.4

# CocoaPodsを再インストール
gem install cocoapods
cd PasskeyAuthApp/ios
pod install
cd ..
```

### 方法C: Gemfileのactivesupportバージョンを固定

```bash
cd PasskeyAuthApp/ios

# Gemfileを編集（既に存在する場合）
# または新規作成:
cat > Gemfile << 'EOF'
source 'https://rubygems.org'

gem 'cocoapods', '~> 1.15'
gem 'activesupport', '~> 7.0.0'
EOF

# bundlerでインストール
bundle install
bundle exec pod install

cd ..
```

## ステップ3: アプリの起動

### 方法1: コマンドラインから起動

```bash
# バックエンドを別ターミナルで起動
cd passkey-auth-app/backend
npm run dev

# 新しいターミナルで
cd PasskeyAuthApp
npm run ios
```

### 方法2: Xcodeから起動（推奨）

```bash
# Metro bundlerを起動（ターミナル1）
cd PasskeyAuthApp
npm start

# 別のターミナルで Xcode を開く（ターミナル2）
open ios/PasskeyAuthApp.xcworkspace
```

**重要**: `PasskeyAuthApp.xcodeproj` ではなく `PasskeyAuthApp.xcworkspace` を開いてください！

Xcodeで:
1. シミュレータを選択（例: iPhone 15）
2. ▶️ ボタンをクリック
3. アプリが起動します

## トラブルシューティング

### エラー: `xcworkspace` ファイルが見つからない

pod installが成功していないため。上記のステップ2を確認してください。

### エラー: Metro bundlerに接続できない

```bash
# キャッシュをクリア
cd PasskeyAuthApp
npm start -- --reset-cache
```

### エラー: Xcodeでビルドエラー

```bash
cd PasskeyAuthApp/ios
# クリーンビルド
xcodebuild clean -workspace PasskeyAuthApp.xcworkspace -scheme PasskeyAuthApp

# Xcodeで Product > Clean Build Folder を実行
```

## 簡易版: bundlerを使わずに直接pod installする方法

これが最も簡単な方法です:

```bash
# 1. システムのCocoaPodsをインストール
sudo gem install cocoapods

# 2. Podsをインストール
cd PasskeyAuthApp/ios
pod install
cd ..

# 3. Xcodeで開く
open ios/PasskeyAuthApp.xcworkspace

# 4. 別ターミナルでMetro bundlerを起動
cd PasskeyAuthApp
npm start

# 5. XcodeでShift+Cmd+Rでビルド&実行
```

## 最終手段: Expo Goを使う（ネイティブモジュールなしの場合）

もしどうしてもビルドできない場合は、Expo Goアプリでプレビューすることも可能ですが、
このプロジェクトはReact Native CLIで作成されているため、Expoへの移行は推奨しません。

## 成功の確認

起動が成功すると:
1. iOSシミュレータが起動
2. アプリのウェルカム画面が表示される
3. 「ログイン」「新規登録」ボタンが表示される

この状態になれば成功です！
