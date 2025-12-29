import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native';
import {Button} from '../components/Button';
import {Input} from '../components/Input';
import {useAuth} from '../contexts/AuthContext';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../navigation/types';
import {registerPasskey, isPasskeySupported} from '../services/passkeyService';

type RegisterScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Register'
>;

interface RegisterScreenProps {
  navigation: RegisterScreenNavigationProp;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({navigation}) => {
  const {register} = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [registerWithPasskey, setRegisterWithPasskey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    username: '',
    password: '',
    confirmPassword: '',
  });

  const validateForm = () => {
    let valid = true;
    const newErrors = {username: '', password: '', confirmPassword: ''};

    if (!username.trim()) {
      newErrors.username = 'ユーザー名を入力してください';
      valid = false;
    } else if (username.length < 3) {
      newErrors.username = 'ユーザー名は3文字以上で入力してください';
      valid = false;
    }

    if (!password) {
      newErrors.password = 'パスワードを入力してください';
      valid = false;
    } else if (password.length < 6) {
      newErrors.password = 'パスワードは6文字以上で入力してください';
      valid = false;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'パスワード（確認）を入力してください';
      valid = false;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'パスワードが一致しません';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const result = await register({username, password});
      if (result.success) {
        if (registerWithPasskey && isPasskeySupported()) {
          // Passkeyを登録
          try {
            const passkeyResult = await registerPasskey(username);
            const message =
              passkeyResult === 'skipped'
                ? 'アカウントは作成されました。Passkeyは既に登録されているためスキップしました。ログイン画面に移動します。'
                : 'アカウントとPasskeyが作成されました。ログイン画面に移動します。';
            Alert.alert('登録完了', message, [
              {
                text: 'OK',
                onPress: () => navigation.navigate('Login'),
              },
            ]);
          } catch (passkeyError: any) {
            // Passkey登録が失敗してもアカウント登録は成功しているのでログイン画面へ
            Alert.alert(
              '登録完了',
              `アカウントが作成されました。\n\nPasskey登録: ${passkeyError.message}\n\nログイン画面に移動します。`,
              [
                {
                  text: 'OK',
                  onPress: () => navigation.navigate('Login'),
                },
              ]
            );
          }
        } else {
          Alert.alert(
            '登録完了',
            'アカウントが作成されました。ログイン画面に移動します。',
            [
              {
                text: 'OK',
                onPress: () => navigation.navigate('Login'),
              },
            ]
          );
        }
      } else {
        Alert.alert('登録失敗', result.message);
      }
    } catch (error: any) {
      Alert.alert('エラー', error.message || '登録に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>新規登録</Text>
          <Text style={styles.subtitle}>
            アカウント情報を入力してください
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="ユーザー名"
            value={username}
            onChangeText={setUsername}
            placeholder="ユーザー名を入力（3文字以上）"
            autoCapitalize="none"
            error={errors.username}
          />

          <Input
            label="パスワード"
            value={password}
            onChangeText={setPassword}
            placeholder="パスワードを入力（6文字以上）"
            secureTextEntry
            error={errors.password}
          />

          <Input
            label="パスワード（確認）"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="パスワードを再入力"
            secureTextEntry
            error={errors.confirmPassword}
          />

          {isPasskeySupported() && (
            <View style={styles.passkeyOption}>
              <View style={styles.passkeyTextContainer}>
                <Text style={styles.passkeyLabel}>Passkeyを登録</Text>
                <Text style={styles.passkeySubtext}>
                  Face ID/Touch IDで簡単にログインできます
                </Text>
              </View>
              <Switch
                value={registerWithPasskey}
                onValueChange={setRegisterWithPasskey}
                disabled={loading}
              />
            </View>
          )}

          <Button
            title="登録"
            onPress={handleRegister}
            loading={loading}
            style={styles.button}
          />

          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            style={styles.linkContainer}>
            <Text style={styles.linkText}>
              すでにアカウントをお持ちの方はログイン
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    marginTop: 40,
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  form: {
    flex: 1,
  },
  passkeyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  passkeyTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  passkeyLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  passkeySubtext: {
    fontSize: 14,
    color: '#666',
  },
  button: {
    marginTop: 24,
  },
  linkContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  linkText: {
    color: '#007AFF',
    fontSize: 14,
  },
});
