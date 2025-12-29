# iOS App Launch Guide

## How to resolve current errors

A CocoaPods Ruby compatibility error is occurring. Follow these steps to resolve it.

## Step 1: Install CocoaPods directly (not via bundler)

```bash
# Install system CocoaPods
sudo gem install cocoapods

# Check version
pod --version
```

## Step 2: Install iOS dependencies

```bash
# Remove existing Pods (if any)
rm -rf ios/Pods ios/Podfile.lock

# Install directly with pod (not via bundler)
cd ios
pod install
cd ..
```

**If errors occur**, try the following:

### Option A: Update the Pod repo and retry

```bash
pod repo update
pod install
```

### Option B: Ruby version issues

Check your current Ruby version:

```bash
ruby -v
```

If you use rbenv, try a different Ruby version:

```bash
# Check installable versions with rbenv
rbenv install -l

# Recommended: Ruby 3.1.x or 3.2.x
rbenv install 3.2.2
rbenv global 3.2.2

# Reinstall CocoaPods
gem install cocoapods
```

### Option C: Pin the activesupport version in Gemfile

```bash
# Edit Gemfile (if it already exists)
# Or create a new one:
cat > Gemfile <<'GEM'
source 'https://rubygems.org'

gem 'activesupport', '~> 7.0.8'
GEM

# Install with bundler
bundle install
```

## Step 3: Launch the app

### Option 1: Launch from the command line

```bash
# Start the backend in a separate terminal
cd passkey-auth-app/backend
npm run dev

# In a new terminal
cd PasskeyAuthApp
npm run ios
```

### Option 2: Launch from Xcode (recommended)

```bash
# Start Metro bundler (terminal 1)
cd PasskeyAuthApp
npm start

# Open Xcode in another terminal (terminal 2)
open ios/PasskeyAuthApp.xcworkspace
```

**Important**: Open `PasskeyAuthApp.xcworkspace` (not `PasskeyAuthApp.xcodeproj`).

In Xcode:
1. Select a simulator (e.g., iPhone 15)
2. Click the ▶️ button
3. The app launches

## Troubleshooting

### Error: `xcworkspace` file not found
This happens when `pod install` did not complete successfully. Re-check Step 2.

### Error: Cannot connect to Metro bundler

```bash
# Clear cache
npx react-native start --reset-cache
```

### Error: Xcode build error

```bash
# Clean build
cd ios
xcodebuild clean
```

Then in Xcode: Product > Clean Build Folder

## Simplified path: run pod install without bundler
This is the easiest approach:

```bash
# 1. Install system CocoaPods
sudo gem install cocoapods

# 2. Install Pods
cd ios
pod install
cd ..

# 3. Open in Xcode
open ios/PasskeyAuthApp.xcworkspace

# 4. Start Metro bundler in a separate terminal
npm start

# 5. Build & run (Shift+Cmd+R)
```

## Last resort: Use Expo Go (if no native modules)
If you cannot build at all, you can preview with Expo Go, but this project uses React Native CLI.
Migration to Expo is not recommended.

## Confirm success
If startup succeeds:
1. The iOS simulator launches
2. The app's welcome screen appears
3. **Log In** and **Register** buttons are visible

If you see this, the setup is complete.
