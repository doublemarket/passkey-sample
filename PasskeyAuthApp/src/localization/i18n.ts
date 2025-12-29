import {NativeModules, Platform} from 'react-native';

export type Language = 'en' | 'ja';

const translations = {
  en: {
    commonOk: 'OK',
    commonCancel: 'Cancel',
    commonError: 'Error',
    commonLogout: 'Log Out',
    commonLoading: 'Loading...',
    navigationHome: 'Home',
    navigationDiagnostics: 'Diagnostics',
    navigationLogin: 'Log In',
    navigationRegister: 'Register',
    languageSelectionTitle: 'Choose your language',
    languageSelectionSubtitle: 'Select a language to continue.',
    languageJapanese: 'Japanese',
    languageEnglish: 'English',
    languageContinue: 'Continue',
    welcomeTitle: 'Passkey Auth App',
    welcomeSubtitle: 'Experience passwordless authentication with WebAuthn/FIDO2.',
    welcomeLogin: 'Log In',
    welcomeRegister: 'Register',
    loginTitle: 'Log In',
    loginSubtitle: 'Enter your account details',
    loginUsernameLabel: 'Username',
    loginUsernamePlaceholder: 'Enter username',
    loginPasswordLabel: 'Password',
    loginPasswordPlaceholder: 'Enter password',
    loginButton: 'Log In',
    loginDivider: 'or',
    loginWithPasskey: 'Log In with Passkey',
    loginNoAccount: 'Don\'t have an account? Register',
    loginValidationUsernameRequired: 'Please enter your username.',
    loginValidationPasswordRequired: 'Please enter your password.',
    loginFailedTitle: 'Login Failed',
    loginSuccessTitle: 'Login Successful',
    loginPasskeySuccessMessage: '{{username}}, you logged in with a passkey.',
    passkeyNotSupportedTitle: 'Passkey Not Supported',
    passkeyNotSupportedMessage: 'This device does not support passkeys.',
    passkeyLoginFailedTitle: 'Passkey Login Failed',
    registerTitle: 'Register',
    registerSubtitle: 'Enter your account details',
    registerUsernameLabel: 'Username',
    registerUsernamePlaceholder: 'Enter username (min 3 characters)',
    registerPasswordLabel: 'Password',
    registerPasswordPlaceholder: 'Enter password (min 6 characters)',
    registerConfirmPasswordLabel: 'Confirm Password',
    registerConfirmPasswordPlaceholder: 'Re-enter password',
    registerPasskeyLabel: 'Register a passkey',
    registerPasskeySubtext: 'Sign in quickly with Face ID/Touch ID.',
    registerButton: 'Register',
    registerHaveAccount: 'Already have an account? Log in',
    registerValidationUsernameRequired: 'Please enter your username.',
    registerValidationUsernameLength: 'Username must be at least 3 characters.',
    registerValidationPasswordRequired: 'Please enter your password.',
    registerValidationPasswordLength: 'Password must be at least 6 characters.',
    registerValidationConfirmPasswordRequired: 'Please confirm your password.',
    registerValidationPasswordMismatch: 'Passwords do not match.',
    registerSuccessTitle: 'Registration Complete',
    registerSuccessAccountCreated:
      'Your account has been created. Redirecting to the login screen.',
    registerSuccessAccountAndPasskey:
      'Your account and passkey have been created. Redirecting to the login screen.',
    registerSuccessPasskeySkipped:
      'Your account has been created. A passkey already exists, so registration was skipped. Redirecting to the login screen.',
    registerSuccessWithPasskeyError:
      'Your account has been created.\n\nPasskey registration: {{error}}\n\nRedirecting to the login screen.',
    registerFailedTitle: 'Registration Failed',
    homeTitle: 'Login Successful',
    homeAuthMethodLabel: 'Authentication Method',
    homeUsernameLabel: 'Username',
    homeAuthTimeLabel: 'Authentication Time',
    homeUserIdLabel: 'User ID',
    homeAuthMethodPassword: 'Password',
    homeAuthMethodPasskey: 'Passkey',
    homeAuthMethodUnknown: 'Unknown',
    homeDescriptionTitle: '🎉 Authentication Complete',
    homeDescriptionPassword:
      'You logged in with a password. Enable passkeys to use biometric login next time.',
    homeDescriptionPasskey:
      'You logged in with a passkey. Next time you can sign in with biometrics only.',
    homeRegisterPasskeyButton: 'Register Passkey',
    homeDiagnosticsButton: 'Diagnostics',
    homeLogoutButton: 'Log Out',
    homeLogoutConfirmTitle: 'Log Out',
    homeLogoutConfirmMessage: 'Are you sure you want to log out?',
    homeLogoutCancel: 'Cancel',
    homeLogoutConfirm: 'Log Out',
    homePasskeyAlreadyRegisteredTitle: 'Passkey Registration',
    homePasskeyAlreadyRegisteredMessage: 'A passkey is already registered.',
    homePasskeyRegisterSuccessTitle: 'Passkey Registered',
    homePasskeyRegisterSuccessMessage:
      'Passkey registration succeeded. You can sign in with biometrics next time.',
    homePasskeyRegisterFailedTitle: 'Passkey Registration Failed',
    homePasskeyNotSupportedTitle: 'Passkey Not Supported',
    homePasskeyNotSupportedMessage: 'This device does not support passkeys.',
    homeUserFetchErrorTitle: 'Error',
    homeUserFetchErrorMessage: 'Unable to fetch user information.',
    diagnosticsTitle: 'Diagnostics',
    diagnosticsSubtitle: 'RP ID: {{rpId}}',
    diagnosticsRpIdUnavailable: 'Unable to resolve',
    diagnosticsAssetlinksButton: 'Check assetlinks.json',
    diagnosticsDalButton: 'Check Digital Asset Links',
    diagnosticsAutoButton: 'Auto Diagnose',
    diagnosticsResultRunning: 'Running...',
    diagnosticsResultNotRun: 'Not run',
    diagnosticsRpIdError: 'Unable to resolve RP ID',
    diagnosticsAssetlinksFetchError: 'Failed to fetch assetlinks.json',
    diagnosticsDalCheckError: 'Digital Asset Links verification failed',
    diagnosticsAssetlinksFetchFailedTitle: 'assetlinks.json fetch failed',
    diagnosticsAssetlinksFetchFailedSummary:
      'assetlinks.json could not be fetched from the RP ID domain.',
    diagnosticsAssetlinksFetchFailedHint1:
      'Confirm that https://{{rpId}}/.well-known/assetlinks.json returns 200.',
    diagnosticsAssetlinksFetchFailedHint2:
      'If there is a redirect, serve it directly.',
    diagnosticsAssetlinksFetchFailedHint3:
      'Verify DNS resolution and certificates.',
    diagnosticsDalFailedTitle: 'Digital Asset Links verification failed',
    diagnosticsDalFailedSummary:
      "Google's verification API could not validate assetlinks.json.",
    diagnosticsDalFailedHint1: 'Ensure assetlinks.json is valid JSON.',
    diagnosticsDalFailedHint2:
      'Confirm package_name and SHA-256 match the installed APK.',
    diagnosticsServerOkTitle: 'Server-side verification OK',
    diagnosticsServerOkSummary:
      'This is likely a device cache or Google Play Services issue.',
    diagnosticsServerOkHint1:
      'Try clearing Play Services / Play Store / Chrome data.',
    diagnosticsServerOkHint2: 'Turn off Private DNS on the device.',
    diagnosticsServerOkHint3: 'Uninstall and reinstall the app.',
    diagnosticsNeedsRunTitle: 'Run diagnostics first',
    diagnosticsNeedsRunSummary: 'Run both assetlinks and DAL checks.',
    diagnosticsNeedsRunHint1: 'Results will appear after both checks run.',
    diagnosticsRpIdUnavailableTitle: 'Unable to resolve RP ID',
    diagnosticsRpIdUnavailableSummary: 'Review the API_BASE_URL setting.',
    diagnosticsRpIdUnavailableHint1: 'Ensure API_BASE_URL starts with https://.',
    errorsNetwork: 'A network error occurred.',
    errorsLogoutFailed: 'Failed to log out.',
    errorsLoginFailed: 'Failed to log in.',
    errorsRegisterFailed: 'Registration failed.',
    errorsPasskeyRegistrationCanceled: 'Passkey registration was canceled.',
    errorsPasskeyRegistrationFailed: 'Passkey registration failed.',
    errorsPasskeyAuthenticationFailed: 'Passkey authentication failed.',
    errorsPasskeyAuthenticationCanceled: 'Passkey authentication was canceled.',
    errorsPasskeyVerificationFailed: 'Passkey verification failed.',
    errorsSessionUnavailable: 'Session could not be verified.',
    errorsPasskeyRegisterStartFailed: 'Failed to start passkey registration.',
    errorsPasskeyRegisterFinishFailed: 'Failed to finish passkey registration.',
    errorsPasskeyLoginStartFailed: 'Failed to start passkey login.',
    errorsPasskeyLoginFinishFailed: 'Failed to finish passkey login.',
    serverUsernamePasswordRequired: 'Username and password are required.',
    serverUsernameRequired: 'Username is required.',
    serverCredentialRequired: 'Credential is required.',
    serverUsernameCredentialRequired: 'Username and credential are required.',
    serverUsernameTooShort: 'Username must be at least 3 characters long.',
    serverPasswordTooShort: 'Password must be at least 6 characters long.',
    serverUsernameTaken: 'That username is already taken.',
    serverLoginInvalid: 'Incorrect username or password.',
    serverUserNotFound: 'User not found.',
    serverPasskeyNotFound: 'Passkey not found.',
    serverPasskeyAlreadyRegistered: 'Passkey is already registered.',
    serverInvalidChallenge: 'Invalid challenge.',
    serverCredentialVerificationFailed: 'Failed to verify credential.',
    serverAuthenticationVerificationFailed: 'Failed to verify authentication.',
    serverPasskeyRegistrationSuccess: 'Passkey registration completed.',
    serverPasskeyLoginSuccess: 'Passkey login succeeded.',
    serverPasskeyStartFailed: 'Failed to start passkey registration.',
    serverPasskeyFinishFailed: 'Failed to finish passkey registration.',
    serverPasskeyLoginStartFailed: 'Failed to start passkey login.',
    serverPasskeyLoginFinishFailed: 'Failed to finish passkey login.',
    serverAuthRegisterSuccess: 'Registration completed.',
    serverAuthLoginSuccess: 'Login succeeded.',
    serverLogoutSuccess: 'Logged out.',
    serverLogoutFailed: 'Failed to log out.',
    serverEndpointNotFound: 'Endpoint not found.',
    serverAuthSessionError: 'A server error occurred.',
  },
  ja: {
    commonOk: 'OK',
    commonCancel: 'キャンセル',
    commonError: 'エラー',
    commonLogout: 'ログアウト',
    commonLoading: '読み込み中...',
    navigationHome: 'ホーム',
    navigationDiagnostics: '診断',
    navigationLogin: 'ログイン',
    navigationRegister: '新規登録',
    languageSelectionTitle: '言語を選択してください',
    languageSelectionSubtitle: '続ける言語を選択してください。',
    languageJapanese: '日本語',
    languageEnglish: '英語',
    languageContinue: '続ける',
    welcomeTitle: 'Passkey認証アプリ',
    welcomeSubtitle: 'WebAuthn/FIDO2準拠の\nパスワードレス認証を体験',
    welcomeLogin: 'ログイン',
    welcomeRegister: '新規登録',
    loginTitle: 'ログイン',
    loginSubtitle: 'アカウント情報を入力してください',
    loginUsernameLabel: 'ユーザー名',
    loginUsernamePlaceholder: 'ユーザー名を入力',
    loginPasswordLabel: 'パスワード',
    loginPasswordPlaceholder: 'パスワードを入力',
    loginButton: 'ログイン',
    loginDivider: 'または',
    loginWithPasskey: 'Passkeyでログイン',
    loginNoAccount: 'アカウントをお持ちでない方は新規登録',
    loginValidationUsernameRequired: 'ユーザー名を入力してください',
    loginValidationPasswordRequired: 'パスワードを入力してください',
    loginFailedTitle: 'ログイン失敗',
    loginSuccessTitle: 'ログイン成功',
    loginPasskeySuccessMessage: '{{username}}さん、Passkeyでログインしました',
    passkeyNotSupportedTitle: 'Passkey未対応',
    passkeyNotSupportedMessage: 'このデバイスではPasskeyがサポートされていません',
    passkeyLoginFailedTitle: 'Passkeyログイン失敗',
    registerTitle: '新規登録',
    registerSubtitle: 'アカウント情報を入力してください',
    registerUsernameLabel: 'ユーザー名',
    registerUsernamePlaceholder: 'ユーザー名を入力（3文字以上）',
    registerPasswordLabel: 'パスワード',
    registerPasswordPlaceholder: 'パスワードを入力（6文字以上）',
    registerConfirmPasswordLabel: 'パスワード（確認）',
    registerConfirmPasswordPlaceholder: 'パスワードを再入力',
    registerPasskeyLabel: 'Passkeyを登録',
    registerPasskeySubtext: 'Face ID/Touch IDで簡単にログインできます',
    registerButton: '登録',
    registerHaveAccount: 'すでにアカウントをお持ちの方はログイン',
    registerValidationUsernameRequired: 'ユーザー名を入力してください',
    registerValidationUsernameLength: 'ユーザー名は3文字以上で入力してください',
    registerValidationPasswordRequired: 'パスワードを入力してください',
    registerValidationPasswordLength: 'パスワードは6文字以上で入力してください',
    registerValidationConfirmPasswordRequired:
      'パスワード（確認）を入力してください',
    registerValidationPasswordMismatch: 'パスワードが一致しません',
    registerSuccessTitle: '登録完了',
    registerSuccessAccountCreated:
      'アカウントが作成されました。ログイン画面に移動します。',
    registerSuccessAccountAndPasskey:
      'アカウントとPasskeyが作成されました。ログイン画面に移動します。',
    registerSuccessPasskeySkipped:
      'アカウントは作成されました。Passkeyは既に登録されているためスキップしました。ログイン画面に移動します。',
    registerSuccessWithPasskeyError:
      'アカウントが作成されました。\n\nPasskey登録: {{error}}\n\nログイン画面に移動します。',
    registerFailedTitle: '登録失敗',
    homeTitle: 'ログイン成功',
    homeAuthMethodLabel: '認証方法',
    homeUsernameLabel: 'ユーザー名',
    homeAuthTimeLabel: '認証日時',
    homeUserIdLabel: 'ユーザーID',
    homeAuthMethodPassword: 'パスワード認証',
    homeAuthMethodPasskey: 'Passkey認証',
    homeAuthMethodUnknown: '不明',
    homeDescriptionTitle: '🎉 認証が完了しました',
    homeDescriptionPassword:
      'パスワード認証でログインしました。Passkey機能を有効にすることで、次回から生体認証でログインできるようになります。',
    homeDescriptionPasskey:
      'Passkey認証でログインしました。次回から生体認証のみでログインできます。',
    homeRegisterPasskeyButton: 'Passkeyを追加登録',
    homeDiagnosticsButton: '診断ツール',
    homeLogoutButton: 'ログアウト',
    homeLogoutConfirmTitle: 'ログアウト',
    homeLogoutConfirmMessage: '本当にログアウトしますか？',
    homeLogoutCancel: 'キャンセル',
    homeLogoutConfirm: 'ログアウト',
    homePasskeyAlreadyRegisteredTitle: 'Passkey登録',
    homePasskeyAlreadyRegisteredMessage: 'Passkeyは既に登録されています。',
    homePasskeyRegisterSuccessTitle: 'Passkey登録完了',
    homePasskeyRegisterSuccessMessage:
      'Passkeyが正常に登録されました。次回から生体認証でログインできます。',
    homePasskeyRegisterFailedTitle: 'Passkey登録失敗',
    homePasskeyNotSupportedTitle: 'Passkey未対応',
    homePasskeyNotSupportedMessage: 'このデバイスではPasskeyがサポートされていません',
    homeUserFetchErrorTitle: 'エラー',
    homeUserFetchErrorMessage: 'ユーザー情報が取得できません',
    diagnosticsTitle: '診断ツール',
    diagnosticsSubtitle: 'RP ID: {{rpId}}',
    diagnosticsRpIdUnavailable: '取得できません',
    diagnosticsAssetlinksButton: 'assetlinks.json を確認',
    diagnosticsDalButton: 'Digital Asset Links を確認',
    diagnosticsAutoButton: '自動判定',
    diagnosticsResultRunning: '実行中...',
    diagnosticsResultNotRun: '未実行',
    diagnosticsRpIdError: 'RP ID が取得できません',
    diagnosticsAssetlinksFetchError: '取得に失敗しました',
    diagnosticsDalCheckError: '検証に失敗しました',
    diagnosticsAssetlinksFetchFailedTitle: 'assetlinks.json の取得失敗',
    diagnosticsAssetlinksFetchFailedSummary:
      'RP ID のドメインで assetlinks.json が取得できていません。',
    diagnosticsAssetlinksFetchFailedHint1:
      'https://{{rpId}}/.well-known/assetlinks.json が 200 で返るか確認してください。',
    diagnosticsAssetlinksFetchFailedHint2:
      'リダイレクトがある場合は直配信にしてください。',
    diagnosticsAssetlinksFetchFailedHint3:
      'DNS 解決や証明書が正しいか確認してください。',
    diagnosticsDalFailedTitle: 'Digital Asset Links の検証失敗',
    diagnosticsDalFailedSummary:
      'Google の検証 API が assetlinks.json を正しく認識できていません。',
    diagnosticsDalFailedHint1:
      'assetlinks.json の JSON 形式が正しいか確認してください。',
    diagnosticsDalFailedHint2:
      'package_name と SHA-256 が実機インストール済み APK と一致するか確認してください。',
    diagnosticsServerOkTitle: 'サーバー側の検証はOK',
    diagnosticsServerOkSummary:
      '端末側のキャッシュや Google Play Services の状態が原因の可能性が高いです。',
    diagnosticsServerOkHint1:
      'Play Services / Play Store / Chrome のデータ削除を試してください。',
    diagnosticsServerOkHint2: '端末の Private DNS をオフにしてください。',
    diagnosticsServerOkHint3:
      'アプリをアンインストールして再インストールしてください。',
    diagnosticsNeedsRunTitle: '診断の実行が必要です',
    diagnosticsNeedsRunSummary: 'assetlinks と DAL の両方を実行してください。',
    diagnosticsNeedsRunHint1: '両方のボタンを実行後に結果が表示されます。',
    diagnosticsRpIdUnavailableTitle: 'RP ID を取得できません',
    diagnosticsRpIdUnavailableSummary: 'API_BASE_URL の設定を見直してください。',
    diagnosticsRpIdUnavailableHint1:
      'API_BASE_URL が https:// で始まっているか確認してください。',
    errorsNetwork: 'ネットワークエラーが発生しました',
    errorsLogoutFailed: 'ログアウトに失敗しました',
    errorsLoginFailed: 'ログインに失敗しました',
    errorsRegisterFailed: '登録に失敗しました',
    errorsPasskeyRegistrationCanceled: 'Passkey登録がキャンセルされました',
    errorsPasskeyRegistrationFailed: 'Passkey登録に失敗しました',
    errorsPasskeyAuthenticationFailed: 'Passkey認証に失敗しました',
    errorsPasskeyAuthenticationCanceled: 'Passkey認証がキャンセルされました',
    errorsPasskeyVerificationFailed: 'Passkey認証の検証に失敗しました',
    errorsSessionUnavailable: 'セッションが確認できませんでした',
    errorsPasskeyRegisterStartFailed: 'Passkey登録開始に失敗しました',
    errorsPasskeyRegisterFinishFailed: 'Passkey登録完了に失敗しました',
    errorsPasskeyLoginStartFailed: 'Passkeyログイン開始に失敗しました',
    errorsPasskeyLoginFinishFailed: 'Passkeyログイン完了に失敗しました',
    serverUsernamePasswordRequired: 'ユーザー名とパスワードは必須です',
    serverUsernameRequired: 'ユーザー名が必要です',
    serverCredentialRequired: '認証情報が必要です',
    serverUsernameCredentialRequired: 'ユーザー名と認証情報が必要です',
    serverUsernameTooShort: 'ユーザー名は3文字以上である必要があります',
    serverPasswordTooShort: 'パスワードは6文字以上である必要があります',
    serverUsernameTaken: 'このユーザー名は既に使用されています',
    serverLoginInvalid: 'ユーザー名またはパスワードが正しくありません',
    serverUserNotFound: 'ユーザーが見つかりません',
    serverPasskeyNotFound: 'Passkeyが見つかりません',
    serverPasskeyAlreadyRegistered: 'Passkeyは既に登録されています',
    serverInvalidChallenge: '無効なチャレンジです',
    serverCredentialVerificationFailed: '認証情報の検証に失敗しました',
    serverAuthenticationVerificationFailed: '認証の検証に失敗しました',
    serverPasskeyRegistrationSuccess: 'Passkeyの登録が完了しました',
    serverPasskeyLoginSuccess: 'Passkeyログインに成功しました',
    serverPasskeyStartFailed: '登録開始に失敗しました',
    serverPasskeyFinishFailed: '登録完了に失敗しました',
    serverPasskeyLoginStartFailed: 'ログイン開始に失敗しました',
    serverPasskeyLoginFinishFailed: 'ログイン完了に失敗しました',
    serverAuthRegisterSuccess: 'ユーザー登録が完了しました',
    serverAuthLoginSuccess: 'ログインに成功しました',
    serverLogoutSuccess: 'ログアウトしました',
    serverLogoutFailed: 'ログアウトに失敗しました',
    serverEndpointNotFound: 'エンドポイントが見つかりません',
    serverAuthSessionError: 'サーバーエラーが発生しました',
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

const supportedLanguages: Language[] = ['en', 'ja'];

export const isLanguage = (value: string): value is Language =>
  supportedLanguages.includes(value as Language);

export const getDeviceLanguage = (): Language => {
  const locale =
    Platform.OS === 'ios'
      ? NativeModules.SettingsManager?.settings?.AppleLocale ||
        NativeModules.SettingsManager?.settings?.AppleLanguages?.[0]
      : NativeModules.I18nManager?.localeIdentifier;

  if (typeof locale === 'string') {
    const code = locale.split(/[_-]/)[0];
    if (code === 'ja') {
      return 'ja';
    }
  }

  return 'en';
};

let currentLanguage: Language = getDeviceLanguage();

export const setCurrentLanguage = (language: Language) => {
  currentLanguage = language;
};

export const getCurrentLanguage = (): Language => currentLanguage;

const applyParams = (
  template: string,
  params?: Record<string, string | number>,
): string => {
  if (!params) {
    return template;
  }

  return Object.entries(params).reduce((result, [key, value]) => {
    return result.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
  }, template);
};

export const translate = (
  key: TranslationKey,
  params?: Record<string, string | number>,
  language: Language = currentLanguage,
): string => {
  const template = translations[language][key] || translations.en[key];
  return applyParams(template, params);
};

const serverMessageKeyMap: Record<string, TranslationKey> = {
  [translations.en.serverUsernamePasswordRequired]:
    'serverUsernamePasswordRequired',
  [translations.en.serverUsernameRequired]: 'serverUsernameRequired',
  [translations.en.serverCredentialRequired]: 'serverCredentialRequired',
  [translations.en.serverUsernameCredentialRequired]:
    'serverUsernameCredentialRequired',
  [translations.en.serverUsernameTooShort]: 'serverUsernameTooShort',
  [translations.en.serverPasswordTooShort]: 'serverPasswordTooShort',
  [translations.en.serverUsernameTaken]: 'serverUsernameTaken',
  [translations.en.serverLoginInvalid]: 'serverLoginInvalid',
  [translations.en.serverUserNotFound]: 'serverUserNotFound',
  [translations.en.serverPasskeyNotFound]: 'serverPasskeyNotFound',
  [translations.en.serverPasskeyAlreadyRegistered]:
    'serverPasskeyAlreadyRegistered',
  [translations.en.serverInvalidChallenge]: 'serverInvalidChallenge',
  [translations.en.serverCredentialVerificationFailed]:
    'serverCredentialVerificationFailed',
  [translations.en.serverAuthenticationVerificationFailed]:
    'serverAuthenticationVerificationFailed',
  [translations.en.serverPasskeyRegistrationSuccess]:
    'serverPasskeyRegistrationSuccess',
  [translations.en.serverPasskeyLoginSuccess]: 'serverPasskeyLoginSuccess',
  [translations.en.serverPasskeyStartFailed]: 'serverPasskeyStartFailed',
  [translations.en.serverPasskeyFinishFailed]: 'serverPasskeyFinishFailed',
  [translations.en.serverPasskeyLoginStartFailed]:
    'serverPasskeyLoginStartFailed',
  [translations.en.serverPasskeyLoginFinishFailed]:
    'serverPasskeyLoginFinishFailed',
  [translations.en.serverAuthRegisterSuccess]: 'serverAuthRegisterSuccess',
  [translations.en.serverAuthLoginSuccess]: 'serverAuthLoginSuccess',
  [translations.en.serverLogoutSuccess]: 'serverLogoutSuccess',
  [translations.en.serverLogoutFailed]: 'serverLogoutFailed',
  [translations.en.serverEndpointNotFound]: 'serverEndpointNotFound',
  [translations.en.serverAuthSessionError]: 'serverAuthSessionError',
};

export const translateServerMessage = (message: string): string => {
  const key = serverMessageKeyMap[message];
  if (!key) {
    return message;
  }
  return translate(key);
};
