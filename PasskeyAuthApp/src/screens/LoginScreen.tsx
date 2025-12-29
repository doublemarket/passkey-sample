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
} from 'react-native';
import {Button} from '../components/Button';
import {Input} from '../components/Input';
import {useAuth} from '../contexts/AuthContext';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../navigation/types';
import {isPasskeySupported} from '../services/passkeyService';

type LoginScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Login'
>;

interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({navigation}) => {
  const {login, loginWithPasskey} = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({username: '', password: ''});

  const validateForm = () => {
    let valid = true;
    const newErrors = {username: '', password: ''};

    if (!username.trim()) {
      newErrors.username = 'ユーザー名を入力してください';
      valid = false;
    }

    if (!password) {
      newErrors.password = 'パスワードを入力してください';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const result = await login({username, password});
      if (result.success) {
      } else {
        Alert.alert('ログイン失敗', result.message);
      }
    } catch (error: any) {
      Alert.alert('エラー', error.message || 'ログインに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handlePasskeyLogin = async () => {
    // Passkeyサポート確認
    if (!isPasskeySupported()) {
      Alert.alert(
        'Passkey未対応',
        'このデバイスではPasskeyがサポートされていません',
        [{text: 'OK'}]
      );
      return;
    }

    setLoading(true);
    try {
      const result = await loginWithPasskey();
      if (result.success && result.user) {
        Alert.alert(
          'ログイン成功',
          `${result.user.username}さん、Passkeyでログインしました`
        );
      } else {
        Alert.alert('Passkeyログイン失敗', result.message);
      }
    } catch (error: any) {
      Alert.alert('Passkeyログイン失敗', error.message);
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
          <Text style={styles.title}>ログイン</Text>
          <Text style={styles.subtitle}>アカウント情報を入力してください</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="ユーザー名"
            value={username}
            onChangeText={setUsername}
            placeholder="ユーザー名を入力"
            autoCapitalize="none"
            error={errors.username}
          />

          <Input
            label="パスワード"
            value={password}
            onChangeText={setPassword}
            placeholder="パスワードを入力"
            secureTextEntry
            error={errors.password}
          />

          <Button
            title="ログイン"
            onPress={handleLogin}
            loading={loading}
            style={styles.button}
          />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>または</Text>
            <View style={styles.dividerLine} />
          </View>

          <Button
            title="Passkeyでログイン"
            onPress={handlePasskeyLogin}
            variant="secondary"
            style={styles.button}
            disabled={loading}
          />

          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
            style={styles.linkContainer}>
            <Text style={styles.linkText}>
              アカウントをお持ちでない方は新規登録
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
  button: {
    marginTop: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#999',
    fontSize: 14,
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
